from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class ModelImageCreate(BaseModel):
    model_photo_id: int
    filename: str
    width: Optional[int] = None
    height: Optional[int] = None
    size: Optional[int] = None
    content_type: Optional[str] = None
    extension: Optional[str] = None
    oss_object_name: str
    oss_url: Optional[str] = None
    image_type: str
    is_primary: bool = False


class ModelImageResponse(ModelImageCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
        ser_json_datetimes = "iso8601"


class ModelPhotoCreate(BaseModel):
    task_id: Optional[str] = None
    batch_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    generation_type: str
    generation_params: Optional[Dict[str, Any]] = None
    selected_options: Optional[Dict[str, Any]] = None
    custom_prompts: Optional[Dict[str, Any]] = None
    final_prompt: Optional[str] = None
    final_negative_prompt: Optional[str] = None
    prompt_config_snapshot: Optional[Dict[str, Any]] = None
    reference_images: Optional[List[str]] = None
    aspect_ratio: Optional[str] = None
    resolution: Optional[str] = None
    model_version: Optional[str] = None
    pipeline_version: Optional[str] = None


class ModelPhotoUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    finished_at: Optional[datetime] = None
    generation_time: Optional[float] = None
    image_count: Optional[int] = None
    total_size: Optional[int] = None


class ModelPhotoResponse(ModelPhotoCreate):
    id: int
    user_id: int
    status: str
    progress: int
    created_at: datetime
    updated_at: datetime
    images: Optional[List[ModelImageResponse]] = None

    class Config:
        from_attributes = True
        ser_json_datetimes = "iso8601"
