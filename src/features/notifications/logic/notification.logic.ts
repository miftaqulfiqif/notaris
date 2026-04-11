import type { NotificationApiItem, NotificationItem } from '@/features/notifications/types/notification.types';

const capitalizeWords = (value: string) =>
    value.replace(/\b\w/g, (char) => char.toUpperCase());

export function getNotificationActionLabel(item: NotificationApiItem): string {
    const actionMap: Record<string, string> = {
        update_status: 'Mengubah status',
        add_document: 'Menambah dokumen',
        delete_document: 'Menghapus dokumen',
        add_folder: 'Menambah folder',
        delete_folder: 'Menghapus folder',
        edit_item: 'Mengedit item',
        update_item: 'Mengedit item',
        delete_item: 'Menghapus item',
        upload_file: 'Upload file',
        delete_file: 'Menghapus file',
    };

    if (actionMap[item.action]) return actionMap[item.action];
    return capitalizeWords(item.action.replace(/_/g, ' '));
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
        type: item.type,
        actor,
        description,
        actionKey: item.action,
        actionLabel: getNotificationActionLabel(item),
        objectType: item.object,
        objectId: item.object_id,
        objectName: item.object_name,
        objectUpdated: item.object_updated,
        filePath: item.file_path,
        createdAt: item.created_at || '-',
        unread: !item.has_read,
    };
}
