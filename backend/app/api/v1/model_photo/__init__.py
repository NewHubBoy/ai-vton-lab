from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from tortoise.expressions import Q

from app.models.model_photo import ModelPhoto
from app.schemas.model_photo import ModelPhotoCreate, ModelPhotoUpdate, ModelPhotoResponse
from app.schemas import Success, SuccessExtra
from app.core.ctx import CTX_USER_ID

model_photo_router = APIRouter()

@model_photo_router.post("", summary="创建模特生成记录")
async def create_model_photo(data: ModelPhotoCreate):
    user_id = CTX_USER_ID.get()
    # Pydantic v2 use model_dump
    obj = await ModelPhoto.create(**data.model_dump(), user_id=user_id)
    return Success(data=ModelPhotoResponse.model_validate(obj))

@model_photo_router.get("", summary="获取模特生成记录列表")
async def get_model_photos(
    page: int = 1,
    page_size: int = 10,
    status: str = None,
    generation_type: str = None
):
    user_id = CTX_USER_ID.get()
    query = ModelPhoto.filter(user_id=user_id, is_deleted=False)
    
    if status:
        query = query.filter(status=status)
    if generation_type:
        query = query.filter(generation_type=generation_type)
        
    total = await query.count()
    items = await query.offset((page - 1) * page_size).limit(page_size).order_by("-created_at")
    
    return SuccessExtra(
        data=[ModelPhotoResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size
    )

@model_photo_router.get("/{id}", summary="获取模特生成记录详情")
async def get_model_photo(id: int):
    user_id = CTX_USER_ID.get()
    obj = await ModelPhoto.get_or_none(id=id, user_id=user_id, is_deleted=False)
    if not obj:
        raise HTTPException(status_code=404, detail="记录不存在")
    return Success(data=ModelPhotoResponse.model_validate(obj))

@model_photo_router.delete("/{id}", summary="删除模特生成记录")
async def delete_model_photo(id: int):
    user_id = CTX_USER_ID.get()
    obj = await ModelPhoto.get_or_none(id=id, user_id=user_id)
    if not obj:
        raise HTTPException(status_code=404, detail="记录不存在")
    
    obj.is_deleted = True
    obj.deleted_at = datetime.now()
    await obj.save()
    return Success(msg="删除成功")
