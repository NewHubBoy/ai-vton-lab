"""充值 API"""

import secrets
from datetime import datetime
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from fastapi.responses import JSONResponse
from tortoise.expressions import Q

from app.core.dependency import AuthControl

get_current_user = AuthControl.is_authed
from app.core.payment import payment_service
from app.models.admin import User
from app.models.recharge import RechargeRecord, CardCode, RechargeConfig
from app.schemas.base import SuccessExtra
from app.schemas.recharge import (
    RechargeRecordCreate,
    RechargeRecordListResponse,
    RechargeRecordResponse,
    CardCodeCreate,
    CardCodeBatchResponse,
    CardCodeRedeem,
    RechargeConfigCreate,
    RechargeConfigUpdate,
    RechargeConfigResponse,
    StripeCheckoutResponse,
    UserCreditsResponse,
)
from app.settings.config import settings

recharge_router = router = APIRouter()


# ==================== 用户端 API ====================


@router.get("/credits", response_model=UserCreditsResponse)
async def get_user_credits(current_user: User = Depends(get_current_user)):
    """获取用户积分"""
    return {
        "credit_balance": current_user.credit_balance,
        "total_recharged": current_user.total_recharged,
    }


@router.get("/records")
async def get_recharge_records(
    page: int = Query(1, description="页码"),
    page_size: int = Query(10, description="每页数量"),
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """获取用户充值记录"""
    query = RechargeRecord.filter(user_id=current_user.id)

    if status:
        query = query.filter(payment_status=status)

    total = await query.count()
    records = await query.offset((page - 1) * page_size).limit(page_size).order_by("-created_at")

    return SuccessExtra(data=[r for r in records], total=total, page=page, page_size=page_size)


@router.post("/create")
async def create_recharge_order(
    data: RechargeRecordCreate,
    current_user: User = Depends(get_current_user),
):
    """创建充值订单"""
    # 获取充值配置
    config = None
    credits = int(data.amount * settings.DEFAULT_CREDIT_PER_YUAN)

    if data.config_id:
        config = await RechargeConfig.filter(id=data.config_id, is_active=True).first()
        if config:
            credits = config.credits
            if config.bonus_ratio > 0:
                credits = int(credits * (1 + float(config.bonus_ratio)))

    # 验证支付方式
    valid_methods = ["stripe", "alipay", "wechat", "bank"]
    if data.payment_method not in valid_methods:
        raise HTTPException(status_code=400, detail=f"不支持的支付方式: {data.payment_method}")

    # 创建订单
    record = await payment_service.create_order(
        user_id=current_user.id,
        amount=data.amount,
        payment_method=data.payment_method,
        credits=credits,
        config_id=data.config_id,
    )

    # 如果是 Stripe，返回 Checkout URL
    if data.payment_method == "stripe":
        return {
            "order_no": record.order_no,
            "session_id": record.stripe_session_id,
            "checkout_url": f"/payment/stripe?session_id={record.stripe_session_id}",
        }

    return {
        "order_no": record.order_no,
        "status": "pending",
    }


@router.post("/card/redeem")
async def redeem_card_code(
    data: CardCodeRedeem,
    current_user: User = Depends(get_current_user),
):
    """兑换卡密"""
    result = await payment_service.process_card_code(
        user_id=current_user.id,
        code=data.code.strip(),
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result


@router.get("/configs")
async def get_recharge_configs():
    """获取充值配置列表"""
    configs = await RechargeConfig.filter(is_active=True).order_by("sort_order")
    return configs


# ==================== 管理端 API ====================


@router.get("/admin/records")
async def admin_get_recharge_records(
    page: int = Query(1, description="页码"),
    page_size: int = Query(10, description="每页数量"),
    user_id: Optional[int] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """管理端获取所有充值记录"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="权限不足")

    query = RechargeRecord.all()

    if user_id:
        query = query.filter(user_id=user_id)
    if status:
        query = query.filter(payment_status=status)

    total = await query.count()
    records = await query.offset((page - 1) * page_size).limit(page_size).order_by("-created_at")

    # 关联用户信息
    result = []
    for r in records:
        user = await User.get(id=r.user_id)
        record_dict = {
            "id": r.id,
            "order_no": r.order_no,
            "user_id": r.user_id,
            "username": user.username,
            "amount": r.amount,
            "credits": r.credits,
            "payment_method": r.payment_method,
            "payment_status": r.payment_status,
            "status_text": r.status_text,
            "payment_method_text": r.payment_method_text,
            "created_at": r.created_at,
            "finished_at": r.finished_at,
        }
        result.append(record_dict)

    return SuccessExtra(data=result, total=total, page=page, page_size=page_size)


@router.post("/admin/card/generate")
async def admin_generate_card_codes(
    data: CardCodeCreate,
    current_user: User = Depends(get_current_user),
):
    """管理端生成卡密"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="权限不足")

    batch_no = f"B{datetime.now().strftime('%Y%m%d%H%M%S')}{secrets.randbelow(10000):04d}"

    # 计算积分
    credits = int(data.amount * settings.DEFAULT_CREDIT_PER_YUAN)

    # 生成卡密
    codes = []
    for _ in range(data.count):
        code = f"CS{secrets.token_hex(12).upper()}"
        card = await CardCode.create(
            code=code,
            batch_no=batch_no,
            amount=data.amount,
            credits=credits,
            expired_at=data.expired_at,
        )
        codes.append(
            {
                "code": card.code,
                "amount": str(card.amount),
                "credits": card.credits,
            }
        )

    return {
        "batch_no": batch_no,
        "codes": codes,
    }


@router.get("/admin/card/list")
async def admin_list_card_codes(
    page: int = Query(1, description="页码"),
    page_size: int = Query(20, description="每页数量"),
    batch_no: Optional[str] = None,
    is_used: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
):
    """管理端查询卡密列表"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="权限不足")

    query = CardCode.all()

    if batch_no:
        query = query.filter(batch_no=batch_no)
    if is_used is not None:
        query = query.filter(is_used=is_used)

    total = await query.count()
    cards = await query.offset((page - 1) * page_size).limit(page_size).order_by("-created_at")

    return SuccessExtra(data=[c for c in cards], total=total, page=page, page_size=page_size)


@router.post("/admin/config")
async def admin_create_config(
    data: RechargeConfigCreate,
    current_user: User = Depends(get_current_user),
):
    """管理端创建充值配置"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="权限不足")

    config = await RechargeConfig.create(**data.model_dump())
    return config


@router.put("/admin/config/{config_id}")
async def admin_update_config(
    config_id: int,
    data: RechargeConfigUpdate,
    current_user: User = Depends(get_current_user),
):
    """管理端更新充值配置"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="权限不足")

    config = await RechargeConfig.get(id=config_id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(config, key, value)
    await config.save()
    return config


@router.delete("/admin/config/{config_id}")
async def admin_delete_config(
    config_id: int,
    current_user: User = Depends(get_current_user),
):
    """管理端删除充值配置"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="权限不足")

    config = await RechargeConfig.get(id=config_id)
    config.is_active = False
    await config.save()
    return {"success": True}


@router.get("/admin/configs")
async def admin_get_configs(current_user: User = Depends(get_current_user)):
    """管理端获取所有充值配置"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="权限不足")

    configs = await RechargeConfig.all().order_by("sort_order")
    return configs


@router.post("/admin/user/credits/add")
async def admin_add_user_credits(
    user_id: int,
    credits: int,
    remark: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """管理端手动添加用户积分"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="权限不足")

    user = await User.get(id=user_id)
    user.credit_balance += credits
    user.total_recharged += credits
    await user.save()

    # 创建充值记录
    await RechargeRecord.create(
        user_id=user_id,
        order_no=f"RC{user_id}ADMIN{datetime.now().strftime('%Y%m%d%H%M%S')}",
        amount=Decimal(0),
        credits=credits,
        payment_method="admin",
        payment_status="succeeded",
        admin_id=current_user.id,
        admin_remark=remark,
    )

    return {
        "success": True,
        "new_balance": user.credit_balance,
    }


# ==================== Stripe Webhook ====================


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    """Stripe Webhook 回调"""
    import stripe
    from fastapi import Request

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_WEBHOOK_SECRET,
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="无效 payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="签名验证失败")

    # 处理事件
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        await payment_service.verify_and_complete(session["id"])

    return {"received": True}
