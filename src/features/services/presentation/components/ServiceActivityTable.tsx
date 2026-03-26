'use client';

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import {
    Star,
    StarOff,
    Folder,
    MoreVertical,
    Clock,
    Eye,
    Trash2,
} from 'lucide-react';
import { Activity } from '@/features/dashboard/types';
import { SortableHeader } from '@/shared/components/SortableHeader';
import { FilterTabs } from '@/shared/components/FilterTabs';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useActivityTabs } from '@/features/dashboard/presentation/hooks/useActivityTabs';
import { useSelection } from '@/shared/hooks/useSelection';
import { usePagination } from '@/shared/hooks/usePagination';
import { Pagination } from '@/shared/components/Pagination';
import { useToast } from '@/shared/hooks/useToast';
import { Toast } from '@/shared/components/Toast';
import { useDropdown } from '@/shared/hooks/useDropdown';
import { DropdownMenu } from '@/shared/components/DropdownMenu';
import type { DropdownMenuItem } from '@/shared/components/DropdownMenu';

interface ServiceActivityTableProps {
    onSelectActivity?: (activity: Activity) => void;
    activities?: Activity[];
    isLoading?: boolean;
}

type ActivitySortField = 'companyName' | 'service' | 'author' | 'modifiedDate' | 'status' | null;
type SortDirection = 'asc' | 'desc';

const STATUS_SORT_PRIORITY: Record<string, number> = {
    selesai: 0,
    proses: 1,
    tertunda: 2,
    terjeda: 2,
    terutunda: 2,
};

const compareText = (left: string, right: string) =>
    left.localeCompare(right, 'id', { sensitivity: 'base', numeric: true });

const normalizeActivityStatus = (status: string): string => {
    const normalizedStatus = status.toLowerCase().trim();

    if (normalizedStatus === 'dalam_proses' || normalizedStatus === 'dalam proses') {
        return 'proses';
    }

    if (normalizedStatus === 'terjeda' || normalizedStatus === 'terutunda') {
        return 'tertunda';
    }

    return normalizedStatus;
};

const toStatusBadgeLabel = (status: string): string => {
    const normalizedStatus = normalizeActivityStatus(status);

    if (normalizedStatus === 'selesai') return 'Selesai';
    if (normalizedStatus === 'proses') return 'Proses';
    if (normalizedStatus === 'tertunda') return 'Tertunda';

    return status;
};

export function ServiceActivityTable({ onSelectActivity, activities = [], isLoading = false }: ServiceActivityTableProps) {
    const { activeTab, setActiveTab } = useActivityTabs();
    const { toast, showToast, hideToast } = useToast();
    const [localActivities, setLocalActivities] = useState<Activity[]>(activities);

    const [sortField, setSortField] = useState<ActivitySortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const { activeDropdown, openDropdown, closeDropdown, isOpen, triggerClass, menuClass } =
        useDropdown<string>({
            triggerClass: 'service-activity-dropdown-trigger',
            menuClass: 'service-activity-dropdown-menu',
        });

    useEffect(() => {
        setLocalActivities(activities);
    }, [activities]);

    const filteredActivities = useMemo(() => {
        if (activeTab === 'favorite') {
            return localActivities.filter((activity) => activity.isFavorite);
        }

        return localActivities;
    }, [activeTab, localActivities]);

    const sortedActivities = useMemo(() => {
        if (!sortField) return filteredActivities;

        const sorted = [...filteredActivities].sort((left, right) => {
            if (sortField === 'modifiedDate') {
                const leftTime = Date.parse(left.modifiedDate);
                const rightTime = Date.parse(right.modifiedDate);

                if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime)) {
                    return leftTime - rightTime;
                }
            }

            if (sortField === 'status') {
                const leftStatus = normalizeActivityStatus(left.status);
                const rightStatus = normalizeActivityStatus(right.status);
                const leftPriority = STATUS_SORT_PRIORITY[leftStatus];
                const rightPriority = STATUS_SORT_PRIORITY[rightStatus];

                if (leftPriority !== undefined && rightPriority !== undefined && leftPriority !== rightPriority) {
                    return leftPriority - rightPriority;
                }

                return compareText(leftStatus, rightStatus);
            }

            return compareText(left[sortField], right[sortField]);
        });

        return sortDirection === 'asc' ? sorted : sorted.reverse();
    }, [filteredActivities, sortDirection, sortField]);

    const {
        toggleSelectAll,
        toggleSelectItem,
        isSelected,
        isAllSelected,
    } = useSelection({ items: sortedActivities, itemIdKey: 'id' });

    const {
        currentPage,
        totalPages,
        paginatedItems,
        setPage,
        startIndex,
        endIndex,
        totalItems,
    } = usePagination({ items: sortedActivities, itemsPerPage: 5 });

    const handleSort = useCallback((field: Exclude<ActivitySortField, null>) => {
        setSortField((prev) => {
            if (prev !== field) {
                setSortDirection('asc');
                return field;
            }

            if (sortDirection === 'asc') {
                setSortDirection('desc');
                return field;
            }

            setSortDirection('asc');
            return null;
        });
        setPage(1);
    }, [setPage, sortDirection]);

    const activeActivity = useMemo(() => {
        if (!activeDropdown) return null;
        return sortedActivities.find((activity) => activity.id === activeDropdown.id) ?? null;
    }, [activeDropdown, sortedActivities]);

    const handleToggleFavorite = useCallback((targetActivity?: Activity | null) => {
        const activity = targetActivity ?? activeActivity;
        if (!activity) return;

        setLocalActivities((prev) =>
            prev.map((item) =>
                item.id === activity.id
                    ? {
                        ...item,
                        isFavorite: !item.isFavorite,
                    }
                    : item,
            ),
        );

        showToast({
            message: activity.isFavorite
                ? 'Berhasil dihapus dari Berbintang'
                : 'Berhasil ditambahkan ke Berbintang',
            variant: 'success',
        });
    }, [activeActivity, showToast]);

    const handleFavoriteIconClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>, activity: Activity) => {
            event.preventDefault();
            event.stopPropagation();
            if (!activity.isFavorite) return;
            handleToggleFavorite(activity);
        },
        [handleToggleFavorite],
    );

    const handleMoveToTrash = useCallback(() => {
        if (!activeActivity) return;

        setLocalActivities((prev) => prev.filter((activity) => activity.id !== activeActivity.id));
        showToast({ message: 'Berhasil dipindahkan ke sampah', variant: 'success' });
    }, [activeActivity, showToast]);

    const moreActions = useMemo<DropdownMenuItem[]>(
        () => [
            {
                label: 'Buka item',
                icon: <Eye className="h-4 w-4" />,
                onClick: () => {
                    if (!activeActivity) return;
                    onSelectActivity?.(activeActivity);
                },
            },
            {
                label: activeActivity?.isFavorite ? 'Hapus dari Berbintang' : 'Tambahkan ke Berbintang',
                icon: activeActivity?.isFavorite ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />,
                hasDivider: true,
                onClick: () => {
                    handleToggleFavorite();
                },
            },
            {
                label: 'Pindahkan ke sampah',
                icon: <Trash2 className="h-4 w-4" />,
                onClick: handleMoveToTrash,
            },
        ],
        [activeActivity, handleMoveToTrash, handleToggleFavorite, onSelectActivity],
    );

    if (isLoading) {
        return (
            <div className="mt-8">
                <h3 className="mb-4 text-lg font-bold text-gray-800">Aktivitas</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <h3 className="mb-4 text-lg font-bold text-gray-800">Aktivitas</h3>

            <FilterTabs
                tabs={[
                    { id: 'recent', label: 'Baru di tambahkan', icon: Clock },
                    { id: 'favorite', label: 'Favorite', icon: Star },
                ]}
                activeTab={activeTab}
                onChange={(id) => {
                    setPage(1);
                    setActiveTab(id as 'recent' | 'favorite');
                }}
            />

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="w-4 p-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-[#8B7355] focus:ring-2 focus:ring-[#8B7355]"
                                            checked={isAllSelected}
                                            onChange={toggleSelectAll}
                                        />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <SortableHeader
                                        label="Nama Perusahaan"
                                        active={sortField === 'companyName'}
                                        direction={sortField === 'companyName' ? sortDirection : null}
                                        onClick={() => handleSort('companyName')}
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <SortableHeader
                                        label="Layanan"
                                        active={sortField === 'service'}
                                        direction={sortField === 'service' ? sortDirection : null}
                                        onClick={() => handleSort('service')}
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <SortableHeader
                                        label="Author"
                                        active={sortField === 'author'}
                                        direction={sortField === 'author' ? sortDirection : null}
                                        onClick={() => handleSort('author')}
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <SortableHeader
                                        label="Dimodifikasi"
                                        active={sortField === 'modifiedDate'}
                                        direction={sortField === 'modifiedDate' ? sortDirection : null}
                                        onClick={() => handleSort('modifiedDate')}
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <SortableHeader
                                        label="Status"
                                        active={sortField === 'status'}
                                        direction={sortField === 'status' ? sortDirection : null}
                                        onClick={() => handleSort('status')}
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <span className="sr-only">Aksi</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                                        {activeTab === 'favorite'
                                            ? 'Belum ada aktivitas berbintang'
                                            : 'Belum ada aktivitas'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((activity) => (
                                    <tr key={activity.id} className="transition-colors hover:bg-gray-50">
                                        <td className="w-4 p-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-[#8B7355] focus:ring-2 focus:ring-[#8B7355]"
                                                    checked={isSelected(activity.id)}
                                                    onChange={() => toggleSelectItem(activity.id)}
                                                />
                                            </div>
                                        </td>
                                        <td className="min-w-70 px-6 py-4">
                                            <button
                                                onClick={() => onSelectActivity?.(activity)}
                                                className="flex w-full items-center gap-3 text-left transition-opacity hover:opacity-70"
                                            >
                                                <div className="shrink-0 rounded-lg bg-gray-100 p-2 text-gray-600">
                                                    <Folder className="h-5 w-5" />
                                                </div>
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span className="block max-w-60 truncate font-medium text-gray-900">
                                                        {activity.companyName}
                                                    </span>
                                                    {activity.isFavorite && (
                                                        <button
                                                            type="button"
                                                            onClick={(event) => handleFavoriteIconClick(event, activity)}
                                                            className="rounded-full p-1 transition-colors hover:bg-gray-100"
                                                        >
                                                            <Star className="mt-0.5 h-3.5 w-3.5 fill-gray-900 text-gray-900" />
                                                        </button>
                                                    )}
                                                </div>
                                            </button>
                                        </td>
                                        <td className="min-w-[150px] truncate px-6 py-4 text-gray-600">
                                            {activity.service}
                                        </td>
                                        <td className="min-w-[150px] truncate px-6 py-4 text-gray-600">
                                            {activity.author}
                                        </td>
                                        <td className="min-w-[150px] truncate px-6 py-4 text-gray-600">
                                            {activity.modifiedDate}
                                        </td>
                                        <td className="min-w-[150px] truncate px-6 py-4">
                                            <StatusBadge status={toStatusBadgeLabel(activity.status)} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={(event) => openDropdown(event, activity.id)}
                                                className={`rounded-lg p-1 transition-colors ${triggerClass} ${
                                                    isOpen(activity.id)
                                                        ? 'bg-gray-100 text-gray-600'
                                                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                                }`}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DropdownMenu
                dropdown={activeDropdown}
                menuClass={menuClass}
                items={moreActions}
                onClose={closeDropdown}
                widthClass="w-60"
            />
            <Toast toast={toast} onClose={hideToast} position="bottom-left" />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={totalItems}
            />
        </div>
    );
}
