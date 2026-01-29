"""
初始化预设提示词配置

运行方式：
    cd backend
    python -m app.scripts.init_prompt_settings
"""

import asyncio

from tortoise import Tortoise

from app.models.prompt_config import PromptConfigSetting
from app.settings import TORTOISE_ORM

# 预设配置列表
PRESET_SETTINGS = [
    # ========== 基础提示词模板 ==========
    {
        "key": "base_prompt_tryon",
        "value": "virtual try-on, realistic clothing fit on model, natural pose, studio lighting, high quality, detailed",
        "value_type": "text",
        "description": "虚拟试穿基础提示词模板",
        "group_name": "base_prompts",
        "sort_order": 1,
    },
    {
        "key": "base_prompt_model",
        "value": "professional fashion model, studio lighting, high quality, detailed face, fashion photography",
        "value_type": "text",
        "description": "模特生成基础提示词模板",
        "group_name": "base_prompts",
        "sort_order": 2,
    },
    {
        "key": "base_prompt_detail",
        "value": "product photography, clean white background, high quality, detailed texture, professional lighting",
        "value_type": "text",
        "description": "商品详情基础提示词模板",
        "group_name": "base_prompts",
        "sort_order": 3,
    },
    # ========== 全局配置 ==========
    {
        "key": "global_negative_prompt",
        "value": "low quality, blurry, distorted, deformed, ugly, bad anatomy, watermark, signature, text",
        "value_type": "text",
        "description": "全局负向提示词（所有类型通用）",
        "group_name": "global",
        "sort_order": 10,
    },
    {
        "key": "prompt_separator",
        "value": ", ",
        "value_type": "text",
        "description": "提示词片段分隔符",
        "group_name": "global",
        "sort_order": 11,
    },
    {
        "key": "max_prompt_length",
        "value": "2000",
        "value_type": "text",
        "description": "最大提示词长度",
        "group_name": "global",
        "sort_order": 12,
    },
    # ========== 默认参数 ==========
    {
        "key": "default_resolution",
        "value": "2K",
        "value_type": "text",
        "description": "默认分辨率",
        "group_name": "defaults",
        "sort_order": 20,
    },
    {
        "key": "default_aspect_ratio",
        "value": "1:1",
        "value_type": "text",
        "description": "默认宽高比",
        "group_name": "defaults",
        "sort_order": 21,
    },
]


async def init_settings():
    """初始化预设配置"""
    print("正在初始化预设提示词配置...")

    created_count = 0
    updated_count = 0

    for setting_data in PRESET_SETTINGS:
        key = setting_data["key"]
        existing = await PromptConfigSetting.get_or_none(key=key)

        if existing:
            # 已存在则跳过（不覆盖用户修改）
            print(f"  [跳过] {key} 已存在")
            updated_count += 1
        else:
            # 不存在则创建
            await PromptConfigSetting.create(**setting_data)
            print(f"  [创建] {key}")
            created_count += 1

    print(f"\n初始化完成：创建 {created_count} 条，跳过 {updated_count} 条")


async def main():
    """主函数"""
    # 初始化数据库连接
    await Tortoise.init(config=TORTOISE_ORM)

    try:
        await init_settings()
    finally:
        await Tortoise.close_connections()


if __name__ == "__main__":
    asyncio.run(main())
