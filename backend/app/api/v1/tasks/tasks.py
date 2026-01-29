import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.generation_task import GenerationTask, TaskTryon, TaskDetail, TaskModel, TaskType, TaskStatus
from app.models.template import DetailTemplate
from app.schemas.generation_task import CreateTaskRequest, GenerationTaskResponse, TaskListResponse
from app.schemas.base import Success, SuccessExtra
from app.core.dependency import AuthControl
from app.models import User

router = APIRouter()


@router.post("/generate", summary="创建生成任务")
async def create_task(request: CreateTaskRequest, current_user: User = Depends(AuthControl.is_authed)):
    # 1. 创建主任务
    task_id = uuid.uuid4()
    task = await GenerationTask.create(
        id=task_id,
        user_id=str(current_user.id),
        task_type=request.task_type,
        status=TaskStatus.QUEUED,
        prompt=request.prompt,
        aspect_ratio=request.aspect_ratio,
        quality=request.quality,
        platform=request.platform,
        started_at=datetime.utcnow(),  # 假设直接开始处理
    )

    # 2. 创建子任务
    try:
        if request.task_type == TaskType.TRYON:
            if not request.tryon:
                raise HTTPException(status_code=400, detail="Missing tryon parameters")
            await TaskTryon.create(id=uuid.uuid4(), task=task, **request.tryon.model_dump())

        elif request.task_type == TaskType.DETAIL:
            if not request.detail:
                raise HTTPException(status_code=400, detail="Missing detail parameters")

            # 验证模版是否存在
            template = await DetailTemplate.get_or_none(id=request.detail.template_id)
            if not template:
                raise HTTPException(status_code=404, detail="Template not found")

            await TaskDetail.create(
                id=uuid.uuid4(),
                task=task,
                input_image=request.detail.input_image,
                template=template,
                extra_options=request.detail.extra_options,
            )

        elif request.task_type == TaskType.MODEL:
            # 预留
            if request.model:
                await TaskModel.create(id=uuid.uuid4(), task=task, **request.model.model_dump())
    except Exception as e:
        await task.delete()  # 回滚
        raise e

    # 重新查询以返回完整数据 (包含反向关联)
    # Tortoise ORM 需要 fetch_related 获取关联数据
    # 这里为了返回 response 结构，再次查询
    created_task = await GenerationTask.filter(id=task_id).prefetch_related("tryon", "detail", "model_gen").first()

    # 实际项目中这里应该触发 Celery/Redis 队列
    # trigger_background_job(created_task)

    return Success(data=GenerationTaskResponse.model_validate(created_task))


@router.get("/", summary="获取任务列表")
async def list_tasks(
    page: int = 1,
    page_size: int = 20,
    task_type: Optional[TaskType] = None,
    status: Optional[TaskStatus] = None,
    current_user: User = Depends(AuthControl.is_authed),
):
    query = GenerationTask.filter(user_id=str(current_user.id))

    if task_type:
        query = query.filter(task_type=task_type)
    if status:
        query = query.filter(status=status)

    total = await query.count()
    items = (
        await query.prefetch_related("tryon", "detail", "model_gen")
        .order_by("-created_at")
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    return SuccessExtra(
        data=[GenerationTaskResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{task_id}", summary="获取任务详情")
async def get_task(task_id: str, current_user: User = Depends(AuthControl.is_authed)):
    task = await GenerationTask.get_or_none(id=task_id, user_id=str(current_user.id)).prefetch_related(
        "tryon", "detail", "model_gen"
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return Success(data=GenerationTaskResponse.model_validate(task))
