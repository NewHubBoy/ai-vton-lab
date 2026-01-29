from fastapi import APIRouter
from .templates import router

templates_router = APIRouter()
templates_router.include_router(router, tags=["Templates"])
