from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class CustomerCreate(BaseModel):
    email: EmailStr = Field(example="customer@example.com")
    username: str = Field(example="customer1")
    password: str = Field(example="123456")
    alias: Optional[str] = Field(None, description="姓名")
    phone: Optional[str] = Field(None, description="电话")
    is_active: Optional[bool] = True

    def create_dict(self):
        return self.model_dump(exclude_unset=True)


class CustomerUpdate(BaseModel):
    id: int
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    alias: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    role_ids: Optional[List[int]] = None
