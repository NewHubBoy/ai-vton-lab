'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTryOnStore } from '@/lib/store';
import { imageApi } from '@/lib/api';
import { useWebSocket } from './useWebSocket';
import type { TaskType } from '@/lib/api/types';
import type { ImageFile } from '@/lib/store/types';

const POLL_INTERVAL = 2000; // 轮询间隔 2 秒
const MAX_POLL_ATTEMPTS = 60; // 最大轮询次数（2分钟）

/**
 * 上传图片到 OSS
 */
async function uploadImageToOss(image: ImageFile | null): Promise<string | null> {
    if (!image?.file) return null;
    try {
        const result = await imageApi.uploadImage(image.file, 'tryon');
        return result.url;
    } catch (error) {
        console.error('上传图片失败:', error);
        throw error;
    }
}

interface UseGenerationOptions {
    taskType?: TaskType;
}

interface UseGenerationReturn {
    generate: () => Promise<void>;
    isGenerating: boolean;
    wsConnected: boolean;
}

export function useGeneration(options: UseGenerationOptions = {}): UseGenerationReturn {
    const { taskType = 'tryon' } = options;

    const {
        modelImage,
        garmentImage,
        resolution,
        aspectRatio,
        dynamicConfigs,
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
            // 先上传图片到 OSS，获取可访问的 URL
            const referenceImages: string[] = [];

            if (modelImage) {
                const modelUrl = await uploadImageToOss(modelImage);
                if (modelUrl) referenceImages.push(modelUrl);
            }

            if (garmentImage) {
                const garmentUrl = await uploadImageToOss(garmentImage);
                if (garmentUrl) referenceImages.push(garmentUrl);
            }

            if (referenceImages.length === 0) {
                throw new Error('图片上传失败，请重试');
            }

            // 将 dynamicConfigs 转换为 selected_configs 格式
            // dynamicConfigs: { gender: 'male', style: ['casual', 'modern'] }
            // selected_configs: { gender: ['male'], style: ['casual', 'modern'] }
            const selectedConfigs: Record<string, string[]> = {};
            for (const [key, value] of Object.entries(dynamicConfigs)) {
                if (value === undefined || value === null || value === '') continue;
                if (typeof value === 'boolean') {
                    // 布尔值转换为字符串数组
                    selectedConfigs[key] = [value ? 'true' : 'false'];
                } else if (Array.isArray(value)) {
                    selectedConfigs[key] = value;
                } else {
                    selectedConfigs[key] = [value];
                }
            }

            // 创建任务 - 使用新的请求格式
            const response = await imageApi.createTask({
                task_type: taskType,
                selected_configs: Object.keys(selectedConfigs).length > 0 ? selectedConfigs : undefined,
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
        garmentImage,
        dynamicConfigs,
        taskType,
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
                const result = msg.result as { images?: { oss_url?: string; url?: string }[] };
                // 优先使用 oss_url，其次是 url
                const imageUrl = result.images?.[0]?.oss_url || result.images?.[0]?.url;
                if (imageUrl) {
                    setResultImage(imageUrl);
                }
                setIsGenerating(false);
                toast.success('换装完成！');
            } else if (msg.status === 'failed') {
                const error = msg.error as { message?: string } | undefined;
                const errorMsg = error?.message || '生成失败';
                setError(errorMsg);
                setIsGenerating(false);
                toast.error(`生成失败: ${errorMsg}`);
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
