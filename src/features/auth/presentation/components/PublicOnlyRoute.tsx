'use client';

import { useAuthContext } from '@/features/auth/context/auth.context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-[#B39B7D] border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};
