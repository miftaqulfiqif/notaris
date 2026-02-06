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

    const checkAuth = useCallback(async () => {
        const result = await authService.getCurrentUser();
        if (result.success && result.data) {
            setUser(result.data);
        } else {
            setUser(null);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        let mounted = true;

        const fetchAuth = async () => {
            const result = await authService.getCurrentUser();
            if (mounted) {
                if (result.success && result.data) {
                    setUser(result.data);
                } else {
                    setUser(null);
                }
                setIsLoading(false);
            }
        };

        fetchAuth();

        return () => {
            mounted = false;
        };
    }, []);

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        const result = await authService.login(credentials);

        if (result.success) {
            await checkAuth();
            setIsLoading(false);
            return true;
        } else {
            setError(result.error || 'Login failed');
            setIsLoading(false);
            return false;
        }
    };

    const logout = async () => {
        setIsLoading(true);
        await authService.logout();
        setUser(null);
        setIsLoading(false);
        router.push('/login');
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
