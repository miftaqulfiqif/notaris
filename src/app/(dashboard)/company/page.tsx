'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Clock3, Download, Edit3, Info, LayoutGrid, List, MoreVertical, Plus, Star, StarOff, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { apiGet, apiPatch, apiPost } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { BulkActionToast, StatusBadge } from '@/shared/components';
import { Toast } from '@/shared/components/Toast';
import { useToast } from '@/shared/hooks/useToast';
import { useDropdown, type DropdownState } from '@/shared/hooks/useDropdown';
import { DropdownMenu } from '@/shared/components/DropdownMenu';
import type { DropdownMenuItem } from '@/shared/components/DropdownMenu';
import { useFavoriteFolder } from '@/features/services/presentation/hooks/useFavoriteFolder';
import { FolderDetailOffcanvas } from '@/features/services/presentation/components/FolderDetailOffcanvas';
import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';
import folderIcon from '@/assets/icons/folder.png';
import ConfirmDialog from '@/shared/components/ConfirmDialog';

interface CompanyItem {
    id: string;
    name: string;
    service: string;
    serviceType: string;
    author: string;
    modifiedAt: string;
    status: string;
    isFavorite: boolean;
}

interface CompanyApiItem {
    id: string;
    folder_name: string;
    layanan: string;
    tipe_layanan: string;
    author: string;
    updated_at: string;
    status: string;
    is_favorite?: boolean;
}

interface CompanyApiResponse {
    message: string;
    data:
    | CompanyApiItem[]
    | {
        current_page?: number;
        total_items?: number;
        total_pages?: number;
        data: CompanyApiItem[];
    };
}

const loadCompanyItems = async (): Promise<CompanyItem[]> => {
    const url = `${ENDPOINTS.USER.FOLDERS_NOTARIS}?page=1&limit=100&search=`;
    const response = await apiGet<CompanyApiResponse>(url);

    return normalizeCompanyItems(response);
};

const normalizeCompanyItems = (response: CompanyApiResponse): CompanyItem[] => {
    const payload = Array.isArray(response.data) ? response.data : response.data?.data || [];

    return payload.map((item) => ({
        id: item.id,
        name: item.folder_name,
        service: item.layanan,
        serviceType: item.tipe_layanan,
        author: item.author,
        modifiedAt: item.updated_at,
        status: item.status,
        isFavorite: Boolean(item.is_favorite),
    }));
};

const toSlug = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-');

type FolderStatusValue = 'selesai' | 'tertunda' | 'proses';
type CompanySortField = 'name' | 'service' | 'serviceType' | 'author' | null;
type SortDirection = 'asc' | 'desc';

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

const normalizeFolderStatus = (status: string): string => {
    const normalizedStatus = status.toLowerCase().trim();

    if (normalizedStatus === 'terutunda' || normalizedStatus === 'terjeda') {
        return 'tertunda';
    }

    return normalizedStatus;
};

const toFolderStatusValue = (status: string): FolderStatusValue | null => {
    const normalizedStatus = normalizeFolderStatus(status);

    if (STATUS_OPTIONS.some((option) => option.value === normalizedStatus)) {
        return normalizedStatus as FolderStatusValue;
    }

    return null;
};

interface CompanyStatusPopoverProps {
    dropdown: DropdownState<string> | null;
    menuClass: string;
    activeStatus: FolderStatusValue | null;
    isLoading: boolean;
    onSelect: (status: FolderStatusValue) => void;
    onClose: () => void;
}

function CompanyStatusPopover({
    dropdown,
    menuClass,
    activeStatus,
    isLoading,
    onSelect,
    onClose,
}: CompanyStatusPopoverProps) {
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

export default function CompanyPage() {
    const router = useRouter();
    const { openModal } = useUploadModal();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [activeTab, setActiveTab] = useState<'baru' | 'favorite'>('baru');
    const [items, setItems] = useState<CompanyItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isMovingToTrash, setIsMovingToTrash] = useState(false);
    const [detailSidebarFolder, setDetailSidebarFolder] = useState<{ id: string; name: string } | null>(null);
    const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
    const [renameFolderName, setRenameFolderName] = useState('');
    const [renameError, setRenameError] = useState<string | null>(null);
    const [isRenamingFolder, setIsRenamingFolder] = useState(false);
    const [updatingStatusFolderId, setUpdatingStatusFolderId] = useState<string | null>(null);
    const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
    const [sortField, setSortField] = useState<CompanySortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const { toast, showToast, hideToast } = useToast();
    const { addToFavorite, removeFromFavorite, isLoading: isFavoriteLoading } = useFavoriteFolder();
    const [popUpDeleteFolder, setPopUpDeleteFolder] = useState(false);
    const [deleteTargetCompany, setDeleteTargetCompany] = useState<CompanyItem | null>(null);
    const { activeDropdown, openDropdown, closeDropdown, isOpen, triggerClass, menuClass } =
        useDropdown<string>({
            triggerClass: 'company-table-dropdown-trigger',
            menuClass: 'company-table-dropdown-menu',
        });
    const {
        activeDropdown: activeStatusDropdown,
        openDropdown: openStatusDropdown,
        closeDropdown: closeStatusDropdown,
        isOpen: isStatusOpen,
        triggerClass: statusTriggerClass,
        menuClass: statusMenuClass,
    } = useDropdown<string>({
        triggerClass: 'company-table-status-trigger',
        menuClass: 'company-table-status-menu',
    });
    const {
        activeDropdown: activeBulkStatusDropdown,
        openDropdown: openBulkStatusDropdown,
        closeDropdown: closeBulkStatusDropdown,
        menuClass: bulkStatusMenuClass,
    } = useDropdown<string>({
        triggerClass: 'company-bulk-status-trigger',
        menuClass: 'company-bulk-status-menu',
    });

    const refreshCompanyItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const normalizedItems = await loadCompanyItems();
            setItems(normalizedItems);
        } catch (err) {
            setItems([]);
            setError(err instanceof Error ? err.message : 'Gagal memuat data perusahaan');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void refreshCompanyItems();
    }, [refreshCompanyItems]);

    const filteredItems = useMemo(() => {
        if (activeTab === 'favorite') {
            return items.filter((item) => item.isFavorite);
        }

        return items;
    }, [activeTab, items]);

    const sortedItems = useMemo(() => {
        if (!sortField) return filteredItems;

        const sorted = [...filteredItems].sort((left, right) =>
            compareText(left[sortField], right[sortField]),
        );

        return sortDirection === 'asc' ? sorted : sorted.reverse();
    }, [filteredItems, sortDirection, sortField]);

    const selectedCompanyItems = useMemo(
        () => sortedItems.filter((item) => selectedIds.includes(item.id)),
        [selectedIds, sortedItems],
    );
    const hasSelectedCompanyItems = selectedCompanyItems.length > 0;
    const canBulkRename = selectedCompanyItems.length === 1;
    const bulkFavoriteLabel = selectedCompanyItems.length > 0 && selectedCompanyItems.every((item) => item.isFavorite)
        ? 'Hapus dari berbintang'
        : 'Tambahkan ke berbintang';
    const activeBulkStatus = useMemo<FolderStatusValue | null>(() => {
        if (selectedCompanyItems.length === 0) return null;

        const normalizedStatuses = selectedCompanyItems
            .map((item) => toFolderStatusValue(normalizeFolderStatus(item.status)))
            .filter((status): status is FolderStatusValue => Boolean(status));

        if (normalizedStatuses.length !== selectedCompanyItems.length) {
            return null;
        }

        const [firstStatus] = normalizedStatuses;
        if (normalizedStatuses.every((status) => status === firstStatus)) {
            return firstStatus;
        }

        return null;
    }, [selectedCompanyItems]);

    useEffect(() => {
        setSelectedIds((prev) => prev.filter((id) => sortedItems.some((item) => item.id === id)));
    }, [sortedItems]);

    useEffect(() => {
        if (!hasSelectedCompanyItems) {
            closeBulkStatusDropdown();
        }
    }, [closeBulkStatusDropdown, hasSelectedCompanyItems]);

    const isAllSelected = useMemo(
        () => sortedItems.length > 0 && selectedIds.length === sortedItems.length,
        [selectedIds.length, sortedItems],
    );

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
            return;
        }

        setSelectedIds(sortedItems.map((item) => item.id));
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((selectedId) => selectedId !== id);
            }

            return [...prev, id];
        });
    };

    const handleSort = useCallback((field: Exclude<CompanySortField, null>) => {
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
    }, [sortDirection]);

    const renderSortIcon = useCallback((field: Exclude<CompanySortField, null>) => {
        if (sortField !== field) {
            return <ArrowUpDown className="h-4 w-4 text-gray-500" />;
        }

        return sortDirection === 'asc'
            ? <ArrowUp className="h-4 w-4 text-[#8A7A62]" />
            : <ArrowDown className="h-4 w-4 text-[#8A7A62]" />;
    }, [sortDirection, sortField]);

    const activeCompany = useMemo(() => {
        if (!activeDropdown) return null;
        return items.find((item) => item.id === activeDropdown.id) ?? null;
    }, [activeDropdown, items]);

    const activeStatusCompany = useMemo(() => {
        if (!activeStatusDropdown) return null;
        return items.find((item) => item.id === activeStatusDropdown.id) ?? null;
    }, [activeStatusDropdown, items]);

    const activeCompanyIsFavorite = Boolean(activeCompany?.isFavorite);
    const activeCompanyStatus = useMemo(() => {
        if (!activeStatusCompany) return null;
        return toFolderStatusValue(activeStatusCompany.status);
    }, [activeStatusCompany]);

    const updateItemFavorite = useCallback((itemId: string, isFavorite: boolean) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === itemId
                    ? { ...item, isFavorite }
                    : item,
            ),
        );
    }, []);

    const handleToggleFavorite = useCallback(
        async (targetItem?: CompanyItem | null) => {
            const company = targetItem ?? activeCompany;
            if (!company) return;

            try {
                if (company.isFavorite) {
                    await removeFromFavorite(company.id);
                    updateItemFavorite(company.id, false);
                    showToast({ message: 'Berhasil dihapus dari berbintang', variant: 'success' });
                } else {
                    await addToFavorite(company.id);
                    updateItemFavorite(company.id, true);
                    showToast({ message: 'Berhasil ditambahkan ke berbintang', variant: 'success' });
                }
            } catch {
                const message = company.isFavorite
                    ? 'Gagal menghapus dari berbintang'
                    : 'Gagal menambahkan ke berbintang';
                showToast({ message, variant: 'error' });
            }
        },
        [activeCompany, addToFavorite, removeFromFavorite, showToast, updateItemFavorite],
    );

    const handleFavoriteIconClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>, company: CompanyItem) => {
            event.preventDefault();
            event.stopPropagation();

            if (!company.isFavorite || isFavoriteLoading) return;
            void handleToggleFavorite(company);
        },
        [handleToggleFavorite, isFavoriteLoading],
    );

    const downloadFolderByItem = useCallback(async (target: { id: string; name: string }) => {
        const downloadUrl = ENDPOINTS.USER.FOLDER_DOWNLOAD.replace(':folder_id', target.id);
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
                    // Ignore JSON parse error and use default message.
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
            const fallbackName = `${target.name || 'folder'}.zip`;
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
        } catch (err) {
            showToast({
                message: err instanceof Error ? err.message : 'Gagal mengunduh folder',
                variant: 'error',
            });
        }
    }, [showToast]);

    const handleDownloadFolder = useCallback(() => {
        if (!activeCompany) return;
        void downloadFolderByItem(activeCompany);
    }, [activeCompany, downloadFolderByItem]);

    const openRenameModalForTarget = useCallback((target: { id: string; name: string }) => {
        if (isRenamingFolder) return;
        setRenameTarget({ id: target.id, name: target.name });
        setRenameFolderName(target.name);
        setRenameError(null);
    }, [isRenamingFolder]);

    const openRenameModal = useCallback(() => {
        if (!activeCompany) return;
        openRenameModalForTarget(activeCompany);
    }, [activeCompany, openRenameModalForTarget]);

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
            const url = ENDPOINTS.USER.RENAME_FOLDER.replace(':folder_id', renameTarget.id);
            await apiPatch(url, { folder_name: normalizedFolderName });

            setItems((prev) =>
                prev.map((item) =>
                    item.id === renameTarget.id
                        ? { ...item, name: normalizedFolderName }
                        : item,
                ),
            );
            setDetailSidebarFolder((prev) =>
                prev && prev.id === renameTarget.id
                    ? { ...prev, name: normalizedFolderName }
                    : prev,
            );
            showToast({ message: 'Nama folder berhasil diperbarui', variant: 'success' });
            setRenameTarget(null);
            setRenameFolderName('');
        } catch (err) {
            setRenameError(err instanceof Error ? err.message : 'Gagal mengganti nama folder');
        } finally {
            setIsRenamingFolder(false);
        }
    }, [isRenamingFolder, renameFolderName, renameTarget, showToast]);

    const handleOpenDetailSidebar = useCallback(() => {
        if (!activeCompany) return;
        setDetailSidebarFolder({
            id: activeCompany.id,
            name: activeCompany.name,
        });
    }, [activeCompany]);

    const handleMoveToTrash = useCallback(async (targetCompany?: CompanyItem | null) => {
        const company = targetCompany ?? activeCompany;

        if (!company || isMovingToTrash) return;

        setIsMovingToTrash(true);
        try {
            await apiPost(ENDPOINTS.USER.MULTIPLE_ITEM_DELETE, {
                items: [{ item_id: company.id, item_type: 'FOLDER' }],
            });

            setItems((prev) => prev.filter((item) => item.id !== company.id));
            setSelectedIds((prev) => prev.filter((id) => id !== company.id));

            showToast({ message: 'Berhasil dipindahkan ke sampah', variant: 'success' });
        } catch {
            showToast({ message: 'Gagal memindahkan ke sampah', variant: 'error' });
        } finally {
            setIsMovingToTrash(false);
        }
    }, [activeCompany, isMovingToTrash, showToast]);

    const handleBulkRename = useCallback(() => {
        if (!canBulkRename) return;

        const target = selectedCompanyItems[0];
        if (!target) return;
        openRenameModalForTarget({ id: target.id, name: target.name });
    }, [canBulkRename, openRenameModalForTarget, selectedCompanyItems]);

    const handleBulkToggleFavorite = useCallback(async () => {
        if (selectedCompanyItems.length === 0 || isBulkActionLoading) return;

        const shouldRemoveFromFavorite = selectedCompanyItems.every((item) => item.isFavorite);
        const payloadItems = selectedCompanyItems.map((item) => ({
            item_id: item.id,
            item_type: 'FOLDER',
        }));

        setIsBulkActionLoading(true);
        try {
            if (shouldRemoveFromFavorite) {
                await apiPost(ENDPOINTS.USER.MULTIPLE_REMOVE_ITEM_FAVORITE, { items: payloadItems });
            } else {
                await apiPost(ENDPOINTS.USER.MULTIPLE_ITEM_FAVORITE, { items: payloadItems });
            }

            const selectedIdsSet = new Set(selectedCompanyItems.map((item) => item.id));
            setItems((prev) =>
                prev.map((item) =>
                    selectedIdsSet.has(item.id)
                        ? { ...item, isFavorite: !shouldRemoveFromFavorite }
                        : item,
                ),
            );

            showToast({
                message: shouldRemoveFromFavorite
                    ? 'Berhasil menghapus pilihan dari berbintang'
                    : 'Berhasil menambahkan pilihan ke berbintang',
                variant: 'success',
            });
            setSelectedIds([]);
        } catch {
            showToast({
                message: shouldRemoveFromFavorite
                    ? 'Gagal menghapus pilihan dari berbintang'
                    : 'Gagal menambahkan pilihan ke berbintang',
                variant: 'error',
            });
        } finally {
            setIsBulkActionLoading(false);
        }
    }, [isBulkActionLoading, selectedCompanyItems, showToast]);

    const handleBulkDownload = useCallback(() => {
        if (selectedCompanyItems.length === 0) return;

        if (selectedCompanyItems.length > 1) {
            showToast({
                message: `Download massal untuk ${selectedCompanyItems.length} folder belum tersedia`,
                variant: 'info',
            });
            return;
        }

        const target = selectedCompanyItems[0];
        if (!target) return;
        void downloadFolderByItem({ id: target.id, name: target.name });
    }, [downloadFolderByItem, selectedCompanyItems, showToast]);

    const handleBulkMoveToTrash = useCallback(async () => {
        if (selectedCompanyItems.length === 0 || isBulkActionLoading) return;

        setIsBulkActionLoading(true);
        try {
            await apiPost(ENDPOINTS.USER.MULTIPLE_ITEM_DELETE, {
                items: selectedCompanyItems.map((item) => ({
                    item_id: item.id,
                    item_type: 'FOLDER',
                })),
            });

            const selectedIdsSet = new Set(selectedCompanyItems.map((item) => item.id));
            setItems((prev) => prev.filter((item) => !selectedIdsSet.has(item.id)));
            setSelectedIds([]);
            showToast({
                message: `${selectedCompanyItems.length} folder berhasil dipindahkan ke sampah`,
                variant: 'success',
            });
        } catch {
            showToast({ message: 'Gagal memindahkan pilihan ke sampah', variant: 'error' });
        } finally {
            setIsBulkActionLoading(false);
        }
    }, [isBulkActionLoading, selectedCompanyItems, showToast]);

    const handleOpenBulkStatusDropdown = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            closeDropdown();
            closeStatusDropdown();
            openBulkStatusDropdown(event, 'bulk-status');
        },
        [closeDropdown, closeStatusDropdown, openBulkStatusDropdown],
    );

    const handleBulkUpdateStatus = useCallback(
        async (nextStatus: FolderStatusValue) => {
            if (selectedCompanyItems.length === 0 || isBulkActionLoading) return;

            const itemsToUpdate = selectedCompanyItems.filter(
                (item) => toFolderStatusValue(normalizeFolderStatus(item.status)) !== nextStatus,
            );
            if (itemsToUpdate.length === 0) return;

            setIsBulkActionLoading(true);
            try {
                const updateResults = await Promise.allSettled(
                    itemsToUpdate.map((item) =>
                        apiPatch(ENDPOINTS.USER.UPDATE_STATUS_FOLDER, {
                            folder_id: item.id,
                            status: nextStatus,
                        }),
                    ),
                );

                const successIds = itemsToUpdate
                    .filter((_, index) => updateResults[index]?.status === 'fulfilled')
                    .map((item) => item.id);

                if (successIds.length > 0) {
                    const successIdSet = new Set(successIds);
                    setItems((prev) =>
                        prev.map((item) =>
                            successIdSet.has(item.id)
                                ? { ...item, status: nextStatus }
                                : item,
                        ),
                    );
                }

                if (successIds.length === itemsToUpdate.length) {
                    showToast({
                        message: `Status ${itemsToUpdate.length} folder berhasil diperbarui`,
                        variant: 'success',
                    });
                } else if (successIds.length > 0) {
                    showToast({
                        message: `Status ${successIds.length} dari ${itemsToUpdate.length} folder berhasil diperbarui`,
                        variant: 'info',
                    });
                } else {
                    showToast({ message: 'Gagal memperbarui status pilihan', variant: 'error' });
                }
            } catch {
                showToast({ message: 'Gagal memperbarui status pilihan', variant: 'error' });
            } finally {
                setIsBulkActionLoading(false);
            }
        },
        [isBulkActionLoading, selectedCompanyItems, showToast],
    );

    const handleOpenStatusDropdown = useCallback(
        (event: MouseEvent<HTMLButtonElement>, folderId: string) => {
            closeDropdown();
            closeBulkStatusDropdown();
            openStatusDropdown(event, folderId);
        },
        [closeBulkStatusDropdown, closeDropdown, openStatusDropdown],
    );

    const handleOpenActionDropdown = useCallback(
        (event: MouseEvent<HTMLButtonElement>, folderId: string) => {
            closeStatusDropdown();
            closeBulkStatusDropdown();
            openDropdown(event, folderId);
        },
        [closeBulkStatusDropdown, closeStatusDropdown, openDropdown],
    );

    const handleUpdateFolderStatus = useCallback(
        async (nextStatus: FolderStatusValue) => {
            if (!activeStatusCompany) return;

            const folderId = activeStatusCompany.id;
            const currentStatus = toFolderStatusValue(activeStatusCompany.status);
            if (currentStatus === nextStatus) return;

            setUpdatingStatusFolderId(folderId);
            try {
                await apiPatch(ENDPOINTS.USER.UPDATE_STATUS_FOLDER, {
                    folder_id: folderId,
                    status: nextStatus,
                });

                setItems((prev) =>
                    prev.map((item) =>
                        item.id === folderId
                            ? { ...item, status: nextStatus }
                            : item,
                    ),
                );
                showToast({ message: 'Status folder berhasil diperbarui', variant: 'success' });
            } catch {
                showToast({ message: 'Gagal memperbarui status folder', variant: 'error' });
            } finally {
                setUpdatingStatusFolderId((prev) => (prev === folderId ? null : prev));
            }
        },
        [activeStatusCompany, showToast],
    );

    const handleOpenCompanyFolder = useCallback(
        (item: CompanyItem) => {
            const serviceSlug = toSlug(item.service) || 'layanan';
            const typeSlug = toSlug(item.serviceType) || 'tipe-layanan';
            router.push(
                `/services/${encodeURIComponent(serviceSlug)}/${encodeURIComponent(typeSlug)}/${encodeURIComponent(item.id)}`,
            );
        },
        [router],
    );

    const companyMenuItems = useMemo<DropdownMenuItem[]>(
        () => [
            {
                label: 'Download folder',
                icon: <Download className="h-4 w-4" />,
                onClick: handleDownloadFolder,
            },
            {
                label: 'Ganti nama',
                icon: <Edit3 className="h-4 w-4" />,
                onClick: openRenameModal,
                hasDivider: true,
            },
            {
                label: 'Lihat detail',
                icon: <Info className="h-4 w-4" />,
                onClick: handleOpenDetailSidebar,
            },
            {
                label: activeCompanyIsFavorite ? 'Hapus dari berbintang' : 'Tambahkan ke berbintang',
                icon: activeCompanyIsFavorite ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />,
                onClick: () => {
                    void handleToggleFavorite();
                },
                hasDivider: true,
                className: isFavoriteLoading ? 'pointer-events-none opacity-60' : '',
            },
            {
                label: 'Tambahkan ke sampah',
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => {
                    setDeleteTargetCompany(activeCompany);
                    setPopUpDeleteFolder(true);
                },
                className: isMovingToTrash ? 'pointer-events-none opacity-60' : '',
            },
        ],
        [
            activeCompany,
            activeCompanyIsFavorite,
            handleDownloadFolder,
            handleOpenDetailSidebar,
            handleToggleFavorite,
            openRenameModal,
            isFavoriteLoading,
            isMovingToTrash,
        ],
    );

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 lg:bg-white">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="w-full min-h-screen flex flex-col">
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-100/50">
                        <DashboardHeader />
                    </div>

                    <div className="flex-1 px-4 sm:px-8 pb-8">
                        {error && (
                            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}
                        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">Perusahaan</h1>
                            <button
                                type="button"
                                onClick={() =>
                                    openModal({
                                        onSuccess: () => {
                                            void refreshCompanyItems();
                                        },
                                    })
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-base font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
                            >
                                <Plus className="h-5 w-5" />
                                Tambah Baru
                            </button>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('baru');
                                        setSelectedIds([]);
                                    }}
                                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-base transition-colors ${activeTab === 'baru'
                                            ? 'border-gray-300 bg-white font-medium text-gray-900 shadow-sm'
                                            : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                                        }`}
                                >
                                    <Clock3 className="h-5 w-5" />
                                    Baru di tambahkan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('favorite');
                                        setSelectedIds([]);
                                    }}
                                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-base transition-colors ${activeTab === 'favorite'
                                            ? 'border-gray-300 bg-white font-medium text-gray-900 shadow-sm'
                                            : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                                        }`}
                                >
                                    <Star className="h-5 w-5" />
                                    Favorite
                                </button>
                            </div>

                            <div className="flex items-center rounded-lg bg-gray-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid')}
                                    className={`rounded-md p-1.5 transition-colors ${viewMode === 'grid'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    aria-label="Grid view"
                                >
                                    <LayoutGrid className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className={`rounded-md p-1.5 transition-colors ${viewMode === 'list'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    aria-label="List view"
                                >
                                    <List className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {viewMode === 'grid' ? (
                            <div className="mt-3">
                                {isLoading ? (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {Array.from({ length: 8 }).map((_, index) => (
                                            <div
                                                key={index}
                                                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                                            >
                                                <div className="h-44 animate-pulse border-b border-gray-200 bg-gray-100" />
                                                <div className="flex items-center justify-between px-3 py-3">
                                                    <div className="h-5 w-28 animate-pulse rounded bg-gray-100" />
                                                    <div className="h-5 w-5 animate-pulse rounded bg-gray-100" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : sortedItems.length === 0 ? (
                                    <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center text-gray-500">
                                        {activeTab === 'favorite'
                                            ? 'Belum ada data perusahaan berbintang'
                                            : 'Belum ada data perusahaan'}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {sortedItems.map((item) => (
                                            <article
                                                key={item.id}
                                                onClick={() => handleOpenCompanyFolder(item)}
                                                className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-sm"
                                            >
                                                <div className="flex h-44 items-center justify-center border-b border-gray-200 bg-gray-100/70">
                                                    <Image
                                                        src={folderIcon}
                                                        alt="Folder"
                                                        width={64}
                                                        height={64}
                                                        className="h-16 w-16"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between gap-2 px-3 py-3">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <span className="truncate text-base text-gray-800">{item.name}</span>
                                                        {item.isFavorite && (
                                                            <button
                                                                type="button"
                                                                onClick={(event) => handleFavoriteIconClick(event, item)}
                                                                disabled={isFavoriteLoading}
                                                                title="Hapus dari berbintang"
                                                                aria-label={`Hapus ${item.name} dari berbintang`}
                                                                className={`rounded-full p-1 transition-colors ${isFavoriteLoading
                                                                        ? 'cursor-not-allowed opacity-60'
                                                                        : 'cursor-pointer hover:bg-gray-200'
                                                                    }`}
                                                            >
                                                                <Star className="h-4 w-4 fill-gray-400 text-gray-400" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        aria-label={`Aksi ${item.name}`}
                                                        onClick={(event) => handleOpenActionDropdown(event, item.id)}
                                                        className={`rounded-full p-1 transition-colors ${triggerClass} ${isOpen(item.id)
                                                                ? 'bg-gray-200 text-gray-600'
                                                                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                                            }`}
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white">
                                <div className="overflow-x-auto">
                                    <table className="min-w-[1160px] w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50/60">
                                                <th className="w-12 px-3 py-3.5 text-left">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAllSelected}
                                                        onChange={toggleSelectAll}
                                                        className="h-5 w-5 rounded border-gray-300 text-[#8A7A62] focus:ring-[#8A7A62]"
                                                    />
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSort('name')}
                                                        className={`inline-flex items-center gap-2 ${sortField === 'name' ? 'text-[#8A7A62]' : ''}`}
                                                    >
                                                        Nama
                                                        {renderSortIcon('name')}
                                                    </button>
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSort('service')}
                                                        className={`inline-flex items-center gap-2 ${sortField === 'service' ? 'text-[#8A7A62]' : ''}`}
                                                    >
                                                        Layanan
                                                        {renderSortIcon('service')}
                                                    </button>
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSort('serviceType')}
                                                        className={`inline-flex items-center gap-2 ${sortField === 'serviceType' ? 'text-[#8A7A62]' : ''}`}
                                                    >
                                                        Tipe layanan
                                                        {renderSortIcon('serviceType')}
                                                    </button>
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSort('author')}
                                                        className={`inline-flex items-center gap-2 ${sortField === 'author' ? 'text-[#8A7A62]' : ''}`}
                                                    >
                                                        Author
                                                        {renderSortIcon('author')}
                                                    </button>
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">Dimodifikasi</th>
                                                <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">Status</th>
                                                <th className="w-14 px-3 py-3.5" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                                        Memuat data perusahaan...
                                                    </td>
                                                </tr>
                                            ) : sortedItems.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                                        {activeTab === 'favorite'
                                                            ? 'Belum ada data perusahaan berbintang'
                                                            : 'Belum ada data perusahaan'}
                                                    </td>
                                                </tr>
                                            ) : (
                                                sortedItems.map((item) => {
                                                    const resolvedStatus = normalizeFolderStatus(item.status);
                                                    const isUpdatingStatus = updatingStatusFolderId === item.id;

                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            onClick={() => handleOpenCompanyFolder(item)}
                                                            className="cursor-pointer border-b border-gray-200 text-base text-gray-800 transition-colors last:border-b-0 hover:bg-gray-50"
                                                        >
                                                            <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedIds.includes(item.id)}
                                                                    onChange={() => toggleSelectOne(item.id)}
                                                                    onClick={(event) => event.stopPropagation()}
                                                                    className="h-5 w-5 rounded border-gray-300 text-[#8A7A62] focus:ring-[#8A7A62]"
                                                                />
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                <div className="inline-flex items-center gap-2.5">
                                                                    <Image
                                                                        src={folderIcon}
                                                                        alt="Folder"
                                                                        width={24}
                                                                        height={24}
                                                                        className="h-6 w-6"
                                                                    />
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{item.name}</span>
                                                                        {item.isFavorite && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(event) => handleFavoriteIconClick(event, item)}
                                                                                disabled={isFavoriteLoading}
                                                                                title="Hapus dari berbintang"
                                                                                aria-label={`Hapus ${item.name} dari berbintang`}
                                                                                className={`rounded-full p-1 transition-colors ${isFavoriteLoading
                                                                                        ? 'cursor-not-allowed opacity-60'
                                                                                        : 'cursor-pointer hover:bg-gray-200'
                                                                                    }`}
                                                                            >
                                                                                <Star className="h-4 w-4 fill-gray-400 text-gray-400" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-3">{item.service}</td>
                                                            <td className="px-3 py-3">{item.serviceType}</td>
                                                            <td className="px-3 py-3">{item.author}</td>
                                                            <td className="px-3 py-3 text-nowrap">{item.modifiedAt}</td>
                                                            <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                                                                <button
                                                                    type="button"
                                                                    aria-label={`Ubah status ${item.name}`}
                                                                    onClick={(event) => handleOpenStatusDropdown(event, item.id)}
                                                                    disabled={isUpdatingStatus}
                                                                    className={`inline-flex rounded-md transition-opacity ${statusTriggerClass} ${isStatusOpen(item.id)
                                                                            ? 'ring-2 ring-[#8B7355]/25 ring-offset-1'
                                                                            : ''
                                                                        } ${isUpdatingStatus
                                                                            ? 'cursor-not-allowed opacity-60'
                                                                            : 'cursor-pointer hover:opacity-80'
                                                                        }`}
                                                                >
                                                                    <StatusBadge status={resolvedStatus} />
                                                                </button>
                                                            </td>
                                                            <td className="px-3 py-3 text-right" onClick={(event) => event.stopPropagation()}>
                                                                <button
                                                                    type="button"
                                                                    aria-label={`Aksi ${item.name}`}
                                                                    onClick={(event) => handleOpenActionDropdown(event, item.id)}
                                                                    className={`rounded-full p-1 transition-colors ${triggerClass} ${isOpen(item.id)
                                                                            ? 'bg-gray-200 text-gray-600'
                                                                            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                                                        }`}
                                                                >
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {renameTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
                    onClick={closeRenameModal}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="rename-folder-modal-title"
                        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <h2 id="rename-folder-modal-title" className="text-lg font-semibold text-gray-900">
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

                            <label htmlFor="rename-folder-name" className="mb-2 block text-sm font-medium text-gray-700">
                                Nama Folder <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="rename-folder-name"
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
            <CompanyStatusPopover
                dropdown={activeStatusDropdown}
                menuClass={statusMenuClass}
                activeStatus={activeCompanyStatus}
                isLoading={Boolean(updatingStatusFolderId)}
                onSelect={(status) => {
                    void handleUpdateFolderStatus(status);
                }}
                onClose={closeStatusDropdown}
            />
            <CompanyStatusPopover
                dropdown={activeBulkStatusDropdown}
                menuClass={bulkStatusMenuClass}
                activeStatus={activeBulkStatus}
                isLoading={isBulkActionLoading}
                onSelect={(status) => {
                    void handleBulkUpdateStatus(status);
                }}
                onClose={closeBulkStatusDropdown}
            />
            <DropdownMenu
                dropdown={activeDropdown}
                menuClass={menuClass}
                items={companyMenuItems}
                onClose={closeDropdown}
            />
            <FolderDetailOffcanvas
                folderId={detailSidebarFolder?.id ?? null}
                folderName={detailSidebarFolder?.name}
                onClose={() => setDetailSidebarFolder(null)}
            />
            <Toast toast={toast} onClose={hideToast} position="bottom-left" />
            {hasSelectedCompanyItems && (
                <BulkActionToast
                    onStatusClick={handleOpenBulkStatusDropdown}
                    onRename={handleBulkRename}
                    onToggleFavorite={() => {
                        void handleBulkToggleFavorite();
                    }}
                    onDownload={handleBulkDownload}
                    onMoveToTrash={() => {
                        void handleBulkMoveToTrash();
                    }}
                    onCancel={() => setSelectedIds([])}
                    favoriteLabel={bulkFavoriteLabel}
                    disabled={isBulkActionLoading || isRenamingFolder}
                    showRename={canBulkRename}
                    statusDisabled={isBulkActionLoading || isRenamingFolder}
                />
            )}
            <ConfirmDialog
                isOpen={popUpDeleteFolder}
                title="Pindahkan ke Sampah"
                message="Apakah anda yakin ingin memindahkan folder ini ke sampah? Tindakan ini dapat dibalikkan dari halaman sampah."
                confirmText="Pindahkan"
                cancelText="Batal"
                type="danger"
                onConfirm={async () => {
                    await handleMoveToTrash(deleteTargetCompany);
                    setPopUpDeleteFolder(false);
                    setDeleteTargetCompany(null);
                }}
                onCancel={() => setPopUpDeleteFolder(false)}
            />
        </div>
    );
}
