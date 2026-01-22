'use client';

import { request } from './client';
import type {
    ImageTaskRequest,
    ImageTaskResponse,
    ImageTaskDetail,
    ImageTaskListResponse,
    TaskListParams,
} from './types';

/**
 * 图像生成 API
 */
export const imageApi = {
    /**
     * 创建图像生成任务
     * @param data 任务请求参数
     * @returns Promise<ImageTaskResponse> 任务创建响应
     */
    createTask: (data: ImageTaskRequest): Promise<ImageTaskResponse> =>
        request<ImageTaskResponse>('/api/v1/images/generate', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    /**
     * 获取任务详情
     * @param taskId 任务 ID
     * @returns Promise<ImageTaskDetail> 任务详情
     */
    getTask: (taskId: string): Promise<ImageTaskDetail> =>
        request<ImageTaskDetail>(`/api/v1/images/tasks/${taskId}`),

    /**
     * 获取任务列表
     * @param params 查询参数（limit, offset, status）
     * @returns Promise<ImageTaskListResponse> 任务列表
     */
    listTasks: (params?: TaskListParams): Promise<ImageTaskListResponse> => {
        const searchParams = new URLSearchParams();
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.offset) searchParams.set('offset', String(params.offset));
        if (params?.status) searchParams.set('status', params.status);

        const query = searchParams.toString();
        return request<ImageTaskListResponse>(
            `/api/v1/images/tasks${query ? `?${query}` : ''}`
        );
    },
};
