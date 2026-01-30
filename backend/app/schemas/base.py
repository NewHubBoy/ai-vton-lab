from datetime import datetime
from typing import Any, Optional

from fastapi.responses import JSONResponse


class Success(JSONResponse):
    def __init__(
        self,
        code: int = 200,
        msg: Optional[str] = "OK",
        data: Optional[Any] = None,
        **kwargs,
    ):
        from pydantic import BaseModel

        if isinstance(data, BaseModel):
            data = data.model_dump()

        content = {"code": code, "msg": msg, "data": data}
        content.update(kwargs)

        # 递归处理 datetime 和 UUID 序列化
        from uuid import UUID

        def convert_types(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            elif isinstance(obj, UUID):
                return str(obj)
            elif isinstance(obj, dict):
                return {k: convert_types(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_types(item) for item in obj]
            return obj

        content = convert_types(content)
        super().__init__(content=content, status_code=code)


class Fail(JSONResponse):
    def __init__(
        self,
        code: int = 400,
        msg: Optional[str] = None,
        data: Optional[Any] = None,
        **kwargs,
    ):
        from pydantic import BaseModel

        if isinstance(data, BaseModel):
            data = data.model_dump()
        content = {"code": code, "msg": msg, "data": data}
        content.update(kwargs)

        # 递归处理 datetime 和 UUID 序列化
        from uuid import UUID

        def convert_types(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            elif isinstance(obj, UUID):
                return str(obj)
            elif isinstance(obj, dict):
                return {k: convert_types(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_types(item) for item in obj]
            return obj

        content = convert_types(content)
        super().__init__(content=content, status_code=code)


class SuccessExtra(JSONResponse):
    def __init__(
        self,
        code: int = 200,
        msg: Optional[str] = None,
        data: Optional[Any] = None,
        total: int = 0,
        page: int = 1,
        page_size: int = 20,
        **kwargs,
    ):
        from pydantic import BaseModel

        if isinstance(data, BaseModel):
            data = data.model_dump()
        elif isinstance(data, list):
            data = [item.model_dump() if isinstance(item, BaseModel) else item for item in data]

        content = {
            "code": code,
            "msg": msg,
            "data": data,
            "total": total,
            "page": page,
            "page_size": page_size,
        }
        content.update(kwargs)

        # 递归处理 datetime 和 UUID 序列化
        from uuid import UUID

        def convert_types(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            elif isinstance(obj, UUID):
                return str(obj)
            elif isinstance(obj, dict):
                return {k: convert_types(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_types(item) for item in obj]
            return obj

        content = convert_types(content)
        super().__init__(content=content, status_code=code)
