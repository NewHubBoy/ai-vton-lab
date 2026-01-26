"""
安全相关工具函数

JWT 认证、Token 解析等功能。
"""

import jwt
from typing import Optional, Dict, Any

from app.settings import settings


def decode_token(token: str) -> Dict[str, Any]:
    """
    解析 JWT Token

    Args:
        token: JWT Token 字符串

    Returns:
        Token payload

    Raises:
        Exception: Token 无效或已过期
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])


def create_token(payload: Dict[str, Any]) -> str:
    """
    创建 JWT Token

    Args:
        payload: Token payload

    Returns:
        JWT Token 字符串
    """
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
