from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ============ Enums ============


class TaskTypeEnum(str, Enum):
    """任务类型枚举：tryon=虚拟试穿, model=模特生成, detail=商品详情"""

    TRYON = "tryon"  # 虚拟试穿
    MODEL = "model"  # 模特生成
    DETAIL = "detail"  # 商品详情


# ============ Request Schemas ============


class ImageTaskRequest(BaseModel):
    """
    图像生成请求

    支持两种模式：
    1. 新模式：通过 task_type + selected_configs 由后端组装提示词
    2. 兼容模式：直接传 prompt（向后兼容）
    """

    # 任务类型（必填）
    task_type: TaskTypeEnum = Field(
        default=TaskTypeEnum.TRYON,
        description="任务类型: tryon/model/detail"
    )

    # 用户自定义提示词（可选，用于补充描述）
    user_prompt: Optional[str] = Field(
        default=None,
        description="用户自定义提示词",
        max_length=2000
    )

    # 用户选择的配置项
    selected_configs: Optional[Dict[str, List[str]]] = Field(
        default=None,
        description="用户选择的配置项 {group_key: [option_key, ...]}"
    )

    # 参考图片
    reference_images: Optional[List[str]] = Field(
        default=None,
        description="参考图片路径列表"
    )

    # 其他参数
    aspect_ratio: str = Field(default="1:1", description="宽高比")
    resolution: str = Field(default="1K", description="分辨率")

    # 向后兼容：直接提供完整 prompt
    prompt: Optional[str] = Field(
        default=None,
        description="完整提示词（向后兼容，优先使用 selected_configs）",
        max_length=5000
    )


class BatchImageTaskRequest(BaseModel):
    """
    批量图像生成请求（使用 Batch API，50% 价格，24小时内完成）

    可扩展：
    - webhook_url: 完成回调
    """
    prompts: List[str] = Field(..., description="提示词列表", min_length=1, max_length=100)
    aspect_ratio: str = Field(default="1:1", description="宽高比")
    resolution: str = Field(default="1K", description="分辨率")


# ============ Response Schemas ============

class ImageResult(BaseModel):
    """生成的单张图片"""
    url: str = Field(..., description="图片URL")
    width: int = Field(..., description="宽度")
    height: int = Field(..., description="高度")


class ImageTaskResponse(BaseModel):
    """创建任务响应"""
    task_id: str = Field(..., description="任务ID")
    status: str = Field(..., description="任务状态")
    created_at: datetime = Field(..., description="创建时间")


class BatchImageTaskResponse(BaseModel):
    """批量任务创建响应"""
    batch_id: str = Field(..., description="批量任务ID")
    batch_name: str = Field(..., description="Gemini Batch 任务名称")
    task_count: int = Field(..., description="任务数量")
    status: str = Field(default="queued", description="任务状态")
    estimated_completion_hours: int = Field(default=24, description="预计完成时间（小时）")
    created_at: datetime = Field(..., description="创建时间")


class BatchTaskStatusResponse(BaseModel):
    """批量任务状态响应"""
    batch_name: str = Field(..., description="Gemini Batch 任务名称")
    status: str = Field(..., description="状态")
    state: str = Field(..., description="详细状态")
    task_count: int = Field(..., description="任务数量")
    completed_count: Optional[int] = Field(default=None, description="完成数量")
    error: Optional[str] = Field(default=None, description="错误信息")


class BatchTaskResultResponse(BaseModel):
    """批量任务结果响应"""
    batch_name: str = Field(..., description="Gemini Batch 任务名称")
    status: str = Field(..., description="总体状态")
    results: List[dict] = Field(..., description="每个任务的结果")


class ImageTaskDetailResponse(BaseModel):
    """任务详情响应（兼容轮询降级）"""

    task_id: str = Field(..., description="任务ID")
    task_type: str = Field(default="general", description="任务类型")
    status: str = Field(..., description="任务状态")
    prompt: str = Field(..., description="提示词（组装后）")
    user_prompt: Optional[str] = Field(default=None, description="用户原始输入")
    selected_configs: Optional[Dict[str, List[str]]] = Field(default=None, description="用户选择的配置项")
    negative_prompt: Optional[str] = Field(default=None, description="负向提示词")
    aspect_ratio: str = Field(default="1:1", description="宽高比")
    resolution: str = Field(default="1K", description="分辨率")

    result: Optional[dict] = Field(default=None, description="生成结果")
    error: Optional[dict] = Field(default=None, description="错误信息")

    created_at: datetime = Field(..., description="创建时间")
    started_at: Optional[datetime] = Field(default=None, description="开始时间")
    finished_at: Optional[datetime] = Field(default=None, description="完成时间")

    class Config:
        from_attributes = True


class ImageTaskListResponse(BaseModel):
    """任务列表响应"""
    tasks: List[ImageTaskDetailResponse]
    total: int


# ============ WebSocket Message Schemas ============

class WSHeartbeat(BaseModel):
    """WebSocket 心跳"""
    type: str = "heartbeat"


class WSSubscribe(BaseModel):
    """WebSocket 订阅任务"""
    type: str = "subscribe"
    task_id: str = Field(..., description="要订阅的任务ID")


class WSTaskUpdate(BaseModel):
    """WebSocket 任务状态更新"""
    type: str = "task_update"
    task_id: str = Field(..., description="任务ID")
    status: str = Field(..., description="任务状态")
    progress: Optional[int] = Field(default=None, description="进度")
    result: Optional[dict] = Field(default=None, description="成功时的结果")
    error: Optional[dict] = Field(default=None, description="失败时的错误")
    finished_at: Optional[str] = Field(default=None, description="完成时间ISO字符串")
