'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef, type MouseEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MoreVertical, Star, StarOff, ArrowUpDown, ArrowUp, ArrowDown, Folder } from 'lucide-react';
import { StarredItem, ItemType } from '@/features/dashboard/hooks/useStarredItems';
import { useSidebar } from '@/layout/providers/SidebarContext';
import { useSelection } from '@/shared/hooks/useSelection';
import { Pagination } from '@/shared/components/Pagination';
import { DropdownMenu } from '@/shared/components/DropdownMenu';
import { Toast } from '@/shared/components/Toast';
import { BulkActionToast } from '@/shared/components/BulkActionToast';
import type { DropdownMenuItem } from '@/shared/components/DropdownMenu';
import { useDropdown } from '@/shared/hooks/useDropdown';
import { useToast } from '@/shared/hooks/useToast';
import { apiGet, apiPost, type ApiResponse } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { FolderSidebarResponse, ServiceType } from '@/features/services/types';
import PDFIcon from '@/assets/icons/PDF.svg';
import FolderIcon from '@/assets/icons/folder.png';
import ServiceIcon from '@/assets/icons/service.png';

type SortField = 'name' | 'author' | 'date' | null;
type SortDirection = 'asc' | 'desc';

interface FileSearchItem {
    folder_id: string | null;
    document_id: string | null;
    type: 'DOCUMENT' | 'FOLDER';
    name: string;
    parent: string;
    updated_at: string;
}

interface FileSearchResponse {
    message: string;
    data: FileSearchItem[];
}

const normalizeText = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, ' ');

const toSlug = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

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

interface StarredTableProps {
    items: StarredItem[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    onPageChange: (page: number) => void;
    onRefresh?: () => void | Promise<void>;
}

export function StarredTable({
    items,
    isLoading,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    onPageChange,
    onRefresh,
}: StarredTableProps) {
    const router = useRouter();
    const { services } = useSidebar();
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
    const [pendingFavoriteId, setPendingFavoriteId] = useState<string | null>(null);
    const [isBulkFavoriteLoading, setIsBulkFavoriteLoading] = useState(false);
    const [navigatingItemId, setNavigatingItemId] = useState<string | null>(null);
    const { toast, showToast, hideToast } = useToast();
    const routeCacheRef = useRef<Record<string, string | null>>({});
    const serviceTypesCacheRef = useRef<Record<string, ServiceType[]>>({});
    const documentFolderCacheRef = useRef<Record<string, string | null>>({});
    const { activeDropdown, openDropdown, closeDropdown, isOpen, triggerClass, menuClass } =
        useDropdown<string>({
            triggerClass: 'starred-table-dropdown-trigger',
            menuClass: 'starred-table-dropdown-menu',
        });

    const sortedItems = useMemo(() => {
        if (!sortField) return items;

        return [...items].sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'name':
                    comparison = a.detail.item_name.localeCompare(b.detail.item_name);
                    break;
                case 'author':
                    comparison = a.detail.author.localeCompare(b.detail.author);
                    break;
                case 'date':
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [items, sortField, sortDirection]);

    const { selectedItems, setSelectedItems, toggleSelectAll, toggleSelectItem, isSelected, isAllSelected } = useSelection({
        items: sortedItems,
        itemIdKey: 'id',
    });

    const selectedStarredItems = useMemo(
        () => sortedItems.filter((item) => selectedItems.includes(item.id)),
        [selectedItems, sortedItems],
    );

    const hasSelectedItems = selectedStarredItems.length > 0;

    useEffect(() => {
        setSelectedItems((prev) =>
            prev.filter((selectedId) => sortedItems.some((item) => item.id === selectedId)),
        );
    }, [setSelectedItems, sortedItems]);

    const activeItem = useMemo(() => {
        if (!activeDropdown) return null;
        return sortedItems.find((item) => item.id === activeDropdown.id) ?? null;
    }, [activeDropdown, sortedItems]);

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
        async (typeNameCandidates: string[]) => {
            const normalizedCandidates = typeNameCandidates
                .map((name) => name.trim())
                .filter(Boolean);

            if (normalizedCandidates.length === 0 || services.length === 0) {
                return null;
            }

            for (const service of services) {
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

    const resolveItemRoute = useCallback(
        async (item: StarredItem) => {
            if (item.id in routeCacheRef.current) {
                return routeCacheRef.current[item.id];
            }

            let route: string | null = null;

            switch (item.item_type) {
                case 'LAYANAN': {
                    route = `/services/${toSlug(item.detail.item_name)}`;
                    break;
                }

                case 'TIPE_LAYANAN': {
                    const serviceName = item.detail.hover[0] || item.detail.location;
                    if (serviceName.trim() && item.detail.item_name.trim()) {
                        route = `/services/${toSlug(serviceName)}/${toSlug(item.detail.item_name)}`;
                    }
                    break;
                }

                case 'FOLDER': {
                    const serviceName = item.detail.hover[0];
                    const typeName = item.detail.hover[1] || item.detail.location;
                    if (serviceName?.trim() && typeName?.trim()) {
                        route = `/services/${toSlug(serviceName)}/${toSlug(typeName)}/${item.item_id}`;
                    }
                    break;
                }

                case 'DOCUMENT': {
                    const folderId = await resolveDocumentFolderId(item.item_id, item.detail.item_name);
                    if (!folderId) {
                        break;
                    }

                    const typeNameCandidates = [item.detail.hover[0]];
                    const typeNameFromFolder = await resolveTypeNameByFolderId(folderId);
                    if (typeNameFromFolder) {
                        typeNameCandidates.push(typeNameFromFolder);
                    }

                    const resolvedSlugs = await resolveServiceAndTypeSlugs(typeNameCandidates);
                    if (resolvedSlugs) {
                        route = `/services/${resolvedSlugs.serviceSlug}/${resolvedSlugs.typeSlug}/${folderId}`;
                    }
                    break;
                }
            }

            if (route) {
                routeCacheRef.current[item.id] = route;
            }
            return route;
        },
        [resolveDocumentFolderId, resolveServiceAndTypeSlugs, resolveTypeNameByFolderId],
    );

    const handleOpenItem = useCallback(
        async (item: StarredItem) => {
            if (navigatingItemId || pendingFavoriteId === item.id) {
                return;
            }

            setNavigatingItemId(item.id);
            try {
                const route = await resolveItemRoute(item);
                if (!route) {
                    showToast({ message: 'Rute item berbintang belum tersedia', variant: 'error' });
                    return;
                }

                router.push(route);
            } catch {
                showToast({ message: 'Gagal membuka item berbintang', variant: 'error' });
            } finally {
                setNavigatingItemId(null);
            }
        },
        [navigatingItemId, pendingFavoriteId, resolveItemRoute, router, showToast],
    );

    const resolveIsFavorite = useCallback(
        (item: { id: string }) => favoriteOverrides[item.id] ?? true,
        [favoriteOverrides],
    );

    const activeItemIsFavorite = useMemo(() => {
        if (!activeItem) return false;
        return resolveIsFavorite(activeItem);
    }, [activeItem, resolveIsFavorite]);

    const handleToggleFavorite = useCallback(
        async (targetItem?: StarredItem | null) => {
            const item = targetItem ?? activeItem;
            if (!item) return;

            const isFavorite = resolveIsFavorite(item);
            setPendingFavoriteId(item.id);

            try {
                if (isFavorite) {
                    await apiPost<unknown>(
                        `${ENDPOINTS.USER.REMOVE_ITEM_FAVORITE}/${item.item_type}/${item.item_id}`,
                    );
                    setFavoriteOverrides((prev) => ({ ...prev, [item.id]: false }));
                    showToast({ message: 'Berhasil dihapus dari Berbintang', variant: 'success' });
                    await onRefresh?.();
                } else {
                    await apiPost<unknown>(ENDPOINTS.USER.ITEM_FAVORITE, {
                        item_id: item.item_id,
                        item_type: item.item_type,
                    });
                    setFavoriteOverrides((prev) => ({ ...prev, [item.id]: true }));
                    showToast({ message: 'Berhasil ditambahkan ke Berbintang', variant: 'success' });
                }
            } catch {
                const message = isFavorite
                    ? 'Gagal menghapus dari Berbintang'
                    : 'Gagal menambahkan ke Berbintang';
                showToast({ message, variant: 'error' });
            } finally {
                setPendingFavoriteId(null);
            }
        },
        [activeItem, onRefresh, resolveIsFavorite, showToast],
    );

    const handleFavoriteIconClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>, item: StarredItem) => {
            event.preventDefault();
            event.stopPropagation();
            if (pendingFavoriteId === item.id) return;
            void handleToggleFavorite(item);
        },
        [handleToggleFavorite, pendingFavoriteId],
    );

    const handleBulkRename = useCallback(() => {
        showToast({ message: `Ganti nama massal untuk ${selectedStarredItems.length} item belum tersedia`, variant: 'info' });
    }, [selectedStarredItems.length, showToast]);

    const handleBulkFavorite = useCallback(async () => {
        if (selectedStarredItems.length === 0 || isBulkFavoriteLoading) return;

        setIsBulkFavoriteLoading(true);
        try {
            await apiPost(ENDPOINTS.USER.MULTIPLE_REMOVE_ITEM_FAVORITE, {
                items: selectedStarredItems.map((item) => ({
                    item_id: item.item_id,
                    item_type: item.item_type,
                })),
            });

            setFavoriteOverrides((prev) => {
                const next = { ...prev };
                selectedStarredItems.forEach((item) => {
                    next[item.id] = false;
                });
                return next;
            });
            setSelectedItems([]);
            showToast({ message: 'Berhasil menghapus pilihan dari Berbintang', variant: 'success' });
            await onRefresh?.();
        } catch {
            showToast({ message: 'Gagal menghapus pilihan dari Berbintang', variant: 'error' });
        } finally {
            setIsBulkFavoriteLoading(false);
        }
    }, [isBulkFavoriteLoading, onRefresh, selectedStarredItems, setSelectedItems, showToast]);

    const handleBulkDownload = useCallback(() => {
        showToast({ message: `Download massal untuk ${selectedStarredItems.length} item belum tersedia`, variant: 'info' });
    }, [selectedStarredItems.length, showToast]);

    const handleBulkMoveToTrash = useCallback(() => {
        showToast({ message: `Pindah ke sampah massal untuk ${selectedStarredItems.length} item belum tersedia`, variant: 'info' });
    }, [selectedStarredItems.length, showToast]);

    const moreActions = useMemo<DropdownMenuItem[]>(
        () => [
            {
                label: activeItemIsFavorite ? 'Hapus dari Berbintang' : 'Tambahkan ke Berbintang',
                icon: activeItemIsFavorite ? (
                    <StarOff className="w-4 h-4" />
                ) : (
                    <Star className="w-4 h-4" />
                ),
                onClick: () => {
                    void handleToggleFavorite();
                },
                className: pendingFavoriteId ? 'pointer-events-none opacity-60' : '',
            },
        ],
        [activeItemIsFavorite, handleToggleFavorite, pendingFavoriteId],
    );

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
        }
        return sortDirection === 'asc' ? (
            <ArrowUp className="w-3 h-3 text-[#8B7355]" />
        ) : (
            <ArrowDown className="w-3 h-3 text-[#8B7355]" />
        );
    };

    const getIcon = (itemType: ItemType) => {
        if (itemType === 'DOCUMENT') {
            return (
                <Image
                    src={PDFIcon}
                    alt="PDF"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                />
            );
        } else if (itemType === 'FOLDER') {
            return (
                <Image
                    src={FolderIcon}
                    alt="Folder"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                />
            );
        }
        return (
            <Image
                src={ServiceIcon}
                alt="Service"
                width={20}
                height={20}
                className="w-5 h-5"
            />
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="w-full bg-white p-8 text-center">
                <div className="animate-pulse flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="w-full bg-white p-8 text-center text-gray-500">
                Tidak ada item berbintang
            </div>
        );
    }

    return (
        <div className="w-full bg-white">
            <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-white border-b border-gray-100 text-xs uppercase text-gray-700 font-medium">
                    <tr>
                        <th scope="col" className="p-4 w-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-[#8B7355] bg-gray-100 border-gray-300 rounded focus:ring-[#8B7355] focus:ring-2"
                                    checked={isAllSelected}
                                    onChange={toggleSelectAll}
                                />
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-3">
                            <button
                                onClick={() => handleSort('name')}
                                className={`flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors ${sortField === 'name' ? 'text-[#8B7355]' : ''}`}
                            >
                                Nama File
                                {getSortIcon('name')}
                            </button>
                        </th>
                        <th scope="col" className="px-6 py-3">
                            <button
                                onClick={() => handleSort('author')}
                                className={`flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors ${sortField === 'author' ? 'text-[#8B7355]' : ''}`}
                            >
                                Author
                                {getSortIcon('author')}
                            </button>
                        </th>
                        <th scope="col" className="px-6 py-3">
                            <button
                                onClick={() => handleSort('date')}
                                className={`flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors ${sortField === 'date' ? 'text-[#8B7355]' : ''}`}
                            >
                                Ditambahkan
                                {getSortIcon('date')}
                            </button>
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Lokasi
                        </th>
                        <th scope="col" className="px-4 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {sortedItems.map((item) => {
                        const isFavorite = resolveIsFavorite(item);

                        return (
                        <tr
                            key={item.id}
                            role="button"
                            tabIndex={0}
                            aria-label={`Buka ${item.detail.item_name}`}
                            className={`group hover:bg-gray-50 transition-colors ${
                                navigatingItemId === item.id
                                    ? 'cursor-progress opacity-70'
                                    : 'cursor-pointer'
                            }`}
                            onClick={() => {
                                void handleOpenItem(item);
                            }}
                            onKeyDown={(event) => {
                                if (event.currentTarget !== event.target) {
                                    return;
                                }
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    void handleOpenItem(item);
                                }
                            }}
                        >
                            <td className="p-4 w-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-[#8B7355] bg-gray-100 border-gray-300 rounded focus:ring-[#8B7355] focus:ring-2"
                                        checked={isSelected(item.id)}
                                        onClick={(event) => event.stopPropagation()}
                                        onChange={() => toggleSelectItem(item.id)}
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center gap-3">
                                {getIcon(item.item_type)}
                                <span>{item.detail.item_name}</span>
                                <button
                                    type="button"
                                    onClick={(event) => handleFavoriteIconClick(event, item)}
                                    disabled={pendingFavoriteId === item.id}
                                    title={
                                        isFavorite
                                            ? 'Hapus dari Berbintang'
                                            : 'Tambahkan ke Berbintang'
                                    }
                                    className={`ml-1 p-1 rounded-full transition-colors ${
                                        pendingFavoriteId === item.id
                                            ? 'cursor-not-allowed opacity-60'
                                            : 'cursor-pointer hover:bg-gray-100'
                                    }`}
                                >
                                    <Star
                                        className={`w-3.5 h-3.5 ${
                                            isFavorite
                                                ? 'fill-gray-900 text-gray-900'
                                                : 'fill-transparent text-gray-400'
                                        }`}
                                    />
                                </button>
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {item.detail.author}
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {formatDate(item.created_at)}
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Folder className="w-4 h-4" />
                                    <span>{item.detail.location}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        openDropdown(event, item.id);
                                    }}
                                    className={`p-1 rounded-full transition-colors ${triggerClass} ${
                                        isOpen(item.id)
                                            ? 'bg-gray-100 text-gray-600'
                                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                        );
                    })}
                </tbody>
            </table>
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
                    favoriteLabel="Hapus dari berbintang"
                    disabled={isBulkFavoriteLoading}
                />
            )}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={totalItems}
            />
        </div>
    );
}
