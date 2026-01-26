'use client';

import { request, API_BASE_URL } from './client';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    username: string;
}

export interface UserInfo {
    id: number;
    username: string;
    email: string;
    avatar?: string;
    is_superuser: boolean;
    is_active: boolean;
}

export interface ApiResponse<T> {
    code: number;
    data: T;
    msg?: string;
}

/**
 * 用户登录
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/base/access_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ msg: '登录失败' }));
        throw new Error(error.msg || error.detail || `HTTP ${response.status}`);
    }

    const result: ApiResponse<LoginResponse> = await response.json();

    if (result.code !== 200) {
        throw new Error(result.msg || '登录失败');
    }

    return result.data;
}

/**
 * 获取用户信息
 */
export async function getUserInfo(): Promise<UserInfo> {
    return request<ApiResponse<UserInfo>>('/api/v1/base/userinfo').then(res => res.data);
}

/**
 * 登出（清除本地 token 和 cookie）
 */
export function logout(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // 清除 cookie
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
}

/**
 * 设置 token（同时保存到 localStorage 和 cookie）
 */
export function setToken(token: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        // 设置 cookie，7天过期
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        document.cookie = `token=${token}; path=/; expires=${expires.toUTCString()}`;
    }
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
}
