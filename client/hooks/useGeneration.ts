'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTryOnStore } from '@/lib/store';
import { tasksApi } from '@/lib/api';
import { useWebSocket } from './useWebSocket';
import { TaskType } from '@/lib/api/types';
import type { ImageFile } from '@/lib/store/types';

const POLL_INTERVAL = 2000; // 轮询间隔 2 秒
const MAX_POLL_ATTEMPTS = 60; // 最大轮询次数（2分钟）

/**
 * 上传图片到 OSS
 */
async function uploadImageToOss(image: ImageFile | null): Promise<string | null> {
    if (!image?.file) return null;
    try {
        const result = await tasksApi.uploadImage(image.file, 'tryon');
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
    const { taskType = TaskType.TRYON } = options;

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
                const { data: task } = await tasksApi.getDetail(taskId);

                if (task.status === 'succeeded' && task.result?.images?.[0]) {
                    setResultImage(task.result.images[0]);
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
            // Upload images to OSS
            let modelUrl: string | undefined;
            if (modelImage) {
                modelUrl = await uploadImageToOss(modelImage) || undefined;
            }

            let garmentUrl: string | undefined;
            if (garmentImage) {
                garmentUrl = await uploadImageToOss(garmentImage) || undefined;
            }

            if (!modelUrl || !garmentUrl) {
                throw new Error('请上传模特图和服装图');
            }

            // Extract category from dynamicConfigs
            let category = 'upper_body'; // Default
            if (dynamicConfigs['category']) {
                const val = dynamicConfigs['category'];
                if (typeof val === 'string') category = val;
                else if (Array.isArray(val) && val.length > 0) category = val[0];
            }

            // Create task based on type
            // Currently focusing on TRYON as per error context
            if (taskType === TaskType.TRYON) {
                // @ts-ignore: Payload type casting to satisfy stricter local types vs flexible API usage
                const { data: response } = await tasksApi.create({
                    task_type: TaskType.TRYON,
                    aspect_ratio: aspectRatio,
                    resolution: resolution,
                    tryon: {
                        person_image: modelUrl,
                        garment_image: garmentUrl,
                        category: category,
                        // Parse seed if it exists in dynamicConfigs
                        seed: dynamicConfigs['seed'] ? Number(dynamicConfigs['seed']) : -1,
                    },
                } as any);

                setJobId(response.id);

                if (isConnected) {
                    subscribe(response.id);
                } else {
                    pollTimerRef.current = setTimeout(() => pollTaskStatus(response.id), POLL_INTERVAL);
                }
            } else {
                // Fallback for other types (model/detail) - to be implemented/verified
                // For now, retain basic structure or throw not implemented if unsure, 
                // but let's try to infer standard structure
                const { data: response } = await tasksApi.create({
                    task_type: taskType,
                    aspect_ratio: aspectRatio,
                    resolution: resolution,
                    // Pass dynamic configs as extra options for now if needed, though schema might not support it directly
                    // This path might need further refinement based on Model/Detail schemas
                } as any);
                setJobId(response.id);
                if (isConnected) subscribe(response.id);
                else pollTimerRef.current = setTimeout(() => pollTaskStatus(response.id), POLL_INTERVAL);
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
