'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../types/user.types';
import { useRouter } from 'next/navigation';
import { authService, LoginCredentials } from '../services/auth.service';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isVerified: boolean;
    login: (credentials: LoginCredentials) => Promise<User | null>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<User | null>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const checkAuth = useCallback(async (): Promise<User | null> => {
        const result = await authService.getCurrentUser();
        const nextUser = result.success && result.data ? result.data : null;

        setUser(nextUser);
        setIsLoading(false);

        return nextUser;
    }, []);

    useEffect(() => {
        let mounted = true;

        const fetchAuth = async () => {
            const result = await authService.getCurrentUser();
            if (!mounted) {
                return;
            }

            const nextUser = result.success && result.data ? result.data : null;
            setUser(nextUser);
            setIsLoading(false);
        };

        fetchAuth();

        return () => {
            mounted = false;
        };
    }, []);

    const login = async (credentials: LoginCredentials): Promise<User | null> => {
        setIsLoading(true);
        setError(null);

        const result = await authService.login(credentials);

        if (result.success) {
            return checkAuth();
        } else {
            setError(result.error || 'Login failed');
            setIsLoading(false);
            return null;
        }
    };

    const logout = async () => {
        setIsLoading(true);
        setError(null);
        await authService.logout();
        setUser(null);
        setIsLoading(false);
        router.replace('/login');
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

export const useOptionalAuthContext = () => useContext(AuthContext);
