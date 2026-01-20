from tortoise import fields

from .base import BaseModel, TimestampMixin


class ImageTask(BaseModel, TimestampMixin):
    """
    图像生成任务模型

    可扩展：
    - 升级 Celery: 添加 celery_task_id 字段追踪 Celery 任务
    - 升级 Redis: 添加 redis_queue 字段记录队列信息
    """
    id = fields.CharField(max_length=36, pk=True, description="任务ID (UUID)")
    user_id = fields.CharField(max_length=36, description="用户ID", index=True)

    # 任务状态：queued/running/succeeded/failed
    status = fields.CharField(
        max_length=32,
        default="queued",
        description="任务状态",
        index=True
    )

    # 生成参数
    prompt = fields.TextField(description="提示词")
    reference_images = fields.JSONField(null=True, description="参考图片路径列表")
    aspect_ratio = fields.CharField(max_length=8, default="1:1", description="宽高比")
    resolution = fields.CharField(max_length=8, default="1K", description="分辨率")

    # 提供商信息
    provider = fields.CharField(max_length=32, default="google", description="提供商")

    # 错误信息
    error_code = fields.CharField(max_length=64, null=True, description="错误码")
    error_message = fields.TextField(null=True, description="错误信息")

    # 结果
    result_json = fields.JSONField(null=True, description="生成结果")

    # 时间戳
    started_at = fields.DatetimeField(null=True, description="开始时间")
    finished_at = fields.DatetimeField(null=True, description="完成时间")

    class Meta:
        table = "image_task"
        # 可扩展：添加索引优化查询
        indexes = [
            ("user_id", "status"),  # 查询用户任务状态
        ]

    class PydanticMeta:
        exclude_fields = ["updated_at"]
