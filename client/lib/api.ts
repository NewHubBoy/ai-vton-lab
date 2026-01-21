'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9999';

// 获取 token（从 localStorage 或 cookie）
function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

// 通用请求函数
async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        (headers as Record<string, string>)['token'] = `${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

// ============ Types ============

export interface ImageTaskRequest {
    prompt: string;
    reference_images?: string[];
    aspect_ratio?: string;
    resolution?: string;
}

export interface ImageTaskResponse {
    task_id: string;
    status: string;
    created_at: string;
}

export interface ImageTaskResult {
    url?: string;
    width?: number;
    height?: number;
}

export interface ImageTaskDetail {
    task_id: string;
    status: 'queued' | 'running' | 'succeeded' | 'failed';
    prompt: string;
    aspect_ratio: string;
    resolution: string;
    result?: {
        images?: ImageTaskResult[]
    };
    error?: {
        code: string;
        message: string;
    };
    created_at: string;
    started_at?: string;
    finished_at?: string;
}

export interface ImageTaskListResponse {
    tasks: ImageTaskDetail[];
    total: number;
}

// ============ API Functions ============

export const imageApi = {
    /**
     * 创建图像生成任务
     */
    createTask: (data: ImageTaskRequest) =>
        request<ImageTaskResponse>('/api/v1/images/generate', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    /**
     * 获取任务详情
     */
    getTask: (taskId: string) =>
        request<ImageTaskDetail>(`/api/v1/images/tasks/${taskId}`),

    /**
     * 获取任务列表
     */
    listTasks: (params?: { limit?: number; offset?: number; status?: string }) => {
        const searchParams = new URLSearchParams();
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.offset) searchParams.set('offset', String(params.offset));
        if (params?.status) searchParams.set('status', params.status);

        const query = searchParams.toString();
        return request<ImageTaskListResponse>(`/api/v1/images/tasks${query ? `?${query}` : ''}`);
    },
};

// ============ Utilities ============

export function getWsUrl(): string {
    const wsBase = API_BASE_URL.replace(/^http/, 'ws');
    const token = getToken();
    return `${wsBase}/api/v1/ws/tasks?token=${token || ''}`;
}

export { getToken, API_BASE_URL };
