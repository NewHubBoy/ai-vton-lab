#!/usr/bin/env python3
"""
任务生成系统测试脚本

测试三种任务类型的创建和数据传递：
1. Tryon (虚拟试穿)
2. Detail (详情页生成)
3. Model (模特生成)

使用方法:
    # 直接运行测试
    cd /Users/dengyafei/Documents/codes/ai-vton-lab/backend
    python tests/test_task_generation.py

    # 使用 pytest
    python -m pytest tests/test_task_generation.py -v
"""

import asyncio
import sys
import uuid
from pathlib import Path
from datetime import datetime

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from tortoise import Tortoise

from app.models.generation_task import GenerationTask, TaskTryon, TaskDetail, TaskModel, TaskType, TaskStatus
from app.models.template import DetailTemplate
from app.schemas.generation_task import (
    CreateTaskRequest,
    GenerationTaskResponse,
    TaskTryonParams,
    TaskDetailParams,
    TaskModelParams,
)
from app.settings.config import settings


class Colors:
    """终端颜色"""

    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    RESET = "\033[0m"


def print_success(msg: str):
    print(f"{Colors.GREEN}✓ {msg}{Colors.RESET}")


def print_error(msg: str):
    print(f"{Colors.RED}✗ {msg}{Colors.RESET}")


def print_info(msg: str):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.RESET}")


def print_warning(msg: str):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.RESET}")


async def init_db():
    """初始化数据库连接"""
    await Tortoise.init(config=settings.get_tortoise_orm())
    await Tortoise.generate_schemas(safe=True)
    print_success("数据库连接成功")


async def close_db():
    """关闭数据库连接"""
    await Tortoise.close_connections()


async def create_test_template() -> DetailTemplate:
    """创建测试模版"""
    template = await DetailTemplate.create(
        id=uuid.uuid4(),
        name="测试模版",
        cover_image="https://example.com/cover.jpg",
        config={
            "prompt": "Generate a professional product detail image with clean background",
            "layout": "vertical",
            "background_color": "#FFFFFF",
        },
        is_active=True,
    )
    print_success(f"创建测试模版: {template.id}")
    return template


async def test_tryon_task():
    """测试 Tryon 任务创建"""
    print_info("\n=== 测试 Tryon 任务 ===")

    test_user_id = str(uuid.uuid4())
    task_id = uuid.uuid4()

    # 1. 创建主任务
    task = await GenerationTask.create(
        id=task_id,
        user_id=test_user_id,
        task_type=TaskType.TRYON,
        status=TaskStatus.QUEUED,
        prompt="Virtual try-on with the given garment",
        aspect_ratio="3:4",
        quality="1K",
        platform="test",
    )
    print_success(f"创建主任务: {task.id}")

    # 2. 创建 Tryon 子任务
    tryon = await TaskTryon.create(
        id=uuid.uuid4(),
        task=task,
        person_image="https://example.com/person.jpg",
        garment_image="https://example.com/garment.jpg",
        category="upper_body",
        seed=42,
    )
    print_success(f"创建 Tryon 子任务: {tryon.id}")

    # 3. 查询并验证
    fetched_task = (
        await GenerationTask.filter(id=task_id)
        .prefetch_related("tryon", "detail", "detail__template", "model_gen")
        .first()
    )

    assert fetched_task is not None, "任务不存在"
    assert fetched_task.tryon is not None, "Tryon 子任务不存在"
    assert fetched_task.tryon.person_image == "https://example.com/person.jpg"
    assert fetched_task.tryon.garment_image == "https://example.com/garment.jpg"
    assert fetched_task.tryon.category == "upper_body"
    print_success("Tryon 数据验证通过")

    # 4. 测试 Schema 序列化
    response = GenerationTaskResponse.model_validate(fetched_task)
    assert response.tryon is not None
    assert response.tryon.person_image == "https://example.com/person.jpg"
    print_success("Schema 序列化验证通过")

    # 5. 测试模拟 Worker 处理
    fetched_task.status = TaskStatus.SUCCEEDED
    fetched_task.result = {
        "images": ["https://oss.example.com/result1.jpg"],
        "local_paths": ["/tmp/result1.jpg"],
    }
    fetched_task.finished_at = datetime.utcnow()
    await fetched_task.save()

    # 验证 result 类型
    updated_task = await GenerationTask.get(id=task_id)
    assert isinstance(updated_task.result, dict), "result 应该是 dict 类型"
    assert "images" in updated_task.result
    print_success("Result 数据格式验证通过")

    # 清理
    await task.delete()
    print_success("Tryon 任务测试完成 ✓")
    return True


async def test_detail_task():
    """测试 Detail 任务创建"""
    print_info("\n=== 测试 Detail 任务 ===")

    test_user_id = str(uuid.uuid4())
    task_id = uuid.uuid4()

    # 创建测试模版
    template = await create_test_template()

    # 1. 创建主任务
    task = await GenerationTask.create(
        id=task_id,
        user_id=test_user_id,
        task_type=TaskType.DETAIL,
        status=TaskStatus.QUEUED,
        prompt=None,  # Detail 任务通常从模版获取 prompt
        aspect_ratio="3:4",
        quality="2K",
        platform="test",
    )
    print_success(f"创建主任务: {task.id}")

    # 2. 创建 Detail 子任务
    detail = await TaskDetail.create(
        id=uuid.uuid4(),
        task=task,
        input_image="https://example.com/product.jpg",
        template=template,
        extra_options={"text": "Premium Quality Product"},
    )
    print_success(f"创建 Detail 子任务: {detail.id}")

    # 3. 查询并验证 (使用 detail__template)
    fetched_task = (
        await GenerationTask.filter(id=task_id)
        .prefetch_related("tryon", "detail", "detail__template", "model_gen")
        .first()
    )

    assert fetched_task is not None, "任务不存在"
    assert fetched_task.detail is not None, "Detail 子任务不存在"
    assert fetched_task.detail.input_image == "https://example.com/product.jpg"
    assert fetched_task.detail.template is not None, "Template 关联不存在"
    assert fetched_task.detail.template.name == "测试模版"
    print_success("Detail 数据验证通过")

    # 4. 验证从模版获取 prompt
    template_config = fetched_task.detail.template.config or {}
    prompt_from_template = template_config.get("prompt")
    assert prompt_from_template is not None
    assert "product detail" in prompt_from_template.lower()
    print_success(f"从模版获取 prompt: {prompt_from_template[:50]}...")

    # 5. 测试 Schema 序列化 (验证 template_id 转换)
    response = GenerationTaskResponse.model_validate(fetched_task)
    assert response.detail is not None
    assert response.detail.template_id == str(template.id)
    print_success(f"Schema 序列化验证通过, template_id: {response.detail.template_id}")

    # 清理
    await task.delete()
    await template.delete()
    print_success("Detail 任务测试完成 ✓")
    return True


async def test_model_task():
    """测试 Model 任务创建"""
    print_info("\n=== 测试 Model 任务 ===")

    test_user_id = str(uuid.uuid4())
    task_id = uuid.uuid4()

    # 1. 创建主任务
    task = await GenerationTask.create(
        id=task_id,
        user_id=test_user_id,
        task_type=TaskType.MODEL,
        status=TaskStatus.QUEUED,
        prompt="Generate a professional model photo",
        aspect_ratio="9:16",
        quality="4K",
        platform="test",
    )
    print_success(f"创建主任务: {task.id}")

    # 2. 创建 Model 子任务
    model = await TaskModel.create(
        id=uuid.uuid4(),
        task=task,
        base_model="sd-xl-base-1.0",
        lora_config={"model": "fashion-lora", "weight": 0.8},
        num_inference_steps=30,
        guidance_scale=7.5,
    )
    print_success(f"创建 Model 子任务: {model.id}")

    # 3. 查询并验证
    fetched_task = (
        await GenerationTask.filter(id=task_id)
        .prefetch_related("tryon", "detail", "detail__template", "model_gen")
        .first()
    )

    assert fetched_task is not None, "任务不存在"
    assert fetched_task.model_gen is not None, "Model 子任务不存在"
    assert fetched_task.model_gen.base_model == "sd-xl-base-1.0"
    assert fetched_task.model_gen.guidance_scale == 7.5
    print_success("Model 数据验证通过")

    # 4. 测试 Schema 序列化
    response = GenerationTaskResponse.model_validate(fetched_task)
    assert response.model is not None
    assert response.model.base_model == "sd-xl-base-1.0"
    print_success("Schema 序列化验证通过")

    # 清理
    await task.delete()
    print_success("Model 任务测试完成 ✓")
    return True


async def test_schema_validation():
    """测试 Schema 验证"""
    print_info("\n=== 测试 Schema 验证 ===")

    # 测试 Tryon 请求 Schema
    tryon_request = CreateTaskRequest(
        task_type=TaskType.TRYON,
        prompt="Try on this garment",
        aspect_ratio="3:4",
        quality="1K",
        tryon=TaskTryonParams(
            person_image="https://example.com/person.jpg",
            garment_image="https://example.com/garment.jpg",
            category="upper_body",
        ),
    )
    assert tryon_request.tryon is not None
    print_success("Tryon 请求 Schema 验证通过")

    # 测试 Detail 请求 Schema
    detail_request = CreateTaskRequest(
        task_type=TaskType.DETAIL,
        aspect_ratio="3:4",
        quality="2K",
        detail=TaskDetailParams(
            input_image="https://example.com/product.jpg",
            template_id=str(uuid.uuid4()),
            extra_options={"text": "Test"},
        ),
    )
    assert detail_request.detail is not None
    print_success("Detail 请求 Schema 验证通过")

    # 测试 Model 请求 Schema
    model_request = CreateTaskRequest(
        task_type=TaskType.MODEL,
        prompt="Generate model photo",
        aspect_ratio="9:16",
        quality="4K",
        model=TaskModelParams(
            base_model="sd-xl-base-1.0",
            guidance_scale=7.5,
        ),
    )
    assert model_request.model is not None
    print_success("Model 请求 Schema 验证通过")

    print_success("Schema 验证测试完成 ✓")
    return True


async def run_all_tests():
    """运行所有测试"""
    print_info("=" * 50)
    print_info("任务生成系统测试")
    print_info("=" * 50)

    try:
        await init_db()

        results = []

        # Schema 验证测试
        results.append(("Schema 验证", await test_schema_validation()))

        # Tryon 任务测试
        results.append(("Tryon 任务", await test_tryon_task()))

        # Detail 任务测试
        results.append(("Detail 任务", await test_detail_task()))

        # Model 任务测试
        results.append(("Model 任务", await test_model_task()))

        # 汇总结果
        print_info("\n" + "=" * 50)
        print_info("测试结果汇总")
        print_info("=" * 50)

        all_passed = True
        for name, passed in results:
            if passed:
                print_success(f"{name}: 通过")
            else:
                print_error(f"{name}: 失败")
                all_passed = False

        if all_passed:
            print_success("\n所有测试通过! ✓")
        else:
            print_error("\n部分测试失败!")
            return False

        return True

    except Exception as e:
        print_error(f"测试异常: {e}")
        import traceback

        traceback.print_exc()
        return False
    finally:
        await close_db()


if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)
