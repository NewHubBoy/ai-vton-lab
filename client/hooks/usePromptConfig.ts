'use client';

import { useState, useEffect } from 'react';
import { promptConfigApi, PromptConfigGroupWithOptions } from '@/lib/api/prompt-config';

interface UsePromptConfigReturn {
    configs: PromptConfigGroupWithOptions[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * 获取 prompt 配置的 hook
 */
export function usePromptConfig(): UsePromptConfigReturn {
    const [configs, setConfigs] = useState<PromptConfigGroupWithOptions[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchConfigs = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await promptConfigApi.getGroupsWithOptions();
            setConfigs(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch configs'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    return {
        configs,
        isLoading,
        error,
        refetch: fetchConfigs,
    };
}
