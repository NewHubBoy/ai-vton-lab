from contextlib import asynccontextmanager

from fastapi import FastAPI
from tortoise import Tortoise

from app.core.exceptions import SettingNotFound
from app.core.init_app import (
    init_data,
    make_middlewares,
    register_exceptions,
    register_routers,
)

try:
    from app.settings.config import settings
except ImportNotFoundError:
    raise SettingNotFound("Can not import settings")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 初始化 Tortoise ORM，使用动态配置
    await Tortoise.init(config=settings.get_tortoise_orm())
    await Tortoise.generate_schemas()
    await init_data()

    # 启动图像生成 Worker（在主事件循环中运行）
    from app.core.image_worker import worker_loop
    import asyncio

    asyncio.create_task(worker_loop())

    # 启动 WebSocket 心跳
    from app.core.ws_manager import ws_manager

    await ws_manager.start_heartbeat(interval=30)
    print("[WS] Heartbeat started")

    yield

    # 关闭 WebSocket 心跳
    await ws_manager.stop_heartbeat()
    await Tortoise.close_connections()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_TITLE,
        description=settings.APP_DESCRIPTION,
        version=settings.VERSION,
        openapi_url="/openapi.json",
        middleware=make_middlewares(),
        lifespan=lifespan,
    )
    register_exceptions(app)
    register_routers(app, prefix="/api")
    return app


app = create_app()
