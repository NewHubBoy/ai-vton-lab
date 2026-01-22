'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9999';

/**
 * 获取认证 token
 * @returns token 字符串或 null
 */
export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

/**
 * 通用 HTTP 请求函数
 * @param endpoint API 端点
 * @param options 请求选项
 * @returns Promise<T> 响应数据
 */
export async function request<T>(
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

/**
 * 获取 WebSocket 连接 URL
 * @returns WebSocket URL 字符串
 */
export function getWsUrl(): string {
    const wsBase = API_BASE_URL.replace(/^http/, 'ws');
    const token = getToken();
    return `${wsBase}/api/v1/ws/tasks?token=${token || ''}`;
}

export { API_BASE_URL };
