"""
初始化模特数据脚本

运行方式：
    cd backend
    python scripts/seed_model_photos.py

注意：需要先启动数据库和后端服务
"""
import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import httpx
from datetime import datetime
from tortoise import Tortoise
from app.settings.config import settings
from app.models.model_photo import ModelPhoto, ModelImage

# 示例模特数据（使用 Unsplash 公开图片）
SAMPLE_MODELS = [
    {
        "name": "都市时尚模特",
        "description": "现代都市风格，白领装扮，适合商务场景",
        "reference_images": [
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
            "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80",
        ],
        "aspect_ratio": "3:4",
        "resolution": "1024x1365",
    },
    {
        "name": "休闲街拍模特",
        "description": "潮流休闲风格，年轻人喜爱穿搭",
        "reference_images": [
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
            "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80",
        ],
        "aspect_ratio": "3:4",
        "resolution": "1024x1365",
    },
    {
        "name": "春夏清新模特",
        "description": "清新自然的春夏装扮，展示青春活力",
        "reference_images": [
            "https://images.unsplash.com/photo-1529139574466-a302c27524ed?w=800&q=80",
            "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80",
        ],
        "aspect_ratio": "3:4",
        "resolution": "1024x1365",
    },
    {
        "name": "优雅礼服模特",
        "description": "正式场合优雅礼服，展现高贵气质",
        "reference_images": [
            "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
            "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80",
        ],
        "aspect_ratio": "3:4",
        "resolution": "1024x1365",
    },
    {
        "name": "运动健身模特",
        "description": "运动健身风格，展现健康生活方式",
        "reference_images": [
            "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
            "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80",
        ],
        "aspect_ratio": "3:4",
        "resolution": "1024x1365",
    },
    {
        "name": "韩系甜美模特",
        "description": "韩系甜美风格，温柔可爱",
        "reference_images": [
            "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&q=80",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80",
        ],
        "aspect_ratio": "3:4",
        "resolution": "1024x1365",
    },
    {
        "name": "复古文艺模特",
        "description": "复古文艺风格，怀旧情怀",
        "reference_images": [
            "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=800&q=80",
            "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&q=80",
        ],
        "aspect_ratio": "3:4",
        "resolution": "1024x1365",
    },
    {
        "name": "中性潮流模特",
        "description": "中性风格，个性十足",
        "reference_images": [
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80",
        ],
        "aspect_ratio": "3:4",
        "resolution": "1024x1365",
    },
]


async def get_image_info(url: str) -> dict:
    """获取图片信息（宽高）"""
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.head(url, timeout=10.0)
            return {"width": 1024, "height": 1365}
    except Exception:
        return {"width": 1024, "height": 1365}


async def seed_model_photos():
    """初始化模特数据"""
    # 初始化数据库连接
    await Tortoise.init(config=settings.get_tortoise_orm())
    await Tortoise.generate_schemas()

    print("=" * 50)
    print("开始初始化模特数据...")
    print("=" * 50)

    created_count = 0
    skipped_count = 0

    for model_data in SAMPLE_MODELS:
        # 检查是否已存在同名记录
        existing = await ModelPhoto.get_or_none(
            name=model_data["name"],
            generation_type="text2img",
            is_deleted=False
        )

        if existing:
            print(f"跳过: {model_data['name']} (已存在)")
            skipped_count += 1
            continue

        # 创建 ModelPhoto 记录
        model_photo = await ModelPhoto.create(
            user_id=1,  # 系统用户
            name=model_data["name"],
            description=model_data["description"],
            generation_type="text2img",
            reference_images=model_data["reference_images"],
            aspect_ratio=model_data["aspect_ratio"],
            resolution=model_data["resolution"],
            status="completed",
            progress=100,
            image_count=len(model_data["reference_images"]),
            total_size=0,
            finished_at=datetime.utcnow(),
            generation_time=0.5,
        )

        # 创建 ModelImage 记录
        for idx, image_url in enumerate(model_data["reference_images"]):
            image_info = await get_image_info(image_url)
            await ModelImage.create(
                model_photo=model_photo,
                user_id=1,
                filename=f"sample_{model_photo.id}_{idx}.jpg",
                width=image_info["width"],
                height=image_info["height"],
                size=0,
                content_type="image/jpeg",
                extension=".jpg",
                oss_object_name=f"samples/model_{model_photo.id}/{idx}.jpg",
                oss_url=image_url,
                oss_folder="samples",
                image_type="preview",
                is_primary=idx == 0,
                is_uploaded=True,
                uploaded_at=datetime.utcnow(),
            )

        print(f"创建: {model_data['name']}")
        created_count += 1

    print("=" * 50)
    print(f"初始化完成！")
    print(f"  新建: {created_count} 条")
    print(f"  跳过: {skipped_count} 条")
    print("=" * 50)

    await Tortoise.close_connections()


if __name__ == "__main__":
    asyncio.run(seed_model_photos())
