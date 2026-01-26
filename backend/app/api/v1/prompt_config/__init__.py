from fastapi import APIRouter

from .prompt_config import router

prompt_config_router = APIRouter()
prompt_config_router.include_router(router, prefix="/prompt_config", tags=["提示词配置模块"])

__all__ = ["prompt_config_router"]
