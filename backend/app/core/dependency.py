from typing import Optional

import jwt
from fastapi import Depends, Header, HTTPException, Request

from app.core.ctx import CTX_USER_ID
from app.models import Role, User
from app.settings import settings


class AuthControl:
    @classmethod
    async def is_authed(
        cls,
        authorization: Optional[str] = Header(None, description="标准 Authorization 头 (Bearer token)"),
        token: Optional[str] = Header(None, description="兼容旧版 token 头"),
    ) -> Optional["User"]:
        """
        JWT 认证

        支持两种方式获取 token：
        1. 标准方式：Authorization: Bearer <token>
        2. 兼容方式：token: <token>
        """
        # 优先使用 Authorization 头
        actual_token = None
        if authorization and authorization.startswith("Bearer "):
            actual_token = authorization[7:]  # 去掉 "Bearer " 前缀
        elif token:
            actual_token = token

        if not actual_token:
            raise HTTPException(status_code=401, detail="缺少认证 Token")

        try:
            if actual_token == "dev":
                user = await User.filter().first()
                user_id = user.id
            else:
                decode_data = jwt.decode(actual_token, settings.SECRET_KEY, algorithms=settings.JWT_ALGORITHM)
                user_id = decode_data.get("user_id")
            user = await User.filter(id=user_id).first()
            if not user:
                raise HTTPException(status_code=401, detail="Authentication failed")
            CTX_USER_ID.set(int(user_id))
            return user
        except jwt.DecodeError:
            raise HTTPException(status_code=401, detail="无效的Token")
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="登录已过期")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"{repr(e)}")


class PermissionControl:
    @classmethod
    async def has_permission(cls, request: Request, current_user: User = Depends(AuthControl.is_authed)) -> None:
        if current_user.is_superuser:
            return
        method = request.method
        path = request.url.path
        roles: list[Role] = await current_user.roles
        if not roles:
            raise HTTPException(status_code=403, detail="The user is not bound to a role")
        apis = [await role.apis for role in roles]
        permission_apis = list(set((api.method, api.path) for api in sum(apis, [])))
        # path = "/api/v1/auth/userinfo"
        # method = "GET"
        if (method, path) not in permission_apis:
            raise HTTPException(status_code=403, detail=f"Permission denied method:{method} path:{path}")


DependAuth = Depends(AuthControl.is_authed)
DependPermission = Depends(PermissionControl.has_permission)
