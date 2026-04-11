import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

type SortDirection = 'asc' | 'desc' | null;

interface SortableHeaderProps {
    label: string;
    className?: string;
    onClick?: () => void;
    direction?: SortDirection;
    active?: boolean;
}

export function SortableHeader({
    label,
    className = '',
    onClick,
    direction = null,
    active = false,
}: SortableHeaderProps) {
    const icon = !active || !direction
        ? <ArrowUpDown className="h-3 w-3" />
        : direction === 'asc'
            ? <ArrowUp className="h-3 w-3" />
            : <ArrowDown className="h-3 w-3" />;

    return (
        <button
            type="button"
            className={`flex items-center gap-2 transition-colors ${active ? 'text-[#8B7355]' : 'text-inherit hover:text-gray-700'} ${className}`}
            onClick={onClick}
        >
            {label}
            {icon}
        </button>
    );
}
