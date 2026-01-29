from fastapi import APIRouter

from app.core.dependency import DependPermission, DependAuth

from .apis import apis_router
from .auditlog import auditlog_router
from .base import base_router
from .customers import customers_router
from .depts import depts_router
from .dicts import dicts_router

from .menus import menus_router
from .oss import oss_router
from .prompt_config import prompt_config_router
from .recharge import recharge_router
from .roles import roles_router
from .tasks import tasks_router
from .templates import templates_router
from .users import users_router
from .ws import ws_router

v1_router = APIRouter()

v1_router.include_router(base_router, prefix="/base")

v1_router.include_router(users_router, prefix="/user", tags=["Users"], dependencies=[DependPermission])
v1_router.include_router(roles_router, prefix="/role", tags=["Roles"], dependencies=[DependPermission])
v1_router.include_router(menus_router, prefix="/menu", tags=["Menus"], dependencies=[DependPermission])
v1_router.include_router(depts_router, prefix="/dept", tags=["Depts"], dependencies=[DependPermission])
v1_router.include_router(dicts_router, prefix="/dict", tags=["Dicts"], dependencies=[DependPermission])
v1_router.include_router(apis_router, prefix="/api", tags=["Apis"], dependencies=[DependPermission])
v1_router.include_router(customers_router, prefix="/customer", tags=["Customers"], dependencies=[DependPermission])
v1_router.include_router(auditlog_router, prefix="/auditlog", tags=["AuditLog"], dependencies=[DependPermission])

# 业务路由
v1_router.include_router(tasks_router, prefix="/tasks", tags=["Tasks"], dependencies=[DependAuth])
v1_router.include_router(templates_router, prefix="/templates", tags=["Templates"], dependencies=[DependAuth])
v1_router.include_router(
    prompt_config_router, prefix="/prompt-config", tags=["PromptConfig"], dependencies=[DependAuth]
)
v1_router.include_router(recharge_router, prefix="/recharge", tags=["Recharge"], dependencies=[DependAuth])
v1_router.include_router(oss_router, prefix="/oss", tags=["OSS"], dependencies=[DependAuth])

# WebSocket
v1_router.include_router(ws_router, prefix="/ws", tags=["WebSocket"])
