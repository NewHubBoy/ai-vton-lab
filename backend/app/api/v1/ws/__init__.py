from fastapi import APIRouter

from .ws import router

ws_router = APIRouter()
ws_router.include_router(router, tags=["ws模块"])

__all__ = ["ws_router"]
