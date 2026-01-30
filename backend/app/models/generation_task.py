from enum import Enum
from tortoise import fields
from .base import BaseModel, TimestampMixin


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


class GenerationTask(BaseModel):
    """
    通用生成任务主表
    """

    id = fields.UUIDField(pk=True)
    user_id = fields.CharField(max_length=36, index=True, description="用户ID")
    task_type = fields.CharEnumField(TaskType, description="任务类型")
    status = fields.CharEnumField(TaskStatus, default=TaskStatus.QUEUED, index=True, description="任务状态")

    # 通用参数
    prompt = fields.TextField(null=True, description="正向提示词")
    aspect_ratio = fields.CharField(max_length=16, null=True, description="图片比例 3:4/9:16/1:1")
    quality = fields.CharField(max_length=16, default="1K", description="图片质量 1K/2K/4K")

    # 结果与错误
    result = fields.JSONField(null=True, description="通用结果数据")
    error = fields.JSONField(null=True, description="错误信息 {code, message}")

    # 元数据
    platform = fields.CharField(max_length=32, null=True, description="来源平台")

    # 时间戳
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    started_at = fields.DatetimeField(null=True, description="开始时间")
    finished_at = fields.DatetimeField(null=True, description="完成时间")

    # 软删除
    is_deleted = fields.BooleanField(default=False, description="是否删除")

    class Meta:
        table = "generation_task"
        ordering = ["-created_at"]


class TaskTryon(BaseModel):
    """
    虚拟试穿任务子表
    """

    id = fields.UUIDField(pk=True)
    task = fields.OneToOneField("models.GenerationTask", related_name="tryon", on_delete=fields.CASCADE)

    person_image = fields.CharField(max_length=1000, description="模特/人物图URL")
    garment_image = fields.CharField(max_length=1000, description="服装图URL")
    category = fields.CharField(max_length=32, description="服装分类")
    seed = fields.IntField(default=-1, description="随机种子")
    mask_image = fields.CharField(max_length=1000, null=True, description="遮罩图URL")

    class Meta:
        table = "task_tryon"


class TaskModel(BaseModel):
    """
    模特生成任务子表 (预留)
    """

    id = fields.UUIDField(pk=True)
    task = fields.OneToOneField("models.GenerationTask", related_name="model_gen", on_delete=fields.CASCADE)

    base_model = fields.CharField(max_length=100, null=True, description="基座模型")
    lora_config = fields.JSONField(null=True, description="LoRA配置")
    num_inference_steps = fields.IntField(null=True, description="步数")
    guidance_scale = fields.FloatField(null=True, description="CFG Scale")

    class Meta:
        table = "task_model"


class TaskDetail(BaseModel):
    """
    详情页生成任务子表
    """

    id = fields.UUIDField(pk=True)
    task = fields.OneToOneField("models.GenerationTask", related_name="detail", on_delete=fields.CASCADE)

    input_image = fields.CharField(max_length=1000, description="原始商品图URL")
    template = fields.ForeignKeyField(
        "models.DetailTemplate", related_name="tasks", null=True, description="使用的模版"
    )
    extra_options = fields.JSONField(null=True, description="模版填充数据")

    class Meta:
        table = "task_detail"
