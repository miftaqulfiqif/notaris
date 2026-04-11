'use client';

import { createPortal } from 'react-dom';
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useLayoutEffect,
    type MouseEvent,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    Download,
    Edit3,
    Info,
    Check,
    X,
    Star,
    StarOff,
    Folder,
    MoreVertical,
    Clock,
    Trash2,
} from 'lucide-react';
import Image from 'next/image';
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
import { ApiResponse, apiGet, apiPatch, apiPost } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { DropdownMenu } from '@/shared/components/DropdownMenu';
import { useDropdown, type DropdownState } from '@/shared/hooks/useDropdown';
import type { DropdownMenuItem } from '@/shared/components/DropdownMenu';
import { useSidebar } from '@/layout/providers/SidebarContext';
import type { FolderSidebarResponse, ServiceType } from '@/features/services/types';
import { FolderDetailOffcanvas } from '@/features/services/presentation/components/FolderDetailOffcanvas';
import folderIcon from '@/assets/icons/folder.png';
import ConfirmDialog from '@/shared/components/ConfirmDialog';

interface ActivitySectionProps {
    onSelectActivity?: (activity: Activity) => void;
    activities?: Activity[];
    dashboardActivities?: PaginatedActivities | null;
    isLoading?: boolean;
    error?: string | null;
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

type FolderStatusValue = 'selesai' | 'tertunda' | 'proses';
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

interface StatusOption {
    value: FolderStatusValue;
    label: string;
    activeClass: string;
    textClass: string;
    dotBorderClass: string;
    dotFillClass: string;
}

const STATUS_OPTIONS: StatusOption[] = [
    {
        value: 'selesai',
        label: 'Selesai',
        activeClass: 'bg-green-100',
        textClass: 'text-green-700',
        dotBorderClass: 'border-green-300',
        dotFillClass: 'bg-green-400',
    },
    {
        value: 'tertunda',
        label: 'Tertunda',
        activeClass: 'bg-red-100',
        textClass: 'text-red-700',
        dotBorderClass: 'border-red-300',
        dotFillClass: 'bg-red-500',
    },
    {
        value: 'proses',
        label: 'Proses',
        activeClass: 'bg-yellow-100',
        textClass: 'text-yellow-700',
        dotBorderClass: 'border-yellow-300',
        dotFillClass: 'bg-yellow-400',
    },
];

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

const resolveFolderIdFromActivity = (activity: Activity): string | null => {
    if (activity.folderId?.trim()) {
        return activity.folderId;
    }

    if (activity.itemType === 'FOLDER') {
        return activity.itemId?.trim() || activity.id;
    }

    return null;
};

const normalizeFolderStatus = (status: string): string => {
    const normalizedStatus = status.toLowerCase().trim();

    if (normalizedStatus === 'dalam_proses' || normalizedStatus === 'dalam proses') {
        return 'proses';
    }

    if (normalizedStatus === 'terutunda' || normalizedStatus === 'terjeda') {
        return 'tertunda';
    }

    return normalizedStatus;
};

const toActivityStatus = (
    ...statuses: Array<string | null | undefined>
): ActivityStatus => {
    for (const status of statuses) {
        if (!status) continue;

        const normalizedStatus = normalizeFolderStatus(status);
        if (normalizedStatus === 'selesai') return 'Selesai';
        if (normalizedStatus === 'proses') return 'Proses';
        if (normalizedStatus === 'tertunda') return 'Tertunda';
    }

    return 'Proses';
};

const toFolderStatusValue = (status: string): FolderStatusValue | null => {
    const normalizedStatus = normalizeFolderStatus(status);

    if (STATUS_OPTIONS.some((option) => option.value === normalizedStatus)) {
        return normalizedStatus as FolderStatusValue;
    }

    return null;
};

const toStatusBadgeLabel = (status: string): string => {
    const value = toFolderStatusValue(status);
    const option = STATUS_OPTIONS.find((candidate) => candidate.value === value);
    return option?.label || status;
};

interface ActivityStatusPopoverProps {
    dropdown: DropdownState<string> | null;
    menuClass: string;
    activeStatus: FolderStatusValue | null;
    isLoading: boolean;
    onSelect: (status: FolderStatusValue) => void;
    onClose: () => void;
}

function ActivityStatusPopover({
    dropdown,
    menuClass,
    activeStatus,
    isLoading,
    onSelect,
    onClose,
}: ActivityStatusPopoverProps) {
    const menuRef = useRef<HTMLDivElement | null>(null);

    const repositionMenu = useCallback(() => {
        if (!dropdown) return;

        const menuElement = menuRef.current;
        if (!menuElement) return;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const menuWidth = menuElement.offsetWidth;
        const menuHeight = menuElement.offsetHeight;
        const viewportPadding = 8;

        const initialLeft = viewportWidth - dropdown.right - menuWidth;
        const minLeft = viewportPadding;
        const maxLeft = Math.max(viewportPadding, viewportWidth - menuWidth - viewportPadding);
        const clampedLeft = Math.min(Math.max(initialLeft, minLeft), maxLeft);
        const clampedRight = viewportWidth - clampedLeft - menuWidth;

        const minTop = viewportPadding;
        const maxTop = Math.max(viewportPadding, viewportHeight - menuHeight - viewportPadding);
        const clampedTop = Math.min(Math.max(dropdown.top, minTop), maxTop);

        menuElement.style.top = `${clampedTop}px`;
        menuElement.style.right = `${clampedRight}px`;
    }, [dropdown]);

    useLayoutEffect(() => {
        repositionMenu();
    }, [repositionMenu, activeStatus]);

    useEffect(() => {
        function handleResize() {
            repositionMenu();
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [repositionMenu]);

    if (!dropdown || typeof document === 'undefined') return null;

    return createPortal(
        <div
            ref={menuRef}
            className={`fixed z-50 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-xl ${menuClass} animate-in fade-in zoom-in-95 duration-100`}
            style={{
                top: dropdown.top,
                right: dropdown.right,
            }}
            onClick={(event) => event.stopPropagation()}
        >
            <div className="space-y-1">
                {STATUS_OPTIONS.map((option) => {
                    const isActive = option.value === activeStatus;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            disabled={isLoading}
                            onClick={() => {
                                onClose();
                                onSelect(option.value);
                            }}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                                isLoading
                                    ? 'cursor-not-allowed opacity-60'
                                    : isActive
                                        ? `${option.activeClass} ${option.textClass} cursor-pointer`
                                        : 'cursor-pointer text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <span
                                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${option.dotBorderClass}`}
                            >
                                <span
                                    className={`h-3 w-3 rounded-full ${
                                        isActive ? option.dotFillClass : 'bg-transparent'
                                    }`}
                                />
                            </span>
                            <span className="flex-1 text-base font-medium">{option.label}</span>
                            {isActive && <Check className={`h-4 w-4 ${option.textClass}`} />}
                        </button>
                    );
                })}
            </div>
        </div>,
        document.body,
    );
}

export function ActivitySection({
    onSelectActivity,
    activities,
    dashboardActivities,
    isLoading = false,
    error,
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
    const {
        activeDropdown: activeStatusDropdown,
        openDropdown: openStatusDropdown,
        closeDropdown: closeStatusDropdown,
        isOpen: isStatusOpen,
        triggerClass: statusTriggerClass,
        menuClass: statusMenuClass,
    } = useDropdown<string>({
        triggerClass: 'activity-table-status-trigger',
        menuClass: 'activity-table-status-menu',
    });
    const {
        activeDropdown: activeBulkStatusDropdown,
        openDropdown: openBulkStatusDropdown,
        closeDropdown: closeBulkStatusDropdown,
        menuClass: bulkStatusMenuClass,
    } = useDropdown<string>({
        triggerClass: 'activity-table-bulk-status-trigger',
        menuClass: 'activity-table-bulk-status-menu',
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
                const detailStatus = typeof act.detail_status === 'string'
                    ? act.detail_status
                    : act.detail_status?.status;

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
                    status: toActivityStatus(
                        act.status,
                        act.object_status,
                        act.status_folder,
                        act.folder_status,
                        detailStatus,
                    ),
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
    const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
    const [updatingStatusActivityId, setUpdatingStatusActivityId] = useState<string | null>(null);
    const [renameTarget, setRenameTarget] = useState<{ activityId: string; folderId: string; name: string } | null>(null);
    const [renameFolderName, setRenameFolderName] = useState('');
    const [renameError, setRenameError] = useState<string | null>(null);
    const [isRenamingFolder, setIsRenamingFolder] = useState(false);
    const [detailSidebarFolder, setDetailSidebarFolder] = useState<{ id: string; name: string } | null>(null);
    const [sortField, setSortField] = useState<ActivitySortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [popUpDeleteFolder, setPopUpDeleteFolder] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);

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
        setStatusOverrides({});
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
                const leftStatus = (statusOverrides[left.id] ?? left.status).toLowerCase().trim();
                const rightStatus = (statusOverrides[right.id] ?? right.status).toLowerCase().trim();
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
    }, [filteredActivities, sortDirection, sortField, statusOverrides]);

    const {
        selectedItems,
        setSelectedItems,
        toggleSelectAll,
        toggleSelectItem,
        isSelected,
        isAllSelected,
    } = useSelection({ items: sortedActivities, itemIdKey: 'id' });

    const selectedActivities = useMemo(
        () => sortedActivities.filter((activity) => selectedItems.includes(activity.id)),
        [selectedItems, sortedActivities],
    );

    const hasSelectedItems = selectedActivities.length > 0;
    const selectedFolderActivities = useMemo(
        () => selectedActivities.filter((activity) => Boolean(resolveFolderIdFromActivity(activity))),
        [selectedActivities],
    );
    const canBulkRename = selectedFolderActivities.length === 1 && selectedActivities.length === 1;
    const bulkFavoriteLabel = selectedActivities.length > 0 && selectedActivities.every((activity) => resolveIsFavorite(activity))
        ? 'Hapus dari berbintang'
        : 'Tambahkan ke berbintang';

    useEffect(() => {
        setSelectedItems((prev) =>
            prev.filter((selectedId) => sortedActivities.some((activity) => activity.id === selectedId)),
        );
    }, [setSelectedItems, sortedActivities]);

    useEffect(() => {
        if (!hasSelectedItems) {
            closeBulkStatusDropdown();
        }
    }, [closeBulkStatusDropdown, hasSelectedItems]);

    useEffect(() => {
        const existingIds = new Set(localActivities.map((activity) => activity.id));
        setStatusOverrides((prev) => {
            const filteredEntries = Object.entries(prev).filter(([activityId]) => existingIds.has(activityId));

            if (filteredEntries.length === Object.keys(prev).length) {
                return prev;
            }

            return Object.fromEntries(filteredEntries);
        });
    }, [localActivities]);

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
        return paginatedItems.find((item) => item.id === activeDropdown.id)
            || sortedActivities.find((item) => item.id === activeDropdown.id)
            || null;
    }, [activeDropdown, paginatedItems, sortedActivities]);

    const activeStatusActivity = useMemo(() => {
        if (!activeStatusDropdown) return null;
        return paginatedItems.find((item) => item.id === activeStatusDropdown.id)
            || sortedActivities.find((item) => item.id === activeStatusDropdown.id)
            || null;
    }, [activeStatusDropdown, paginatedItems, sortedActivities]);

    const resolveActivityStatus = useCallback(
        (activity: Activity) => statusOverrides[activity.id] ?? activity.status,
        [statusOverrides],
    );

    const activeActivityIsFavorite = useMemo(() => {
        if (!activeActivity) return false;
        return resolveIsFavorite(activeActivity);
    }, [activeActivity, resolveIsFavorite]);

    const activeActivityFolderId = useMemo(
        () => (activeActivity ? resolveFolderIdFromActivity(activeActivity) : null),
        [activeActivity],
    );
    const activeStatusFolderId = useMemo(
        () => (activeStatusActivity ? resolveFolderIdFromActivity(activeStatusActivity) : null),
        [activeStatusActivity],
    );

    const activeStatusValue = useMemo(() => {
        if (!activeStatusActivity) return null;
        return toFolderStatusValue(resolveActivityStatus(activeStatusActivity));
    }, [activeStatusActivity, resolveActivityStatus]);

    const activeBulkStatus = useMemo<FolderStatusValue | null>(() => {
        if (selectedFolderActivities.length === 0) return null;

        const normalizedStatuses = selectedFolderActivities
            .map((activity) => toFolderStatusValue(resolveActivityStatus(activity)))
            .filter((status): status is FolderStatusValue => Boolean(status));

        if (normalizedStatuses.length !== selectedFolderActivities.length) {
            return null;
        }

        const [firstStatus] = normalizedStatuses;
        if (normalizedStatuses.every((status) => status === firstStatus)) {
            return firstStatus;
        }

        return null;
    }, [resolveActivityStatus, selectedFolderActivities]);

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

    const downloadFolderById = useCallback(async (folderId: string, folderName: string) => {
        const downloadUrl = ENDPOINTS.USER.FOLDER_DOWNLOAD.replace(':folder_id', folderId);
        try {
            const response = await fetch(downloadUrl, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                let errorMessage = `Request failed with status ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData?.errors || errorData?.message || errorMessage;
                } catch {
                    // Ignore JSON parse errors and keep fallback.
                }

                if (errorMessage === 'Folder is empty') {
                    errorMessage = 'Folder kosong, tidak ada file untuk diunduh';
                }
                throw new Error(errorMessage);
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const contentDisposition = response.headers.get('content-disposition');
            const fileNameMatch = contentDisposition?.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
            const fallbackName = `${folderName || 'folder'}.zip`;
            const resolvedFileName = fileNameMatch?.[1]
                ? decodeURIComponent(fileNameMatch[1].replace(/["']/g, '').trim())
                : fallbackName;

            link.href = objectUrl;
            link.download = resolvedFileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(objectUrl);
            showToast({ message: 'Download folder dimulai', variant: 'success' });
        } catch (error) {
            showToast({
                message: error instanceof Error ? error.message : 'Gagal mengunduh folder',
                variant: 'error',
            });
        }
    }, [showToast]);

    const handleDownloadFromMenu = useCallback(() => {
        if (!activeActivity) return;
        if (!activeActivityFolderId) {
            showToast({ message: 'Item ini tidak memiliki folder untuk diunduh', variant: 'error' });
            return;
        }
        void downloadFolderById(activeActivityFolderId, activeActivity.companyName);
    }, [activeActivity, activeActivityFolderId, downloadFolderById, showToast]);

    const handleOpenDetailFromMenu = useCallback(() => {
        if (!activeActivity) return;
        if (!activeActivityFolderId) {
            showToast({ message: 'Item ini tidak memiliki folder untuk detail', variant: 'error' });
            return;
        }

        setDetailSidebarFolder({
            id: activeActivityFolderId,
            name: activeActivity.companyName,
        });
    }, [activeActivity, activeActivityFolderId, showToast]);

    const openRenameModalForActivity = useCallback((activity: Activity) => {
        const folderId = resolveFolderIdFromActivity(activity);
        if (!folderId || isRenamingFolder) return;

        setRenameTarget({
            activityId: activity.id,
            folderId,
            name: activity.companyName,
        });
        setRenameFolderName(activity.companyName);
        setRenameError(null);
    }, [isRenamingFolder]);

    const closeRenameModal = useCallback(() => {
        if (isRenamingFolder) return;
        setRenameTarget(null);
        setRenameFolderName('');
        setRenameError(null);
    }, [isRenamingFolder]);

    const handleRenameFolder = useCallback(async () => {
        if (!renameTarget || isRenamingFolder) return;

        const normalizedFolderName = renameFolderName.trim();
        if (!normalizedFolderName) {
            setRenameError('Nama folder wajib diisi');
            return;
        }

        setIsRenamingFolder(true);
        setRenameError(null);
        try {
            const url = ENDPOINTS.USER.RENAME_FOLDER.replace(':folder_id', renameTarget.folderId);
            await apiPatch(url, { folder_name: normalizedFolderName });

            setLocalActivities((prev) =>
                prev.map((activity) =>
                    activity.id === renameTarget.activityId
                        ? { ...activity, companyName: normalizedFolderName }
                        : activity,
                ),
            );
            setRenameTarget(null);
            setRenameFolderName('');
            showToast({ message: 'Nama folder berhasil diperbarui', variant: 'success' });
        } catch (error) {
            setRenameError(error instanceof Error ? error.message : 'Gagal mengganti nama folder');
        } finally {
            setIsRenamingFolder(false);
        }
    }, [isRenamingFolder, renameFolderName, renameTarget, showToast]);

    const handleRenameFromMenu = useCallback(() => {
        if (!activeActivity) return;
        if (!activeActivityFolderId) {
            showToast({ message: 'Item ini tidak mendukung ganti nama folder', variant: 'error' });
            return;
        }
        openRenameModalForActivity(activeActivity);
    }, [activeActivity, activeActivityFolderId, openRenameModalForActivity, showToast]);

    const handleOpenActionDropdown = useCallback(
        (event: MouseEvent<HTMLButtonElement>, activityId: string) => {
            event.preventDefault();
            event.stopPropagation();
            closeStatusDropdown();
            closeBulkStatusDropdown();
            openDropdown(event, activityId);
        },
        [closeBulkStatusDropdown, closeStatusDropdown, openDropdown],
    );

    const handleOpenStatusDropdown = useCallback(
        (event: MouseEvent<HTMLButtonElement>, activityId: string) => {
            event.preventDefault();
            event.stopPropagation();
            closeDropdown();
            closeBulkStatusDropdown();
            openStatusDropdown(event, activityId);
        },
        [closeBulkStatusDropdown, closeDropdown, openStatusDropdown],
    );

    const handleUpdateActivityStatus = useCallback(async (nextStatus: FolderStatusValue) => {
        if (!activeStatusActivity || !activeStatusFolderId) {
            showToast({ message: 'Item ini tidak mendukung ubah status', variant: 'error' });
            return;
        }

        const activityId = activeStatusActivity.id;
        const currentStatus = toFolderStatusValue(resolveActivityStatus(activeStatusActivity));
        if (currentStatus === nextStatus) return;

        setUpdatingStatusActivityId(activityId);
        try {
            await apiPatch(ENDPOINTS.USER.UPDATE_STATUS_FOLDER, {
                folder_id: activeStatusFolderId,
                status: nextStatus,
            });

            const statusLabel = STATUS_OPTIONS.find((option) => option.value === nextStatus)?.label || nextStatus;
            setStatusOverrides((prev) => ({ ...prev, [activityId]: statusLabel }));
            setLocalActivities((prev) =>
                prev.map((activity) =>
                    activity.id === activityId
                        ? { ...activity, status: statusLabel as ActivityStatus }
                        : activity,
                ),
            );
            showToast({ message: 'Status folder berhasil diperbarui', variant: 'success' });
        } catch {
            showToast({ message: 'Gagal memperbarui status folder', variant: 'error' });
        } finally {
            setUpdatingStatusActivityId((prev) => (prev === activityId ? null : prev));
        }
    }, [activeStatusActivity, activeStatusFolderId, resolveActivityStatus, showToast]);

    const handleOpenBulkStatusDropdown = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            closeDropdown();
            closeStatusDropdown();
            openBulkStatusDropdown(event, 'bulk-status');
        },
        [closeDropdown, closeStatusDropdown, openBulkStatusDropdown],
    );

    const handleBulkRename = useCallback(() => {
        if (!canBulkRename) return;
        const target = selectedFolderActivities[0];
        if (!target) return;
        closeBulkStatusDropdown();
        openRenameModalForActivity(target);
    }, [canBulkRename, closeBulkStatusDropdown, openRenameModalForActivity, selectedFolderActivities]);

    const handleBulkFavorite = useCallback(async () => {
        if (isProcessingBulk || selectedActivities.length === 0) return;

        const candidates = selectedActivities
            .map((activity) => ({ activityId: activity.id, target: resolveFavoriteTarget(activity) }))
            .filter((item): item is { activityId: string; target: { item_id: string; item_type: ActivityItemType } } => Boolean(item.target));

        if (candidates.length === 0) {
            showToast({ message: 'Tidak ada item valid untuk proses berbintang', variant: 'error' });
            return;
        }

        const shouldRemoveFromFavorite = selectedActivities.every((activity) => resolveIsFavorite(activity));

        setIsProcessingBulk(true);
        try {
            if (shouldRemoveFromFavorite) {
                await apiPost(ENDPOINTS.USER.MULTIPLE_REMOVE_ITEM_FAVORITE, {
                    items: candidates.map((item) => item.target),
                });
            } else {
                await apiPost(ENDPOINTS.USER.MULTIPLE_ITEM_FAVORITE, {
                    items: candidates.map((item) => item.target),
                });
            }

            setFavoriteOverrides((prev) => {
                const next = { ...prev };
                candidates.forEach((item) => {
                    next[item.activityId] = !shouldRemoveFromFavorite;
                });
                return next;
            });

            showToast({
                message: shouldRemoveFromFavorite
                    ? `${candidates.length} item berhasil dihapus dari berbintang`
                    : `${candidates.length} item berhasil ditambahkan ke berbintang`,
                variant: 'success',
            });
            setSelectedItems([]);
        } catch {
            showToast({
                message: shouldRemoveFromFavorite
                    ? 'Gagal menghapus item dari berbintang'
                    : 'Gagal menambahkan item ke berbintang',
                variant: 'error',
            });
        } finally {
            setIsProcessingBulk(false);
        }
    }, [isProcessingBulk, resolveFavoriteTarget, resolveIsFavorite, selectedActivities, setSelectedItems, showToast]);

    const handleBulkDownload = useCallback(() => {
        if (selectedActivities.length === 0) return;

        if (selectedActivities.length > 1) {
            showToast({
                message: `Download massal untuk ${selectedActivities.length} folder belum tersedia`,
                variant: 'info',
            });
            return;
        }

        const target = selectedActivities[0];
        if (!target) return;
        const folderId = resolveFolderIdFromActivity(target);
        if (!folderId) {
            showToast({ message: 'Item terpilih tidak memiliki folder untuk diunduh', variant: 'error' });
            return;
        }

        void downloadFolderById(folderId, target.companyName);
    }, [downloadFolderById, selectedActivities, showToast]);

    const handleBulkMoveToTrash = useCallback(() => {
        setIsDeleteModalOpen(true);
    }, []);

    const handleBulkUpdateStatus = useCallback(async (nextStatus: FolderStatusValue) => {
        if (selectedFolderActivities.length === 0 || isProcessingBulk) return;

        const activitiesToUpdate = selectedFolderActivities.filter(
            (activity) => toFolderStatusValue(resolveActivityStatus(activity)) !== nextStatus,
        );

        if (activitiesToUpdate.length === 0) return;

        setIsProcessingBulk(true);
        try {
            const updateResults = await Promise.allSettled(
                activitiesToUpdate.map((activity) => {
                    const folderId = resolveFolderIdFromActivity(activity);
                    if (!folderId) {
                        return Promise.reject(new Error('Folder id tidak ditemukan'));
                    }
                    return apiPatch(ENDPOINTS.USER.UPDATE_STATUS_FOLDER, {
                        folder_id: folderId,
                        status: nextStatus,
                    });
                }),
            );

            const successIds = activitiesToUpdate
                .filter((_, index) => updateResults[index]?.status === 'fulfilled')
                .map((activity) => activity.id);

            if (successIds.length > 0) {
                const statusLabel = STATUS_OPTIONS.find((option) => option.value === nextStatus)?.label || nextStatus;
                setStatusOverrides((prev) => {
                    const next = { ...prev };
                    successIds.forEach((id) => {
                        next[id] = statusLabel;
                    });
                    return next;
                });
                setLocalActivities((prev) =>
                    prev.map((activity) =>
                        successIds.includes(activity.id)
                            ? { ...activity, status: statusLabel as ActivityStatus }
                            : activity,
                    ),
                );
            }

            if (successIds.length === activitiesToUpdate.length) {
                showToast({
                    message: `Status ${activitiesToUpdate.length} folder berhasil diperbarui`,
                    variant: 'success',
                });
            } else if (successIds.length > 0) {
                showToast({
                    message: `Status ${successIds.length} dari ${activitiesToUpdate.length} folder berhasil diperbarui`,
                    variant: 'info',
                });
            } else {
                showToast({ message: 'Gagal memperbarui status pilihan', variant: 'error' });
            }
        } catch {
            showToast({ message: 'Gagal memperbarui status pilihan', variant: 'error' });
        } finally {
            setIsProcessingBulk(false);
        }
    }, [isProcessingBulk, resolveActivityStatus, selectedFolderActivities, showToast]);

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
                label: 'Download folder',
                icon: <Download className="h-4 w-4" />,
                onClick: handleDownloadFromMenu,
                className: !activeActivityFolderId ? 'pointer-events-none opacity-60' : '',
            },
            {
                label: 'Ganti nama',
                icon: <Edit3 className="h-4 w-4" />,
                onClick: handleRenameFromMenu,
                hasDivider: true,
                className: !activeActivityFolderId || isRenamingFolder ? 'pointer-events-none opacity-60' : '',
            },
            {
                label: 'Lihat Detail Folder',
                icon: <Info className="h-4 w-4" />,
                onClick: handleOpenDetailFromMenu,
                className: !activeActivityFolderId ? 'pointer-events-none opacity-60' : '',
            },
            {
                label: activeActivityIsFavorite ? 'Hapus dari berbintang' : 'Tambahkan ke berbintang',
                icon: activeActivityIsFavorite ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />,
                onClick: () => {
                    void handleToggleFavorite();
                },
                hasDivider: true,
                className: pendingFavoriteId ? 'pointer-events-none opacity-60' : '',
            },
            {
                label: 'Tambahkan ke sampah',
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => {
                    setDeleteTarget(activeActivity);
                    setPopUpDeleteFolder(true);
                },
                className: isTrashLoading ? 'pointer-events-none opacity-60' : '',
            },
        ],
        [
            activeActivity,
            activeActivityFolderId,
            activeActivityIsFavorite,
            handleDownloadFromMenu,
            handleOpenDetailFromMenu,
            handleRenameFromMenu,
            handleToggleFavorite,
            isRenamingFolder,
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
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedItems.map((activity) => {
                                    const isFavorite = resolveIsFavorite(activity);
                                    const isNavigating = navigatingItemId === activity.id;
                                    const isFavoritePending = pendingFavoriteId === activity.id;
                                    const folderId = resolveFolderIdFromActivity(activity);
                                    const resolvedStatus = toStatusBadgeLabel(resolveActivityStatus(activity));
                                    const isUpdatingStatus = updatingStatusActivityId === activity.id;
                                    const canEditStatus = Boolean(folderId);

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
                                                        <Image src={folderIcon} alt="Folder" width={20} height={20} className="h-5 w-5" />
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
                                            <td className="min-w-[200px] px-6 py-4 text-gray-600">{activity.service}</td>
                                            <td className="min-w-[200px] px-6 py-4 text-gray-600">{activity.author}</td>
                                            <td className="min-w-[200px] px-6 py-4 text-gray-600">{activity.modifiedDate}</td>
                                            <td className="min-w-[200px] px-6 py-4">
                                                {canEditStatus ? (
                                                    <button
                                                        type="button"
                                                        onClick={(event) => handleOpenStatusDropdown(event, activity.id)}
                                                        disabled={isUpdatingStatus}
                                                        className={`inline-flex rounded-md transition-opacity ${statusTriggerClass} ${
                                                            isStatusOpen(activity.id)
                                                                ? 'ring-2 ring-[#8B7355]/25 ring-offset-1'
                                                                : ''
                                                        } ${
                                                            isUpdatingStatus
                                                                ? 'cursor-not-allowed opacity-60'
                                                                : 'cursor-pointer hover:opacity-80'
                                                        }`}
                                                    >
                                                        <StatusBadge status={resolvedStatus} />
                                                    </button>
                                                ) : (
                                                    <StatusBadge status={resolvedStatus} />
                                                )}
                                            </td>
                                            <td className="min-w-[120px] px-6 py-4 text-gray-600" onClick={(event) => event.stopPropagation()}>
                                                <button
                                                    type="button"
                                                    onClick={(event) => handleOpenActionDropdown(event, activity.id)}
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
            <ActivityStatusPopover
                dropdown={activeStatusDropdown}
                menuClass={statusMenuClass}
                activeStatus={activeStatusValue}
                isLoading={Boolean(updatingStatusActivityId)}
                onSelect={(status) => {
                    void handleUpdateActivityStatus(status);
                }}
                onClose={closeStatusDropdown}
            />
            <ActivityStatusPopover
                dropdown={activeBulkStatusDropdown}
                menuClass={bulkStatusMenuClass}
                activeStatus={activeBulkStatus}
                isLoading={isProcessingBulk}
                onSelect={(status) => {
                    void handleBulkUpdateStatus(status);
                }}
                onClose={closeBulkStatusDropdown}
            />
            <Toast toast={toast} onClose={hideToast} position="bottom-left" />

            {hasSelectedItems && (
                <BulkActionToast
                    onRename={handleBulkRename}
                    onStatusClick={handleOpenBulkStatusDropdown}
                    onToggleFavorite={handleBulkFavorite}
                    onDownload={handleBulkDownload}
                    onMoveToTrash={handleBulkMoveToTrash}
                    onCancel={() => setSelectedItems([])}
                    favoriteLabel={bulkFavoriteLabel}
                    disabled={isProcessingBulk || isRenamingFolder}
                    showRename={canBulkRename}
                    statusDisabled={isProcessingBulk || isRenamingFolder || selectedFolderActivities.length === 0}
                />
            )}

            <FolderDetailOffcanvas
                folderId={detailSidebarFolder?.id ?? null}
                folderName={detailSidebarFolder?.name}
                onClose={() => setDetailSidebarFolder(null)}
            />

            {renameTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
                    onClick={closeRenameModal}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="rename-activity-folder-modal-title"
                        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <h2 id="rename-activity-folder-modal-title" className="text-lg font-semibold text-gray-900">
                                Ganti nama folder
                            </h2>
                            <button
                                type="button"
                                onClick={closeRenameModal}
                                disabled={isRenamingFolder}
                                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Tutup modal ganti nama folder"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            className="px-5 py-5"
                            onSubmit={(event) => {
                                event.preventDefault();
                                void handleRenameFolder();
                            }}
                        >
                            {renameError && (
                                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                                    {renameError}
                                </div>
                            )}

                            <label htmlFor="rename-activity-folder-name" className="mb-2 block text-sm font-medium text-gray-700">
                                Nama Folder <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="rename-activity-folder-name"
                                type="text"
                                value={renameFolderName}
                                onChange={(event) => {
                                    setRenameFolderName(event.target.value);
                                    if (renameError) {
                                        setRenameError(null);
                                    }
                                }}
                                placeholder="Masukkan nama folder"
                                disabled={isRenamingFolder}
                                autoFocus
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]"
                            />

                            <div className="mt-5 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeRenameModal}
                                    disabled={isRenamingFolder}
                                    className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isRenamingFolder || !renameFolderName.trim()}
                                    className="rounded-xl border border-[#7A6A53] bg-[#7A6A53] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#685942] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isRenamingFolder ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
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
            <ConfirmDialog
                isOpen={popUpDeleteFolder}
                title="Pindahkan ke Sampah"
                message="Apakah anda yakin ingin memindahkan folder ini ke sampah? Tindakan ini dapat dibalikkan dari halaman sampah."
                confirmText="Pindahkan"
                cancelText="Batal"
                type="danger"
                onConfirm={async () => {
                    if (!deleteTarget) return;
                    await handleMoveToTrash(deleteTarget);
                    setPopUpDeleteFolder(false);
                }}
                onCancel={() => setPopUpDeleteFolder(false)}
            />
        </div>
    );
}
