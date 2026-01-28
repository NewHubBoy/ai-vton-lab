from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class DictCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool = True


class DictUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class DictResponse(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DictItemCreate(BaseModel):
    dict_id: int
    label: str
    value: str
    sort_order: int = 0
    is_active: bool = True


class DictItemUpdate(BaseModel):
    label: Optional[str] = None
    value: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class DictItemResponse(BaseModel):
    id: int
    dict_id: int
    label: str
    value: str
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DictWithItemsResponse(DictResponse):
    items: List[DictItemResponse] = []
