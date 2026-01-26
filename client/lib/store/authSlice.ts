'use client';

import { StateCreator } from 'zustand';
import { login as apiLogin, logout as apiLogout, getUserInfo, setToken, isAuthenticated, UserInfo, LoginCredentials } from '../api/auth';

export interface AuthSlice {
    // State
    user: UserInfo | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (credentials: LoginCredentials) => Promise<boolean>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    clearError: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiLogin(credentials);
            setToken(response.access_token);

            // 获取用户信息
            try {
                const userInfo = await getUserInfo();
                set({ user: userInfo, isAuthenticated: true, isLoading: false });
            } catch {
                // 即使获取用户信息失败，登录仍然成功
                set({ isAuthenticated: true, isLoading: false });
            }

            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : '登录失败';
            set({ error: message, isLoading: false });
            return false;
        }
    },

    logout: () => {
        apiLogout();
        set({ user: null, isAuthenticated: false, error: null });
    },

    checkAuth: async () => {
        if (!isAuthenticated()) {
            set({ isAuthenticated: false, user: null });
            return;
        }

        try {
            const userInfo = await getUserInfo();
            set({ user: userInfo, isAuthenticated: true });
        } catch {
            // Token 无效，清除登录状态
            apiLogout();
            set({ user: null, isAuthenticated: false });
        }
    },

    clearError: () => set({ error: null }),
});
