'use client';

import { useAuthContext } from '@/features/auth/context/auth.context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Route guard for pages that should only be accessible by unverified users.
 * Redirects to dashboard if user is already verified.
 * Redirects to login if user is not authenticated.
 */
export const UnverifiedOnlyRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isVerified, isLoading } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (isVerified) {
                // Redirect verified users to dashboard
                router.push('/dashboard');
            }
        }
    }, [isLoading, isAuthenticated, isVerified, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-[#B39B7D] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Memuat...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || isVerified) {
        return null;
    }

    return <>{children}</>;
};
