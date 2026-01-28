from fastapi import APIRouter

from .customers import router

customers_router = APIRouter()
customers_router.include_router(router, tags=["客户模块"])

__all__ = ["customers_router"]
