from fastapi import APIRouter, HTTPException, Depends
from app.models.template import DetailTemplate
from app.schemas.template import CreateTemplateRequest, UpdateTemplateRequest, TemplateResponse, TemplateListResponse
from app.schemas.base import Success, SuccessExtra

router = APIRouter()


@router.post("/", summary="创建模版")
async def create_template(request: CreateTemplateRequest):
    template = await DetailTemplate.create(**request.model_dump())
    return Success(data=TemplateResponse.model_validate(template))


@router.get("/", summary="获取模版列表")
async def list_templates(page: int = 1, page_size: int = 20, is_active: bool = True):
    query = DetailTemplate.filter(is_active=is_active)
    total = await query.count()
    items = await query.offset((page - 1) * page_size).limit(page_size)
    return SuccessExtra(
        data=[TemplateResponse.model_validate(item) for item in items], total=total, page=page, page_size=page_size
    )


@router.put("/{template_id}", summary="更新模版")
async def update_template(template_id: str, request: UpdateTemplateRequest):
    template = await DetailTemplate.get_or_none(id=template_id)
    if not template:
        raise HTTPException(status_code=404, detail="模版不存在")

    update_data = request.model_dump(exclude_unset=True)
    if update_data:
        await template.update_from_dict(update_data).save()

    return Success(data=TemplateResponse.model_validate(template))


@router.delete("/{template_id}", summary="删除模版")
async def delete_template(template_id: str):
    template = await DetailTemplate.get_or_none(id=template_id)
    if not template:
        raise HTTPException(status_code=404, detail="模版不存在")

    await template.delete()
    return Success(msg="删除成功")
