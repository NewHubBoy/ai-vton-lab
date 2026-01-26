from fastapi import APIRouter

from app.core.dependency import DependPermission, DependAuth

from .apis import apis_router
from .auditlog import auditlog_router
from .base import base_router
from .depts import depts_router
from .menus import menus_router
from .oss import oss_router
from .roles import roles_router
from .users import users_router
from .images import images_router
from .ws import ws_router
from .model_photo import model_photo_router
from .prompt_config import prompt_config_router

v1_router = APIRouter()

v1_router.include_router(base_router, prefix="/base")
v1_router.include_router(users_router, prefix="/user", dependencies=[DependPermission])
v1_router.include_router(roles_router, prefix="/role", dependencies=[DependPermission])
v1_router.include_router(menus_router, prefix="/menu", dependencies=[DependPermission])
v1_router.include_router(apis_router, prefix="/api", dependencies=[DependPermission])
v1_router.include_router(depts_router, prefix="/dept", dependencies=[DependPermission])
v1_router.include_router(auditlog_router, prefix="/auditlog", dependencies=[DependPermission])
# OSS 上传路由（AuthControl 在路由内部处理）
v1_router.include_router(oss_router, prefix="/oss", dependencies=[DependAuth])

# 图像生成相关路由（AuthControl 在路由内部处理）
v1_router.include_router(images_router, prefix="/images", dependencies=[DependAuth])
# WebSocket 路由（不使用 DependAuth，因为 WebSocket 认证通过 query param token 在 handler 中处理）
v1_router.include_router(ws_router, prefix="/ws")

# 新增路由
v1_router.include_router(model_photo_router, prefix="/model-photo", dependencies=[DependAuth])
v1_router.include_router(prompt_config_router, prefix="/prompt-config", dependencies=[DependAuth])
