from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class PromptConfigGroupCreate(BaseModel):
    group_key: str
    group_name: str
    description: Optional[str] = None
    config_type: Optional[str] = None
    input_type: str
    is_multiple: bool = False
    is_required: bool = False
    placeholder: Optional[str] = None
    default_option_key: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True
    is_system: bool = False

class PromptConfigGroupUpdate(BaseModel):
    group_name: Optional[str] = None
    description: Optional[str] = None
    config_type: Optional[str] = None
    input_type: Optional[str] = None
    is_multiple: Optional[bool] = None
    is_required: Optional[bool] = None
    placeholder: Optional[str] = None
    default_option_key: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class PromptConfigGroupResponse(PromptConfigGroupCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PromptConfigOptionCreate(BaseModel):
    group_id: int
    option_key: str
    option_label: str
    prompt_text: Optional[str] = None
    negative_prompt: Optional[str] = None
    prompt_order: int = 2
    image_url: Optional[str] = None
    description: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True
    is_default: bool = False

class PromptConfigOptionUpdate(BaseModel):
    option_label: Optional[str] = None
    prompt_text: Optional[str] = None
    negative_prompt: Optional[str] = None
    prompt_order: Optional[int] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None

class PromptConfigOptionResponse(PromptConfigOptionCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PromptCombinationRuleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    condition_json: Dict[str, Any]
    action_type: str
    target: str
    action_prompt: str
    priority: int = 0
    is_active: bool = True

class PromptCombinationRuleResponse(PromptCombinationRuleCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PromptConfigSettingCreate(BaseModel):
    key: str
    value: str
    value_type: str
    description: Optional[str] = None
    group_name: Optional[str] = None
    sort_order: int = 0
    is_editable: bool = True

class PromptConfigSettingResponse(PromptConfigSettingCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PromptUserConfigCreate(BaseModel):
    group_id: int
    selected_options: List[str]
    custom_prompts: Optional[Dict[str, str]] = None
    is_inherited: bool = True
    source_config_id: Optional[int] = None

class PromptUserConfigResponse(PromptUserConfigCreate):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
