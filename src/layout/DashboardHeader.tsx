'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Bell, Menu, LogOut, Settings, X, ChevronRight, FileText, Folder } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSidebar } from '@/layout/providers/SidebarContext';
import { useAuthContext } from '@/features/auth/context/auth.context';
import { getUserRoleName } from '@/features/auth/utils/user';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useNotificationRedirect } from '@/features/notifications/hooks/useNotificationRedirect';
import { getStatusColor } from '@/features/dashboard/utils';
import { getInitials } from '@/shared/utils/initials';
import { apiGet, ApiResponse } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { Toast } from '@/shared/components/Toast';
import { useToast } from '@/shared/hooks/useToast';
import { FolderSidebarResponse, ServiceType } from '@/features/services/types';
import type { NotificationItem } from '@/features/notifications/types/notification.types';
import type { Service } from '@/features/dashboard/types/service.types';
import ConfirmDialog from '@/shared/components/ConfirmDialog';

type SearchFilter = 'ALL' | 'DOCUMENT' | 'FOLDER';
const SEARCH_FILTER_ORDER: SearchFilter[] = ['ALL', 'DOCUMENT', 'FOLDER'];
const MAX_NOTIFICATION_PREVIEW = 5;

interface GlobalSearchItem {
    id: string;
    title: string;
    service: string;
    lastUpdate: string;
    type: Exclude<SearchFilter, 'ALL'>;
    folderId: string | null;
    documentId: string | null;
    parent: string;
}

interface GlobalSearchApiItem {
    folder_id: string | null;
    document_id: string | null;
    type: Exclude<SearchFilter, 'ALL'>;
    name: string;
    parent: string;
    updated_at: string;
}

interface GlobalSearchResponse {
    message: string;
    data: GlobalSearchApiItem[] | { data?: GlobalSearchApiItem[] } | null;
}

interface ServicesResponse {
    message: string;
    data: Service[] | { data?: Service[] } | null;
}

interface ServiceTypesResponse {
    message: string;
    data: ServiceType[] | { data?: ServiceType[] } | null;
}

const normalizeNotificationStatus = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, '_');

const toStatusColorValue = (value: string) => {
    const normalizedStatus = normalizeNotificationStatus(value);

    if (normalizedStatus === 'dalam_proses') return 'proses';
    if (normalizedStatus === 'terutunda' || normalizedStatus === 'tertunda') return 'terjeda';

    return normalizedStatus;
};

const formatStatusLabel = (value: string) => {
    const normalizedStatus = normalizeNotificationStatus(value);

    if (normalizedStatus === 'selesai') return 'Selesai';
    if (normalizedStatus === 'proses' || normalizedStatus === 'dalam_proses') return 'Proses';
    if (normalizedStatus === 'tertunda' || normalizedStatus === 'terjeda' || normalizedStatus === 'terutunda') {
        return 'Tertunda';
    }

    return value
        .trim()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeText = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, ' ');

const toSlug = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

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

const getGlobalSearchItems = (
    payload: GlobalSearchResponse['data'],
): GlobalSearchApiItem[] => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
        return payload.data;
    }

    return [];
};

const getServicesPayload = (payload: ServicesResponse['data']): Service[] => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
        return payload.data;
    }

    return [];
};

const getServiceTypesPayload = (payload: ServiceTypesResponse['data']): ServiceType[] => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
        return payload.data;
    }

    return [];
};

const getServiceTypeId = (type: ServiceType): string => {
    const typedValue = type as ServiceType & {
        tipe_layanan_id?: string | number;
        type_id?: string | number;
        id?: string | number;
    };

    const rawId = typedValue.id ?? typedValue.tipe_layanan_id ?? typedValue.type_id;
    return rawId == null ? '' : String(rawId);
};

export function DashboardHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const { toggle, services } = useSidebar();
    const { user, logout } = useAuthContext();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearchFilter, setActiveSearchFilter] = useState<SearchFilter>('ALL');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState<GlobalSearchItem[]>([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [navigatingSearchItemId, setNavigatingSearchItemId] = useState<string | null>(null);
    const [highlightedSearchIndex, setHighlightedSearchIndex] = useState(-1);
    const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
    const [popUpLogoutAccount, setPopUpLogoutAccount] = useState(false);
    const {
        notifications,
        isLoading: isNotificationLoading,
        error: notificationError,
        totalNotRead,
        fetchNotifications,
        markAllAsRead,
        markAsRead,
    } = useNotifications({
        page: 1,
        limit: 10,
        search: '',
        fallbackActorName: user?.name,
        autoFetch: true,
    });
    const { toast, showToast, hideToast } = useToast();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchResultListRef = useRef<HTMLDivElement>(null);
    const searchRequestIdRef = useRef(0);
    const serviceTypesCacheRef = useRef<Record<string, ServiceType[]>>({});
    const searchScopeTypeIdCacheRef = useRef<Record<string, string | null>>({});
    const folderRouteCacheRef = useRef<Record<string, string>>({});
    const servicesCacheRef = useRef<Service[]>([]);
    const unreadCount = totalNotRead;
    const trimmedSearchQuery = searchQuery.trim();
    const isSearchOverlayVisible = isSearchFocused && trimmedSearchQuery.length > 0;
    const activeServiceRoute = useMemo(() => parseActiveServiceRoute(pathname), [pathname]);
    const { navigatingNotificationId, openNotification } = useNotificationRedirect({
        services,
        showToast,
        markAsRead,
    });
    const latestNotifications = useMemo(() => (
        notifications
            .map((notification, index) => {
                const parsedDate = Date.parse(notification.createdAt);
                return {
                    notification,
                    index,
                    timestamp: Number.isNaN(parsedDate) ? 0 : parsedDate,
                };
            })
            .sort((a, b) => {
                if (a.timestamp === b.timestamp) {
                    return a.index - b.index;
                }
                return b.timestamp - a.timestamp;
            })
            .slice(0, MAX_NOTIFICATION_PREVIEW)
            .map((item) => item.notification)
    ), [notifications]);

    useEffect(() => {
        if (!trimmedSearchQuery) {
            setSearchResults([]);
            setSearchError(null);
            setIsSearchLoading(false);
            return;
        }

        const requestId = searchRequestIdRef.current + 1;
        searchRequestIdRef.current = requestId;
        setIsSearchLoading(true);
        setSearchError(null);

        const timeoutId = window.setTimeout(() => {
            void (async () => {
                try {
                    const scopedTypeId = await resolveScopedSearchTypeId();
                    const params = new URLSearchParams({
                        file_type: activeSearchFilter,
                        search: trimmedSearchQuery,
                    });
                    if (scopedTypeId) {
                        params.set('tipe_layanan_id', scopedTypeId);
                    }

                    const response = await apiGet<GlobalSearchResponse>(
                        `${ENDPOINTS.NOTARIS.FILE_SEARCH}?${params.toString()}`,
                    );

                    if (searchRequestIdRef.current !== requestId) {
                        return;
                    }

                    const items = getGlobalSearchItems(response.data);
                    const mappedResults = items.map((item, index) => {
                        const itemType: Exclude<SearchFilter, 'ALL'> =
                            item.type === 'DOCUMENT' ? 'DOCUMENT' : 'FOLDER';
                        return {
                            id: item.folder_id || item.document_id || `${itemType.toLowerCase()}-${index}`,
                            title: item.name,
                            service: item.parent || '-',
                            lastUpdate: item.updated_at || '-',
                            type: itemType,
                            folderId: item.folder_id,
                            documentId: item.document_id,
                            parent: item.parent || '',
                        };
                    });

                    setSearchResults(mappedResults);
                } catch (error) {
                    if (searchRequestIdRef.current !== requestId) {
                        return;
                    }

                    setSearchResults([]);
                    setSearchError(error instanceof Error ? error.message : 'Gagal memuat hasil pencarian');
                } finally {
                    if (searchRequestIdRef.current === requestId) {
                        setIsSearchLoading(false);
                    }
                }
            })();
        }, 250);

        return () => {
            window.clearTimeout(timeoutId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSearchFilter, activeServiceRoute, trimmedSearchQuery]);

    const filteredSearchItems = useMemo(() => {
        return searchResults.filter((item) => {
            const matchesType = activeSearchFilter === 'ALL' || item.type === activeSearchFilter;
            return matchesType;
        });
    }, [activeSearchFilter, searchResults]);

    useEffect(() => {
        if (!isSearchOverlayVisible || isSearchLoading || searchError || filteredSearchItems.length === 0) {
            setHighlightedSearchIndex(-1);
            return;
        }

        setHighlightedSearchIndex((prev) => {
            if (prev >= 0 && prev < filteredSearchItems.length) {
                return prev;
            }
            return 0;
        });
    }, [filteredSearchItems, isSearchLoading, isSearchOverlayVisible, searchError]);

    useEffect(() => {
        if (highlightedSearchIndex < 0) {
            return;
        }

        const activeItem = searchResultListRef.current?.querySelector<HTMLElement>(
            `[data-search-index="${highlightedSearchIndex}"]`,
        );
        activeItem?.scrollIntoView({ block: 'nearest' });
    }, [highlightedSearchIndex]);

    useClickOutside(dropdownRef, () => setIsDropdownOpen(false), isDropdownOpen);
    useClickOutside(notificationRef, () => setIsNotificationOpen(false), isNotificationOpen);
    useClickOutside(searchRef, () => setIsSearchFocused(false), isSearchOverlayVisible);
    const handleMarkAllRead = () => {
        void (async () => {
            setIsMarkingAllRead(true);
            try {
                await markAllAsRead();
                showToast({ message: 'Semua notifikasi ditandai sudah dibaca', variant: 'success' });
            } catch (error) {
                showToast({
                    message: error instanceof Error ? error.message : 'Gagal menandai notifikasi',
                    variant: 'error',
                });
            } finally {
                setIsMarkingAllRead(false);
            }
        })();
    };

    useEffect(() => {
        if (!isSearchOverlayVisible) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsSearchFocused(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isSearchOverlayVisible]);

    const fetchAvailableServices = async () => {
        if (services.length > 0) {
            servicesCacheRef.current = services;
            return services;
        }

        if (servicesCacheRef.current.length > 0) {
            return servicesCacheRef.current;
        }

        const response = await apiGet<ServicesResponse>(ENDPOINTS.USER.SERVICES);
        const normalizedServices = getServicesPayload(response.data);
        servicesCacheRef.current = normalizedServices;
        return normalizedServices;
    };

    const fetchServiceTypesByService = async (serviceId: string) => {
        const cached = serviceTypesCacheRef.current[serviceId];
        if (cached) {
            return cached;
        }

        const url = ENDPOINTS.USER.SERVICE_TYPES.replace(':serviceId', serviceId);
        const response = await apiGet<ApiResponse<ServiceType[]> | ServiceTypesResponse>(url);
        const serviceTypes = getServiceTypesPayload(response.data as ServiceTypesResponse['data']);
        serviceTypesCacheRef.current[serviceId] = serviceTypes;
        return serviceTypes;
    };

    const resolveScopedSearchTypeId = async () => {
        if (!activeServiceRoute) {
            return null;
        }

        const cacheKey = `${activeServiceRoute.serviceSlug}/${activeServiceRoute.typeSlug}`;
        if (cacheKey in searchScopeTypeIdCacheRef.current) {
            return searchScopeTypeIdCacheRef.current[cacheKey];
        }

        const availableServices = await fetchAvailableServices();
        const matchedService = availableServices.find(
            (service) => toSlug(service.name) === activeServiceRoute.serviceSlug,
        );

        if (!matchedService) {
            searchScopeTypeIdCacheRef.current[cacheKey] = null;
            return null;
        }

        const serviceTypes = await fetchServiceTypesByService(matchedService.id);
        const matchedType = serviceTypes.find(
            (type) => toSlug(type.name) === activeServiceRoute.typeSlug,
        );
        const resolvedTypeId = matchedType ? getServiceTypeId(matchedType) || null : null;

        searchScopeTypeIdCacheRef.current[cacheKey] = resolvedTypeId;
        return resolvedTypeId;
    };

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

    const resolveServiceAndTypeSlugs = async (typeNameCandidates: string[]) => {
        const normalizedCandidates = typeNameCandidates
            .map((name) => name.trim())
            .filter(Boolean);

        if (normalizedCandidates.length === 0) {
            return null;
        }

        const availableServices = await fetchAvailableServices();
        if (availableServices.length === 0) {
            return null;
        }

        for (const service of availableServices) {
            try {
                const serviceTypes = await fetchServiceTypesByService(service.id);
                const matchedType = serviceTypes.find((type) =>
                    normalizedCandidates.some((candidate) => isTypeNameMatch(type.name, candidate)),
                );

                if (matchedType) {
                    return {
                        serviceSlug: toSlug(service.name),
                        typeSlug: toSlug(matchedType.name),
                    };
                }
            } catch {
                continue;
            }
        }

        return null;
    };

    const resolveServiceAndTypeSlugsByTypeId = async (typeId?: string | null) => {
        if (!typeId?.trim()) {
            return null;
        }

        const availableServices = await fetchAvailableServices();
        if (availableServices.length === 0) {
            return null;
        }

        for (const service of availableServices) {
            try {
                const serviceTypes = await fetchServiceTypesByService(service.id);
                const matchedType = serviceTypes.find((type) => getServiceTypeId(type) === String(typeId));

                if (matchedType) {
                    return {
                        serviceSlug: toSlug(service.name),
                        typeSlug: toSlug(matchedType.name),
                    };
                }
            } catch {
                continue;
            }
        }

        return null;
    };

    const resolveFolderRoute = async (folderId: string, parentTypeName?: string) => {
        const cachedRoute = folderRouteCacheRef.current[folderId];
        if (cachedRoute) {
            return cachedRoute;
        }

        const activeRoute = parseActiveServiceRoute(pathname);
        if (activeRoute && parentTypeName && toSlug(parentTypeName) === activeRoute.typeSlug) {
            const contextualRoute = `/services/${activeRoute.serviceSlug}/${activeRoute.typeSlug}/${folderId}`;
            folderRouteCacheRef.current[folderId] = contextualRoute;
            return contextualRoute;
        }

        try {
            const url = ENDPOINTS.USER.DETAIL_FOLDER_SIDEBAR.replace(':folder_id', folderId);
            const detail = await apiGet<FolderSidebarResponse & { data?: Record<string, unknown> }>(url);
            const typedData = detail.data as {
                detail_folder?: { tipe_layanan?: string; tipe_layanan_id?: string };
                tipe_layanan?: string;
                tipe_layanan_id?: string;
            } | undefined;

            const typeId = typedData?.detail_folder?.tipe_layanan_id || typedData?.tipe_layanan_id;
            const resolvedByTypeId = await resolveServiceAndTypeSlugsByTypeId(typeId);
            if (resolvedByTypeId) {
                const route = `/services/${resolvedByTypeId.serviceSlug}/${resolvedByTypeId.typeSlug}/${folderId}`;
                folderRouteCacheRef.current[folderId] = route;
                return route;
            }

            const typeNameCandidates = [
                typedData?.detail_folder?.tipe_layanan,
                typedData?.tipe_layanan,
                parentTypeName,
            ]
                .filter((value): value is string => Boolean(value && value.trim()))
                .map((value) => value.trim());

            const resolvedSlugs = await resolveServiceAndTypeSlugs(typeNameCandidates);
            if (!resolvedSlugs) {
                if (activeRoute) {
                    const contextualRoute = `/services/${activeRoute.serviceSlug}/${activeRoute.typeSlug}/${folderId}`;
                    folderRouteCacheRef.current[folderId] = contextualRoute;
                    return contextualRoute;
                }
                return null;
            }

            const route = `/services/${resolvedSlugs.serviceSlug}/${resolvedSlugs.typeSlug}/${folderId}`;
            folderRouteCacheRef.current[folderId] = route;
            return route;
        } catch {
            if (activeRoute) {
                const contextualRoute = `/services/${activeRoute.serviceSlug}/${activeRoute.typeSlug}/${folderId}`;
                folderRouteCacheRef.current[folderId] = contextualRoute;
                return contextualRoute;
            }
            return null;
        }
    };

    const resolveFolderFromSearch = async (folderName: string, preferredFolderId?: string | null) => {
        const normalizedFolderName = folderName.trim();
        if (!normalizedFolderName) {
            return { folderId: null, parentTypeName: null as string | null };
        }

        const scopedTypeId = await resolveScopedSearchTypeId();
        const params = new URLSearchParams({
            file_type: 'FOLDER',
            search: normalizedFolderName,
        });
        if (scopedTypeId) {
            params.set('tipe_layanan_id', scopedTypeId);
        }
        const response = await apiGet<GlobalSearchResponse>(
            `${ENDPOINTS.NOTARIS.FILE_SEARCH}?${params.toString()}`,
        );
        const items = getGlobalSearchItems(response.data);
        const normalizedTarget = normalizeText(normalizedFolderName);
        const exactById = preferredFolderId
            ? items.find(
                (item) => item.type === 'FOLDER' && item.folder_id === preferredFolderId,
            )
            : null;

        const exactByName = items.find(
            (item) => item.type === 'FOLDER' && item.folder_id && normalizeText(item.name) === normalizedTarget,
        );

        const folderCandidates = items.filter((item) => item.type === 'FOLDER' && item.folder_id);
        const fallbackMatch = folderCandidates.length === 1 ? folderCandidates[0] : null;
        const resolvedMatch = exactById || exactByName || fallbackMatch;

        return {
            folderId: resolvedMatch?.folder_id || null,
            parentTypeName: resolvedMatch?.parent || null,
        };
    };

    const resolveFolderTypeNameById = async (folderId: string, folderName?: string | null) => {
        if (!folderId?.trim()) {
            return null;
        }

        const normalizedFolderName = folderName?.trim();
        if (normalizedFolderName) {
            const resolved = await resolveFolderFromSearch(normalizedFolderName, folderId);
            if (resolved.parentTypeName) {
                return resolved.parentTypeName;
            }
        }

        return null;
    };

    const handleSearchItemClick = async (item: GlobalSearchItem) => {
        if (navigatingSearchItemId) {
            return;
        }

        setNavigatingSearchItemId(item.id);
        setSearchError(null);

        try {
            let folderId = item.folderId;
            let parentTypeName: string | null =
                item.type === 'FOLDER' ? (item.parent || null) : null;

            if (!folderId && item.type === 'DOCUMENT') {
                const resolved = await resolveFolderFromSearch(item.parent);
                folderId = resolved.folderId;
                parentTypeName = resolved.parentTypeName;
            }

            if (folderId && !parentTypeName) {
                parentTypeName = await resolveFolderTypeNameById(folderId, item.type === 'FOLDER' ? item.title : item.parent);
            }

            if (!folderId) {
                setSearchError('Folder untuk item ini tidak ditemukan');
                return;
            }

            const route = await resolveFolderRoute(folderId, parentTypeName || undefined);
            if (!route) {
                setSearchError('Rute item ini belum bisa ditentukan');
                return;
            }

            setIsSearchFocused(false);
            setSearchQuery('');
            setActiveSearchFilter('ALL');
            router.push(route);
        } catch {
            setSearchError('Gagal membuka hasil pencarian');
        } finally {
            setNavigatingSearchItemId(null);
        }
    };

    const handleNotificationClick = (notification: NotificationItem) => {
        setIsNotificationOpen(false);
        void openNotification(notification);
    };

    const handleSearchClear = () => {
        setSearchQuery('');
        setIsSearchFocused(false);
        setActiveSearchFilter('ALL');
        setHighlightedSearchIndex(-1);
    };

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isSearchOverlayVisible) {
            return;
        }

        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            const activeIndex = SEARCH_FILTER_ORDER.indexOf(activeSearchFilter);
            const delta = event.key === 'ArrowRight' ? 1 : -1;
            const nextIndex = (activeIndex + delta + SEARCH_FILTER_ORDER.length) % SEARCH_FILTER_ORDER.length;
            setActiveSearchFilter(SEARCH_FILTER_ORDER[nextIndex]);
            return;
        }

        if (event.key === 'ArrowDown') {
            if (!filteredSearchItems.length) {
                return;
            }

            event.preventDefault();
            setHighlightedSearchIndex((prev) => (prev + 1) % filteredSearchItems.length);
            return;
        }

        if (event.key === 'ArrowUp') {
            if (!filteredSearchItems.length) {
                return;
            }

            event.preventDefault();
            setHighlightedSearchIndex((prev) => {
                if (prev <= 0) {
                    return filteredSearchItems.length - 1;
                }
                return prev - 1;
            });
            return;
        }

        if (event.key === 'Enter') {
            if (!filteredSearchItems.length || highlightedSearchIndex < 0) {
                return;
            }

            event.preventDefault();
            void handleSearchItemClick(filteredSearchItems[highlightedSearchIndex]);
        }
    };

    return (
        <>
            <header className="relative flex items-center gap-4">
            <button
                onClick={toggle}
                className="p-2 lg:hidden text-gray-600 hover:bg-gray-100 rounded-lg"
            >
                <Menu className="w-6 h-6" />
            </button>

            <div className="relative flex-1 min-w-0 max-w-2xl" ref={searchRef}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                    <Search className="w-6 h-6" />
                </div>
                <input
                    type="text"
                    placeholder="Cari file, folder, nomor akta, nama klien"
                    value={searchQuery}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => {
                        setIsSearchFocused(true);
                        setIsDropdownOpen(false);
                        setIsNotificationOpen(false);
                    }}
                    onChange={(event) => {
                        const nextQuery = event.target.value;
                        setSearchQuery(nextQuery);
                        if (!nextQuery.trim()) {
                            setActiveSearchFilter('ALL');
                        }
                        setIsSearchFocused(true);
                        setIsDropdownOpen(false);
                        setIsNotificationOpen(false);
                    }}
                    className={`w-full py-3 bg-white border placeholder:text-gray-400 rounded-2xl focus:outline-none focus:ring-2 text-black transition-all shadow-sm ${trimmedSearchQuery ? 'pl-14 pr-12 border-[#B39B7D] focus:ring-[#B39B7D]/40' : 'pl-12 pr-4 border-gray-200 focus:ring-[#B39B7D]'
                        }`}
                />
                {trimmedSearchQuery && (
                    <button
                        type="button"
                        onClick={handleSearchClear}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900 transition-colors"
                        aria-label="Hapus pencarian"
                    >
                        <X className="w-7 h-7" />
                    </button>
                )}

                {isSearchOverlayVisible && (
                    <div className="absolute left-0 top-[calc(100%+14px)] z-40 w-full">
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#F7F7F7] shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setActiveSearchFilter('ALL')}
                                        className={`inline-flex items-center rounded-2xl border px-5 py-2.5 text-sm font-medium transition-colors ${activeSearchFilter === 'ALL'
                                            ? 'border-[#7A6A53] bg-[#7A6A53] text-white'
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Semua
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveSearchFilter('DOCUMENT')}
                                        className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-medium transition-colors ${activeSearchFilter === 'DOCUMENT'
                                            ? 'border-[#7A6A53] bg-[#7A6A53] text-white'
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <FileText className="h-4 w-4" />
                                        Dokumen
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveSearchFilter('FOLDER')}
                                        className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-medium transition-colors ${activeSearchFilter === 'FOLDER'
                                            ? 'border-[#7A6A53] bg-[#7A6A53] text-white'
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Folder className="h-4 w-4" />
                                        Folder
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[58vh] overflow-y-auto p-4">
                                {isSearchLoading ? (
                                    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm text-gray-500">
                                        Memuat hasil pencarian...
                                    </div>
                                ) : searchError ? (
                                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
                                        {searchError}
                                    </div>
                                ) : filteredSearchItems.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm text-gray-500">
                                        Tidak ada hasil untuk <span className="font-semibold text-gray-700">{trimmedSearchQuery}</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2" ref={searchResultListRef}>
                                        {filteredSearchItems.map((item, index) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                data-search-index={index}
                                                onClick={() => void handleSearchItemClick(item)}
                                                onMouseEnter={() => setHighlightedSearchIndex(index)}
                                                disabled={Boolean(navigatingSearchItemId)}
                                                className={`w-full rounded-2xl px-4 py-3 text-left transition-colors ${
                                                    navigatingSearchItemId
                                                        ? 'cursor-not-allowed opacity-70'
                                                        : highlightedSearchIndex === index
                                                            ? 'bg-[#ECECEC]'
                                                            : 'hover:bg-[#ECECEC] cursor-pointer'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${highlightedSearchIndex === index ? 'bg-transparent' : 'bg-[#ECECEC]'
                                                        }`}>
                                                        {item.type === 'DOCUMENT' ? (
                                                            <FileText className="h-7 w-7 text-gray-700" />
                                                        ) : (
                                                            <Folder className="h-7 w-7 text-gray-700" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-semibold text-[#181C23]">{item.title}</p>
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {item.service} <span className="mx-2">•</span> {item.lastUpdate}
                                                        </p>
                                                        {navigatingSearchItemId === item.id && (
                                                            <p className="mt-1 text-xs font-medium text-[#7A6A53]">Membuka...</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4 ml-auto">
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => {
                            setIsNotificationOpen((prev) => {
                                const next = !prev;
                                if (next) {
                                    void fetchNotifications();
                                }
                                return next;
                            });
                            setIsDropdownOpen(false);
                        }}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors relative shadow-sm"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        )}
                    </button>

                    {isNotificationOpen && (
                        <div className="absolute right-0 top-[calc(100%+14px)] z-50 w-[min(92vw,620px)]">
                            <div className="absolute -top-3 right-8 sm:right-12 w-6 h-6 rotate-45 border-l border-t border-gray-200 bg-[#F7F7F7]"></div>
                            <div className="relative overflow-hidden border border-gray-200 rounded-2xl bg-[#F7F7F7] shadow-[0_18px_36px_rgba(0,0,0,0.15)]">
                                <div className="flex items-start justify-between border-b border-gray-200 px-6 pt-5 pb-4">
                                    <div>
                                        <h3 className="text-xl leading-tight font-semibold text-gray-800">Notifikasi</h3>
                                        <button
                                            onClick={handleMarkAllRead}
                                            disabled={unreadCount === 0 || isNotificationLoading || isMarkingAllRead}
                                            className="mt-5 inline-flex items-center gap-2.5 text-sm sm:text-base text-[#6E5F49] hover:text-[#5b4d39] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            Tandai semua dibaca
                                            <span className="min-w-8 h-7 px-2 rounded-md bg-[#7A6A53] text-white text-sm leading-7 text-center">
                                                {unreadCount}
                                            </span>
                                        </button>
                                    </div>
                                    <div className="flex flex-col items-center gap-6 pt-1">
                                        <button
                                            onClick={() => setIsNotificationOpen(false)}
                                            className="text-gray-700 hover:text-gray-900 transition-colors"
                                            aria-label="Tutup notifikasi"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                        <button
                                            className="text-gray-700 hover:text-gray-900 transition-colors"
                                            aria-label="Pengaturan notifikasi"
                                        >
                                            <Settings className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                <div className="max-h-[55vh] overflow-y-auto">
                                    {isNotificationLoading ? (
                                        <div className="px-8 py-10 text-center text-base text-gray-500">
                                            Memuat notifikasi...
                                        </div>
                                    ) : notificationError ? (
                                        <div className="px-8 py-10 text-center">
                                            <p className="text-base text-red-500">{notificationError}</p>
                                            <button
                                                onClick={() => void fetchNotifications()}
                                                className="mt-4 inline-flex rounded-lg bg-[#8A7A62] px-4 py-2 text-sm font-medium text-white hover:bg-[#75674F] transition-colors"
                                            >
                                                Coba lagi
                                            </button>
                                        </div>
                                    ) : latestNotifications.length === 0 ? (
                                        <div className="px-8 py-10 text-center text-base text-gray-500">
                                            Belum ada notifikasi
                                        </div>
                                    ) : (
                                        latestNotifications.map((notification) => (
                                            <button
                                                key={notification.id}
                                                type="button"
                                                onClick={() => handleNotificationClick(notification)}
                                                disabled={Boolean(navigatingNotificationId)}
                                                className={`flex w-full items-center gap-4 border-b border-gray-200 px-6 py-4 text-left transition-colors ${notification.unread ? 'bg-[#F4F2EF]' : 'bg-[#F7F7F7]'
                                                    } ${
                                                    navigatingNotificationId
                                                        ? 'cursor-not-allowed opacity-70'
                                                        : 'cursor-pointer hover:bg-[#EEEAE5]'
                                                    }`}
                                            >
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#89A1B5] to-[#3D4957] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                                                    {getInitials(notification.actor)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-base font-semibold text-[#2F343B]">
                                                        {notification.description}
                                                    </p>
                                                    <p className="mt-2 text-sm leading-normal text-gray-500">
                                                        {notification.createdAt} <span className="mx-2">•</span> {notification.actionLabel}
                                                    </p>
                                                    <div className="mt-3 inline-flex max-w-full items-center gap-2 text-sm leading-normal text-[#2F343B]">
                                                        {notification.objectType === 'DOCUMENT' ? (
                                                            <FileText className="w-5 h-5 shrink-0 text-red-500" />
                                                        ) : (
                                                            <Folder className="w-5 h-5 shrink-0 text-[#7A6A53]" />
                                                        )}
                                                        <span className="truncate">{notification.objectName}</span>
                                                    </div>
                                                    {notification.actionKey === 'update_status' && notification.objectUpdated && (
                                                        <div className="mt-2">
                                                            <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${getStatusColor(toStatusColorValue(notification.objectUpdated))}`}>
                                                                {formatStatusLabel(notification.objectUpdated)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                {notification.unread && (
                                                    <span className="w-3.5 h-3.5 rounded-full bg-red-400 shrink-0" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        setIsNotificationOpen(false);
                                        router.push('/notifications');
                                    }}
                                    className="w-full flex items-center justify-end gap-2 px-6 py-3.5 text-sm sm:text-base text-[#6E5F49] leading-normal hover:bg-[#EEEAE5] transition-colors"
                                >
                                    Lihat semua notifikasi
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => {
                            setIsDropdownOpen((prev) => !prev);
                            setIsNotificationOpen(false);
                        }}
                        className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200 shadow-sm hidden sm:block focus:outline-none focus:ring-2 focus:ring-[#B39B7D] focus:ring-offset-2 transition-all"
                    >
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                            {getInitials(user?.name)}
                        </div>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDropdownOpen(false);
                                    router.push('/profile');
                                }}
                                className="w-full px-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors"
                            >
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{getUserRoleName(user) || 'User'}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.email || 'email@example.com'}</p>
                            </button>
                            <button
                                onClick={() => setPopUpLogoutAccount(true)}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Keluar
                            </button>
                        </div>
                    )}
                </div>
            </div>
            </header>
            <Toast toast={toast} onClose={hideToast} position="bottom-left" />
            <ConfirmDialog
                isOpen={popUpLogoutAccount}
                title="Logout"
                message="Apakah anda yakin ingin keluar dari akun Anda?"
                confirmText="Keluar"
                cancelText="Batal"
                type="danger"
                onConfirm={() => {
                    logout();
                    setIsDropdownOpen(false);
                }}
                onCancel={() => setPopUpLogoutAccount(false)}
            />
        </>
    );
}
