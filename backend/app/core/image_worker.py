"""
后台任务 Worker (适配新架构)

负责处理图像生成任务：
1. 轮询数据库获取 queued 状态的任务
2. 调用 Google Gen API 生成图像
3. 上传到 OSS 并保存记录
4. 更新任务状态
5. 通过 WebSocket 推送结果

注意：已移除 ModelPhoto / ModelImage 相关逻辑，结果直接存入 GenerationTask.result
"""

import asyncio
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List, Dict, Any

from app.models.generation_task import GenerationTask, TaskStatus, TaskType
from app.core.ws_manager import ws_manager
from app.core.image_client import generate_image
from app.services.prompt_assembler import PromptAssembler
from app.settings.config import settings
from app.utils.oss_utils import get_oss_uploader


# Worker 配置
CONFIG = {
    "poll_interval": 2,  # 轮询间隔（秒）
    "batch_size": 10,  # 每次处理的任务数
    "retry_times": 3,  # 重试次数
    "retry_delay": 5,  # 重试间隔（秒）
    "oss_folder": "generated",  # OSS 文件夹
}


async def upload_image_to_oss(local_path: str, user_id: str) -> Optional[dict]:
    """上传图片到 OSS

    Returns:
        包含上传信息的字典 (oss_url, width, height)，或失败时返回 None
    """
    try:
        # 读取文件内容
        with open(local_path, "rb") as f:
            content = f.read()

        # 获取 OSS 上传器
        uploader = get_oss_uploader()

        # 生成 OSS 对象名
        filename = Path(local_path).name
        object_name = uploader.generate_object_name(
            filename,
            folder=CONFIG["oss_folder"],
            use_date_folder=True,
        )

        # 上传到 OSS
        success, result = uploader.upload_file(content, object_name)

        if not success:
            print(f"[ImageWorker] OSS upload failed: {result}")
            return None

        # 获取图片信息
        width, height = 0, 0
        try:
            from PIL import Image

            with Image.open(local_path) as img:
                width, height = img.size
        except Exception:
            pass

        return {"url": result, "width": width, "height": height, "filename": filename}

    except Exception as e:
        print(f"[ImageWorker] Error uploading image: {e}")
        return None


async def process_single_task(task: GenerationTask) -> bool:
    """处理单个任务"""
    print(f"[ImageWorker] Processing task: {task.id}, user_id: {task.user_id}")

    # 更新为 running
    task.status = TaskStatus.PROCESSING
    task.started_at = datetime.now(timezone.utc)
    await task.save()

    # WebSocket 推送：开始处理
    await ws_manager.push_task_update(
        user_id=task.user_id,
        task_id=str(task.id),
        status="processing",
    )

    # 调用生成（支持重试）
    last_error = None

    # 如果是 Tryon 任务，可能需要获取图片路径
    await task.fetch_related("tryon", "detail", "detail__template", "model_gen")

    # 准备提示词：使用 PromptAssembler 组装或使用默认 prompt
    prompt = task.prompt or ""
    if task.prompt_configs:
        try:
            assembler = PromptAssembler(task.task_type.value)
            assembled = await assembler.assemble(task.prompt_configs, task.prompt)
            prompt = assembled.positive_prompt
            print(f"[ImageWorker] Assembled prompt: {prompt[:100]}...")
        except Exception as e:
            print(f"[ImageWorker] PromptAssembler error: {e}, using fallback")
            prompt = task.prompt or "Default prompt"
    else:
        prompt = task.prompt or "Default prompt"

    # 准备参考图片
    reference_images = []
    if task.task_type == TaskType.TRYON and task.tryon:
        # Tryon 任务使用 person_image 和 garment_image
        if task.tryon.person_image:
            reference_images.append(task.tryon.person_image)
        if task.tryon.garment_image:
            reference_images.append(task.tryon.garment_image)

    # Handle Detail type
    if task.task_type == TaskType.DETAIL and task.detail:
        if task.detail.input_image:
            reference_images.append(task.detail.input_image)
        # 尝试从模版 config 中获取 prompt
        if task.detail.template and hasattr(task.detail.template, "config"):
            template_config = task.detail.template.config or {}
            if template_config.get("prompt"):
                prompt = template_config["prompt"]

    # Model type currently has no reference images in schema

    for attempt in range(CONFIG["retry_times"]):
        try:
            result = generate_image(
                prompt=prompt,
                reference_images=reference_images,
                aspect_ratio=task.aspect_ratio or "1:1",
                resolution=task.quality or "1K",  # 映射 quality 字段
                output_filename=f"task_{task.id}",
                verbose=False,
            )

            if result["status"] == "success":
                # 计算耗时
                finished_time = datetime.now(timezone.utc)

                # 上传生成的图片到 OSS
                uploaded_images = []
                for local_path in result.get("generated_images", []):
                    upload_result = await upload_image_to_oss(local_path, task.user_id)
                    if upload_result:
                        uploaded_images.append(upload_result["url"])
                    else:
                        # 上传失败，暂且忽略或标记
                        pass

                # 成功：更新结果
                task.status = TaskStatus.SUCCEEDED
                task.result = {"images": uploaded_images, "local_paths": result.get("generated_images", [])}  # 仅供调试
                task.finished_at = finished_time
                await task.save()

                # WebSocket 推送：成功
                await ws_manager.push_task_update(
                    user_id=task.user_id,
                    task_id=str(task.id),
                    status="succeeded",
                    result=task.result,
                    finished_at=task.finished_at.isoformat(),
                )
                return True
            else:
                last_error = result.get("error", "Unknown error")

        except Exception as e:
            last_error = str(e)

        # 重试等待
        if attempt < CONFIG["retry_times"] - 1:
            await asyncio.sleep(CONFIG["retry_delay"])

    # 失败：更新错误信息
    finished_time = datetime.now(timezone.utc)
    task.status = TaskStatus.FAILED
    task.error = {"code": "GENERATION_FAILED", "message": last_error or "Max retries exceeded"}
    task.finished_at = finished_time
    await task.save()

    # WebSocket 推送：失败
    await ws_manager.push_task_update(
        user_id=task.user_id,
        task_id=str(task.id),
        status="failed",
        error=task.error,
        finished_at=task.finished_at.isoformat(),
    )

    return False


async def worker_loop():
    """主循环：轮询并处理任务"""
    print(f"[ImageWorker] Started (poll_interval={CONFIG['poll_interval']}s)")

    while True:
        try:
            # 捞取 queued 状态的任务
            tasks = await GenerationTask.filter(status=TaskStatus.QUEUED).limit(CONFIG["batch_size"])

            if tasks:
                print(f"[ImageWorker] Processing {len(tasks)} tasks")
                for task in tasks:
                    await process_single_task(task)
            else:
                await asyncio.sleep(CONFIG["poll_interval"])

        except asyncio.CancelledError:
            print("[ImageWorker] Stopping...")
            break
        except Exception as e:
            print(f"[ImageWorker] Error: {e}")
            await asyncio.sleep(CONFIG["poll_interval"])


def start_worker():
    """启动 Worker"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    async def init_db_and_run():
        from tortoise import Tortoise

        await Tortoise.init(config=settings.get_tortoise_orm())
        # 注意：这里不再自动生成 Schema，避免生产环境意外
        # await Tortoise.generate_schemas()
        try:
            await worker_loop()
        finally:
            await Tortoise.close_connections()

    loop.run_until_complete(init_db_and_run())


if __name__ == "__main__":
    print("Starting Image Worker...")
    start_worker()
