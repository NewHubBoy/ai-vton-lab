from fastapi import APIRouter

from .model_photo import router

model_photo_router = APIRouter()
model_photo_router.include_router(router, prefix="/model_photo", tags=["模特管理模块"])

__all__ = ["model_photo_router"]
