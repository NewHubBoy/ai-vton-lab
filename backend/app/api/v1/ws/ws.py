"""
WebSocket 路由

提供任务状态实时推送功能。

可扩展：
- 升级 Redis: 多实例部署时使用 Redis Pub/Sub
- 升级认证: 使用更安全的 WebSocket 认证方式
"""

from fastapi import APIRouter, WebSocket, Query
from pydantic import BaseModel

from app.core.ws_manager import handle_websocket_connection

router = APIRouter()


class WebSocketMessage(BaseModel):
    """WebSocket 消息格式"""

    type: str
    task_id: str | None = None
    status: str | None = None
    result: dict | None = None
    error: dict | None = None
    finished_at: str | None = None


@router.websocket("/tasks")
async def websocket_tasks(websocket: WebSocket, token: str = Query(..., description="JWT Token")):
    """
    任务状态 WebSocket 连接

    消息格式：
    - 订阅任务: {"type": "subscribe", "task_id": "xxx"}
    - 接收更新: {"type": "task_update", "task_id": "xxx", "status": "running", ...}
    - 心跳: {"type": "heartbeat"}

    可扩展：
    - 认证升级: 支持 refresh token 自动续期
    - 权限控制: 只能订阅自己的任务
    - 批量订阅: 同时订阅多个任务
    """
    await handle_websocket_connection(websocket, token)


# HTTP 端点用于文档展示（实际功能由 WebSocket 提供）
@router.get(
    "/tasks/ws-info",
    summary="WebSocket 连接说明",
    description="""
    ## WebSocket 连接信息

    **URL**: `ws://host:9999/api/v1/ws/tasks?token=xxx`

    **消息格式**:
    - 订阅: `{"type": "subscribe", "task_id": "任务ID"}`
    - 心跳: `{"type": "heartbeat"}`

    **接收消息**:
    - 任务更新: `{"type": "task_update", "task_id": "xxx", "status": "succeeded", ...}`
    """,
    tags=["ws模块"],
)
async def ws_info():
    """WebSocket 端点说明（实际连接请使用 ws://host:9999/api/v1/ws/tasks?token=xxx）"""
    return {
        "message": "请使用 WebSocket 连接端点: ws://host:9999/api/v1/ws/tasks?token=xxx",
        "ws_url": "ws://host:9999/api/v1/ws/tasks?token=xxx",
        "subscribe_format": {"type": "subscribe", "task_id": "xxx"},
    }
