export interface NotificationApiItem {
    id: string;
    type: string;
    action: string;
    description: string;
    object: string;
    object_id: string;
    object_name: string;
    object_updated: string | null;
    has_read: boolean;
    created_at: string;
}

export interface NotificationsResponse {
    message: string;
    data: {
        current_page: number;
        total_items: number;
        total_pages: number;
        total_not_read: number;
        data: NotificationApiItem[];
    };
}

export interface NotificationItem {
    id: string;
    actor: string;
    title: string;
    action: string;
    time: string;
    attachment?: string;
    unread: boolean;
    statusLabel?: string;
}

export interface UseNotificationsOptions {
    page?: number;
    limit?: number;
    search?: string;
    fallbackActorName?: string;
    autoFetch?: boolean;
}
