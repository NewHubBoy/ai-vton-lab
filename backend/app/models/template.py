from tortoise import fields
from .base import BaseModel


class DetailTemplate(BaseModel):
    """
    详情页模版表
    """

    id = fields.UUIDField(pk=True)
    name = fields.CharField(max_length=100, description="模版名称")
    cover_image = fields.CharField(max_length=1000, null=True, description="模版封面图")
    config = fields.JSONField(default={}, description="模版配置(布局/图层等)")
    is_active = fields.BooleanField(default=True, description="是否启用")
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")

    class Meta:
        table = "detail_template"
        ordering = ["-created_at"]
