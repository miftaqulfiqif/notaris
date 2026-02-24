'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { mapNotificationItem } from '@/features/notifications/logic/notification.logic';
import type { NotificationItem, NotificationsResponse, UseNotificationsOptions } from '@/features/notifications/types/notification.types';

export function useNotifications(options: UseNotificationsOptions = {}) {
    const {
        page = 1,
        limit = 10,
        search = '',
        fallbackActorName,
        autoFetch = true,
    } = options;

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalNotRead, setTotalNotRead] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const queryString = useMemo(() => {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            search,
        });

        return queryParams.toString();
    }, [limit, page, search]);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiGet<NotificationsResponse>(
                `${ENDPOINTS.USER.NOTIFICATIONS}?${queryString}`
            );

            setNotifications(
                response.data.data.map((item) => mapNotificationItem(item, fallbackActorName))
            );
            setTotalNotRead(response.data.total_not_read);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.total_pages);
            setTotalItems(response.data.total_items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat notifikasi');
        } finally {
            setIsLoading(false);
        }
    }, [fallbackActorName, queryString]);

    const markAllAsReadLocal = useCallback(() => {
        setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
        setTotalNotRead(0);
    }, []);

    const markAllAsRead = useCallback(async () => {
        const url = ENDPOINTS.USER.NOTIFICATION_READ.replace(':notifikasi_id', 'all_read');
        await apiPost(url);
        markAllAsReadLocal();
    }, [markAllAsReadLocal]);

    useEffect(() => {
        if (!autoFetch) return;
        void fetchNotifications();
    }, [autoFetch, fetchNotifications]);

    return {
        notifications,
        isLoading,
        error,
        totalNotRead,
        currentPage,
        totalPages,
        totalItems,
        fetchNotifications,
        markAllAsReadLocal,
        markAllAsRead,
    };
}
