'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { useAuthContext } from '@/features/auth/context/auth.context';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { NotificationsView } from '@/features/notifications/presentation/views/NotificationsView';
import { useNotificationRedirect } from '@/features/notifications/hooks/useNotificationRedirect';
import { useToast } from '@/shared/hooks/useToast';
import { Toast } from '@/shared/components/Toast';
import { useSidebar } from '@/layout/providers/SidebarContext';

export default function NotificationsPage() {
    const { user } = useAuthContext();
    const { services } = useSidebar();
    const [page, setPage] = useState(1);
    const limit = 10;
    const {
        notifications,
        isLoading,
        error,
        totalNotRead,
        currentPage,
        totalPages,
        totalItems,
        fetchNotifications,
        markAllAsRead,
        markAsRead,
    } = useNotifications({
        page,
        limit,
        search: '',
        fallbackActorName: user?.name,
        autoFetch: true,
    });
    const { toast, showToast, hideToast } = useToast();
    const { navigatingNotificationId, openNotification } = useNotificationRedirect({
        services,
        showToast,
        markAsRead,
    });
    const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * limit;
    const endIndex = totalItems === 0 ? 0 : Math.min(startIndex + notifications.length, totalItems);

    const handlePageChange = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
        setPage(nextPage);
    };

    const handleMarkAllRead = () => {
        void (async () => {
            try {
                await markAllAsRead();
                showToast({ message: 'Semua notifikasi ditandai sudah dibaca', variant: 'success' });
            } catch (err) {
                showToast({
                    message: err instanceof Error ? err.message : 'Gagal menandai notifikasi',
                    variant: 'error',
                });
            }
        })();
    };

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
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        onMarkAllRead={handleMarkAllRead}
                        onRetry={() => {
                            void fetchNotifications();
                        }}
                        onPageChange={handlePageChange}
                        navigatingNotificationId={navigatingNotificationId}
                        onNotificationClick={(notification) => {
                            void openNotification(notification);
                        }}
                    />
                </div>
            </div>
            <Toast toast={toast} onClose={hideToast} position="bottom-left" />
        </div>
    );
}
