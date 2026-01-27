import { ActivityStatus } from '../types';

export function getStatusColor(status: ActivityStatus): string {
    switch (status) {
        case 'Selesai':
            return 'bg-green-100 text-green-600';
        case 'Terjeda':
        case 'Terjadi Kesalahan':
            return 'bg-red-100 text-red-600';
        case 'Dalam Proses':
            return 'bg-yellow-100 text-yellow-600';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}
