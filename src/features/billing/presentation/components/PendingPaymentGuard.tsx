'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/features/auth/context/auth.context';
import { canAccessCheckout, getAuthenticatedHomePath } from '@/features/auth/utils/user';

export function PendingPaymentGuard({ children }: Readonly<{ children: React.ReactNode }>) {
    const { isAuthenticated, isLoading, user } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (!user?.verified_at) {
            router.push('/verify-email');
            return;
        }

        if (!canAccessCheckout(user)) {
            router.push(getAuthenticatedHomePath(user));
        }
    }, [isAuthenticated, isLoading, router, user]);

    if (isLoading || !isAuthenticated || !user?.verified_at || !canAccessCheckout(user)) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F7F5F2]">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#B39B7D] border-t-transparent" />
            </div>
        );
    }

    return <>{children}</>;
}
