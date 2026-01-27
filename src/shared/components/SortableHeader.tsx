import { ArrowUpDown } from 'lucide-react';

interface SortableHeaderProps {
    label: string;
    className?: string;
    onClick?: () => void;
}

export function SortableHeader({ label, className = '', onClick }: SortableHeaderProps) {
    return (
        <div
            className={`flex items-center gap-2 cursor-pointer hover:text-gray-700 ${className}`}
            onClick={onClick}
        >
            {label}
            <ArrowUpDown className="w-3 h-3" />
        </div>
    );
}
