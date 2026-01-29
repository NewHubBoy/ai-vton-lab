'use client';

import { useCallback, useEffect, useState } from 'react';
import { imageApi, ImageTaskDetail } from '@/lib/api';

interface UseTaskHistoryOptions {
    pageSize?: number;
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
    const { pageSize = 20, autoFetch = true } = options;

    const [tasks, setTasks] = useState<ImageTaskDetail[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = useCallback(
        async (newPage: number, append = false) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await imageApi.listTasks({ page: newPage, page_size: pageSize });

                if (append) {
                    setTasks((prev) => [...prev, ...response.data]);
                } else {
                    setTasks(response.data);
                }
                setTotal(response.total);
                setPage(newPage);
            } catch (err) {
                setError(err instanceof Error ? err.message : '获取历史记录失败');
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize]
    );

    // 刷新（从头加载）
    const refresh = useCallback(async () => {
        await fetchTasks(1, false);
    }, [fetchTasks]);

    // 加载更多
    const loadMore = useCallback(async () => {
        if (isLoading || tasks.length >= total) return;
        await fetchTasks(page + 1, true);
    }, [isLoading, tasks.length, total, page, fetchTasks]);

    // 自动加载
    useEffect(() => {
        if (autoFetch) {
            fetchTasks(1, false);
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
