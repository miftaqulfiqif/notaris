import { useState } from 'react';
import { ENDPOINTS } from '../api/endpoints';

interface LoginCredentials {
    emailOrUsername: string;
    password: string;
}

interface LoginResponse {
    success: boolean;
    message?: string;
    token?: string;
}

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (credentials: LoginCredentials): Promise<LoginResponse | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: credentials.emailOrUsername,
                    password: credentials.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errors || data.message || 'Login failed');
            }

            if (data.token) {
                localStorage.setItem('token', data.token);
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
            }

            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during login');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        login,
        isLoading,
        error,
    };
};
