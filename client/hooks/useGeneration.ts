'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useTryOnStore } from '@/lib/store';
import { imageApi } from '@/lib/api';
import { useWebSocket } from './useWebSocket';

const POLL_INTERVAL = 2000; // 轮询间隔 2 秒
const MAX_POLL_ATTEMPTS = 60; // 最大轮询次数（2分钟）

interface UseGenerationReturn {
    generate: () => Promise<void>;
    isGenerating: boolean;
    wsConnected: boolean;
}

export function useGeneration(): UseGenerationReturn {
    const {
        modelImage,
        garmentImages,
        resolution,
        aspectRatio,
        canGenerate,
        isGenerating,
        setIsGenerating,
        setJobId,
        setResultImage,
        setError,
    } = useTryOnStore();

    const { isConnected, subscribe, onTaskUpdate } = useWebSocket();
    const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pollAttemptsRef = useRef(0);

    // 清理轮询
    const clearPolling = useCallback(() => {
        if (pollTimerRef.current) {
            clearTimeout(pollTimerRef.current);
            pollTimerRef.current = null;
        }
        pollAttemptsRef.current = 0;
    }, []);

    // REST 轮询获取任务状态
    const pollTaskStatus = useCallback(
        async (taskId: string) => {
            if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
                setError('任务超时，请重试');
                setIsGenerating(false);
                clearPolling();
                return;
            }

            try {
                const task = await imageApi.getTask(taskId);

                if (task.status === 'succeeded' && task.result?.images?.[0]?.url) {
                    setResultImage(task.result.images[0].url);
                    setIsGenerating(false);
                    clearPolling();
                } else if (task.status === 'failed') {
                    setError(task.error?.message || '生成失败');
                    setIsGenerating(false);
                    clearPolling();
                } else {
                    // 继续轮询
                    pollAttemptsRef.current++;
                    pollTimerRef.current = setTimeout(() => pollTaskStatus(taskId), POLL_INTERVAL);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : '查询状态失败');
                setIsGenerating(false);
                clearPolling();
            }
        },
        [setResultImage, setError, setIsGenerating, clearPolling]
    );

    // 生成图像
    const generate = useCallback(async () => {
        if (!canGenerate()) return;

        setIsGenerating(true);
        setError(null);
        setResultImage(null);
        clearPolling();

        try {
            // 构建 prompt
            const parts: string[] = ['Virtual try-on'];
            if (garmentImages.top) parts.push('with top garment');
            if (garmentImages.bottom) parts.push('with bottom garment');
            if (garmentImages.full) parts.push('with full outfit');
            const prompt = parts.join(' ');

            // 收集图片（转为 base64 或 URL）
            const referenceImages: string[] = [];

            // 这里简化处理：实际项目中需要将 File 转为 base64 或上传获取 URL
            // 暂时使用 preview URL（blob URL，后端可能不支持）
            if (modelImage?.preview) {
                referenceImages.push(modelImage.preview);
            }
            if (garmentImages.top?.preview) {
                referenceImages.push(garmentImages.top.preview);
            }
            if (garmentImages.bottom?.preview) {
                referenceImages.push(garmentImages.bottom.preview);
            }
            if (garmentImages.full?.preview) {
                referenceImages.push(garmentImages.full.preview);
            }

            // 创建任务
            const response = await imageApi.createTask({
                prompt,
                reference_images: referenceImages.length > 0 ? referenceImages : undefined,
                aspect_ratio: aspectRatio,
                resolution: resolution,
            });

            setJobId(response.task_id);

            // 根据 WebSocket 连接状态选择策略
            if (isConnected) {
                // WS 模式：订阅任务更新
                subscribe(response.task_id);
            } else {
                // 回退模式：轮询
                pollTimerRef.current = setTimeout(() => pollTaskStatus(response.task_id), POLL_INTERVAL);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '创建任务失败');
            setIsGenerating(false);
        }
    }, [
        canGenerate,
        modelImage,
        garmentImages,
        resolution,
        aspectRatio,
        isConnected,
        setIsGenerating,
        setError,
        setResultImage,
        setJobId,
        subscribe,
        pollTaskStatus,
        clearPolling,
    ]);

    // 监听 WebSocket 任务更新
    useEffect(() => {
        const unsubscribe = onTaskUpdate((msg) => {
            if (msg.status === 'succeeded' && msg.result) {
                const result = msg.result as { images?: { url?: string }[] };
                if (result.images?.[0]?.url) {
                    setResultImage(result.images[0].url);
                }
                setIsGenerating(false);
            } else if (msg.status === 'failed') {
                const error = msg.error as { message?: string } | undefined;
                setError(error?.message || '生成失败');
                setIsGenerating(false);
            }
        });

        return unsubscribe;
    }, [onTaskUpdate, setResultImage, setError, setIsGenerating]);

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            clearPolling();
        };
    }, [clearPolling]);

    return {
        generate,
        isGenerating,
        wsConnected: isConnected,
    };
}
