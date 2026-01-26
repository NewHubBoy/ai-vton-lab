"""
阿里云 OSS 上传工具模块
"""
import os
import uuid
from datetime import datetime
from typing import Optional, Tuple

import oss2


class OSSConfig:
    """OSS 配置类"""

    def __init__(
        self,
        access_key_id: str,
        access_key_secret: str,
        bucket_name: str,
        endpoint: str,
        cdn_endpoint: Optional[str] = None,
        use_cdn: bool = False,
    ):
        self.access_key_id = access_key_id
        self.access_key_secret = access_key_secret
        self.bucket_name = bucket_name
        self.endpoint = endpoint
        self.cdn_endpoint = cdn_endpoint
        self.use_cdn = use_cdn

    @property
    def bucket(self) -> oss2.Bucket:
        """获取 OSS Bucket 实例"""
        auth = oss2.Auth(self.access_key_id, self.access_key_secret)
        return oss2.Bucket(auth, self.endpoint, self.bucket_name)

    @property
    def base_url(self) -> str:
        """获取基础访问 URL"""
        if self.use_cdn and self.cdn_endpoint:
            return f"https://{self.cdn_endpoint}"
        return f"https://{self.bucket_name}.{self.endpoint}"


class OSSUploader:
    """阿里云 OSS 上传器"""

    # 允许的文件扩展名
    ALLOWED_EXTENSIONS = {
        # 图片
        '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.ico',
        # 文档
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt',
        # 视频
        '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv',
        # 音频
        '.mp3', '.wav', '.ogg', '.m4a',
        # 压缩文件
        '.zip', '.rar', '.7z', '.tar', '.gz',
    }

    # 默认文件过期时间（秒）- 7天
    DEFAULT_EXPIRE_SECONDS = 7 * 24 * 3600

    def __init__(self, config: OSSConfig):
        self.config = config

    def is_allowed_file(self, filename: str) -> bool:
        """检查文件扩展名是否允许"""
        ext = os.path.splitext(filename)[1].lower()
        return ext in self.ALLOWED_EXTENSIONS

    def generate_object_name(
        self,
        filename: str,
        folder: str = "uploads",
        use_date_folder: bool = True,
    ) -> str:
        """生成 OSS 对象名称

        Args:
            filename: 原始文件名
            folder: 基础文件夹
            use_date_folder: 是否使用日期子文件夹

        Returns:
            OSS 对象名称
        """
        ext = os.path.splitext(filename)[1].lower() or ""

        # 生成唯一文件名
        unique_name = f"{uuid.uuid4().hex}{ext}"

        if use_date_folder:
            date_str = datetime.now().strftime("%Y/%m/%d")
            return f"{folder}/{date_str}/{unique_name}"
        return f"{folder}/{unique_name}"

    def upload_file(
        self,
        file_content: bytes,
        object_name: str,
        content_type: Optional[str] = None,
    ) -> Tuple[bool, str]:
        """上传文件内容到 OSS

        Args:
            file_content: 文件内容（bytes）
            object_name: OSS 对象名称
            content_type: MIME 类型

        Returns:
            (是否成功, 文件URL或错误信息)
        """
        try:
            bucket = self.config.bucket

            # 如果没有指定 content_type，尝试自动检测
            if not content_type:
                content_type = self._get_content_type(object_name)

            headers = {}
            if content_type:
                headers['Content-Type'] = content_type

            # 上传文件
            bucket.put_object(object_name, file_content, headers=headers)

            # 生成访问 URL
            url = f"{self.config.base_url}/{object_name}"
            return True, url

        except Exception as e:
            return False, str(e)

    def upload_file_path(
        self,
        file_path: str,
        object_name: Optional[str] = None,
    ) -> Tuple[bool, str]:
        """上传本地文件到 OSS

        Args:
            file_path: 本地文件路径
            object_name: OSS 对象名称（可选，默认自动生成）

        Returns:
            (是否成功, 文件URL或错误信息)
        """
        try:
            if object_name is None:
                object_name = self.generate_object_name(
                    os.path.basename(file_path)
                )

            bucket = self.config.bucket
            bucket.put_object_from_file(object_name, file_path)

            url = f"{self.config.base_url}/{object_name}"
            return True, url

        except Exception as e:
            return False, str(e)

    def generate_presigned_url(
        self,
        object_name: str,
        expires: int = DEFAULT_EXPIRE_SECONDS,
    ) -> Tuple[bool, str]:
        """生成签名URL（用于私有bucket访问）

        Args:
            object_name: OSS 对象名称
            expires: 过期时间（秒）

        Returns:
            (是否成功, 签名URL或错误信息)
        """
        try:
            bucket = self.config.bucket
            # 生成签名URL，有效期 expires 秒
            signed_url = bucket.sign_url('GET', object_name, expires)

            # 解码 URL 中的编码字符，使其更易读
            from urllib.parse import unquote
            decoded_url = unquote(signed_url)

            # 确保使用 https
            if decoded_url.startswith("http://"):
                decoded_url = "https://" + decoded_url[7:]

            return True, decoded_url

        except Exception as e:
            return False, str(e)

    def delete_file(self, object_name: str) -> Tuple[bool, str]:
        """删除 OSS 文件

        Args:
            object_name: OSS 对象名称

        Returns:
            (是否成功, 消息或错误信息)
        """
        try:
            bucket = self.config.bucket
            bucket.delete_object(object_name)
            return True, "删除成功"

        except Exception as e:
            return False, str(e)

    def file_exists(self, object_name: str) -> bool:
        """检查文件是否存在"""
        try:
            bucket = self.config.bucket
            return bucket.object_exists(object_name)
        except Exception:
            return False

    def _get_content_type(self, filename: str) -> str:
        """根据文件名获取 MIME 类型"""
        ext = os.path.splitext(filename)[1].lower()

        content_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.bmp': 'image/bmp',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.ppt': 'application/vnd.ms-powerpoint',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            '.txt': 'text/plain',
            '.mp4': 'video/mp4',
            '.avi': 'video/x-msvideo',
            '.mov': 'video/quicktime',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.zip': 'application/zip',
            '.rar': 'application/x-rar-compressed',
        }

        return content_types.get(ext, 'application/octet-stream')


# 全局 OSS 上传器实例（懒加载）
_oss_uploader: Optional[OSSUploader] = None


def get_oss_uploader() -> OSSUploader:
    """获取全局 OSS 上传器实例"""
    global _oss_uploader
    if _oss_uploader is None:
        from app.settings.config import settings
        config = OSSConfig(
            access_key_id=settings.OSS_ACCESS_KEY_ID,
            access_key_secret=settings.OSS_ACCESS_KEY_SECRET,
            bucket_name=settings.OSS_BUCKET_NAME,
            endpoint=settings.OSS_ENDPOINT,
            cdn_endpoint=settings.OSS_CDN_ENDPOINT,
            use_cdn=settings.OSS_USE_CDN,
        )
        _oss_uploader = OSSUploader(config)
    return _oss_uploader
