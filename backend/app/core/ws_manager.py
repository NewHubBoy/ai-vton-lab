"""
WebSocket 连接管理器

用于管理用户 WebSocket 连接，实现任务状态实时推送。

可扩展：
- 升级 Redis: 使用 Redis Pub/Sub 实现多实例间消息推送
- 升级 Celery: Celery Worker 可以通过 Redis 发布任务更新消息
"""

from typing import Dict, Optional
import asyncio
import json

from fastapi import WebSocket, WebSocketDisconnect

from app.core.security import decode_token


class ConnectionManager:
    """
    WebSocket 连接管理器

    功能：
    - 管理用户 WebSocket 连接
    - 任务订阅关系维护
    - 消息推送

    可扩展升级路径：
    1. Redis Pub/Sub: 多实例部署时跨实例推送
    2. Celery 集成: Worker 直接发布消息
    """

    def __init__(self):
        # user_id -> WebSocket 连接
        self.connections: Dict[str, WebSocket] = {}

        # task_id -> user_id (用于定向推送)
        self.task_subscribers: Dict[str, str] = {}

        # 心跳任务
        self._heartbeat_task: Optional[asyncio.Task] = None

    async def connect(self, user_id: str, websocket: WebSocket) -> bool:
        """
        建立 WebSocket 连接

        Args:
            user_id: 用户ID
            websocket: WebSocket 连接

        Returns:
            是否连接成功
        """
        try:
            await websocket.accept()
            self.connections[user_id] = websocket
            return True
        except Exception:
            return False

    def disconnect(self, user_id: str):
        """
        断开 WebSocket 连接

        可扩展：
        - 记录断开原因（正常关闭/异常）
        - 清理订阅关系时通知其他服务
        """
        if user_id in self.connections:
            del self.connections[user_id]

        # 清理该用户的所有订阅
        tasks_to_remove = [t for t, u in self.task_subscribers.items() if u == user_id]
        for task_id in tasks_to_remove:
            del self.task_subscribers[task_id]

    async def send_message(self, user_id: str, message: dict) -> bool:
        """
        发送消息给指定用户

        Args:
            user_id: 用户ID
            message: 消息内容

        Returns:
            是否发送成功
        """
        if user_id in self.connections:
            try:
                await self.connections[user_id].send_json(message)
                return True
            except Exception:
                # 连接可能已断开，清理
                self.disconnect(user_id)
                return False
        return False

    async def push_task_update(
        self,
        task_id: str,
        status: str,
        result: Optional[dict] = None,
        error: Optional[dict] = None,
        finished_at: Optional[str] = None,
    ) -> int:
        """
        推送任务状态更新

        Args:
            task_id: 任务ID
            status: 状态
            result: 成功时的结果
            error: 失败时的错误
            finished_at: 完成时间

        Returns:
            推送成功的用户数
        """
        user_id = self.task_subscribers.get(task_id)
        if not user_id:
            return 0

        message = {
            "type": "task_update",
            "task_id": task_id,
            "status": status,
        }

        if result is not None:
            message["result"] = result

        if error is not None:
            message["error"] = error

        if finished_at:
            message["finished_at"] = finished_at

        success = await self.send_message(user_id, message)
        if success:
            # 成功后清理订阅关系
            del self.task_subscribers[task_id]

        return 1 if success else 0

    async def start_heartbeat(self, interval: int = 30):
        """
        启动心跳任务

        可扩展：
        - 使用 Redis 存储心跳状态
        - 配合负载均衡器检测连接健康
        """
        self._heartbeat_task = asyncio.create_task(self._heartbeat_loop(interval))

    async def stop_heartbeat(self):
        """停止心跳任务"""
        if self._heartbeat_task:
            self._heartbeat_task.cancel()
            try:
                await self._heartbeat_task
            except asyncio.CancelledError:
                pass

    async def _heartbeat_loop(self, interval: int):
        """心跳循环"""
        while True:
            await asyncio.sleep(interval)
            # 发送心跳给所有在线用户
            for user_id in list(self.connections.keys()):
                await self.send_message(user_id, {"type": "heartbeat"})

    async def handle_message(self, user_id: str, data: dict) -> Optional[dict]:
        """
        处理客户端消息

        Args:
            user_id: 用户ID
            data: 消息数据

        Returns:
            响应消息（如果有）
        """
        msg_type = data.get("type")

        if msg_type == "subscribe":
            # 订阅任务
            task_id = data.get("task_id")
            if task_id:
                self.task_subscribers[task_id] = user_id
                return {"type": "subscribed", "task_id": task_id}

        elif msg_type == "heartbeat":
            # 响应心跳
            return {"type": "heartbeat"}

        return None


# 全局实例
ws_manager = ConnectionManager()


async def handle_websocket_connection(websocket: WebSocket, token: str) -> Optional[str]:
    """
    处理 WebSocket 连接

    Args:
        websocket: WebSocket 连接
        token: 认证 token

    Returns:
        user_id 或 None（认证失败）
    """
    # 必须先接受连接，否则无法关闭
    await websocket.accept()

    # 验证 token
    try:
        payload = decode_token(token)
        user_id = str(payload.get("user_id"))
    except Exception as e:
        await websocket.close(code=4001, reason=f"Invalid token: {str(e)}")
        return None

    # 记录连接
    ws_manager.connections[user_id] = websocket

    try:
        while True:
            data = await websocket.receive_json()

            # 处理消息
            response = await ws_manager.handle_message(user_id, data)

            if response:
                await websocket.send_json(response)

    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(user_id)

    return user_id
