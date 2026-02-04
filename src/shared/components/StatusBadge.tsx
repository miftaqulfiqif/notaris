import { getStatusColor } from '@/features/dashboard/utils';
import { ActivityStatus } from '@/features/dashboard/types';

interface StatusBadgeProps {
    status: ActivityStatus | string;
    className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    return (
        <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(status as ActivityStatus)} min-w-[100px] text-center inline-block capitalize ${className}`}>
            {status}
        </span>
    );
}
