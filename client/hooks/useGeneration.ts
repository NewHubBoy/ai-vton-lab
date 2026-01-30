'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTryOnStore } from '@/lib/store';
import { tasksApi } from '@/lib/api';
import { useWebSocket } from './useWebSocket';
import { TaskType } from '@/lib/api/types';
import type { ImageFile } from '@/lib/store/types';
import type { DynamicConfigValues } from '@/lib/store/settingsSlice';

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

/**
 * 转换 dynamicConfigs 为后端格式
 * @param configs 前端的动态配置 {group_key: value}
 * @returns 后端格式 {group_key: [option_key, ...]}
 */
function formatPromptConfigs(configs: DynamicConfigValues): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(configs)) {
        if (typeof value === 'string') {
            result[key] = [value];
        } else if (Array.isArray(value)) {
            result[key] = value;
        }
        // boolean 类型跳过，不用于 prompt 组装
    }
    return result;
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
        triggerHistoryRefresh,
    } = useTryOnStore();

    const { isConnected, subscribe, onTaskUpdate } = useWebSocket();
    const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pollAttemptsRef = useRef(0);
    const taskProcessedRef = useRef(false);  // 混合模式：避免重复处理

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
                    if (taskProcessedRef.current) return;  // 已由 WebSocket 处理
                    taskProcessedRef.current = true;
                    setResultImage(task.result.images[0]);
                    setIsGenerating(false);
                    triggerHistoryRefresh();
                    toast.success('换装完成！');
                    clearPolling();
                } else if (task.status === 'failed') {
                    if (taskProcessedRef.current) return; // 已由 WebSocket 处理
                    taskProcessedRef.current = true;
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
        [setResultImage, setError, setIsGenerating, clearPolling, triggerHistoryRefresh]
    );

    // 生成图像
    const generate = useCallback(async () => {
        if (!canGenerate()) return;

        setIsGenerating(true);
        setError(null);
        setResultImage(null);
        taskProcessedRef.current = false;  // 重置处理标记
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
                // 构建 prompt_configs
                const promptConfigs = formatPromptConfigs(dynamicConfigs);

                // @ts-ignore: Payload type casting to satisfy stricter local types vs flexible API usage
                const { data: response } = await tasksApi.create({
                    task_type: TaskType.TRYON,
                    prompt_configs: Object.keys(promptConfigs).length > 0 ? promptConfigs : undefined,
                    aspect_ratio: aspectRatio,
                    quality: resolution,
                    tryon: {
                        person_image: modelUrl,
                        garment_image: garmentUrl,
                        category: category,
                        // Parse seed if it exists in dynamicConfigs
                        seed: dynamicConfigs['seed'] ? Number(dynamicConfigs['seed']) : -1,
                    },
                } as any);

                setJobId(response.id);

                // 混合模式：始终启用轮询 + WebSocket
                pollTimerRef.current = setTimeout(() => pollTaskStatus(response.id), POLL_INTERVAL);
                if (isConnected) {
                    subscribe(response.id);
                }
            } else {
                // Fallback for other types (model/detail)
                const promptConfigs = formatPromptConfigs(dynamicConfigs);

                const { data: response } = await tasksApi.create({
                    task_type: taskType,
                    prompt_configs: Object.keys(promptConfigs).length > 0 ? promptConfigs : undefined,
                    aspect_ratio: aspectRatio,
                    quality: resolution,
                } as any);
                setJobId(response.id);

                // 混合模式：始终启用轮询 + WebSocket
                pollTimerRef.current = setTimeout(() => pollTaskStatus(response.id), POLL_INTERVAL);
                if (isConnected) {
                    subscribe(response.id);
                }
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
                if (taskProcessedRef.current) return;  // 已由轮询处理
                taskProcessedRef.current = true;
                clearPolling();  // 清理轮询

                const result = msg.result as { images?: { oss_url?: string; url?: string }[] };
                // 优先使用 oss_url，其次是 url
                const imageUrl = result.images?.[0]?.oss_url || result.images?.[0]?.url;
                if (imageUrl) {
                    setResultImage(imageUrl);
                }
                setIsGenerating(false);
                triggerHistoryRefresh();
                toast.success('换装完成！');
            } else if (msg.status === 'failed') {
                if (taskProcessedRef.current) return;  // 已由轮询处理
                taskProcessedRef.current = true;
                clearPolling();  // 清理轮询

                const error = msg.error as { message?: string } | undefined;
                const errorMsg = error?.message || '生成失败';
                setError(errorMsg);
                setIsGenerating(false);
                toast.error(`生成失败: ${errorMsg}`);
            }
        });

        return unsubscribe;
    }, [onTaskUpdate, setResultImage, setError, setIsGenerating, triggerHistoryRefresh]);

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
