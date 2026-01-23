from tortoise import fields

from .base import BaseModel, TimestampMixin


class ModelPhoto(BaseModel, TimestampMixin):
    """
    模特生成记录表
    """
    user_id = fields.BigIntField(index=True, description="发起用户ID")
    task_id = fields.CharField(max_length=36, null=True, index=True, description="关联的ImageTask.ID")
    batch_id = fields.CharField(max_length=36, null=True, description="批量任务ID")
    name = fields.CharField(max_length=100, null=True, description="模特名称/编号")
    description = fields.TextField(null=True, description="描述")
    generation_type = fields.CharField(max_length=32, index=True, description="生成类型：text2img / img2img / tryon")
    generation_params = fields.JSONField(null=True, description="生成参数快照")

    # Prompt 配置关联
    selected_options = fields.JSONField(null=True, description="用户选择的配置选项")
    custom_prompts = fields.JSONField(null=True, description="自定义的 prompt 片段覆盖")
    final_prompt = fields.TextField(null=True, description="组合后的完整正面提示词")
    final_negative_prompt = fields.TextField(null=True, description="组合后的完整负面提示词")
    prompt_config_snapshot = fields.JSONField(null=True, description="生成时使用的配置快照")

    # 生成参数
    reference_images = fields.JSONField(null=True, description="参考图片URL列表")
    aspect_ratio = fields.CharField(max_length=8, null=True, description="1:1 / 3:4 / 9:16")
    resolution = fields.CharField(max_length=16, null=True, description="1024x1024")
    model_version = fields.CharField(max_length=64, null=True, description="模型版本")
    pipeline_version = fields.CharField(max_length=64, null=True, description="推理/算法流水线版本")

    # 生成状态
    status = fields.CharField(max_length=32, default="queued", index=True, description="queued/processing/completed/failed")
    progress = fields.IntField(default=0, description="进度百分比 0-100")
    error_code = fields.CharField(max_length=64, null=True, description="错误码")
    error_message = fields.TextField(null=True, description="错误详情")
    started_at = fields.DatetimeField(null=True, description="开始时间")
    finished_at = fields.DatetimeField(null=True, description="完成时间")
    generation_time = fields.FloatField(null=True, description="耗时(秒)")

    # 统计信息
    image_count = fields.IntField(default=0, description="生成图片数量")
    total_size = fields.BigIntField(default=0, description="总大小(bytes)")
    is_deleted = fields.BooleanField(default=False, description="软删除")
    deleted_at = fields.DatetimeField(null=True, description="删除时间")

    class Meta:
        table = "model_photo"
        indexes = [
            ("user_id", "created_at"),
            ("user_id", "status"),
        ]


class ModelImage(BaseModel):
    """
    模特图片表
    """
    created_at = fields.DatetimeField(auto_now_add=True, index=True)
    model_photo = fields.ForeignKeyField("models.ModelPhoto", related_name="images", index=True)
    user_id = fields.BigIntField(description="上传用户ID")

    # 图片基本信息
    filename = fields.CharField(max_length=255, description="原始文件名")
    width = fields.IntField(null=True, description="宽度(px)")
    height = fields.IntField(null=True, description="高度(px)")
    size = fields.BigIntField(null=True, description="文件大小(bytes)")
    content_type = fields.CharField(max_length=100, null=True, description="MIME类型")
    extension = fields.CharField(max_length=20, null=True, description=".jpg/.png 等")

    # OSS 信息
    oss_object_name = fields.CharField(max_length=500, index=True, description="OSS对象名/路径")
    oss_url = fields.CharField(max_length=1000, null=True, description="OSS访问URL")
    oss_cdn_url = fields.CharField(max_length=1000, null=True, description="CDN URL")
    oss_folder = fields.CharField(max_length=100, null=True, description="存储文件夹")
    local_path = fields.CharField(max_length=500, null=True, description="本地备份路径")
    is_uploaded = fields.BooleanField(default=False, description="是否已上传OSS")
    uploaded_at = fields.DatetimeField(null=True, description="上传时间")

    # 图片分类
    image_type = fields.CharField(max_length=32, description="preview/result/thumbnail")
    is_primary = fields.BooleanField(default=False, description="是否主图")
    sort_order = fields.IntField(default=0, description="排序权重")
    is_deleted = fields.BooleanField(default=False, description="软删除")
    parent_image = fields.ForeignKeyField("models.ModelImage", related_name="children", null=True, description="父图ID")

    class Meta:
        table = "model_image"
        indexes = [
            ("user_id", "created_at"),
        ]


class ModelPhotoOption(BaseModel):
    """
    生成选项明细表
    """
    created_at = fields.DatetimeField(auto_now_add=True)
    model_photo = fields.ForeignKeyField("models.ModelPhoto", related_name="options", index=True)
    user_id = fields.BigIntField(description="发起用户ID")
    group_key = fields.CharField(max_length=64, description="配置组key")
    option_key = fields.CharField(max_length=64, description="选项key")
    option_label = fields.CharField(max_length=100, null=True, description="选项显示名")

    class Meta:
        table = "model_photo_option"
        indexes = [
            ("group_key", "option_key"),
            ("user_id", "created_at"),
        ]


class ModelInputImage(BaseModel):
    """
    生成输入图片表
    """
    created_at = fields.DatetimeField(auto_now_add=True)
    model_photo = fields.ForeignKeyField("models.ModelPhoto", related_name="inputs", index=True)
    user_id = fields.BigIntField(description="上传用户ID")
    role = fields.CharField(max_length=32, description="base_model/garment/mask/pose/control/depth/seg")
    filename = fields.CharField(max_length=255, null=True, description="原始文件名")
    width = fields.IntField(null=True, description="宽度(px)")
    height = fields.IntField(null=True, description="高度(px)")
    size = fields.BigIntField(null=True, description="文件大小(bytes)")
    content_type = fields.CharField(max_length=100, null=True, description="MIME类型")
    extension = fields.CharField(max_length=20, null=True, description=".jpg/.png")
    oss_object_name = fields.CharField(max_length=500, index=True, description="OSS对象名/路径")
    oss_url = fields.CharField(max_length=1000, null=True, description="OSS访问URL")
    meta = fields.JSONField(null=True, description="角色相关参数")
    is_deleted = fields.BooleanField(default=False, description="软删除")

    class Meta:
        table = "model_input_image"
        # indexes defined in list of tuples if multiple fields, or individual index=True
