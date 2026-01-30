'use client';

import { request, API_BASE_URL, getToken } from './client';
import type {
    CreateTaskRequest,
    GenerationTask,
    TaskListResponse,
    TaskListParams,
} from './types';

export interface UploadResponse {
    url: string;
    filename: string;
    object_name: string;
    size: number;
    content_type: string;
}

/**
 * 任务相关 API
 */
export const tasksApi = {
    /**
     * 上传图片到 OSS
     */
    uploadImage: async (file: File, folder: string = 'tryon'): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const token = getToken();

        const response = await fetch(`${API_BASE_URL}/api/v1/oss/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || '上传失败');
        }

        const result = await response.json();
        return result.data;
    },

    /**
     * 创建生成任务
     */
    create: (data: CreateTaskRequest): Promise<{ data: GenerationTask }> =>
        request<{ data: GenerationTask }>('/api/v1/tasks/generate', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    /**
     * 获取任务详情
     */
    getDetail: (id: string): Promise<{ data: GenerationTask }> =>
        request<{ data: GenerationTask }>(`/api/v1/tasks/${id}`),

    /**
     * 获取任务列表
     */
    getList: (params?: TaskListParams): Promise<TaskListResponse> => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.page_size) searchParams.set('page_size', String(params.page_size));
        if (params?.status) searchParams.set('status', params.status);
        if (params?.task_type) searchParams.set('task_type', params.task_type);

        const query = searchParams.toString();
        return request<TaskListResponse>(
            `/api/v1/tasks/${query ? `?${query}` : ''}`
        );
    },

    /**
     * 删除任务 (软删除)
     */
    delete: (id: string): Promise<void> =>
        request<void>(`/api/v1/tasks/${id}`, {
            method: 'DELETE',
        }),
};
