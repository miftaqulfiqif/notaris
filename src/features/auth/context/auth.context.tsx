'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserResponse } from '../types/user.types';
import { useRouter } from 'next/navigation';
import { ENDPOINTS } from '@/shared/api/endpoints';

interface LoginCredentials {
    emailOrUsername: string;
    password: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isVerified: boolean;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const checkAuth = async () => {
        try {
            // We don't set loading to true here to avoid flashing if called in background,
            // but for initial load it's already true.
            const response = await fetch(ENDPOINTS.AUTH.CURRENT, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                cache: 'no-store'
            });

            if (response.ok) {
                const data: UserResponse = await response.json();
                setUser(data.data);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error('Auth check failed', err);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: credentials.emailOrUsername,
                    password: credentials.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // After successful login, fetch the user data
            await checkAuth();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await fetch(ENDPOINTS.AUTH.LOGOUT, {
                method: 'POST',
                credentials: 'include',
            });
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            isVerified: !!user?.verified_at,
            login,
            logout,
            checkAuth,
            error
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
