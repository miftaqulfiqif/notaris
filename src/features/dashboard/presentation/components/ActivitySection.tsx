'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    Star,
    StarOff,
    Folder,
    MoreVertical,
    Clock,
    Eye,
    Trash2,
} from 'lucide-react';
import { Activity, ActivityItemType, ActivityStatus } from '@/features/dashboard/types';
import { mockActivities } from '@/features/dashboard/data';
import { SortableHeader } from '@/shared/components/SortableHeader';
import { FilterTabs } from '@/shared/components/FilterTabs';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useActivityTabs } from '@/features/dashboard/presentation/hooks/useActivityTabs';
import { useSelection } from '@/shared/hooks/useSelection';
import { usePagination } from '@/shared/hooks/usePagination';
import { Pagination } from '@/shared/components/Pagination';
import { BulkActionToast } from '@/shared/components/BulkActionToast';
import { useToast } from '@/shared/hooks/useToast';
import { Toast } from '@/shared/components/Toast';
import { ConfirmationModal } from '@/shared/components/ConfirmationModal';
import { PaginatedActivities } from '@/features/dashboard/hooks/useDashboard';
import { ApiResponse, apiGet, apiPost } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { DropdownMenu } from '@/shared/components/DropdownMenu';
import { useDropdown } from '@/shared/hooks/useDropdown';
import type { DropdownMenuItem } from '@/shared/components/DropdownMenu';
import { useSidebar } from '@/layout/providers/SidebarContext';
import type { FolderSidebarResponse, ServiceType } from '@/features/services/types';

interface ActivitySectionProps {
    onSelectActivity?: (activity: Activity) => void;
    activities?: Activity[];
    dashboardActivities?: PaginatedActivities | null;
    isLoading?: boolean;
    error?: string | null;
    clientHeaderLabel?: string;
}

interface FileSearchItem {
    folder_id: string | null;
    document_id: string | null;
    type: 'DOCUMENT' | 'FOLDER';
    name: string;
}

interface FileSearchResponse {
    message: string;
    data: FileSearchItem[];
}

interface FavoriteLookupResponse {
    message: string;
    data: {
        current_page: number;
        total_items: number;
        total_pages: number;
        data: Array<{
            item_id: string;
            item_type: ActivityItemType;
        }>;
    };
}

const ACTIVITY_ITEM_TYPES: ActivityItemType[] = ['FOLDER', 'DOCUMENT', 'LAYANAN', 'TIPE_LAYANAN'];

const toSlug = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const normalizeText = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, ' ');

const isTypeNameMatch = (sourceTypeName: string, candidateTypeName: string) => {
    const normalizedSource = normalizeText(sourceTypeName);
    const normalizedCandidate = normalizeText(candidateTypeName);
    const sourceSlug = toSlug(sourceTypeName);
    const candidateSlug = toSlug(candidateTypeName);

    return normalizedSource === normalizedCandidate
        || normalizedSource.includes(normalizedCandidate)
        || normalizedCandidate.includes(normalizedSource)
        || sourceSlug === candidateSlug;
};

const parseActiveServiceRoute = (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length < 3 || segments[0] !== 'services') {
        return null;
    }

    return {
        serviceSlug: segments[1],
        typeSlug: segments[2],
    };
};

const normalizeActivityItemType = (value?: string | null): ActivityItemType => {
    if (!value) return 'FOLDER';

    const normalized = value.trim().toUpperCase();
    if (ACTIVITY_ITEM_TYPES.includes(normalized as ActivityItemType)) {
        return normalized as ActivityItemType;
    }

    return 'FOLDER';
};

export function ActivitySection({
    onSelectActivity,
    activities,
    dashboardActivities,
    isLoading = false,
    error,
    clientHeaderLabel = 'Nama Klien',
}: ActivitySectionProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { services } = useSidebar();
    const { activeTab, setActiveTab } = useActivityTabs();
    const { toast, showToast, hideToast } = useToast();
    const { activeDropdown, openDropdown, closeDropdown, isOpen, triggerClass, menuClass } =
        useDropdown<string>({
            triggerClass: 'activity-table-dropdown-trigger',
            menuClass: 'activity-table-dropdown-menu',
        });
    const routeCacheRef = useRef<Record<string, string | null>>({});
    const serviceTypesCacheRef = useRef<Record<string, ServiceType[]>>({});
    const documentFolderCacheRef = useRef<Record<string, string | null>>({});

    const realActivities = useMemo(() => {
        if (!dashboardActivities?.data) return [];

        return dashboardActivities.data
            .filter((act): act is NonNullable<typeof act> => Boolean(act))
            .map((act, index) => {
                const itemType = normalizeActivityItemType(act.item_type ?? (act.folder_id ? 'FOLDER' : 'DOCUMENT'));
                const folderId = act.folder_id || null;
                const documentId = act.document_id || null;
                const resolvedItemId = act.item_id || (itemType === 'DOCUMENT'
                    ? documentId || folderId
                    : folderId || documentId);

                const fallbackId = resolvedItemId || `fallback-id-${index}`;

                return {
                    id: fallbackId,
                    itemId: resolvedItemId || fallbackId,
                    folderId,
                    documentId,
                    companyName: act.folder_name || '-',
                    clientName: '-',
                    service: act.tipe_layanan || '-',
                    serviceName: act.layanan || null,
                    typeName: act.tipe_layanan || null,
                    author: act.author || '-',
                    modifiedDate: String(act.updated_at || '-'),
                    status: (act.status || act.object_status || 'Proses') as ActivityStatus,
                    isFavorite: Boolean(act.is_favorite),
                    itemType,
                    routePath: act.route_path || null,
                    createdAt: act.created_at || null,
                } satisfies Activity;
            });
    }, [dashboardActivities]);

    const initialActivityData = dashboardActivities !== undefined ? realActivities : (activities ?? mockActivities);
    const [localActivities, setLocalActivities] = useState<Activity[]>(initialActivityData);
    const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
    const [pendingFavoriteId, setPendingFavoriteId] = useState<string | null>(null);
    const [navigatingItemId, setNavigatingItemId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isProcessingBulk, setIsProcessingBulk] = useState(false);
    const [isTrashLoading, setIsTrashLoading] = useState(false);

    const resolveFavoriteTarget = useCallback((activity: Activity) => {
        const itemType = activity.itemType ?? 'FOLDER';
        const itemId = activity.itemId
            || (itemType === 'DOCUMENT' ? activity.documentId : activity.folderId)
            || activity.id;

        if (!itemId) {
            return null;
        }

        return {
            item_id: itemId,
            item_type: itemType,
        };
    }, []);

    const resolveIsFavorite = useCallback(
        (activity: Pick<Activity, 'id' | 'isFavorite'>) => favoriteOverrides[activity.id] ?? Boolean(activity.isFavorite),
        [favoriteOverrides],
    );

    useEffect(() => {
        setLocalActivities(initialActivityData);
        setFavoriteOverrides({});
    }, [initialActivityData]);

    useEffect(() => {
        let isMounted = true;

        const syncFavorites = async () => {
            if (localActivities.length === 0) {
                if (isMounted) {
                    setFavoriteOverrides({});
                }
                return;
            }

            try {
                const response = await apiGet<FavoriteLookupResponse>(
                    `${ENDPOINTS.USER.ITEM_FAVORITE}?page=1&limit=500&search=`,
                );
                if (!isMounted) return;

                const favoriteKeys = new Set(
                    (response.data.data || []).map((item) => `${item.item_type}:${item.item_id}`),
                );

                setFavoriteOverrides((prev) => {
                    const next = { ...prev };
                    localActivities.forEach((activity) => {
                        const target = resolveFavoriteTarget(activity);
                        if (!target) return;
                        next[activity.id] = favoriteKeys.has(`${target.item_type}:${target.item_id}`);
                    });
                    return next;
                });
            } catch {
                if (isMounted) {
                    setFavoriteOverrides((prev) => {
                        const next = { ...prev };
                        localActivities.forEach((activity) => {
                            if (!(activity.id in next)) {
                                next[activity.id] = Boolean(activity.isFavorite);
                            }
                        });
                        return next;
                    });
                }
            }
        };

        void syncFavorites();

        return () => {
            isMounted = false;
        };
    }, [localActivities, resolveFavoriteTarget]);

    const filteredActivities = useMemo(() => {
        if (activeTab === 'favorite') {
            return localActivities.filter((activity) => resolveIsFavorite(activity));
        }

        return localActivities;
    }, [activeTab, localActivities, resolveIsFavorite]);

    const {
        selectedItems,
        setSelectedItems,
        toggleSelectAll,
        toggleSelectItem,
        isSelected,
        isAllSelected,
    } = useSelection({ items: filteredActivities, itemIdKey: 'id' });

    const selectedActivities = useMemo(
        () => filteredActivities.filter((activity) => selectedItems.includes(activity.id)),
        [filteredActivities, selectedItems],
    );

    const hasSelectedItems = selectedActivities.length > 0;

    useEffect(() => {
        setSelectedItems((prev) =>
            prev.filter((selectedId) => filteredActivities.some((activity) => activity.id === selectedId)),
        );
    }, [filteredActivities, setSelectedItems]);

    const {
        currentPage,
        totalPages,
        paginatedItems,
        setPage,
        startIndex,
        endIndex,
        totalItems,
    } = usePagination({ items: filteredActivities, itemsPerPage: 5 });

    const activeActivity = useMemo(() => {
        if (!activeDropdown) return null;
        return paginatedItems.find((item) => item.id === activeDropdown.id)
            || filteredActivities.find((item) => item.id === activeDropdown.id)
            || null;
    }, [activeDropdown, filteredActivities, paginatedItems]);

    const activeActivityIsFavorite = useMemo(() => {
        if (!activeActivity) return false;
        return resolveIsFavorite(activeActivity);
    }, [activeActivity, resolveIsFavorite]);

    const fetchServiceTypesByService = useCallback(async (serviceId: string) => {
        const cached = serviceTypesCacheRef.current[serviceId];
        if (cached) {
            return cached;
        }

        const url = ENDPOINTS.USER.SERVICE_TYPES.replace(':serviceId', serviceId);
        const response = await apiGet<ApiResponse<ServiceType[]>>(url);
        const serviceTypes = response.data || [];
        serviceTypesCacheRef.current[serviceId] = serviceTypes;
        return serviceTypes;
    }, []);

    const resolveServiceAndTypeSlugs = useCallback(
        async (serviceNameCandidate: string | null | undefined, typeNameCandidates: string[]) => {
            const normalizedTypeCandidates = typeNameCandidates
                .map((name) => name.trim())
                .filter(Boolean);

            if (services.length === 0 || normalizedTypeCandidates.length === 0) {
                return null;
            }

            const directServiceMatch = serviceNameCandidate
                ? services.find((service) => isTypeNameMatch(service.name, serviceNameCandidate))
                : null;

            if (directServiceMatch) {
                const serviceTypes = await fetchServiceTypesByService(directServiceMatch.id);
                const matchedType = serviceTypes.find((type) =>
                    normalizedTypeCandidates.some((candidate) => isTypeNameMatch(type.name, candidate)),
                );

                if (matchedType) {
                    return {
                        serviceSlug: toSlug(directServiceMatch.name),
                        typeSlug: toSlug(matchedType.name),
                    };
                }
            }

            for (const service of services) {
                const serviceTypes = await fetchServiceTypesByService(service.id);
                const matchedType = serviceTypes.find((type) =>
                    normalizedTypeCandidates.some((candidate) => isTypeNameMatch(type.name, candidate)),
                );

                if (matchedType) {
                    return {
                        serviceSlug: toSlug(service.name),
                        typeSlug: toSlug(matchedType.name),
                    };
                }
            }

            return null;
        },
        [fetchServiceTypesByService, services],
    );

    const resolveDocumentFolderId = useCallback(async (documentId: string, documentName: string) => {
        const cachedFolderId = documentFolderCacheRef.current[documentId];
        if (cachedFolderId !== undefined) {
            return cachedFolderId;
        }

        if (!documentName.trim()) {
            documentFolderCacheRef.current[documentId] = null;
            return null;
        }

        const params = new URLSearchParams({
            file_type: 'DOCUMENT',
            search: documentName,
        });

        const response = await apiGet<FileSearchResponse>(
            `${ENDPOINTS.NOTARIS.FILE_SEARCH}?${params.toString()}`,
        );

        const exactMatch = (response.data || []).find(
            (candidate) =>
                candidate.type === 'DOCUMENT'
                && candidate.document_id === documentId
                && candidate.folder_id,
        );

        const folderId = exactMatch?.folder_id
            || (response.data || []).find((candidate) => candidate.type === 'DOCUMENT' && candidate.folder_id)?.folder_id
            || null;

        documentFolderCacheRef.current[documentId] = folderId;
        return folderId;
    }, []);

    const resolveTypeNameByFolderId = useCallback(async (folderId: string) => {
        try {
            const url = ENDPOINTS.USER.DETAIL_FOLDER_SIDEBAR.replace(':folder_id', folderId);
            const response = await apiGet<FolderSidebarResponse>(url);
            return response.data.detail_folder.tipe_layanan?.trim() || null;
        } catch {
            return null;
        }
    }, []);

    const resolveActivityRoute = useCallback(
        async (activity: Activity) => {
            if (activity.id in routeCacheRef.current) {
                return routeCacheRef.current[activity.id];
            }

            if (activity.routePath) {
                routeCacheRef.current[activity.id] = activity.routePath;
                return activity.routePath;
            }

            const itemType = activity.itemType ?? 'FOLDER';
            const fallbackRoute = parseActiveServiceRoute(pathname);
            let route: string | null = null;

            switch (itemType) {
                case 'LAYANAN': {
                    const serviceSlug = activity.serviceSlug || toSlug(activity.serviceName || activity.companyName || activity.service);
                    if (serviceSlug) {
                        route = `/services/${serviceSlug}`;
                    }
                    break;
                }

                case 'TIPE_LAYANAN': {
                    const serviceSlug = activity.serviceSlug || toSlug(activity.serviceName || '');
                    const typeSlug = activity.typeSlug || toSlug(activity.typeName || activity.service || activity.companyName);

                    if (serviceSlug && typeSlug) {
                        route = `/services/${serviceSlug}/${typeSlug}`;
                        break;
                    }

                    const resolvedSlugs = await resolveServiceAndTypeSlugs(
                        activity.serviceName,
                        [activity.typeName || activity.service].filter((value): value is string => Boolean(value?.trim())),
                    );

                    if (resolvedSlugs) {
                        route = `/services/${resolvedSlugs.serviceSlug}/${resolvedSlugs.typeSlug}`;
                    }
                    break;
                }

                case 'DOCUMENT': {
                    let folderId = activity.folderId || null;
                    if (!folderId && activity.documentId) {
                        folderId = await resolveDocumentFolderId(activity.documentId, activity.companyName);
                    }

                    if (!folderId) {
                        break;
                    }

                    const serviceSlug = activity.serviceSlug || toSlug(activity.serviceName || '');
                    const typeSlug = activity.typeSlug || toSlug(activity.typeName || activity.service || '');

                    if (serviceSlug && typeSlug) {
                        route = `/services/${serviceSlug}/${typeSlug}/${folderId}`;
                        break;
                    }

                    const typeNameCandidates = [activity.typeName || activity.service];
                    const typeNameFromFolder = await resolveTypeNameByFolderId(folderId);
                    if (typeNameFromFolder) {
                        typeNameCandidates.push(typeNameFromFolder);
                    }

                    const resolvedSlugs = await resolveServiceAndTypeSlugs(
                        activity.serviceName,
                        typeNameCandidates.filter((value): value is string => Boolean(value?.trim())),
                    );

                    if (resolvedSlugs) {
                        route = `/services/${resolvedSlugs.serviceSlug}/${resolvedSlugs.typeSlug}/${folderId}`;
                        break;
                    }

                    if (fallbackRoute) {
                        route = `/services/${fallbackRoute.serviceSlug}/${fallbackRoute.typeSlug}/${folderId}`;
                    }
                    break;
                }

                case 'FOLDER':
                default: {
                    const folderId = activity.folderId || activity.itemId || activity.id;
                    const serviceSlug = activity.serviceSlug || toSlug(activity.serviceName || '');
                    const typeSlug = activity.typeSlug || toSlug(activity.typeName || activity.service || '');

                    if (folderId && serviceSlug && typeSlug) {
                        route = `/services/${serviceSlug}/${typeSlug}/${folderId}`;
                        break;
                    }

                    if (folderId) {
                        const resolvedSlugs = await resolveServiceAndTypeSlugs(
                            activity.serviceName,
                            [activity.typeName || activity.service].filter((value): value is string => Boolean(value?.trim())),
                        );

                        if (resolvedSlugs) {
                            route = `/services/${resolvedSlugs.serviceSlug}/${resolvedSlugs.typeSlug}/${folderId}`;
                            break;
                        }

                        if (fallbackRoute) {
                            route = `/services/${fallbackRoute.serviceSlug}/${fallbackRoute.typeSlug}/${folderId}`;
                        }
                    }
                    break;
                }
            }

            if (route) {
                routeCacheRef.current[activity.id] = route;
            }
            return route;
        },
        [pathname, resolveDocumentFolderId, resolveServiceAndTypeSlugs, resolveTypeNameByFolderId],
    );

    const handleOpenActivity = useCallback(
        async (activity: Activity) => {
            if (navigatingItemId || pendingFavoriteId === activity.id) {
                return;
            }

            setNavigatingItemId(activity.id);
            try {
                const route = await resolveActivityRoute(activity);
                if (!route) {
                    onSelectActivity?.(activity);
                    showToast({ message: 'Rute aktivitas belum tersedia', variant: 'error' });
                    return;
                }

                router.push(route);
            } catch {
                showToast({ message: 'Gagal membuka aktivitas', variant: 'error' });
            } finally {
                setNavigatingItemId(null);
            }
        },
        [navigatingItemId, onSelectActivity, pendingFavoriteId, resolveActivityRoute, router, showToast],
    );

    const handleToggleFavorite = useCallback(
        async (targetActivity?: Activity | null) => {
            const activity = targetActivity ?? activeActivity;
            if (!activity) return;

            const target = resolveFavoriteTarget(activity);
            if (!target) {
                showToast({ message: 'Item aktivitas tidak valid', variant: 'error' });
                return;
            }

            const isFavorite = resolveIsFavorite(activity);
            setPendingFavoriteId(activity.id);

            try {
                if (isFavorite) {
                    await apiPost(
                        `${ENDPOINTS.USER.REMOVE_ITEM_FAVORITE}/${target.item_type}/${target.item_id}`,
                    );
                    setFavoriteOverrides((prev) => ({ ...prev, [activity.id]: false }));
                    showToast({ message: 'Berhasil dihapus dari Berbintang', variant: 'success' });
                } else {
                    await apiPost(ENDPOINTS.USER.ITEM_FAVORITE, target);
                    setFavoriteOverrides((prev) => ({ ...prev, [activity.id]: true }));
                    showToast({ message: 'Berhasil ditambahkan ke Berbintang', variant: 'success' });
                }
            } catch {
                showToast({
                    message: isFavorite
                        ? 'Gagal menghapus dari Berbintang'
                        : 'Gagal menambahkan ke Berbintang',
                    variant: 'error',
                });
            } finally {
                setPendingFavoriteId(null);
            }
        },
        [activeActivity, resolveFavoriteTarget, resolveIsFavorite, showToast],
    );

    const handleFavoriteIconClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>, activity: Activity) => {
            event.preventDefault();
            event.stopPropagation();
            if (!resolveIsFavorite(activity) || pendingFavoriteId === activity.id) return;
            void handleToggleFavorite(activity);
        },
        [handleToggleFavorite, pendingFavoriteId, resolveIsFavorite],
    );

    const handleMoveToTrash = useCallback(async (targetActivity?: Activity | null) => {
        const activity = targetActivity ?? activeActivity;
        if (!activity) return;

        const target = resolveFavoriteTarget(activity);
        if (!target) {
            showToast({ message: 'Item aktivitas tidak valid', variant: 'error' });
            return;
        }

        setIsTrashLoading(true);
        try {
            await apiPost(ENDPOINTS.USER.ITEM_DELETE, target);
            setLocalActivities((prev) => prev.filter((item) => item.id !== activity.id));
            setFavoriteOverrides((prev) => {
                const next = { ...prev };
                delete next[activity.id];
                return next;
            });
            showToast({ message: 'Berhasil dipindahkan ke sampah', variant: 'success' });
        } catch {
            showToast({ message: 'Gagal memindahkan item aktivitas ke sampah', variant: 'error' });
        } finally {
            setIsTrashLoading(false);
        }
    }, [activeActivity, resolveFavoriteTarget, showToast]);

    const handleBulkRename = useCallback(() => {
        showToast({ message: 'Ganti nama massal belum didukung sepenuhnya', variant: 'info' });
        setSelectedItems([]);
    }, [setSelectedItems, showToast]);

    const handleBulkFavorite = useCallback(async () => {
        if (isProcessingBulk || selectedActivities.length === 0) return;

        const candidates = selectedActivities
            .filter((activity) => !resolveIsFavorite(activity))
            .map((activity) => ({ activityId: activity.id, target: resolveFavoriteTarget(activity) }))
            .filter((item): item is { activityId: string; target: { item_id: string; item_type: ActivityItemType } } => Boolean(item.target));

        if (candidates.length === 0) {
            showToast({ message: 'Semua item terpilih sudah berbintang', variant: 'info' });
            return;
        }

        setIsProcessingBulk(true);
        try {
            await apiPost(ENDPOINTS.USER.MULTIPLE_ITEM_FAVORITE, {
                items: candidates.map((item) => item.target),
            });

            setFavoriteOverrides((prev) => {
                const next = { ...prev };
                candidates.forEach((item) => {
                    next[item.activityId] = true;
                });
                return next;
            });

            showToast({
                message: `${candidates.length} item berhasil ditambahkan ke Berbintang`,
                variant: 'success',
            });
            setSelectedItems([]);
        } catch {
            showToast({ message: 'Gagal menambahkan item ke Berbintang', variant: 'error' });
        } finally {
            setIsProcessingBulk(false);
        }
    }, [isProcessingBulk, resolveFavoriteTarget, resolveIsFavorite, selectedActivities, setSelectedItems, showToast]);

    const handleBulkDownload = useCallback(() => {
        showToast({ message: `Mendownload ${selectedActivities.length} item...`, variant: 'info' });
        setSelectedItems([]);
    }, [selectedActivities.length, setSelectedItems, showToast]);

    const handleBulkMoveToTrash = useCallback(() => {
        setIsDeleteModalOpen(true);
    }, []);

    const confirmBulkDelete = useCallback(async () => {
        setIsProcessingBulk(true);
        try {
            const payloadItems = selectedActivities
                .map((activity) => resolveFavoriteTarget(activity))
                .filter((item): item is { item_id: string; item_type: ActivityItemType } => Boolean(item));

            if (payloadItems.length === 0) {
                showToast({ message: 'Tidak ada item valid untuk dipindahkan ke sampah', variant: 'error' });
                return;
            }

            await apiPost(ENDPOINTS.USER.MULTIPLE_ITEM_DELETE, { items: payloadItems });

            setLocalActivities((prev) => prev.filter((activity) => !selectedItems.includes(activity.id)));
            setSelectedItems([]);
            setIsDeleteModalOpen(false);
            showToast({
                message: `${payloadItems.length} item berhasil dipindahkan ke sampah`,
                variant: 'success',
            });
        } catch {
            showToast({ message: 'Gagal memindahkan item ke sampah', variant: 'error' });
        } finally {
            setIsProcessingBulk(false);
        }
    }, [resolveFavoriteTarget, selectedActivities, selectedItems, setSelectedItems, showToast]);

    const moreActions = useMemo<DropdownMenuItem[]>(
        () => [
            {
                label: 'Buka item',
                icon: <Eye className="h-4 w-4" />,
                onClick: () => {
                    if (!activeActivity) return;
                    void handleOpenActivity(activeActivity);
                },
            },
            {
                label: activeActivityIsFavorite ? 'Hapus dari Berbintang' : 'Tambahkan ke Berbintang',
                icon: activeActivityIsFavorite ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />,
                onClick: () => {
                    void handleToggleFavorite();
                },
                hasDivider: true,
                className: pendingFavoriteId ? 'pointer-events-none opacity-60' : '',
            },
            {
                label: 'Pindahkan ke sampah',
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => {
                    void handleMoveToTrash();
                },
                className: isTrashLoading ? 'pointer-events-none opacity-60' : '',
            },
        ],
        [
            activeActivity,
            activeActivityIsFavorite,
            handleMoveToTrash,
            handleOpenActivity,
            handleToggleFavorite,
            isTrashLoading,
            pendingFavoriteId,
        ],
    );

    return (
        <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Aktivitas</h3>
            </div>

            <FilterTabs
                tabs={[
                    { id: 'recent', label: 'Baru di tambahkan', icon: Clock },
                    { id: 'favorite', label: 'Favorite', icon: Star },
                ]}
                activeTab={activeTab}
                onChange={(id) => {
                    setSelectedItems([]);
                    setPage(1);
                    setActiveTab(id as 'recent' | 'favorite');
                }}
            />

            <div className="min-h-[300px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="py-24 text-center text-gray-500 animate-pulse">Memuat aktivitas...</div>
                ) : error ? (
                    <div className="px-4 py-6 text-center text-sm text-red-600">{error}</div>
                ) : filteredActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="mb-4 rounded-full bg-gray-50 p-4">
                            <Folder className="h-12 w-12 fill-gray-200 text-gray-300" />
                        </div>
                        <h4 className="mb-1 font-semibold text-gray-900">
                            {activeTab === 'favorite'
                                ? 'Belum ada aktivitas berbintang'
                                : 'Belum ada aktivitas arsip dokumen'}
                        </h4>
                        <p className="text-sm text-gray-500">
                            {activeTab === 'favorite'
                                ? 'Aktivitas yang Anda bintangi akan muncul di sini'
                                : 'Aktivitas dokumen atau folder yang Anda akses akan muncul di sini'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="w-4 p-4">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-[#8B7355] focus:ring-2 focus:ring-[#8B7355]"
                                                checked={isAllSelected && filteredActivities.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                        <SortableHeader label="Nama Perusahaan" />
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                        <SortableHeader label={clientHeaderLabel} />
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                        <SortableHeader label="Layanan" />
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                        <SortableHeader label="Author" />
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                        <SortableHeader label="Dimodifikasi" />
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                        <SortableHeader label="Status" />
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedItems.map((activity) => {
                                    const isFavorite = resolveIsFavorite(activity);
                                    const isNavigating = navigatingItemId === activity.id;
                                    const isFavoritePending = pendingFavoriteId === activity.id;

                                    return (
                                        <tr
                                            key={activity.id}
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`Buka ${activity.companyName}`}
                                            className={`group transition-colors ${isNavigating ? 'cursor-progress opacity-70' : 'cursor-pointer hover:bg-gray-50'}`}
                                            onClick={() => {
                                                void handleOpenActivity(activity);
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.currentTarget !== event.target) {
                                                    return;
                                                }
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault();
                                                    void handleOpenActivity(activity);
                                                }
                                            }}
                                        >
                                            <td className="w-4 p-4" onClick={(event) => event.stopPropagation()}>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-[#8B7355] focus:ring-2 focus:ring-[#8B7355]"
                                                        checked={isSelected(activity.id)}
                                                        onChange={() => toggleSelectItem(activity.id)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="min-w-[200px] px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
                                                        <Folder className="h-5 w-5 fill-[#FFB020] text-[#FFB020]" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-left font-medium text-gray-900">{activity.companyName}</span>
                                                        {isFavorite && (
                                                            <button
                                                                type="button"
                                                                onClick={(event) => handleFavoriteIconClick(event, activity)}
                                                                disabled={isFavoritePending}
                                                                title="Hapus dari Berbintang"
                                                                className={`rounded-full p-1 transition-colors ${
                                                                    isFavoritePending
                                                                        ? 'cursor-not-allowed opacity-60'
                                                                        : 'cursor-pointer hover:bg-gray-200'
                                                                }`}
                                                            >
                                                                <Star className="h-3.5 w-3.5 fill-gray-900 text-gray-900" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="min-w-[200px] px-6 py-4 text-gray-600">{activity.clientName}</td>
                                            <td className="min-w-[200px] px-6 py-4 text-gray-600">{activity.service}</td>
                                            <td className="min-w-[200px] px-6 py-4 text-gray-600">{activity.author}</td>
                                            <td className="min-w-[200px] px-6 py-4 text-gray-600">{activity.modifiedDate}</td>
                                            <td className="min-w-[200px] px-6 py-4">
                                                <StatusBadge status={activity.status} />
                                            </td>
                                            <td className="min-w-[120px] px-6 py-4 text-gray-600" onClick={(event) => event.stopPropagation()}>
                                                <button
                                                    type="button"
                                                    onClick={(event) => openDropdown(event, activity.id)}
                                                    className={`rounded-lg p-1 transition-colors ${triggerClass} ${
                                                        isOpen(activity.id)
                                                            ? 'bg-gray-100 text-gray-600'
                                                            : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                                                    }`}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {filteredActivities.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalItems={totalItems}
                />
            )}

            <DropdownMenu
                dropdown={activeDropdown}
                menuClass={menuClass}
                items={moreActions}
                onClose={closeDropdown}
                widthClass="w-60"
            />
            <Toast toast={toast} onClose={hideToast} position="bottom-left" />

            {hasSelectedItems && (
                <BulkActionToast
                    onRename={handleBulkRename}
                    onToggleFavorite={handleBulkFavorite}
                    onDownload={handleBulkDownload}
                    onMoveToTrash={handleBulkMoveToTrash}
                    onCancel={() => setSelectedItems([])}
                    disabled={isProcessingBulk}
                    statusLabel={`${selectedActivities.length} Terpilih`}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmBulkDelete}
                isProcessing={isProcessingBulk}
                title="Pindahkan ke sampah"
                description={
                    <span>
                        Apakah Anda yakin ingin memindahkan <b>{selectedActivities.length} item</b> yang dipilih ke tempat sampah? Tindakan ini dapat dibalikkan dari halaman sampah.
                    </span>
                }
                confirmText="Ya, Pindahkan"
                cancelText="Batal"
                variant="danger"
            />
        </div>
    );
}
