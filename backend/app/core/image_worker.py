"""
后台任务 Worker

负责处理图像生成任务：
1. 轮询数据库获取 queued 状态的任务
2. 调用 Google Gen API 生成图像
3. 上传到 OSS 并保存记录
4. 更新任务状态
5. 通过 WebSocket 推送结果

可扩展升级：
- Celery: 将处理逻辑改为 Celery Task
- Redis Queue: 使用 Redis List 作为任务队列
- 重试机制: 实现指数退避重试
"""
import asyncio
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from app.models.image_task import ImageTask
from app.models.model_photo import ModelPhoto, ModelImage
from app.core.ws_manager import ws_manager
from app.core.image_client import generate_image
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


async def upload_image_to_oss(local_path: str, user_id: int, model_photo_id: Optional[int] = None, create_model_image: bool = True) -> Optional[dict]:
    """上传图片到 OSS 并创建 ModelImage 记录

    Args:
        local_path: 本地图片路径
        user_id: 用户ID
        model_photo_id: 关联的 ModelPhoto ID

    Returns:
        包含上传信息的字典，或失败时返回 None
    """
    try:
        # 读取文件内容
        with open(local_path, "rb") as f:
            content = f.read()

        # 获取 OSS 上传器
        uploader = get_oss_uploader()

        # 生成 OSS 对象名
        filename = Path(local_path).name
        ext = Path(local_path).suffix
        object_name = uploader.generate_object_name(
            filename,
            folder=CONFIG["oss_folder"],
            use_date_folder=True,
        )

        # 上传到 OSS
        success, result = uploader.upload_file(content, object_name)
        print(f"[ImageWorker] OSS upload result: success={success}, result={result}, object_name={object_name}")

        if not success:
            print(f"[ImageWorker] OSS upload failed: {result}")
            return None

        # 获取图片信息
        try:
            from PIL import Image
            with Image.open(local_path) as img:
                width, height = img.size
                file_size = len(content)
            print(f"[ImageWorker] PIL open success: {local_path}, size={width}x{height}")
        except Exception as img_error:
            print(f"[ImageWorker] PIL open failed: {img_error}, path={local_path}")
            return None

        # 只有在需要创建 ModelImage 记录时才创建
        if create_model_image and model_photo_id:
            model_image = await ModelImage.create(
                model_photo_id=model_photo_id,
                user_id=user_id,
                filename=filename,
                width=width,
                height=height,
                size=file_size,
                content_type=f"image/{ext[1:].lower()}" if ext else "image/png",
                extension=ext.lower(),
                oss_object_name=object_name,
                oss_url=result,
                oss_folder=CONFIG["oss_folder"],
                image_type="result",
                is_primary=False,
                is_uploaded=True,
                uploaded_at=datetime.utcnow(),
            )
            print(f"[ImageWorker] Image uploaded to OSS: {result}")
            return {
                "model_image_id": model_image.id,
                "oss_url": result,
                "width": width,
                "height": height,
            }
        else:
            # 直接返回 OSS URL，不创建 ModelImage 记录
            print(f"[ImageWorker] Image uploaded to OSS (no ModelImage): {result}")
            return {
                "model_image_id": None,
                "oss_url": result,
                "width": width,
                "height": height,
            }

    except Exception as e:
        print(f"[ImageWorker] Error uploading image: {e}")
        return None


async def process_single_task(task: ImageTask) -> bool:
    """
    处理单个任务

    Args:
        task: ImageTask 实例

    Returns:
        是否处理成功
    """
    print(f"[ImageWorker] Processing task: {task.id}, user_id: {task.user_id}")
    print(f"[ImageWorker] Current WS connections: {list(ws_manager.connections.keys())}")

    # 更新为 running
    task.status = "running"
    task.started_at = datetime.now(timezone.utc)
    await task.save()

    # WebSocket 推送：开始处理（通过 user_id 直接推送）
    push_result = await ws_manager.push_task_update(
        user_id=task.user_id,
        task_id=task.id,
        status="running",
    )
    print(f"[ImageWorker] WS push running result: {push_result}")

    # 调用生成（支持重试）
    last_error = None
    for attempt in range(CONFIG["retry_times"]):
        try:
            print(f"[ImageWorker] Attempt {attempt + 1}/{CONFIG['retry_times']} for task {task.id}")
            result = generate_image(
                prompt=task.prompt,
                reference_images=task.reference_images,
                aspect_ratio=task.aspect_ratio,
                resolution=task.resolution,
                output_filename=f"task_{task.id}",
                verbose=False,
            )
            print(f"[ImageWorker] generate_image result: {result.get('status')}, error: {result.get('error')}")

            if result["status"] == "success":
                # 计算耗时
                generation_time = None
                finished_time = datetime.now(timezone.utc)
                if task.started_at:
                    started_time = task.started_at
                    if started_time.tzinfo is None:
                        started_time = started_time.replace(tzinfo=timezone.utc)
                    generation_time = (finished_time - started_time).total_seconds()

                # 创建 ModelPhoto 记录
                model_photo = await ModelPhoto.create(
                    user_id=task.user_id,
                    task_id=task.id,
                    generation_type=task.task_type,
                    selected_options=task.selected_configs,
                    custom_prompts={"user_prompt": task.user_prompt} if task.user_prompt else {},
                    final_prompt=task.prompt,
                    final_negative_prompt=task.negative_prompt,
                    reference_images=task.reference_images,
                    aspect_ratio=task.aspect_ratio,
                    resolution=task.resolution,
                    status="completed",
                    progress=100,
                    image_count=len(result.get("generated_images", [])),
                    started_at=task.started_at,
                    finished_at=finished_time,
                    generation_time=generation_time,
                )
                print(f"[ImageWorker] Created ModelPhoto record: {model_photo.id}")

                # 上传生成的图片到 OSS
                uploaded_images = []
                for local_path in result.get("generated_images", []):
                    upload_result = await upload_image_to_oss(local_path, task.user_id, model_photo.id)
                    if upload_result:
                        uploaded_images.append(upload_result)
                    else:
                        # 上传失败，使用本地路径
                        uploaded_images.append({
                            "local_path": local_path,
                            "oss_url": None,
                            "width": 1024,
                            "height": 1024,
                        })

                # 成功：更新结果
                task.status = "succeeded"
                task.result_json = {
                    "images": uploaded_images
                }
                task.finished_at = finished_time
                await task.save()

                # WebSocket 推送：成功
                await ws_manager.push_task_update(
                    user_id=task.user_id,
                    task_id=task.id,
                    status="succeeded",
                    result=task.result_json,
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
    task.status = "failed"
    task.error_code = "GENERATION_FAILED"
    task.error_message = last_error or "Max retries exceeded"
    task.finished_at = finished_time
    await task.save()

    # 创建失败的 ModelPhoto 记录
    try:
        generation_time = None
        if task.started_at:
            started_time = task.started_at
            if started_time.tzinfo is None:
                started_time = started_time.replace(tzinfo=timezone.utc)
            generation_time = (finished_time - started_time).total_seconds()

        await ModelPhoto.create(
            user_id=task.user_id,
            task_id=task.id,
            generation_type=task.task_type,
            selected_options=task.selected_configs,
            custom_prompts={"user_prompt": task.user_prompt} if task.user_prompt else {},
            final_prompt=task.prompt,
            final_negative_prompt=task.negative_prompt,
            reference_images=task.reference_images,
            aspect_ratio=task.aspect_ratio,
            resolution=task.resolution,
            status="failed",
            progress=0,
            error_code=task.error_code,
            error_message=task.error_message,
            started_at=task.started_at,
            finished_at=finished_time,
            generation_time=generation_time,
        )
        print(f"[ImageWorker] Created failed ModelPhoto record for task: {task.id}")
    except Exception as e:
        print(f"[ImageWorker] Failed to create ModelPhoto record: {e}")

    # WebSocket 推送：失败
    await ws_manager.push_task_update(
        user_id=task.user_id,
        task_id=task.id,
        status="failed",
        error={"code": task.error_code, "message": task.error_message},
        finished_at=task.finished_at.isoformat(),
    )

    return False


async def worker_loop():
    """
    主循环：轮询并处理任务

    可扩展：
    - 使用 Redis Queue 替代数据库轮询
    - 使用 Celery 实现分布式处理
    """
    print(f"[ImageWorker] Started (poll_interval={CONFIG['poll_interval']}s, batch_size={CONFIG['batch_size']})")

    while True:
        try:
            # 捞取 queued 状态的任务
            tasks = await ImageTask.filter(status="queued").limit(CONFIG["batch_size"])

            if tasks:
                print(f"[ImageWorker] Processing {len(tasks)} tasks")
                for task in tasks:
                    await process_single_task(task)
            else:
                # 没有任务时短暂休眠，减少数据库查询
                await asyncio.sleep(CONFIG["poll_interval"])

        except asyncio.CancelledError:
            print("[ImageWorker] Stopping...")
            break
        except Exception as e:
            print(f"[ImageWorker] Error: {e}")
            await asyncio.sleep(CONFIG["poll_interval"])


def start_worker():
    """
    启动 Worker（在独立线程中运行）

    用于独立进程模式：
    - 作为独立进程启动（使用 multiprocessing）
    - 集成 Celery Worker

    注意：当作为 FastAPI 的一部分运行时，使用 asyncio.create_task() 在主事件循环中启动
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    async def init_db_and_run():
        # 在独立线程中需要重新初始化数据库连接
        from tortoise import Tortoise
        await Tortoise.init(config=settings.get_tortoise_orm())
        await Tortoise.generate_schemas()
        try:
            await worker_loop()
        finally:
            await Tortoise.close_connections()

    loop.run_until_complete(init_db_and_run())


# ============ Celery 升级路径（预留） ============
# 以下代码在升级 Celery 时使用：

# from celery import Celery
#
# celery_app = Celery("image_worker", broker="redis://localhost:6379/0")
#
# @celery_app.task(bind=True, max_retries=3)
# def process_image_task(self, task_id: str):
#     """Celery Task 版本的图像处理"""
#     # ... 同样的处理逻辑 ...
#     # 使用 self.retry() 实现重试
# ==============================================


def run_worker():
    """运行 Worker（阻塞）"""
    start_worker()


if __name__ == "__main__":
    # 直接运行时启动 worker
    print("Starting Image Worker...")
    start_worker()
