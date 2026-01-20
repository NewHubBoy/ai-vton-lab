'use client';

import { useCallback, useEffect, useState } from 'react';
import { imageApi, ImageTaskDetail } from '@/app/lib/api';

interface UseTaskHistoryOptions {
    limit?: number;
    autoFetch?: boolean;
}

interface UseTaskHistoryReturn {
    tasks: ImageTaskDetail[];
    total: number;
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    loadMore: () => Promise<void>;
    hasMore: boolean;
}

export function useTaskHistory(options: UseTaskHistoryOptions = {}): UseTaskHistoryReturn {
    const { limit = 20, autoFetch = true } = options;

    const [tasks, setTasks] = useState<ImageTaskDetail[]>([]);
    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = useCallback(
        async (newOffset: number, append = false) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await imageApi.listTasks({ limit, offset: newOffset });

                if (append) {
                    setTasks((prev) => [...prev, ...response.tasks]);
                } else {
                    setTasks(response.tasks);
                }
                setTotal(response.total);
                setOffset(newOffset);
            } catch (err) {
                setError(err instanceof Error ? err.message : '获取历史记录失败');
            } finally {
                setIsLoading(false);
            }
        },
        [limit]
    );

    // 刷新（从头加载）
    const refresh = useCallback(async () => {
        await fetchTasks(0, false);
    }, [fetchTasks]);

    // 加载更多
    const loadMore = useCallback(async () => {
        if (isLoading || tasks.length >= total) return;
        await fetchTasks(offset + limit, true);
    }, [isLoading, tasks.length, total, offset, limit, fetchTasks]);

    // 自动加载
    useEffect(() => {
        if (autoFetch) {
            fetchTasks(0, false);
        }
    }, [autoFetch, fetchTasks]);

    return {
        tasks,
        total,
        isLoading,
        error,
        refresh,
        loadMore,
        hasMore: tasks.length < total,
    };
}
