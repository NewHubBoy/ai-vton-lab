'use client';

import { request } from './client';

// 配置类型：tryon=虚拟试穿, model=模特生成, detail=商品详情
export type ConfigType = 'tryon' | 'model' | 'detail';

// 配置组类型
export interface PromptConfigGroup {
    id: number;
    group_key: string;
    group_name: string;
    config_type?: string | null;
    description?: string | null;
    input_type: 'select' | 'radio' | 'radiobox' | 'checkbox' | 'slider' | 'toggle';
    is_multiple: boolean;
    is_required: boolean;
    placeholder?: string | null;
    default_option_key?: string | null;
    sort_order: number;
    is_active: boolean;
    is_system: boolean;
    created_at: string;
    updated_at: string;
}

// 配置选项类型
export interface PromptConfigOption {
    id: number;
    group_id: number;
    option_key: string;
    option_label: string;
    prompt_text?: string | null;
    negative_prompt?: string | null;
    prompt_order: number;
    image_url?: string | null;
    description?: string | null;
    sort_order: number;
    is_active: boolean;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

// 带选项的配置组
export interface PromptConfigGroupWithOptions extends PromptConfigGroup {
    options: PromptConfigOption[];
}

// API 响应类型
interface ApiResponse<T> {
    code: number;
    msg: string;
    data: T;
    total?: number;
}

/**
 * 获取所有配置组
 * @param isActive 是否只获取启用的配置
 * @param configType 配置类型筛选
 */
export async function getPromptConfigGroups(
    isActive: boolean = true,
    configType?: ConfigType
): Promise<PromptConfigGroup[]> {
    const params = new URLSearchParams();
    params.set('is_active', String(isActive));
    if (configType) {
        params.set('config_type', configType);
    }
    const response = await request<ApiResponse<PromptConfigGroup[]>>(
        `/api/v1/prompt-config/groups?${params.toString()}`
    );
    return response.data;
}

/**
 * 获取配置组的选项
 */
export async function getPromptConfigOptions(groupId: number, isActive: boolean = true): Promise<PromptConfigOption[]> {
    const response = await request<ApiResponse<PromptConfigOption[]>>(
        `/api/v1/prompt-config/groups/${groupId}/options?is_active=${isActive}`
    );
    return response.data;
}

/**
 * 获取所有配置组及其选项
 * @param configType 配置类型筛选
 */
export async function getPromptConfigGroupsWithOptions(
    configType?: ConfigType
): Promise<PromptConfigGroupWithOptions[]> {
    const groups = await getPromptConfigGroups(true, configType);

    const groupsWithOptions = await Promise.all(
        groups.map(async (group) => {
            const options = await getPromptConfigOptions(group.id);
            return {
                ...group,
                options,
            };
        })
    );

    return groupsWithOptions;
}

export const promptConfigApi = {
    getGroups: getPromptConfigGroups,
    getOptions: getPromptConfigOptions,
    getGroupsWithOptions: getPromptConfigGroupsWithOptions,
};
