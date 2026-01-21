'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getWsUrl } from '@/lib/api';

export type WSStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WSMessage {
    type: string;
    task_id?: string;
    status?: string;
    result?: Record<string, unknown>;
    error?: Record<string, unknown>;
    finished_at?: string;
}

interface UseWebSocketOptions {
    autoConnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    heartbeatInterval?: number;
}

interface UseWebSocketReturn {
    status: WSStatus;
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
    subscribe: (taskId: string) => void;
    onTaskUpdate: (callback: (msg: WSMessage) => void) => () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
    const {
        autoConnect = true,
        reconnectInterval = 3000,
        maxReconnectAttempts = 5,
        heartbeatInterval = 30000,
    } = options;

    const [status, setStatus] = useState<WSStatus>('disconnected');
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
    const taskUpdateCallbacksRef = useRef<Set<(msg: WSMessage) => void>>(new Set());

    // 清理心跳定时器
    const clearHeartbeat = useCallback(() => {
        if (heartbeatTimerRef.current) {
            clearInterval(heartbeatTimerRef.current);
            heartbeatTimerRef.current = null;
        }
    }, []);

    // 发送心跳
    const startHeartbeat = useCallback(() => {
        clearHeartbeat();
        heartbeatTimerRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
            }
        }, heartbeatInterval);
    }, [heartbeatInterval, clearHeartbeat]);

    // 断开连接
    const disconnect = useCallback(() => {
        clearHeartbeat();
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setStatus('disconnected');
    }, [clearHeartbeat]);

    // 连接 WebSocket
    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const wsUrl = getWsUrl();
        if (!wsUrl.includes('token=') || wsUrl.endsWith('token=')) {
            // 没有 token，不连接
            setStatus('disconnected');
            return;
        }

        setStatus('connecting');

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setStatus('connected');
                reconnectAttemptsRef.current = 0;
                startHeartbeat();
            };

            ws.onclose = () => {
                clearHeartbeat();
                setStatus('disconnected');

                // 自动重连
                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    reconnectAttemptsRef.current++;
                    setTimeout(connect, reconnectInterval);
                }
            };

            ws.onerror = () => {
                setStatus('error');
            };

            ws.onmessage = (event) => {
                try {
                    const msg: WSMessage = JSON.parse(event.data);

                    if (msg.type === 'task_update') {
                        // 通知所有订阅者
                        taskUpdateCallbacksRef.current.forEach((cb) => cb(msg));
                    }
                } catch {
                    // 忽略解析错误
                }
            };
        } catch {
            setStatus('error');
        }
    }, [
        startHeartbeat,
        clearHeartbeat,
        maxReconnectAttempts,
        reconnectInterval,
    ]);

    // 订阅任务
    const subscribe = useCallback((taskId: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'subscribe', task_id: taskId }));
        }
    }, []);

    // 注册任务更新回调
    const onTaskUpdate = useCallback((callback: (msg: WSMessage) => void) => {
        taskUpdateCallbacksRef.current.add(callback);
        return () => {
            taskUpdateCallbacksRef.current.delete(callback);
        };
    }, []);

    // 自动连接
    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);

    return {
        status,
        isConnected: status === 'connected',
        connect,
        disconnect,
        subscribe,
        onTaskUpdate,
    };
}
