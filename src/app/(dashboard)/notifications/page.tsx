'use client';

import { DashboardHeader } from '@/layout/DashboardHeader';
import { useAuthContext } from '@/features/auth/context/auth.context';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { NotificationsView } from '@/features/notifications/presentation/views/NotificationsView';

export default function NotificationsPage() {
    const { user } = useAuthContext();
    const {
        notifications,
        isLoading,
        error,
        totalNotRead,
        fetchNotifications,
        markAllAsReadLocal,
    } = useNotifications({
        page: 1,
        limit: 10,
        search: '',
        fallbackActorName: user?.name,
        autoFetch: true,
    });

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="w-full min-h-screen flex flex-col">
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-8 pt-8 pb-4 border-b border-gray-100/50">
                        <DashboardHeader />
                    </div>

                    <NotificationsView
                        notifications={notifications}
                        isLoading={isLoading}
                        error={error}
                        totalNotRead={totalNotRead}
                        onMarkAllRead={markAllAsReadLocal}
                        onRetry={() => {
                            void fetchNotifications();
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
