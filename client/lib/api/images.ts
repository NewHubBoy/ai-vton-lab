'use client';

import { request, API_BASE_URL, getToken } from './client';
import type {
    ImageTaskRequest,
    ImageTaskResponse,
    ImageTaskDetail,
    ImageTaskListResponse,
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
 * 图像生成 API
 */
export const imageApi = {
    /**
     * 上传图片到 OSS
     * @param file 文件对象
     * @param folder 上传目录
     * @returns Promise<UploadResponse> 上传响应
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
     * 批量上传图片到 OSS
     * @param files 文件数组
     * @param folder 上传目录
     * @returns Promise<{ urls: UploadResponse[] }> 上传响应
     */
    uploadImages: async (files: File[], folder: string = 'tryon'): Promise<{ urls: UploadResponse[] }> => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        formData.append('folder', folder);

        const token = getToken();

        const response = await fetch(`${API_BASE_URL}/api/v1/oss/upload/multiple`, {
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
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.page_size) searchParams.set('page_size', String(params.page_size));
        if (params?.status) searchParams.set('status', params.status);

        const query = searchParams.toString();
        return request<ImageTaskListResponse>(
            `/api/v1/images/tasks${query ? `?${query}` : ''}`
        );
    },
};
