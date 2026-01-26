from fastapi import APIRouter

from .oss import router

oss_router = APIRouter()
oss_router.include_router(router, tags=["oss模块"])

__all__ = ["oss_router"]
