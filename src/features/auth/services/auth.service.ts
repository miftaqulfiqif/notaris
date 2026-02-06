import { ENDPOINTS } from '@/shared/api/endpoints';
import { User, UserResponse } from '../types/user.types';

export interface LoginCredentials {
    emailOrUsername: string;
    password: string;
}

export interface AuthServiceResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

async function fetchWithCredentials(url: string, options: RequestInit = {}): Promise<Response> {
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include',
    });
}

export const authService = {
    async getCurrentUser(): Promise<AuthServiceResult<User>> {
        try {
            const response = await fetchWithCredentials(ENDPOINTS.AUTH.CURRENT, {
                method: 'GET',
                cache: 'no-store',
            });

            if (response.ok) {
                const data: UserResponse = await response.json();
                return { success: true, data: data.data };
            }
            return { success: false };
        } catch (err) {
            console.error('Auth check failed', err);
            return { success: false, error: 'Auth check failed' };
        }
    },

    async login(credentials: LoginCredentials): Promise<AuthServiceResult<void>> {
        try {
            const response = await fetchWithCredentials(ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                body: JSON.stringify({
                    username: credentials.emailOrUsername,
                    password: credentials.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.message || 'Login failed' };
            }

            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
        }
    },

    async logout(): Promise<AuthServiceResult<void>> {
        try {
            await fetchWithCredentials(ENDPOINTS.AUTH.LOGOUT, {
                method: 'POST',
            });
            return { success: true };
        } catch (err) {
            console.error('Logout failed', err);
            return { success: false, error: 'Logout failed' };
        }
    },
};
