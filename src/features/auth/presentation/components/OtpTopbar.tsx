'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { BrandLogo } from '@/shared/components';
import { useAuthContext } from '@/features/auth/context/auth.context';
import { clearStoredOtpSessions } from '@/features/auth/utils/otp-session';

export const OtpTopbar = () => {
    const { logout } = useAuthContext();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        clearStoredOtpSessions();
        await logout();
    };

    return (
        <header className="bg-white border-b border-gray-100 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <BrandLogo width={122} height={45} priority />
                <button
                    type="button"
                    onClick={() => {
                        void handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? 'Keluar...' : 'Keluar'}
                </button>
            </div>
        </header>
    );
};
