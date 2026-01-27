from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


# ==================== 充值记录 Schema ====================

class RechargeRecordCreate(BaseModel):
    """创建充值记录"""
    amount: Decimal = Field(..., ge=0.01, description="充值金额")
    payment_method: str = Field(..., description="支付方式")
    config_id: Optional[int] = Field(default=None, description="充值配置ID")


class RechargeRecordResponse(BaseModel):
    """充值记录响应"""
    id: int
    order_no: str
    user_id: int
    amount: Decimal
    currency: str
    credits: int
    payment_method: str
    payment_status: str
    status_text: str
    payment_method_text: str
    created_at: datetime
    finished_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RechargeRecordListResponse(BaseModel):
    """充值记录列表响应"""
    data: list[RechargeRecordResponse]
    total: int
    limit: int
    offset: int


# ==================== 卡密 Schema ====================

class CardCodeCreate(BaseModel):
    """创建卡密"""
    amount: Decimal = Field(..., ge=0.01, description="面额")
    count: int = Field(default=1, ge=1, le=100, description="生成数量")
    expired_at: Optional[datetime] = Field(default=None, description="过期时间")


class CardCodeResponse(BaseModel):
    """卡密响应"""
    code: str
    amount: Decimal
    credits: int
    is_used: bool
    used_at: Optional[datetime] = None
    expired_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CardCodeRedeem(BaseModel):
    """卡密兑换"""
    code: str = Field(..., min_length=8, max_length=64, description="卡密")


class CardCodeBatchResponse(BaseModel):
    """批量卡密响应"""
    batch_no: str
    codes: list[CardCodeResponse]


# ==================== 充值配置 Schema ====================

class RechargeConfigCreate(BaseModel):
    """创建充值配置"""
    name: str = Field(..., min_length=1, max_length=64)
    amount: Decimal = Field(..., ge=0.01)
    credits: int = Field(..., ge=0)
    bonus_ratio: Decimal = Field(default=0, ge=0, description="赠送比例")
    description: Optional[str] = None
    sort_order: int = Field(default=0)
    is_active: bool = Field(default=True)


class RechargeConfigUpdate(BaseModel):
    """更新充值配置"""
    name: Optional[str] = None
    amount: Optional[Decimal] = None
    credits: Optional[int] = None
    bonus_ratio: Optional[Decimal] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class RechargeConfigResponse(BaseModel):
    """充值配置响应"""
    id: int
    name: str
    amount: Decimal
    credits: int
    bonus_ratio: Decimal
    bonus_credits: int  # 赠送积分 = credits * bonus_ratio
    description: Optional[str]
    is_active: bool
    sort_order: int

    class Config:
        from_attributes = True


# ==================== 支付相关 Schema ====================

class StripeCheckoutCreate(BaseModel):
    """创建 Stripe Checkout"""
    config_id: int = Field(..., description="充值配置ID")


class StripeCheckoutResponse(BaseModel):
    """Stripe Checkout 响应"""
    session_id: str
    checkout_url: str


class StripeWebhook(BaseModel):
    """Stripe Webhook"""
    type: str
    data: dict


class PaymentCallback(BaseModel):
    """支付回调基类"""
    order_no: str
    payment_method: str
    status: str
    amount: Optional[Decimal] = None
    transaction_id: Optional[str] = None


# ==================== 用户积分 Schema ====================

class UserCreditsResponse(BaseModel):
    """用户积分响应"""
    credit_balance: int
    total_recharged: int

    class Config:
        from_attributes = True
