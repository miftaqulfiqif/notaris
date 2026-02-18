import type { NotificationApiItem, NotificationItem } from '@/features/notifications/types/notification.types';

const capitalizeFirst = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

export function getNotificationActionLabel(item: NotificationApiItem): string {
    const actionMap: Record<string, string> = {
        update_status: 'Status berubah',
        update_item: 'Mengedit item',
        delete_item: 'Hapus item',
        upload_file: 'Upload file',
        delete_file: 'Hapus file',
    };

    if (actionMap[item.action]) return actionMap[item.action];
    return item.action.replace(/_/g, ' ');
}

export function mapNotificationItem(
    item: NotificationApiItem,
    fallbackActorName?: string
): NotificationItem {
    const description = item.description || `${item.object_name} diperbarui`;
    const firstWord = description.trim().split(/\s+/)[0];
    const actor =
        firstWord?.toLowerCase() === 'saya'
            ? (fallbackActorName || 'Saya')
            : (firstWord || 'User');

    return {
        id: item.id,
        actor,
        title: description,
        action: getNotificationActionLabel(item),
        time: item.created_at || '-',
        attachment: item.object === 'DOCUMENT' ? item.object_name : undefined,
        unread: !item.has_read,
        statusLabel:
            item.action === 'update_status' && item.object_updated
                ? capitalizeFirst(item.object_updated)
                : undefined,
    };
}
