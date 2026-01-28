from tortoise import fields

from .base import BaseModel, TimestampMixin


class PromptConfigGroup(BaseModel, TimestampMixin):
    """
    配置组表
    """
    group_key = fields.CharField(max_length=64, unique=True, description="配置组唯一标识")
    group_name = fields.CharField(max_length=100, description="显示名称")
    description = fields.TextField(null=True, description="配置组描述")
    input_type = fields.CharField(max_length=32, description="select/radio/radiobox/checkbox/slider/toggle")
    is_multiple = fields.BooleanField(default=False, description="是否支持多选")
    is_required = fields.BooleanField(default=False, description="是否必选")
    placeholder = fields.CharField(max_length=255, null=True, description="占位提示文字")
    default_option_key = fields.CharField(max_length=64, null=True, description="默认选项key")
    sort_order = fields.IntField(default=0, description="排序权重")
    is_active = fields.BooleanField(default=True, description="是否启用")
    is_system = fields.BooleanField(default=False, description="系统内置配置")

    class Meta:
        table = "prompt_config_group"
        indexes = [
            ("is_active", "sort_order"),
        ]


class PromptConfigOption(BaseModel, TimestampMixin):
    """
    配置选项表
    """
    group = fields.ForeignKeyField("models.PromptConfigGroup", related_name="options", index=True)
    option_key = fields.CharField(max_length=64, description="选项唯一标识")
    option_label = fields.CharField(max_length=100, description="前端显示名称")
    prompt_text = fields.TextField(null=True, description="转换后的正面提示词片段")
    negative_prompt = fields.TextField(null=True, description="负面提示词片段")
    prompt_order = fields.IntField(default=2, description="提示词排序：1=前面 2=中间 3=后面")
    image_url = fields.CharField(max_length=500, null=True, description="选项预览图URL")
    description = fields.TextField(null=True, description="选项描述说明")
    sort_order = fields.IntField(default=0, description="排序权重")
    is_active = fields.BooleanField(default=True, description="是否启用")
    is_default = fields.BooleanField(default=False, description="是否默认选项")

    class Meta:
        table = "prompt_config_option"
        unique_together = (("group", "option_key"),)
        indexes = [
            ("group", "is_active"),
            ("group", "sort_order"),
        ]


class PromptCombinationRule(BaseModel):
    """
    组合规则表
    """
    created_at = fields.DatetimeField(auto_now_add=True)
    name = fields.CharField(max_length=100, description="规则名称")
    description = fields.TextField(null=True, description="规则描述")
    condition_json = fields.JSONField(description="触发条件")
    action_type = fields.CharField(max_length=32, description="append/prepend/replace/remove")
    target = fields.CharField(max_length=16, description="positive / negative / both")
    action_prompt = fields.TextField(description="执行的动作内容")
    priority = fields.IntField(default=0, description="优先级")
    is_active = fields.BooleanField(default=True, description="是否启用")

    class Meta:
        table = "prompt_combination_rule"


class PromptConfigSetting(BaseModel, TimestampMixin):
    """
    系统配置表
    """
    key = fields.CharField(max_length=64, unique=True, index=True, description="配置键")
    value = fields.TextField(description="配置值")
    value_type = fields.CharField(max_length=32, description="text/json/list")
    description = fields.TextField(null=True, description="配置描述")
    group_name = fields.CharField(max_length=100, null=True, description="配置分组名称")
    sort_order = fields.IntField(default=0, description="排序权重")
    is_editable = fields.BooleanField(default=True, description="是否可编辑")

    class Meta:
        table = "prompt_config_setting"
        indexes = [
            ("group_name", "sort_order"),
        ]


class PromptUserConfig(BaseModel, TimestampMixin):
    """
    用户配置表
    """
    user_id = fields.BigIntField(index=True, description="关联用户ID")
    group = fields.ForeignKeyField("models.PromptConfigGroup", related_name="user_configs")
    selected_options = fields.JSONField(description="用户选择的选项key数组")
    custom_prompts = fields.JSONField(null=True, description="自定义的提示词片段覆盖")
    is_inherited = fields.BooleanField(default=True, description="是否继承系统默认")
    source_config_id = fields.BigIntField(null=True, description="来源配置ID")

    class Meta:
        table = "prompt_user_config"
        unique_together = (("user_id", "group"),)
