export type ActivityStatus = 'Selesai' | 'Terjeda' | 'Dalam Proses';

export interface Activity {
    id: string;
    companyName: string;
    clientName: string;
    service: string;
    author: string;
    modifiedDate: string;
    status: ActivityStatus;
    isFavorite: boolean;
}
