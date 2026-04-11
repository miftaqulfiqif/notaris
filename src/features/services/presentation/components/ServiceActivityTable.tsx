'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import {
    Star,
    StarOff,
    Folder,
    MoreVertical,
    Clock,
    Eye,
    Trash2,
    Search,
} from 'lucide-react';
import { apiGet } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { Activity, ActivityItemType } from '@/features/dashboard/types';
import { SortableHeader } from '@/shared/components/SortableHeader';
import { FilterTabs } from '@/shared/components/FilterTabs';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useActivityTabs } from '@/features/dashboard/presentation/hooks/useActivityTabs';
import { useSelection } from '@/shared/hooks/useSelection';
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

interface ServiceActivityApiItem {
    id?: string;
    item_id?: string;
    item_type?: ActivityItemType | string;
    folder_id?: string | null;
    document_id?: string | null;
    folder_name?: string | null;
    object?: string | null;
    layanan?: string | null;
    tipe_layanan?: string | null;
    service?: string | null;
    companyName?: string | null;
    author?: string | null;
    updated_at?: string | null;
    modifiedDate?: string | null;
    created_at?: string | null;
    status?: string | null;
    object_status?: string | null;
    status_folder?: string | null;
    folder_status?: string | null;
    detail_status?: { status?: string | null } | string | null;
    is_favorite?: boolean;
    isFavorite?: boolean;
    route_path?: string | null;
}

interface ServiceActivitiesPagination {
    current_page?: number;
    total_items?: number;
    total_pages?: number;
    data?: ServiceActivityApiItem[];
}

interface ServiceActivitiesResponse {
    message?: string;
    data:
        | ServiceActivityApiItem[]
        | ServiceActivitiesPagination
        | ServiceActivitiesPagination[];
}

type ActivitySortField = 'companyName' | 'service' | 'author' | 'modifiedDate' | 'status' | null;
type SortDirection = 'asc' | 'desc';

const ACTIVITY_ITEM_TYPES: ActivityItemType[] = ['FOLDER', 'DOCUMENT', 'LAYANAN', 'TIPE_LAYANAN'];
const ACTIVITIES_PAGE_LIMIT = 10;

const STATUS_SORT_PRIORITY: Record<string, number> = {
    selesai: 0,
    proses: 1,
    tertunda: 2,
    terjeda: 2,
    terutunda: 2,
};

const compareText = (left: string, right: string) =>
    left.localeCompare(right, 'id', { sensitivity: 'base', numeric: true });

const normalizeActivityItemType = (value?: string | null): ActivityItemType => {
    if (!value) return 'FOLDER';

    const normalized = value.trim().toUpperCase();
    if (ACTIVITY_ITEM_TYPES.includes(normalized as ActivityItemType)) {
        return normalized as ActivityItemType;
    }

    return 'FOLDER';
};

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

const isPaginatedActivitiesPayload = (payload: unknown): payload is ServiceActivitiesPagination => {
    return typeof payload === 'object' && payload !== null && 'data' in payload;
};

const parseServiceActivitiesResponse = (payload: ServiceActivitiesResponse['data']) => {
    if (Array.isArray(payload)) {
        const [firstItem] = payload;

        if (firstItem && isPaginatedActivitiesPayload(firstItem)) {
            const items = Array.isArray(firstItem.data) ? firstItem.data : [];
            return {
                items,
                currentPage: firstItem.current_page ?? 1,
                totalItems: firstItem.total_items ?? items.length,
                totalPages: firstItem.total_pages ?? (items.length > 0 ? 1 : 0),
            };
        }

        return {
            items: payload,
            currentPage: 1,
            totalItems: payload.length,
            totalPages: payload.length > 0 ? 1 : 0,
        };
    }

    if (isPaginatedActivitiesPayload(payload)) {
        const items = Array.isArray(payload.data) ? payload.data : [];

        return {
            items,
            currentPage: payload.current_page ?? 1,
            totalItems: payload.total_items ?? items.length,
            totalPages: payload.total_pages ?? (items.length > 0 ? 1 : 0),
        };
    }

    return {
        items: [],
        currentPage: 1,
        totalItems: 0,
        totalPages: 0,
    };
};

const mapApiActivityToActivity = (activity: ServiceActivityApiItem, index: number): Activity => {
    const itemType = normalizeActivityItemType(activity.item_type ?? (activity.folder_id ? 'FOLDER' : 'DOCUMENT'));
    const folderId = activity.folder_id ?? null;
    const documentId = activity.document_id ?? null;
    const resolvedItemId =
        activity.item_id
        || (itemType === 'DOCUMENT' ? documentId || folderId : folderId || documentId)
        || activity.id
        || `folder-activity-${index}`;
    const detailStatus =
        typeof activity.detail_status === 'string'
            ? activity.detail_status
            : activity.detail_status?.status;
    const rawStatus =
        detailStatus
        || activity.status
        || activity.object_status
        || activity.status_folder
        || activity.folder_status
        || 'Proses';

    return {
        id: String(activity.id ?? resolvedItemId),
        itemId: String(resolvedItemId),
        folderId,
        documentId,
        companyName: activity.folder_name?.trim() || activity.companyName?.trim() || '-',
        clientName: '-',
        service:
            activity.tipe_layanan?.trim()
            || activity.layanan?.trim()
            || activity.service?.trim()
            || activity.object?.trim()
            || '-',
        author: activity.author?.trim() || '-',
        modifiedDate: String(activity.updated_at || activity.modifiedDate || activity.created_at || '-'),
        status: toStatusBadgeLabel(rawStatus) as Activity['status'],
        isFavorite: Boolean(activity.is_favorite ?? activity.isFavorite),
        itemType,
        routePath: activity.route_path || null,
        createdAt: activity.created_at || null,
    };
};

export function ServiceActivityTable({ onSelectActivity, activities, isLoading = false }: ServiceActivityTableProps) {
    const { activeTab, setActiveTab } = useActivityTabs();
    const { toast, showToast, hideToast } = useToast();
    const usesRemoteData = activities === undefined;
    const [remoteActivities, setRemoteActivities] = useState<Activity[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [remoteTotalPages, setRemoteTotalPages] = useState(0);
    const [remoteTotalItems, setRemoteTotalItems] = useState(0);
    const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
    const [hiddenActivityIds, setHiddenActivityIds] = useState<string[]>([]);
    const [loadedRemoteQueryKey, setLoadedRemoteQueryKey] = useState<string | null>(null);
    const [remoteErrorState, setRemoteErrorState] = useState<{ key: string; message: string } | null>(null);
    const requestIdRef = useRef(0);

    const [sortField, setSortField] = useState<ActivitySortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const { activeDropdown, openDropdown, closeDropdown, isOpen, triggerClass, menuClass } =
        useDropdown<string>({
            triggerClass: 'service-activity-dropdown-trigger',
            menuClass: 'service-activity-dropdown-menu',
        });
    const remoteQueryKey = `${currentPage}:${searchQuery}`;
    const isRemoteLoading = usesRemoteData && !isLoading && loadedRemoteQueryKey !== remoteQueryKey;
    const remoteError =
        remoteErrorState?.key === remoteQueryKey ? remoteErrorState.message : null;

    useEffect(() => {
        if (!usesRemoteData || isLoading) return;

        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;

        const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: ACTIVITIES_PAGE_LIMIT.toString(),
            search: searchQuery,
        });

        void apiGet<ServiceActivitiesResponse>(
            `${ENDPOINTS.USER.FOLDER_ACTIVITIES_LIST}?${params.toString()}`,
        )
            .then((response) => {
                if (requestId !== requestIdRef.current) return;

                const parsed = parseServiceActivitiesResponse(response.data);
                setRemoteActivities(parsed.items.map(mapApiActivityToActivity));
                setRemoteTotalItems(parsed.totalItems);
                setRemoteTotalPages(parsed.totalPages);
                setRemoteErrorState(null);
                setLoadedRemoteQueryKey(remoteQueryKey);

                if (parsed.totalPages > 0 && currentPage > parsed.totalPages) {
                    setCurrentPage(parsed.totalPages);
                }
            })
            .catch((error: unknown) => {
                if (requestId !== requestIdRef.current) return;

                setRemoteActivities([]);
                setRemoteTotalItems(0);
                setRemoteTotalPages(0);
                setRemoteErrorState({
                    key: remoteQueryKey,
                    message: error instanceof Error ? error.message : 'Gagal memuat aktivitas folder',
                });
                setLoadedRemoteQueryKey(remoteQueryKey);
            });
    }, [currentPage, isLoading, remoteQueryKey, searchQuery, usesRemoteData]);

    const localActivities = useMemo(
        () =>
            (usesRemoteData ? remoteActivities : (activities ?? []))
                .filter((activity) => !hiddenActivityIds.includes(activity.id))
                .map((activity) => ({
                    ...activity,
                    isFavorite: favoriteOverrides[activity.id] ?? activity.isFavorite,
                })),
        [activities, favoriteOverrides, hiddenActivityIds, remoteActivities, usesRemoteData],
    );

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

    const usesServerPagination = usesRemoteData && activeTab !== 'favorite';

    const paginatedItems = useMemo(() => {
        if (usesServerPagination) {
            return sortedActivities;
        }

        const start = (currentPage - 1) * ACTIVITIES_PAGE_LIMIT;
        return sortedActivities.slice(start, start + ACTIVITIES_PAGE_LIMIT);
    }, [currentPage, sortedActivities, usesServerPagination]);

    const totalItems = usesServerPagination ? remoteTotalItems : sortedActivities.length;
    const totalPages = totalItems === 0
        ? 0
        : usesServerPagination
            ? Math.max(remoteTotalPages, 1)
            : Math.ceil(sortedActivities.length / ACTIVITIES_PAGE_LIMIT);
    const effectiveCurrentPage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
    const startIndex = totalItems === 0 ? 0 : (effectiveCurrentPage - 1) * ACTIVITIES_PAGE_LIMIT;
    const endIndex = totalItems === 0 ? 0 : Math.min(startIndex + paginatedItems.length, totalItems);

    const {
        setSelectedItems,
        toggleSelectAll,
        toggleSelectItem,
        isSelected,
        isAllSelected,
    } = useSelection({ items: sortedActivities, itemIdKey: 'id' });

    useEffect(() => {
        setSelectedItems((prev) =>
            prev.filter((selectedId) =>
                sortedActivities.some((activity) => activity.id === selectedId),
            ),
        );
    }, [setSelectedItems, sortedActivities]);

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
        setCurrentPage(1);
    }, [sortDirection]);

    const activeActivity = useMemo(() => {
        if (!activeDropdown) return null;
        return sortedActivities.find((activity) => activity.id === activeDropdown.id) ?? null;
    }, [activeDropdown, sortedActivities]);

    const handleToggleFavorite = useCallback((targetActivity?: Activity | null) => {
        const activity = targetActivity ?? activeActivity;
        if (!activity) return;

        const currentFavorite = favoriteOverrides[activity.id] ?? activity.isFavorite;
        setFavoriteOverrides((prev) => ({
            ...prev,
            [activity.id]: !currentFavorite,
        }));

        showToast({
            message: currentFavorite
                ? 'Berhasil dihapus dari Berbintang'
                : 'Berhasil ditambahkan ke Berbintang',
            variant: 'success',
        });
    }, [activeActivity, favoriteOverrides, showToast]);

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

        setHiddenActivityIds((prev) =>
            prev.includes(activeActivity.id) ? prev : [...prev, activeActivity.id],
        );
        showToast({ message: 'Berhasil dipindahkan ke sampah', variant: 'success' });
    }, [activeActivity, showToast]);

    const handleOpenActivity = useCallback((activity: Activity) => {
        onSelectActivity?.(activity);
    }, [onSelectActivity]);

    const handleOpenActivityKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>, activity: Activity) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        handleOpenActivity(activity);
    }, [handleOpenActivity]);

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

    if (isLoading || (usesRemoteData && isRemoteLoading && localActivities.length === 0)) {
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

    const emptyStateMessage = remoteError
        || (activeTab === 'favorite' ? 'Belum ada aktivitas berbintang' : 'Belum ada aktivitas');

    return (
        <div className="mt-8">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-gray-800">Aktivitas</h3>

                {usesRemoteData && (
                    <label className="relative block w-full sm:max-w-xs">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) => {
                                setSearchQuery(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Cari aktivitas folder"
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-[#8B7355] focus:ring-2 focus:ring-[#8B7355]/15"
                        />
                    </label>
                )}
            </div>

            <FilterTabs
                tabs={[
                    { id: 'recent', label: 'Baru di tambahkan', icon: Clock },
                    { id: 'favorite', label: 'Favorite', icon: Star },
                ]}
                activeTab={activeTab}
                onChange={(id) => {
                    setCurrentPage(1);
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
                                        {emptyStateMessage}
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
                                            <div
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => handleOpenActivity(activity)}
                                                onKeyDown={(event) => handleOpenActivityKeyDown(event, activity)}
                                                className="flex w-full items-center gap-3 text-left transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] focus-visible:ring-offset-2"
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
                                            </div>
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
                currentPage={effectiveCurrentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                    const nextPage = totalPages > 0 ? Math.min(Math.max(page, 1), totalPages) : 1;
                    setCurrentPage(nextPage);
                }}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={totalItems}
            />
        </div>
    );
}
