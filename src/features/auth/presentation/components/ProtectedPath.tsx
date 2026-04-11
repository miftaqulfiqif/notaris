'use client';

import { useAuthContext } from '@/features/auth/context/auth.context';
import { getUserRoleName } from '@/features/auth/utils/user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type ProtectedPathProps = {
    allowedRoles?: string[];
    children: React.ReactNode;
    disallowedRoles?: string[];
    redirectTo?: string;
};

export const ProtectedPath = ({
    allowedRoles,
    children,
    disallowedRoles,
    redirectTo = '/dashboard',
}: ProtectedPathProps) => {
    const { isAuthenticated, isVerified, isLoading, user } = useAuthContext();
    const router = useRouter();
    const normalizedRoleName = getUserRoleName(user)?.toUpperCase();
    const normalizedAllowedRoles = allowedRoles?.map((role) => role.toUpperCase());
    const normalizedDisallowedRoles = disallowedRoles?.map((role) => role.toUpperCase());
    const isAllowedRole = normalizedAllowedRoles ? normalizedAllowedRoles.includes(normalizedRoleName ?? '') : true;
    const isDisallowedRole = normalizedDisallowedRoles ? normalizedDisallowedRoles.includes(normalizedRoleName ?? '') : false;
    const hasAccess = isAuthenticated && isVerified && isAllowedRole && !isDisallowedRole;

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (!isVerified) {
                router.push('/verify-email');
            } else if (!isAllowedRole || isDisallowedRole) {
                router.push(redirectTo);
            }
        }
    }, [isLoading, isAuthenticated, isVerified, isAllowedRole, isDisallowedRole, redirectTo, router]);

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

    if (!hasAccess) {
        return null;
    }

    return <>{children}</>;
};
