from fastapi import APIRouter, HTTPException
from fastapi.encoders import jsonable_encoder

from app.models.prompt_config import PromptConfigGroup, PromptConfigOption, PromptConfigSetting
from app.schemas.prompt_config import (
    PromptConfigGroupCreate, PromptConfigGroupUpdate, PromptConfigGroupResponse,
    PromptConfigOptionCreate, PromptConfigOptionUpdate, PromptConfigOptionResponse,
    PromptConfigSettingCreate, PromptConfigSettingResponse
)
from app.schemas import Success, SuccessExtra

router = APIRouter()

# --- Groups ---


@router.get("/groups", summary="获取配置组列表")
async def get_groups(is_active: bool = True, config_type: str = None):
    query = PromptConfigGroup.filter()
    if is_active is not None:
        query = query.filter(is_active=is_active)
    if config_type:
        query = query.filter(config_type=config_type)

    items = await query.order_by("sort_order")
    data = [PromptConfigGroupResponse.model_validate(item).model_dump() for item in items]
    return SuccessExtra(data=jsonable_encoder(data), total=len(items))


@router.post("/groups", summary="创建配置组")
async def create_group(data: PromptConfigGroupCreate):
    obj = await PromptConfigGroup.create(**data.model_dump())
    return Success(data=jsonable_encoder(PromptConfigGroupResponse.model_validate(obj).model_dump()))


@router.put("/groups/{id}", summary="更新配置组")
async def update_group(id: int, data: PromptConfigGroupUpdate):
    obj = await PromptConfigGroup.get_or_none(id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="配置组不存在")
    await obj.update_from_dict(data.model_dump(exclude_unset=True))
    await obj.save()
    return Success(data=jsonable_encoder(PromptConfigGroupResponse.model_validate(obj).model_dump()))


# --- Options ---


@router.get("/groups/{group_id}/options", summary="获取配置选项列表")
async def get_options(group_id: int, is_active: bool = True):
    query = PromptConfigOption.filter(group_id=group_id)
    if is_active is not None:
        query = query.filter(is_active=is_active)

    items = await query.order_by("sort_order")
    data = [PromptConfigOptionResponse.model_validate(item).model_dump() for item in items]
    return SuccessExtra(data=jsonable_encoder(data), total=len(items))


@router.post("/options", summary="创建配置选项")
async def create_option(data: PromptConfigOptionCreate):
    obj = await PromptConfigOption.create(**data.model_dump())
    return Success(data=jsonable_encoder(PromptConfigOptionResponse.model_validate(obj).model_dump()))


@router.put("/options/{id}", summary="更新配置选项")
async def update_option(id: int, data: PromptConfigOptionUpdate):
    obj = await PromptConfigOption.get_or_none(id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="配置选项不存在")
    await obj.update_from_dict(data.model_dump(exclude_unset=True))
    await obj.save()
    return Success(data=jsonable_encoder(PromptConfigOptionResponse.model_validate(obj).model_dump()))


# --- Settings (系统配置) ---


@router.get("/settings", summary="获取系统配置列表")
async def get_settings(group_name: str = None):
    """获取系统配置列表，可按 group_name 筛选"""
    query = PromptConfigSetting.filter()
    if group_name:
        query = query.filter(group_name=group_name)

    items = await query.order_by("group_name", "sort_order")
    data = [PromptConfigSettingResponse.model_validate(item).model_dump() for item in items]
    return SuccessExtra(data=jsonable_encoder(data), total=len(items))


@router.get("/settings/{key}", summary="根据 key 获取单个配置")
async def get_setting_by_key(key: str):
    """根据 key 获取单个配置"""
    obj = await PromptConfigSetting.get_or_none(key=key)
    if not obj:
        raise HTTPException(status_code=404, detail="配置不存在")
    return Success(data=jsonable_encoder(PromptConfigSettingResponse.model_validate(obj).model_dump()))


@router.post("/settings", summary="创建系统配置")
async def create_setting(data: PromptConfigSettingCreate):
    """创建系统配置"""
    existing = await PromptConfigSetting.get_or_none(key=data.key)
    if existing:
        raise HTTPException(status_code=400, detail="配置 key 已存在")
    obj = await PromptConfigSetting.create(**data.model_dump())
    return Success(data=jsonable_encoder(PromptConfigSettingResponse.model_validate(obj).model_dump()))


@router.put("/settings/{id}", summary="更新系统配置")
async def update_setting(id: int, data: PromptConfigSettingCreate):
    """更新系统配置"""
    obj = await PromptConfigSetting.get_or_none(id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="配置不存在")
    if not obj.is_editable:
        raise HTTPException(status_code=403, detail="该配置不可编辑")
    await obj.update_from_dict(data.model_dump(exclude_unset=True))
    await obj.save()
    return Success(data=jsonable_encoder(PromptConfigSettingResponse.model_validate(obj).model_dump()))


@router.delete("/settings/{id}", summary="删除系统配置")
async def delete_setting(id: int):
    """删除系统配置"""
    obj = await PromptConfigSetting.get_or_none(id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="配置不存在")
    if not obj.is_editable:
        raise HTTPException(status_code=403, detail="该配置不可删除")
    await obj.delete()
    return Success(msg="删除成功")
