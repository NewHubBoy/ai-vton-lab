import logging

from fastapi import APIRouter, Body, Query
from tortoise.expressions import Q

from app.controllers.user import user_controller
from app.controllers.role import role_controller
from app.schemas.base import Fail, Success, SuccessExtra
from app.schemas.customers import CustomerCreate, CustomerUpdate

logger = logging.getLogger(__name__)

router = APIRouter()

# 客户角色名称常量
CUSTOMER_ROLE_NAME = "客户"


async def get_customer_role_id() -> int:
    """获取客户角色ID"""
    role = await role_controller.model.filter(name=CUSTOMER_ROLE_NAME, is_deleted=False).first()
    if not role:
        raise ValueError("客户角色不存在，请先创建客户角色")
    return role.id


@router.get("/list", summary="查看客户列表")
async def list_customer(
    page: int = Query(1, description="页码"),
    page_size: int = Query(10, description="每页数量"),
    username: str = Query("", description="用户名称，用于搜索"),
    email: str = Query("", description="邮箱地址"),
):
    """获取客户列表（只返回角色为客户的用户）"""
    q = Q()
    if username:
        q &= Q(username__contains=username)
    if email:
        q &= Q(email__contains=email)

    # 获取客户角色
    customer_role = await role_controller.model.filter(name=CUSTOMER_ROLE_NAME, is_deleted=False).first()
    if not customer_role:
        return SuccessExtra(data=[], total=0, page=page, page_size=page_size)

    # 过滤只有客户角色的用户
    q &= Q(roles__id=customer_role.id)

    total, user_objs = await user_controller.list(page=page, page_size=page_size, search=q)
    data = [await obj.to_dict(m2m=True, exclude_fields=["password"]) for obj in user_objs]

    return SuccessExtra(data=data, total=total, page=page, page_size=page_size)


@router.get("/get", summary="查看客户详情")
async def get_customer(
    customer_id: int = Query(..., description="客户ID"),
):
    user_obj = await user_controller.get(id=customer_id)
    user_dict = await user_obj.to_dict(exclude_fields=["password"])
    return Success(data=user_dict)


@router.post("/create", summary="创建客户")
async def create_customer(
    customer_in: CustomerCreate,
):
    """创建客户（自动分配客户角色）"""
    # 检查邮箱是否已存在
    user = await user_controller.get_by_email(customer_in.email)
    if user:
        return Fail(code=400, msg="该邮箱已被注册")

    # 检查用户名是否已存在
    user = await user_controller.get_by_username(customer_in.username)
    if user:
        return Fail(code=400, msg="该用户名已被使用")

    # 获取客户角色ID
    try:
        customer_role_id = await get_customer_role_id()
    except ValueError as e:
        return Fail(code=400, msg=str(e))

    # 创建用户
    new_user = await user_controller.create_user(obj_in=customer_in)

    # 分配客户角色
    await user_controller.update_roles(new_user, [customer_role_id])

    return Success(msg="客户创建成功")


@router.post("/update", summary="更新客户")
async def update_customer(
    customer_in: CustomerUpdate,
):
    """更新客户信息"""
    user = await user_controller.update(id=customer_in.id, obj_in=customer_in)

    # 如果提供了角色ID，则更新角色（但保证客户角色始终存在）
    if customer_in.role_ids is not None:
        try:
            customer_role_id = await get_customer_role_id()
            role_ids = list(set(customer_in.role_ids + [customer_role_id]))
            await user_controller.update_roles(user, role_ids)
        except ValueError:
            pass

    return Success(msg="客户更新成功")


@router.delete("/delete", summary="删除客户")
async def delete_customer(
    customer_id: int = Query(..., description="客户ID"),
):
    await user_controller.remove(id=customer_id)
    return Success(msg="客户删除成功")


@router.post("/reset_password", summary="重置客户密码")
async def reset_password(customer_id: int = Body(..., description="客户ID", embed=True)):
    await user_controller.reset_password(customer_id)
    return Success(msg="密码已重置为123456")


@router.post("/add_credits", summary="给客户充值积分")
async def add_credits(
    customer_id: int = Body(..., description="客户ID"),
    credits: int = Body(..., description="充值积分数"),
    remark: str = Body("", description="备注"),  # noqa: F841
):
    """管理员手动给客户充值积分"""
    user_obj = await user_controller.get(id=customer_id)
    if not user_obj:
        return Fail(code=404, msg="客户不存在")

    user_obj.credit_balance += credits
    user_obj.total_recharged += credits
    await user_obj.save()

    return Success(msg=f"充值成功，当前余额: {user_obj.credit_balance}", data={"new_balance": user_obj.credit_balance})
