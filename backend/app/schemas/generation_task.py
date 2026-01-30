from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field

# ============ Enums ============


class TaskType(str, Enum):
    """任务类型枚举"""

    TRYON = "tryon"
    MODEL = "model"
    DETAIL = "detail"


class TaskStatus(str, Enum):
    """任务状态枚举"""

    QUEUED = "queued"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    FAILED = "failed"


# ============ Shared Schemas ============


class TaskBase(BaseModel):
    prompt: Optional[str] = Field(None, description="正向提示词")
    aspect_ratio: Optional[str] = Field("3:4", description="图片比例 3:4/9:16/1:1")
    quality: Optional[str] = Field("1K", description="图片质量 1K/2K/4K")
    platform: Optional[str] = Field(None, description="来源平台")


# ============ Request Schemas ============


class TaskTryonParams(BaseModel):
    """虚拟试穿特定参数"""

    person_image: str = Field(..., description="模特/人物图URL")
    garment_image: str = Field(..., description="服装图URL")
    category: str = Field(..., description="服装分类")
    seed: int = Field(-1, description="随机种子")
    mask_image: Optional[str] = Field(None, description="遮罩图URL")


class TaskDetailParams(BaseModel):
    """详情页特定参数"""

    input_image: str = Field(..., description="原始商品图URL")
    template_id: str = Field(..., description="使用的模版ID")
    extra_options: Optional[Dict[str, Any]] = Field(None, description="模版填充数据")


class TaskModelParams(BaseModel):
    """模特生成特定参数 (预留)"""

    base_model: Optional[str] = Field(None)
    lora_config: Optional[Dict[str, Any]] = Field(None)
    num_inference_steps: Optional[int] = Field(None)
    guidance_scale: Optional[float] = Field(None)


class CreateTaskRequest(TaskBase):
    """创建任务通用请求"""

    task_type: TaskType = Field(..., description="任务类型")

    # 类型特定参数 (选填，根据 task_type 校验)
    tryon: Optional[TaskTryonParams] = Field(None, description="试穿参数")
    detail: Optional[TaskDetailParams] = Field(None, description="详情页参数")
    model: Optional[TaskModelParams] = Field(None, description="模特生成参数")


# ============ Response Schemas ============


class TaskTryonResponse(TaskTryonParams):
    class Config:
        from_attributes = True


class TaskDetailResponse(TaskDetailParams):
    class Config:
        from_attributes = True


class TaskModelResponse(TaskModelParams):
    class Config:
        from_attributes = True


class GenerationTaskResponse(BaseModel):
    """通用任务响应"""

    id: UUID | str
    user_id: str
    task_type: TaskType
    status: TaskStatus
    prompt: Optional[str]
    aspect_ratio: Optional[str]
    quality: Optional[str]
    result: Optional[List[str]] = Field(None, description="结果图片URL列表")
    error: Optional[Dict[str, Any]]
    created_at: datetime
    started_at: Optional[datetime]
    finished_at: Optional[datetime]
    is_deleted: bool = False

    # 子表数据
    tryon: Optional[TaskTryonResponse] = None
    detail: Optional[TaskDetailResponse] = None
    model: Optional[TaskModelResponse] = None

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    data: List[GenerationTaskResponse]
