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
    file_path: string | null;
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
    type: string;
    actor: string;
    description: string;
    actionKey: string;
    actionLabel: string;
    objectType: string;
    objectId: string;
    objectName: string;
    objectUpdated: string | null;
    filePath: string | null;
    createdAt: string;
    unread: boolean;
}

export interface UseNotificationsOptions {
    page?: number;
    limit?: number;
    search?: string;
    fallbackActorName?: string;
    autoFetch?: boolean;
}
