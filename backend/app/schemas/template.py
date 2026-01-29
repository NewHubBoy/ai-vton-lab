from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class TemplateBase(BaseModel):
    name: str = Field(..., description="模版名称")
    cover_image: Optional[str] = Field(None, description="模版封面图")
    config: Dict[str, Any] = Field(default={}, description="模版配置")
    is_active: bool = Field(True, description="是否启用")


class CreateTemplateRequest(TemplateBase):
    pass


class UpdateTemplateRequest(BaseModel):
    name: Optional[str] = None
    cover_image: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class TemplateResponse(TemplateBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class TemplateListResponse(BaseModel):
    total: int
    data: List[TemplateResponse]
