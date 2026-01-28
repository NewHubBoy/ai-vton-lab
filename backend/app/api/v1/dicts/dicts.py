import logging

from fastapi import APIRouter, Query
from fastapi.exceptions import HTTPException
from tortoise.expressions import Q

from app.models.admin import Dict, DictItem
from app.schemas.base import Success, SuccessExtra
from app.schemas.dicts import (
    DictCreate,
    DictUpdate,
    DictResponse,
    DictItemCreate,
    DictItemUpdate,
    DictItemResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/dicts", summary="查看字典列表")
async def list_dicts(
    page: int = Query(1, description="页码"),
    page_size: int = Query(10, description="每页数量"),
    name: str = Query("", description="字典名称"),
    code: str = Query("", description="字典编码"),
):
    q = Q()
    if name:
        q &= Q(name__contains=name)
    if code:
        q &= Q(code__contains=code)

    total = await Dict.filter(q).count()
    dict_objs = await Dict.filter(q).offset((page - 1) * page_size).limit(page_size).order_by("-id")
    data = [DictResponse.model_validate(obj, from_attributes=True).model_dump() for obj in dict_objs]
    return SuccessExtra(data=data, total=total, page=page, page_size=page_size)


@router.get("/dicts/{dict_id}", summary="查看字典详情")
async def get_dict(dict_id: int):
    dict_obj = await Dict.get_or_none(id=dict_id)
    if not dict_obj:
        raise HTTPException(status_code=404, detail="字典不存在")
    return Success(data=DictResponse.model_validate(dict_obj, from_attributes=True).model_dump())


@router.post("/dicts", summary="创建字典")
async def create_dict(dict_in: DictCreate):
    if await Dict.filter(code=dict_in.code).exists():
        raise HTTPException(status_code=400, detail="字典编码已存在")
    dict_obj = await Dict.create(**dict_in.model_dump())
    return Success(msg="创建成功", data={"id": dict_obj.id})


@router.put("/dicts/{dict_id}", summary="更新字典")
async def update_dict(dict_id: int, dict_in: DictUpdate):
    dict_obj = await Dict.get_or_none(id=dict_id)
    if not dict_obj:
        raise HTTPException(status_code=404, detail="字典不存在")
    if dict_in.code and dict_in.code != dict_obj.code:
        if await Dict.filter(code=dict_in.code).exists():
            raise HTTPException(status_code=400, detail="字典编码已存在")
    update_data = dict_in.model_dump(exclude_unset=True)
    await Dict.filter(id=dict_id).update(**update_data)
    return Success(msg="更新成功")


@router.delete("/dicts/{dict_id}", summary="删除字典")
async def delete_dict(dict_id: int):
    dict_obj = await Dict.get_or_none(id=dict_id)
    if not dict_obj:
        raise HTTPException(status_code=404, detail="字典不存在")
    await DictItem.filter(dict_id=dict_id).delete()
    await dict_obj.delete()
    return Success(msg="删除成功")


@router.get("/dicts/{dict_id}/items", summary="获取字典项列表")
async def list_dict_items(
    dict_id: int,
    page: int = Query(1, description="页码"),
    page_size: int = Query(10, description="每页数量"),
):
    dict_obj = await Dict.get_or_none(id=dict_id)
    if not dict_obj:
        raise HTTPException(status_code=404, detail="字典不存在")

    total = await DictItem.filter(dict_id=dict_id).count()
    items = await DictItem.filter(dict_id=dict_id).offset((page - 1) * page_size).limit(page_size).order_by("sort_order")
    data = [DictItemResponse.model_validate(item, from_attributes=True).model_dump() for item in items]
    return SuccessExtra(data=data, total=total, page=page, page_size=page_size)


@router.get("/code/{code}/items", summary="根据字典编码获取项列表")
async def get_items_by_code(code: str):
    dict_obj = await Dict.get_or_none(code=code, is_active=True)
    if not dict_obj:
        raise HTTPException(status_code=404, detail="字典不存在")

    items = await DictItem.filter(dict_id=dict_obj.id, is_active=True).order_by("sort_order")
    data = [DictItemResponse.model_validate(item, from_attributes=True).model_dump(mode="json") for item in items]
    return Success(data=data)


@router.post("/items", summary="创建字典项")
async def create_dict_item(item_in: DictItemCreate):
    dict_obj = await Dict.get_or_none(id=item_in.dict_id)
    if not dict_obj:
        raise HTTPException(status_code=404, detail="字典不存在")
    item_obj = await DictItem.create(**item_in.model_dump())
    return Success(msg="创建成功", data={"id": item_obj.id})


@router.put("/items/{item_id}", summary="更新字典项")
async def update_dict_item(item_id: int, item_in: DictItemUpdate):
    item_obj = await DictItem.get_or_none(id=item_id)
    if not item_obj:
        raise HTTPException(status_code=404, detail="字典项不存在")
    update_data = item_in.model_dump(exclude_unset=True)
    await DictItem.filter(id=item_id).update(**update_data)
    return Success(msg="更新成功")


@router.delete("/items/{item_id}", summary="删除字典项")
async def delete_dict_item(item_id: int):
    item_obj = await DictItem.get_or_none(id=item_id)
    if not item_obj:
        raise HTTPException(status_code=404, detail="字典项不存在")
    await item_obj.delete()
    return Success(msg="删除成功")
