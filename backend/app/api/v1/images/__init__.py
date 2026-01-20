from fastapi import APIRouter

from .images import router

images_router = APIRouter()
images_router.include_router(router, tags=["图片模块"])

__all__ = ["images_router"]
