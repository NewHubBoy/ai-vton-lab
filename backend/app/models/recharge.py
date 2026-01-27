from tortoise import fields

from .base import BaseModel, TimestampMixin


class RechargeRecord(BaseModel, TimestampMixin):
    """充值记录"""
    user_id = fields.IntField(description="用户ID", index=True)
    order_no = fields.CharField(max_length=64, unique=True, description="订单号", index=True)

    # 充值金额相关
    amount = fields.DecimalField(max_digits=10, decimal_places=2, description="充值金额(元)")
    currency = fields.CharField(max_length=3, default="CNY", description="货币类型")

    # 兑换积分相关
    credits = fields.IntField(description="兑换积分数量")
    credit_per_yuan = fields.IntField(default=100, description="1元兑换积分比例")

    # 支付方式
    payment_method = fields.CharField(
        max_length=20,
        description="支付方式: card(卡密), stripe, alipay, wechat, bank"
    )
    payment_status = fields.CharField(
        max_length=20, default="pending",
        description="支付状态: pending, processing, succeeded, failed, cancelled"
    )

    # 第三方支付信息
    stripe_payment_intent_id = fields.CharField(max_length=128, null=True, description="Stripe支付意图ID")
    stripe_session_id = fields.CharField(max_length=128, null=True, description="Stripe会话ID")
    alipay_order_no = fields.CharField(max_length=128, null=True, description="支付宝订单号")
    wechat_order_no = fields.CharField(max_length=128, null=True, description="微信订单号")

    # 卡密信息
    card_code = fields.CharField(max_length=64, null=True, description="卡密代码")

    # 管理员操作
    admin_id = fields.IntField(null=True, description="处理管理员ID")
    admin_remark = fields.CharField(max_length=500, null=True, description="管理员备注")

    class Meta:
        table = "recharge_record"
        ordering = ["-created_at"]

    @property
    def status_text(self) -> str:
        """状态文本"""
        status_map = {
            "pending": "待支付",
            "processing": "处理中",
            "succeeded": "成功",
            "failed": "失败",
            "cancelled": "已取消",
        }
        return status_map.get(self.payment_status, self.payment_status)

    @property
    def payment_method_text(self) -> str:
        """支付方式文本"""
        method_map = {
            "card": "卡密兑换",
            "stripe": "Stripe",
            "alipay": "支付宝",
            "wechat": "微信支付",
            "bank": "银行卡",
        }
        return method_map.get(self.payment_method, self.payment_method)


class CardCode(BaseModel, TimestampMixin):
    """卡密"""
    code = fields.CharField(max_length=64, unique=True, description="卡密", index=True)
    batch_no = fields.CharField(max_length=32, description="批次号", index=True)
    amount = fields.DecimalField(max_digits=10, decimal_places=2, description="面额(元)")
    credits = fields.IntField(description="兑换积分")
    is_used = fields.BooleanField(default=False, description="是否已使用", index=True)
    used_by_id = fields.IntField(null=True, description="使用者ID")
    used_at = fields.DatetimeField(null=True, description="使用时间")
    expired_at = fields.DatetimeField(null=True, description="过期时间")
    is_active = fields.BooleanField(default=True, description="是否激活")

    class Meta:
        table = "card_code"

    @property
    def is_expired(self) -> bool:
        """是否过期"""
        if self.expired_at is None:
            return False
        from datetime import datetime
        return datetime.now() > self.expired_at


class RechargeConfig(BaseModel, TimestampMixin):
    """充值配置"""
    name = fields.CharField(max_length=64, description="配置名称")
    amount = fields.DecimalField(max_digits=10, decimal_places=2, description="金额(元)")
    credits = fields.IntField(description="赠送积分")
    bonus_ratio = fields.DecimalField(max_digits=5, decimal_places=2, default=0, description="赠送比例")
    is_active = fields.BooleanField(default=True, description="是否启用")
    sort_order = fields.IntField(default=0, description="排序")
    description = fields.CharField(max_length=255, null=True, description="描述")

    class Meta:
        table = "recharge_config"
        ordering = ["sort_order"]
