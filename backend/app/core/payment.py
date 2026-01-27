"""支付服务"""
import uuid
from abc import ABC, abstractmethod
from datetime import datetime
from decimal import Decimal
from typing import Optional

import stripe
from tortoise.transactions import in_transaction

from app.models.recharge import RechargeRecord, CardCode, RechargeConfig
from app.settings.config import settings


class PaymentProvider(ABC):
    """支付提供商抽象基类"""

    @abstractmethod
    async def create_payment(self, order_no: str, amount: Decimal, credits: int) -> dict:
        """创建支付"""
        pass

    @abstractmethod
    async def verify_payment(self, order_no: str) -> bool:
        """验证支付"""
        pass


class StripePaymentProvider(PaymentProvider):
    """Stripe 支付提供商"""

    def __init__(self):
        stripe.api_key = settings.STRIPE_API_KEY

    async def create_payment(self, order_no: str, amount: Decimal, credits: int) -> dict:
        """创建 Stripe Checkout Session"""
        try:
            # 转换为最小货币单位 (分)
            amount_cents = int(amount * 100)

            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": "usd",
                            "product_data": {
                                "name": f"积分充值 - {credits} 积分",
                            },
                            "unit_amount": amount_cents,
                        },
                        "quantity": 1,
                    }
                ],
                mode="payment",
                success_url=f"{settings.STRIPE_SUCCESS_URL}?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.STRIPE_CANCEL_URL}?order_no={order_no}",
                metadata={
                    "order_no": order_no,
                    "credits": str(credits),
                },
            )

            return {
                "session_id": session.id,
                "checkout_url": session.url,
                "payment_intent_id": session.payment_intent,
            }
        except stripe.error.StripeError as e:
            raise ValueError(f"Stripe 创建支付失败: {str(e)}")

    async def verify_payment(self, session_id: str) -> dict:
        """验证 Stripe 支付"""
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            return {
                "status": "succeeded" if session.payment_status == "paid" else "pending",
                "order_no": session.metadata.get("order_no"),
                "amount": Decimal(session.amount_total) / 100,
            }
        except stripe.error.StripeError as e:
            raise ValueError(f"Stripe 验证失败: {str(e)}")


class CardCodeProvider(PaymentProvider):
    """卡密支付提供商"""

    async def create_payment(self, order_no: str, amount: Decimal, credits: int) -> dict:
        """卡密不需要创建支付，直接返回"""
        return {"order_no": order_no}

    async def verify_payment(self, code: str) -> Optional[CardCode]:
        """验证卡密"""
        card = await CardCode.filter(code=code, is_active=True).first()
        if not card:
            return None
        if card.is_used:
            return None
        if card.is_expired:
            return None
        return card


class PaymentService:
    """支付服务"""

    def __init__(self):
        self.providers = {
            "stripe": StripePaymentProvider(),
            "card": CardCodeProvider(),
        }

    def get_provider(self, method: str) -> PaymentProvider:
        """获取支付提供商"""
        provider = self.providers.get(method)
        if not provider:
            raise ValueError(f"不支持的支付方式: {method}")
        return provider

    async def create_order(
        self,
        user_id: int,
        amount: Decimal,
        payment_method: str,
        credits: int,
        config_id: Optional[int] = None,
    ) -> RechargeRecord:
        """创建充值订单"""
        order_no = f"RC{user_id}{uuid.uuid4().hex[:12].upper()}"

        record = await RechargeRecord.create(
            user_id=user_id,
            order_no=order_no,
            amount=amount,
            credits=credits,
            payment_method=payment_method,
            payment_status="pending",
        )

        if payment_method == "stripe":
            provider = self.get_provider("stripe")
            result = await provider.create_payment(order_no, amount, credits)
            record.stripe_session_id = result.get("session_id")
            record.payment_status = "processing"
            await record.save()

        return record

    async def process_card_code(
        self,
        user_id: int,
        code: str,
    ) -> dict:
        """处理卡密兑换"""
        async with in_transaction() as conn:
            # 验证并锁定卡密
            card = await CardCode.filter(
                code=code,
                is_active=True,
                is_used=False,
            ).first()

            if not card:
                return {"success": False, "message": "卡密无效或已使用"}

            if card.is_expired:
                return {"success": False, "message": "卡密已过期"}

            # 创建充值记录
            order_no = f"RC{user_id}{uuid.uuid4().hex[:12].upper()}"
            record = await RechargeRecord.create(
                user_id=user_id,
                order_no=order_no,
                amount=card.amount,
                credits=card.credits,
                payment_method="card",
                payment_status="succeeded",
                card_code=code,
            )

            # 标记卡密已使用
            card.is_used = True
            card.used_by_id = user_id
            card.used_at = datetime.utcnow()
            await card.save()

            # 更新用户积分
            from app.models.admin import User
            user = await User.get(id=user_id)
            user.credit_balance += card.credits
            user.total_recharged += card.credits
            await user.save()

            return {
                "success": True,
                "message": "兑换成功",
                "data": {
                    "order_no": order_no,
                    "amount": card.amount,
                    "credits": card.credits,
                    "new_balance": user.credit_balance,
                }
            }

    async def verify_and_complete(self, session_id: str) -> bool:
        """验证 Stripe 支付并完成订单"""
        provider = self.get_provider("stripe")
        result = await provider.verify_payment(session_id)

        if result["status"] != "succeeded":
            return False

        record = await RechargeRecord.get(order_no=result["order_no"])
        if record.payment_status == "succeeded":
            return True

        # 更新订单状态
        record.payment_status = "succeeded"
        record.stripe_payment_intent_id = result.get("payment_intent_id")
        await record.save()

        # 更新用户积分
        from app.models.admin import User
        user = await User.get(id=record.user_id)
        user.credit_balance += record.credits
        user.total_recharged += record.credits
        await user.save()

        return True


# 单例实例
payment_service = PaymentService()
