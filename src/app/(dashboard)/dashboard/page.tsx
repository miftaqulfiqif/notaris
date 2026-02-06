'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthContext } from '@/features/auth/context/auth.context';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { FolderGrid } from '@/features/dashboard/presentation/components/FolderGrid';
import { ActivitySection } from '@/features/dashboard/presentation/components/ActivitySection';
import { Activity } from '@/features/dashboard/types';
import { ActivityDetailSidebar } from '@/features/dashboard/presentation/components/ActivityDetailSidebar';
import { Plus } from 'lucide-react';

import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';

export default function DashboardPage() {
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const { openModal } = useUploadModal();
    const { user } = useAuthContext();
    const [loginCount, setLoginCount] = useState<number>(0);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkLoginStatus = () => {
            const today = new Date().toISOString().split('T')[0];
            const storedDate = localStorage.getItem('lastLoginDate');
            let count = parseInt(localStorage.getItem('dailyLoginCount') || '0', 10);
            const sessionInitialized = sessionStorage.getItem('session_initialized');

            if (storedDate !== today) {
                // New day, reset count
                count = 0;
                localStorage.setItem('lastLoginDate', today);
                localStorage.setItem('dailyLoginCount', '0');
            }

            if (!sessionInitialized) {
                // New session
                count += 1;
                localStorage.setItem('dailyLoginCount', count.toString());
                sessionStorage.setItem('session_initialized', 'true');
            }

            setLoginCount(count);
            setIsChecking(false);
        };

        checkLoginStatus();
    }, []);

    const showGreeting = useMemo(() => {
        if (isChecking) return false;
        return loginCount === 1;
    }, [loginCount, isChecking]);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Main Content - shrinks when sidebar is open */}
            <div className={`flex-1 min-w-0 overflow-y-auto overflow-x-hidden transition-all duration-300`} style={{ scrollbarWidth: 'none' }}>
                <div className="w-full min-h-screen flex flex-col">
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-100/50">
                        <DashboardHeader />
                    </div>

                    <div className="px-4 sm:px-8 pb-8 flex-1">
                        {/* Welcome Section */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 mt-4">
                            <div>
                                {showGreeting ? (
                                    <>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang, {user?.name || 'User'}</h1>
                                        <p className="text-gray-500">Selamat datang kembali, ayo mulai aktivitas mu lagi di Notarix</p>
                                    </>
                                ) : (
                                    <div className="flex items-center text-sm font-medium text-gray-500">
                                        <span>Dashboard</span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => openModal()}
                                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Tambah Baru</span>
                            </button>
                        </div>

                        <FolderGrid />

                        <ActivitySection onSelectActivity={setSelectedActivity} />
                    </div>
                </div>
            </div>

            {/* Detail Sidebar */}
            {selectedActivity && (
                <ActivityDetailSidebar
                    activity={selectedActivity}
                    onClose={() => setSelectedActivity(null)}
                />
            )}
        </div>
    );
}
