"""
图像生成 API

提供图像生成任务的创建、查询、列表接口。
支持多种任务类型：模特生成、虚拟试穿、服装合成等。
"""

from datetime import datetime
from typing import Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.core.dependency import AuthControl
from app.core.image_client import create_batch_job, get_batch_job_status, get_batch_results
from app.models import User
from app.models.image_task import ImageTask
from app.schemas.base import Success
from app.schemas.image_task import (
    ImageTaskRequest,
    ImageTaskResponse,
    ImageTaskDetailResponse,
    ImageTaskListResponse,
    BatchImageTaskRequest,
    BatchImageTaskResponse,
    BatchTaskStatusResponse,
    BatchTaskResultResponse,
)
from app.services.prompt_assembler import PromptAssembler

router = APIRouter(prefix="")


@router.post("/generate", response_model=ImageTaskResponse)
async def create_image_task(request: ImageTaskRequest, current_user: User = Depends(AuthControl.is_authed)):
    """
    创建图像生成任务

    支持两种模式：
    1. 新模式：通过 task_type + selected_configs 由后端组装提示词
    2. 兼容模式：直接传 prompt（向后兼容）
    """
    # 组装提示词
    final_prompt: str
    negative_prompt: Optional[str] = None

    if request.selected_configs:
        # 新模式：后端组装
        assembler = PromptAssembler(request.task_type.value)
        result = await assembler.assemble(
            selected_configs=request.selected_configs,
            user_prompt=request.user_prompt,
        )
        final_prompt = result.positive_prompt
        negative_prompt = result.negative_prompt
    elif request.prompt:
        # 向后兼容：使用前端传来的完整 prompt
        final_prompt = request.prompt
    else:
        raise HTTPException(status_code=400, detail="必须提供 selected_configs 或 prompt")

    # 创建任务
    task = ImageTask(
        id=str(uuid.uuid4()),
        user_id=str(current_user.id),
        task_type=request.task_type.value,
        prompt=final_prompt,
        user_prompt=request.user_prompt,
        selected_configs=request.selected_configs,
        negative_prompt=negative_prompt,
        reference_images=request.reference_images,
        aspect_ratio=request.aspect_ratio,
        resolution=request.resolution,
        status="queued",
    )
    await task.save()

    return {
        "task_id": task.id,
        "status": task.status,
        "created_at": task.created_at,
    }


@router.get("/tasks/{task_id}", response_model=ImageTaskDetailResponse)
async def get_task(task_id: str, current_user: User = Depends(AuthControl.is_authed)):
    """
    查询任务详情
    """
    task = await ImageTask.get_or_none(id=task_id, user_id=str(current_user.id), is_deleted=False)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    return {
        "task_id": task.id,
        "task_type": task.task_type,
        "status": task.status,
        "prompt": task.prompt,
        "user_prompt": task.user_prompt,
        "selected_configs": task.selected_configs,
        "negative_prompt": task.negative_prompt,
        "aspect_ratio": task.aspect_ratio,
        "resolution": task.resolution,
        "result": task.result_json,
        "error": {"code": task.error_code, "message": task.error_message} if task.error_code else None,
        "created_at": task.created_at,
        "started_at": task.started_at,
        "finished_at": task.finished_at,
    }


@router.get("/tasks", response_model=ImageTaskListResponse)
async def list_tasks(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status: Optional[str] = Query(default=None, description="状态筛选"),
    task_type: Optional[str] = Query(default=None, description="任务类型筛选"),
    current_user: User = Depends(AuthControl.is_authed),
):
    """
    获取用户任务列表

    支持按状态和任务类型筛选。
    """
    query = ImageTask.filter(user_id=str(current_user.id), is_deleted=False)

    if status:
        query = query.filter(status=status)

    if task_type:
        query = query.filter(task_type=task_type)

    total = await query.count()
    tasks = await query.order_by("-created_at").offset(offset).limit(limit)

    return {
        "tasks": [
            {
                "task_id": t.id,
                "task_type": t.task_type,
                "status": t.status,
                "prompt": t.prompt,
                "user_prompt": t.user_prompt,
                "selected_configs": t.selected_configs,
                "negative_prompt": t.negative_prompt,
                "aspect_ratio": t.aspect_ratio,
                "resolution": t.resolution,
                "result": t.result_json,
                "error": {"code": t.error_code, "message": t.error_message} if t.error_code else None,
                "created_at": t.created_at,
                "started_at": t.started_at,
                "finished_at": t.finished_at,
            }
            for t in tasks
        ],
        "total": total,
    }


# ============ Batch API 端点 ============


@router.post("/batch-generate", response_model=BatchImageTaskResponse)
async def create_batch_image_task(
    request: BatchImageTaskRequest,
    current_user: User = Depends(AuthControl.is_authed),
):
    """
    创建批量图像生成任务（使用 Gemini Batch API，50% 价格）

    特点：
    - 价格：标准价格的 50%
    - 处理时间：目标 24 小时内完成（通常更快）
    - 适用场景：离线批量处理，无需实时结果

    限制：
    - 每次最多 100 个 prompt
    - 不支持参考图片
    """
    if len(request.prompts) > 100:
        raise HTTPException(status_code=400, detail="每次最多支持 100 个 prompt")

    # 创建 Gemini Batch 任务
    result = create_batch_job(
        prompts=request.prompts,
        aspect_ratio=request.aspect_ratio,
        resolution=request.resolution,
    )

    if result["status"] != "success":
        raise HTTPException(status_code=500, detail=f"创建批量任务失败: {result.get('error')}")

    # 创建本地记录
    batch_id = str(uuid.uuid4())
    batch_task = ImageTask(
        id=batch_id,
        user_id=str(current_user.id),
        prompt=f"Batch task with {len(request.prompts)} prompts",
        aspect_ratio=request.aspect_ratio,
        resolution=request.resolution,
        status="queued",
        result_json={"batch_name": result["batch_name"], "task_count": len(request.prompts)},
    )
    await batch_task.save()

    return {
        "batch_id": batch_id,
        "batch_name": result["batch_name"],
        "task_count": len(request.prompts),
        "status": "queued",
        "estimated_completion_hours": 24,
        "created_at": datetime.utcnow(),
    }


@router.get("/batch/{batch_name}/status", response_model=BatchTaskStatusResponse)
async def get_batch_task_status(
    batch_name: str,
    current_user: User = Depends(AuthControl.is_authed),
):
    """
    查询批量任务状态

    返回：
    - state: 任务状态（PENDING, RUNNING, SUCCEEDED, FAILED）
    - completed_count: 已完成数量（如果有）
    """
    result = get_batch_job_status(batch_name)

    if result["status"] != "success":
        raise HTTPException(status_code=500, detail=f"查询状态失败: {result.get('error')}")

    return {
        "batch_name": batch_name,
        "status": result.get("status", "unknown"),
        "state": result.get("state", "UNKNOWN"),
        "task_count": 0,  # Batch API 不直接返回数量
        "completed_count": None,
        "error": None,
    }


@router.get("/batch/{batch_name}/results", response_model=BatchTaskResultResponse)
async def get_batch_task_results(
    batch_name: str,
    current_user: User = Depends(AuthControl.is_authed),
):
    """
    获取批量任务结果

    注意：仅在任务状态为 SUCCEEDED 时调用
    """
    # 先检查状态
    status_result = get_batch_job_status(batch_name)
    if status_result.get("state", "").upper() != "SUCCEEDED":
        raise HTTPException(status_code=400, detail=f"任务尚未完成，当前状态: {status_result.get('state', 'UNKNOWN')}")

    # 获取结果
    result = get_batch_results(batch_name)

    if result["status"] != "success":
        raise HTTPException(status_code=500, detail=f"获取结果失败: {result.get('error')}")

    return {
        "batch_name": batch_name,
        "status": "success",
        "results": result.get("results", []),
    }


# ============ Admin API 端点 ============


class AdminImageTaskResponse(BaseModel):
    """管理端任务列表响应（包含用户信息）"""

    task_id: str
    user_id: str
    username: Optional[str] = None
    task_type: str = "general"
    status: str
    prompt: str
    user_prompt: Optional[str] = None
    selected_configs: Optional[dict] = None
    negative_prompt: Optional[str] = None
    aspect_ratio: str
    resolution: str
    result: Optional[dict] = None
    error: Optional[dict] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None


class AdminTaskListResponse(BaseModel):
    """管理端任务列表响应"""

    code: int
    msg: str
    data: list
    total: int


@router.get("/admin/tasks", response_model=AdminTaskListResponse)
async def admin_list_tasks(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status: Optional[str] = Query(default=None, description="状态筛选"),
    task_type: Optional[str] = Query(default=None, description="任务类型筛选"),
    user_id: Optional[str] = Query(default=None, description="用户ID筛选"),
    current_user: User = Depends(AuthControl.is_authed),
):
    """
    管理员获取所有图像生成任务列表

    仅超级用户可访问，返回所有用户的任务记录。
    支持按状态、任务类型、用户ID筛选，支持分页。
    """
    # 检查是否为超级用户
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="仅超级管理员可访问此接口")

    query = ImageTask.filter(is_deleted=False)

    if status:
        query = query.filter(status=status)

    if task_type:
        query = query.filter(task_type=task_type)

    if user_id:
        query = query.filter(user_id=user_id)

    total = await query.count()
    tasks = await query.order_by("-created_at").offset(offset).limit(limit)

    # 构建任务列表，同时获取用户名
    task_list = []
    for t in tasks:
        # 获取用户名
        username = None
        if t.user_id:
            user = await User.get_or_none(id=t.user_id)
            username = user.username if user else None

        task_list.append(
            {
                "task_id": t.id,
                "user_id": t.user_id,
                "username": username,
                "task_type": t.task_type,
                "status": t.status,
                "prompt": t.prompt[:100] + "..." if len(t.prompt) > 100 else t.prompt,
                "user_prompt": t.user_prompt,
                "selected_configs": t.selected_configs,
                "negative_prompt": t.negative_prompt,
                "aspect_ratio": t.aspect_ratio,
                "resolution": t.resolution,
                "result": t.result_json,
                "error": {"code": t.error_code, "message": t.error_message} if t.error_code else None,
                "created_at": t.created_at,
                "started_at": t.started_at,
                "finished_at": t.finished_at,
            }
        )

    return {
        "code": 200,
        "msg": "success",
        "data": task_list,
        "total": total,
    }


@router.get("/admin/tasks/{task_id}", response_model=AdminImageTaskResponse)
async def admin_get_task(
    task_id: str,
    current_user: User = Depends(AuthControl.is_authed),
):
    """
    管理员获取单个任务详情

    仅超级用户可访问。
    """
    # 检查是否为超级用户
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="仅超级管理员可访问此接口")

    task = await ImageTask.get_or_none(id=task_id, is_deleted=False)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    # 获取用户名
    username = None
    if task.user_id:
        user = await User.get_or_none(id=task.user_id)
        username = user.username if user else None

    return Success(data={
        "task_id": task.id,
        "user_id": task.user_id,
        "username": username,
        "task_type": task.task_type,
        "status": task.status,
        "prompt": task.prompt,
        "user_prompt": task.user_prompt,
        "selected_configs": task.selected_configs,
        "negative_prompt": task.negative_prompt,
        "aspect_ratio": task.aspect_ratio,
        "resolution": task.resolution,
        "result": task.result_json,
        "error": {"code": task.error_code, "message": task.error_message} if task.error_code else None,
        "created_at": task.created_at,
        "started_at": task.started_at,
        "finished_at": task.finished_at,
    })
