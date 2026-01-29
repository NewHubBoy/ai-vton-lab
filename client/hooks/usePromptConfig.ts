'use client';

import { useState, useEffect } from 'react';
import { promptConfigApi, PromptConfigGroupWithOptions, ConfigType } from '@/lib/api/prompt-config';

interface UsePromptConfigOptions {
    configType?: ConfigType;
}

interface UsePromptConfigReturn {
    configs: PromptConfigGroupWithOptions[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * 获取 prompt 配置的 hook
 * @param options.configType 配置类型，用于筛选对应场景的配置
 */
export function usePromptConfig(options: UsePromptConfigOptions = {}): UsePromptConfigReturn {
    const { configType } = options;
    const [configs, setConfigs] = useState<PromptConfigGroupWithOptions[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchConfigs = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await promptConfigApi.getGroupsWithOptions(configType);
            setConfigs(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch configs'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, [configType]);

    return {
        configs,
        isLoading,
        error,
        refetch: fetchConfigs,
    };
}
