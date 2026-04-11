export type ActivityStatus = 'Selesai' | 'Terjeda' | 'Tertunda' | 'Proses';

export type ActivityItemType = 'FOLDER' | 'DOCUMENT' | 'LAYANAN' | 'TIPE_LAYANAN';

export interface Activity {
    id: string;
    companyName: string;
    clientName: string;
    service: string;
    author: string;
    modifiedDate: string;
    status: ActivityStatus;
    isFavorite: boolean;
    isStarred?: boolean;
    itemType?: ActivityItemType;
    itemId?: string;
    folderId?: string | null;
    documentId?: string | null;
    serviceName?: string | null;
    typeName?: string | null;
    serviceSlug?: string | null;
    typeSlug?: string | null;
    routePath?: string | null;
    createdAt?: string | null;
}
