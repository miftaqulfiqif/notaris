import { ActivityStatus } from '../types';

export function getStatusColor(status: ActivityStatus | string): string {
    const normalizedStatus = status.toLowerCase();

    switch (normalizedStatus) {
        case 'selesai':
            return 'bg-green-100 text-green-600';
        case 'terjeda':
            return 'bg-red-100 text-red-600';
        case 'proses':
            return 'bg-yellow-100 text-yellow-600';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}
