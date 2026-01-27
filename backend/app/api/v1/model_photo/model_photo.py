from datetime import datetime
from fastapi import APIRouter, HTTPException

from app.models.model_photo import ModelPhoto
from app.schemas.model_photo import ModelPhotoCreate, ModelPhotoUpdate, ModelPhotoResponse
from app.schemas import Success, SuccessExtra
from app.core.ctx import CTX_USER_ID

router = APIRouter()


@router.post("/create", summary="创建模特生成记录")
async def create_model_photo(data: ModelPhotoCreate):
    user_id = CTX_USER_ID.get()
    obj = await ModelPhoto.create(**data.model_dump(), user_id=user_id)
    return Success(data=ModelPhotoResponse.model_validate(obj))


@router.get("/list", summary="获取模特生成记录列表")
async def get_model_photos(page: int = 1, page_size: int = 10, status: str = None, generation_type: str = None):
    user_id = CTX_USER_ID.get()
    query = ModelPhoto.filter(user_id=user_id, is_deleted=False)

    if status:
        query = query.filter(status=status)
    if generation_type:
        query = query.filter(generation_type=generation_type)

    total = await query.count()
    items = await query.offset((page - 1) * page_size).limit(page_size).order_by("-created_at")

    return SuccessExtra(
        data=[ModelPhotoResponse.model_validate(item) for item in items], total=total, page=page, page_size=page_size
    )


@router.get("/{id}", summary="获取模特生成记录详情")
async def get_model_photo(id: int):
    user_id = CTX_USER_ID.get()
    obj = await ModelPhoto.get_or_none(id=id, user_id=user_id, is_deleted=False)
    if not obj:
        raise HTTPException(status_code=404, detail="记录不存在")
    return Success(data=ModelPhotoResponse.model_validate(obj))


@router.delete("/{id}", summary="删除模特生成记录")
async def delete_model_photo(id: int):
    user_id = CTX_USER_ID.get()
    obj = await ModelPhoto.get_or_none(id=id, user_id=user_id)
    if not obj:
        raise HTTPException(status_code=404, detail="记录不存在")

    obj.is_deleted = True
    obj.deleted_at = datetime.now()
    await obj.save()
    return Success(msg="删除成功")


# ============ 管理端接口 ============


@router.get("/admin/list", summary="获取所有模特记录")
async def get_all_model_photos(page: int = 1, page_size: int = 10, status: str = None, generation_type: str = None):
    """获取所有用户的模特记录（管理端使用）"""
    query = ModelPhoto.filter(is_deleted=False)

    if status:
        query = query.filter(status=status)
    if generation_type:
        query = query.filter(generation_type=generation_type)

    total = await query.count()
    items = await query.offset((page - 1) * page_size).limit(page_size).order_by("-created_at")

    # 获取用户信息
    from app.models.admin import User

    results = []
    for item in items:
        user = await User.get_or_none(id=item.user_id)
        item_dict = ModelPhotoResponse.model_validate(item).model_dump()
        item_dict["username"] = user.username if user else None
        results.append(item_dict)

    return SuccessExtra(data=results, total=total, page=page, page_size=page_size)


# ============ 换装合成记录 ============


@router.get("/tryon", summary="获取换装合成记录列表")
async def get_tryon_records(page: int = 1, page_size: int = 10, status: str = None):
    """获取所有用户的换装合成记录（管理端使用）"""
    query = ModelPhoto.filter(generation_type="tryon", is_deleted=False)

    if status:
        query = query.filter(status=status)

    total = await query.count()
    items = await query.offset((page - 1) * page_size).limit(page_size).order_by("-created_at")

    # 获取用户信息
    from app.models.admin import User

    results = []
    for item in items:
        user = await User.get_or_none(id=item.user_id)
        item_dict = ModelPhotoResponse.model_validate(item).model_dump()
        item_dict["username"] = user.username if user else None
        results.append(item_dict)

    return SuccessExtra(data=results, total=total, page=page, page_size=page_size)


@router.get("/tryon/{id}", summary="获取换装合成记录详情")
async def get_tryon_record(id: int):
    """获取单个换装合成记录详情"""
    obj = await ModelPhoto.get_or_none(id=id, generation_type="tryon", is_deleted=False)
    if not obj:
        raise HTTPException(status_code=404, detail="记录不存在")

    # 获取用户信息
    from app.models.admin import User

    user = await User.get_or_none(id=obj.user_id)
    result = ModelPhotoResponse.model_validate(obj).model_dump()
    result["username"] = user.username if user else None

    return Success(data=result)
