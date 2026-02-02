import { ActivityStatus } from '../types';

export function getStatusColor(status: ActivityStatus): string {
    switch (status) {
        case 'Selesai':
            return 'bg-green-100 text-green-600';
        case 'Terjeda':
            return 'bg-red-100 text-red-600';
        case 'Proses':
            return 'bg-yellow-100 text-yellow-600';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}
