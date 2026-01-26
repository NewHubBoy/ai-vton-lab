import os
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.schemas import Success
from app.settings.config import settings
from app.utils.oss_utils import OSSUploader, get_oss_uploader

router = APIRouter()


class UploadResponse(BaseModel):
    """上传响应"""

    url: str
    filename: str
    object_name: str
    size: int
    content_type: str


class UploadMultiResponse(BaseModel):
    """多文件上传响应"""

    urls: List[dict]


def validate_config() -> OSSUploader:
    """验证 OSS 配置"""
    if not settings.OSS_ACCESS_KEY_ID or not settings.OSS_ACCESS_KEY_SECRET:
        raise HTTPException(status_code=400, detail="请先配置 OSS 访问凭证")
    if not settings.OSS_BUCKET_NAME:
        raise HTTPException(status_code=400, detail="请先配置 OSS Bucket 名称")
    return get_oss_uploader()


@router.post("/upload", summary="上传文件到 OSS")
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Form(default="uploads"),
):
    """上传单个文件到阿里云 OSS"""
    uploader = validate_config()

    # 检查文件扩展名
    if not uploader.is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型: {os.path.splitext(file.filename)[1]}",
        )

    # 生成对象名称
    object_name = uploader.generate_object_name(
        file.filename,
        folder=folder,
        use_date_folder=settings.OSS_USE_DATE_FOLDER,
    )

    # 读取文件内容
    content = await file.read()

    # 上传文件
    success, result = uploader.upload_file(content, object_name)

    if not success:
        raise HTTPException(status_code=500, detail=f"上传失败: {result}")

    return Success(
        data={
            "url": result,
            "filename": file.filename,
            "object_name": object_name,
            "size": len(content),
            "content_type": file.content_type or "application/octet-stream",
        }
    )


@router.post("/upload/multiple", summary="批量上传文件到 OSS")
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    folder: str = Form(default="uploads"),
):
    """批量上传多个文件到阿里云 OSS"""
    uploader = validate_config()

    results = []

    for file in files:
        # 检查文件扩展名
        if not uploader.is_allowed_file(file.filename):
            continue

        # 生成对象名称
        object_name = uploader.generate_object_name(
            file.filename,
            folder=folder,
            use_date_folder=settings.OSS_USE_DATE_FOLDER,
        )

        # 读取并上传文件
        content = await file.read()
        success, result = uploader.upload_file(content, object_name)

        if success:
            results.append(
                {
                    "url": result,
                    "filename": file.filename,
                    "object_name": object_name,
                    "size": len(content),
                    "content_type": file.content_type or "application/octet-stream",
                }
            )

    return Success(data={"urls": results})


@router.post("/upload/base64", summary="上传 Base64 编码的文件")
async def upload_base64(
    file: str = Form(..., description="Base64 编码的文件数据"),
    filename: str = Form(..., description="文件名"),
    content_type: Optional[str] = Form(None, description="文件 MIME 类型"),
    folder: str = Form(default="uploads"),
):
    """上传 Base64 编码的文件到阿里云 OSS"""
    import base64

    uploader = validate_config()

    # 检查文件扩展名
    if not uploader.is_allowed_file(filename):
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型: {os.path.splitext(filename)[1]}",
        )

    try:
        # 解码 Base64 数据
        file_content = base64.b64decode(file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"无效的 Base64 数据: {e}")

    # 生成对象名称
    object_name = uploader.generate_object_name(
        filename,
        folder=folder,
        use_date_folder=settings.OSS_USE_DATE_FOLDER,
    )

    # 上传文件
    success, result = uploader.upload_file(
        file_content,
        object_name,
        content_type=content_type,
    )

    if not success:
        raise HTTPException(status_code=500, detail=f"上传失败: {result}")

    return Success(
        data={
            "url": result,
            "filename": filename,
            "object_name": object_name,
            "size": len(file_content),
            "content_type": content_type or uploader._get_content_type(filename),
        }
    )


@router.delete("/delete", summary="删除 OSS 文件")
async def delete_file(object_name: str = Form(..., description="OSS 对象名称")):
    """删除阿里云 OSS 中的文件"""
    uploader = validate_config()

    success, message = uploader.delete_file(object_name)

    if not success:
        raise HTTPException(status_code=500, detail=message)

    return Success(msg=message)


@router.get("/sign-url", summary="生成签名URL")
async def get_sign_url(
    object_name: str,
    expires: int = Form(default=3600, description="过期时间（秒），最大 64800"),
):
    """生成 OSS 文件的签名访问 URL（适用于私有 Bucket）"""
    uploader = validate_config()

    # 限制最大过期时间
    expires = min(expires, 64800)

    success, result = uploader.generate_presigned_url(object_name, expires)

    if not success:
        raise HTTPException(status_code=500, detail=result)

    return Success(data={"url": result})
