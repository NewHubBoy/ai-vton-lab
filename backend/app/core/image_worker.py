"""
后台任务 Worker

负责处理图像生成任务：
1. 轮询数据库获取 queued 状态的任务
2. 调用 Google Gen API 生成图像
3. 更新任务状态
4. 通过 WebSocket 推送结果

可扩展升级：
- Celery: 将处理逻辑改为 Celery Task
- Redis Queue: 使用 Redis List 作为任务队列
- 重试机制: 实现指数退避重试
"""
import asyncio
import threading
import time
from datetime import datetime
from typing import Optional

from app.models.image_task import ImageTask
from app.core.ws_manager import ws_manager
from app.core.image_client import generate_image
from app.settings.config import settings


# Worker 配置
CONFIG = {
    "poll_interval": 2,  # 轮询间隔（秒）
    "batch_size": 10,  # 每次处理的任务数
    "retry_times": 3,  # 重试次数
    "retry_delay": 5,  # 重试间隔（秒）
}


async def process_single_task(task: ImageTask) -> bool:
    """
    处理单个任务

    Args:
        task: ImageTask 实例

    Returns:
        是否处理成功
    """
    # 更新为 running
    task.status = "running"
    task.started_at = datetime.utcnow()
    await task.save()

    # WebSocket 推送：开始处理
    await ws_manager.push_task_update(
        task_id=task.id,
        status="running",
    )

    # 调用生成（支持重试）
    last_error = None
    for attempt in range(CONFIG["retry_times"]):
        try:
            result = generate_image(
                prompt=task.prompt,
                reference_images=task.reference_images,
                aspect_ratio=task.aspect_ratio,
                resolution=task.resolution,
                output_filename=f"task_{task.id}",
                verbose=False,
            )

            if result["status"] == "success":
                # 成功：更新结果
                task.status = "succeeded"
                task.result_json = {
                    "images": [
                        {"url": url, "width": 1024, "height": 1024}
                        for url in result.get("generated_images", [])
                    ]
                }
                task.finished_at = datetime.utcnow()
                await task.save()

                # WebSocket 推送：成功
                await ws_manager.push_task_update(
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
    task.status = "failed"
    task.error_code = "GENERATION_FAILED"
    task.error_message = last_error or "Max retries exceeded"
    task.finished_at = datetime.utcnow()
    await task.save()

    # WebSocket 推送：失败
    await ws_manager.push_task_update(
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
