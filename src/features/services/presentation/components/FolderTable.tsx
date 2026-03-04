'use client';

import { createPortal } from 'react-dom';
import {
    useCallback,
    useMemo,
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    type MouseEvent,
} from 'react';
import { MoreVertical, Search, Download, Edit3, Info, Star, StarOff, Trash2, Check, X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import folderIcon from '@/assets/icons/folder.png';
import { FolderItem } from '@/features/services/types';
import { StatusBadge } from '@/shared/components';
import { useFavoriteFolder } from '@/features/services/presentation/hooks/useFavoriteFolder';
import { FolderDetailOffcanvas } from '@/features/services/presentation/components/FolderDetailOffcanvas';
import { useDropdown } from '@/shared/hooks/useDropdown';
import { useToast } from '@/shared/hooks/useToast';
import { DropdownMenu } from '@/shared/components/DropdownMenu';
import { BulkActionToast } from '@/shared/components/BulkActionToast';
import { Toast } from '@/shared/components/Toast';
import { apiPatch, apiPost } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useSelection } from '@/shared/hooks/useSelection';
import type { DropdownMenuItem } from '@/shared/components/DropdownMenu';
import type { DropdownState } from '@/shared/hooks/useDropdown';

type FolderStatusValue = 'selesai' | 'tertunda' | 'proses';

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

interface FolderStatusPopoverProps {
    dropdown: DropdownState<string> | null;
    menuClass: string;
    activeStatus: FolderStatusValue | null;
    isLoading: boolean;
    onSelect: (status: FolderStatusValue) => void;
    onClose: () => void;
}

function FolderStatusPopover({
    dropdown,
    menuClass,
    activeStatus,
    isLoading,
    onSelect,
    onClose,
}: FolderStatusPopoverProps) {
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
                            <span className="flex-1 font-medium text-base">{option.label}</span>
                            {isActive && <Check className={`h-4 w-4 ${option.textClass}`} />}
                        </button>
                    );
                })}
            </div>
        </div>,
        document.body,
    );
}

interface FolderTableProps {
    items: FolderItem[];
    onRefresh?: () => void;
    resolveFolderHref?: (folder: FolderItem) => string;
}

const toSlug = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-');

export function FolderTable({ items, onRefresh, resolveFolderHref }: FolderTableProps) {
    const router = useRouter();
    const params = useParams();
    const { slug, typeSlug } = params as { slug?: string; typeSlug?: string };
    const { addToFavorite, removeFromFavorite, isLoading: isFavoriteLoading } = useFavoriteFolder();
    const { toast, showToast, hideToast } = useToast();
    const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
    const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
    const [updatingStatusFolderId, setUpdatingStatusFolderId] = useState<string | null>(null);
    const [isTrashLoading, setIsTrashLoading] = useState(false);
    const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
    const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
    const [renameFolderName, setRenameFolderName] = useState('');
    const [renameError, setRenameError] = useState<string | null>(null);
    const [isRenamingFolder, setIsRenamingFolder] = useState(false);
    const [detailSidebarFolder, setDetailSidebarFolder] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const { selectedItems, setSelectedItems, toggleSelectAll, toggleSelectItem, isSelected, isAllSelected } = useSelection({
        items,
        itemIdKey: 'id',
    });
    const { activeDropdown, openDropdown, closeDropdown, isOpen, triggerClass, menuClass } =
        useDropdown<string>({
            triggerClass: 'folder-table-dropdown-trigger',
            menuClass: 'folder-table-dropdown-menu',
        });
    const {
        activeDropdown: activeStatusDropdown,
        openDropdown: openStatusDropdown,
        closeDropdown: closeStatusDropdown,
        isOpen: isStatusOpen,
        triggerClass: statusTriggerClass,
        menuClass: statusMenuClass,
    } = useDropdown<string>({
        triggerClass: 'folder-table-status-trigger',
        menuClass: 'folder-table-status-menu',
    });
    const {
        activeDropdown: activeBulkStatusDropdown,
        openDropdown: openBulkStatusDropdown,
        closeDropdown: closeBulkStatusDropdown,
        menuClass: bulkStatusMenuClass,
    } = useDropdown<string>({
        triggerClass: 'folder-table-bulk-status-trigger',
        menuClass: 'folder-table-bulk-status-menu',
    });

    const selectedFolders = useMemo(
        () => items.filter((item) => selectedItems.includes(item.id)),
        [items, selectedItems],
    );

    const hasSelectedItems = selectedFolders.length > 0;
    const canBulkRename = selectedFolders.length === 1;
    const bulkFavoriteLabel = selectedFolders.length > 0 && selectedFolders.every(
        (folder) => favoriteOverrides[folder.id] ?? Boolean(folder.is_favorite),
    )
        ? 'Hapus dari berbintang'
        : 'Tambahkan ke berbintang';
    const activeBulkStatus = useMemo<FolderStatusValue | null>(() => {
        if (selectedFolders.length === 0) return null;

        const normalizedStatuses = selectedFolders
            .map((folder) =>
                toFolderStatusValue(statusOverrides[folder.id] ?? normalizeFolderStatus(folder.status)),
            )
            .filter((status): status is FolderStatusValue => Boolean(status));

        if (normalizedStatuses.length !== selectedFolders.length) {
            return null;
        }

        const [firstStatus] = normalizedStatuses;
        if (normalizedStatuses.every((status) => status === firstStatus)) {
            return firstStatus;
        }

        return null;
    }, [selectedFolders, statusOverrides]);

    useEffect(() => {
        setSelectedItems((prev) => prev.filter((selectedId) => items.some((item) => item.id === selectedId)));
    }, [items, setSelectedItems]);

    useEffect(() => {
        if (!hasSelectedItems) {
            closeBulkStatusDropdown();
        }
    }, [closeBulkStatusDropdown, hasSelectedItems]);

    useEffect(() => {
        const existingIds = new Set(items.map((item) => item.id));
        setStatusOverrides((prev) => {
            const filteredEntries = Object.entries(prev).filter(([folderId]) => existingIds.has(folderId));

            if (filteredEntries.length === Object.keys(prev).length) {
                return prev;
            }

            return Object.fromEntries(filteredEntries);
        });
    }, [items]);

    const activeFolder = useMemo(() => {
        if (!activeDropdown) return null;
        return items.find((item) => item.id === activeDropdown.id) ?? null;
    }, [activeDropdown, items]);

    const activeStatusFolder = useMemo(() => {
        if (!activeStatusDropdown) return null;
        return items.find((item) => item.id === activeStatusDropdown.id) ?? null;
    }, [activeStatusDropdown, items]);

    const resolveIsFavorite = useCallback(
        (folder: { id: string; is_favorite?: boolean }) =>
            favoriteOverrides[folder.id] ?? Boolean(folder.is_favorite),
        [favoriteOverrides],
    );

    const activeFolderIsFavorite = useMemo(() => {
        if (!activeFolder) return false;
        return resolveIsFavorite(activeFolder);
    }, [activeFolder, resolveIsFavorite]);

    const resolveFolderStatus = useCallback(
        (folder: { id: string; status: string }) =>
            statusOverrides[folder.id] ?? normalizeFolderStatus(folder.status),
        [statusOverrides],
    );

    const activeFolderStatus = useMemo(() => {
        if (!activeStatusFolder) return null;
        return toFolderStatusValue(resolveFolderStatus(activeStatusFolder));
    }, [activeStatusFolder, resolveFolderStatus]);

    const handleToggleFavorite = useCallback(async (targetFolder?: { id: string; is_favorite?: boolean } | null) => {
        const folder = targetFolder ?? activeFolder;
        if (!folder) return;

        const isFavorite = resolveIsFavorite(folder);
        try {
            if (isFavorite) {
                await removeFromFavorite(folder.id);
                setFavoriteOverrides((prev) => ({ ...prev, [folder.id]: false }));
                showToast({ message: 'Berhasil dihapus dari Berbintang', variant: 'success' });
            } else {
                await addToFavorite(folder.id);
                setFavoriteOverrides((prev) => ({ ...prev, [folder.id]: true }));
                showToast({ message: 'Berhasil ditambahkan ke Berbintang', variant: 'success' });
            }
            setTimeout(() => onRefresh?.(), 500);
        } catch (error) {
            const message =
                error instanceof Error
                    ? "Gagal memproses permintaan"
                    : isFavorite
                        ? 'Gagal menghapus dari Berbintang'
                        : 'Gagal menambahkan ke Berbintang';
            showToast({ message, variant: 'error' });
        }
    }, [activeFolder, addToFavorite, removeFromFavorite, showToast, onRefresh, resolveIsFavorite]);

    const handleFavoriteIconClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>, folder: { id: string; is_favorite?: boolean }) => {
            event.preventDefault();
            event.stopPropagation();
            if (!resolveIsFavorite(folder) || isFavoriteLoading) return;
            void handleToggleFavorite(folder);
        },
        [handleToggleFavorite, isFavoriteLoading, resolveIsFavorite],
    );

    const handleMoveToTrash = useCallback(async () => {
        if (!activeFolder) return;

        setIsTrashLoading(true);
        try {
            await apiPost(ENDPOINTS.USER.MULTIPLE_ITEM_DELETE, {
                items: [{ item_id: activeFolder.id, item_type: 'FOLDER' }],
            });
            showToast({ message: 'Berhasil dipindahkan ke sampah', variant: 'success' });
            setTimeout(() => onRefresh?.(), 500);
        } catch {
            showToast({ message: 'Gagal memindahkan ke sampah', variant: 'error' });
        } finally {
            setIsTrashLoading(false);
        }
    }, [activeFolder, onRefresh, showToast]);

    const handleOpenDetailSidebar = useCallback(() => {
        if (!activeFolder) return;
        setDetailSidebarFolder({
            id: activeFolder.id,
            name: activeFolder.folder_name,
        });
    }, [activeFolder]);

    const downloadFolderById = useCallback(async (folder: { id: string; folder_name: string }) => {
        const downloadUrl = ENDPOINTS.USER.FOLDER_DOWNLOAD.replace(':folder_id', folder.id);
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
                    // Ignore JSON parse error and keep fallback message.
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
            const fallbackName = `${folder.folder_name || 'folder'}.zip`;
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

    const handleDownloadFolder = useCallback(() => {
        if (!activeFolder) return;
        void downloadFolderById(activeFolder);
    }, [activeFolder, downloadFolderById]);

    const openRenameModalForTarget = useCallback((target: { id: string; name: string }) => {
        if (isRenamingFolder) return;
        setRenameTarget({ id: target.id, name: target.name });
        setRenameFolderName(target.name);
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
            const url = ENDPOINTS.USER.RENAME_FOLDER.replace(':folder_id', renameTarget.id);
            await apiPatch(url, { folder_name: normalizedFolderName });

            setRenameTarget(null);
            setRenameFolderName('');
            showToast({ message: 'Nama folder berhasil diperbarui', variant: 'success' });
            setTimeout(() => onRefresh?.(), 300);
        } catch (error) {
            setRenameError(error instanceof Error ? error.message : 'Gagal mengganti nama folder');
        } finally {
            setIsRenamingFolder(false);
        }
    }, [isRenamingFolder, onRefresh, renameFolderName, renameTarget, showToast]);

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

    const handleUpdateFolderStatus = useCallback(async (nextStatus: FolderStatusValue) => {
        if (!activeStatusFolder) return;

        const folderId = activeStatusFolder.id;
        const currentStatus = toFolderStatusValue(resolveFolderStatus(activeStatusFolder));

        if (currentStatus === nextStatus) return;

        setUpdatingStatusFolderId(folderId);

        try {
            await apiPatch(ENDPOINTS.USER.UPDATE_STATUS_FOLDER, {
                folder_id: folderId,
                status: nextStatus,
            });

            setStatusOverrides((prev) => ({ ...prev, [folderId]: nextStatus }));
            showToast({ message: 'Status folder berhasil diperbarui', variant: 'success' });
            setTimeout(() => onRefresh?.(), 500);
        } catch {
            showToast({ message: 'Gagal memperbarui status folder', variant: 'error' });
        } finally {
            setUpdatingStatusFolderId((prev) => (prev === folderId ? null : prev));
        }
    }, [activeStatusFolder, onRefresh, resolveFolderStatus, showToast]);

    const handleRenameFromMenu = useCallback(() => {
        if (!activeFolder) return;
        openRenameModalForTarget({
            id: activeFolder.id,
            name: activeFolder.folder_name,
        });
    }, [activeFolder, openRenameModalForTarget]);

    const folderMenuItems = useMemo<DropdownMenuItem[]>(
        () => [
            { label: 'Download folder', icon: <Download className="w-4 h-4" />, onClick: handleDownloadFolder },
            {
                label: 'Ganti nama',
                icon: <Edit3 className="w-4 h-4" />,
                onClick: handleRenameFromMenu,
                hasDivider: true,
                className: isRenamingFolder ? 'pointer-events-none opacity-60' : '',
            },
            { label: 'Lihat Detail', icon: <Info className="w-4 h-4" />, onClick: handleOpenDetailSidebar },
            {
                label: activeFolderIsFavorite ? 'Hapus dari berbintang' : 'Tambahkan ke berbintang',
                icon: activeFolderIsFavorite ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />,
                onClick: () => {
                    void handleToggleFavorite();
                },
                hasDivider: true,
                className: isFavoriteLoading ? 'pointer-events-none opacity-60' : '',
            },
            {
                label: 'Tambahkan ke sampah',
                icon: <Trash2 className="w-4 h-4" />,
                onClick: handleMoveToTrash,
                className: isTrashLoading ? 'pointer-events-none opacity-60' : '',
            },
        ],
        [
            activeFolderIsFavorite,
            handleDownloadFolder,
            handleMoveToTrash,
            handleOpenDetailSidebar,
            handleRenameFromMenu,
            handleToggleFavorite,
            isFavoriteLoading,
            isRenamingFolder,
            isTrashLoading,
        ],
    );

    const fallbackResolveFolderHref = useCallback(
        (folder: FolderItem) => {
            const resolvedSlug = slug ?? '';
            const resolvedTypeSlug = typeSlug || toSlug(folder.tipe_layanan || 'tipe-layanan');
            return `/services/${resolvedSlug}/${resolvedTypeSlug}/${folder.id}`;
        },
        [slug, typeSlug],
    );

    const handleRowClick = useCallback(
        (folder: FolderItem) => {
            const href = resolveFolderHref?.(folder) ?? fallbackResolveFolderHref(folder);
            router.push(href);
        },
        [fallbackResolveFolderHref, resolveFolderHref, router],
    );

    const handleBulkRename = useCallback(() => {
        if (!canBulkRename) return;

        const target = selectedFolders[0];
        if (!target) return;
        closeBulkStatusDropdown();
        openRenameModalForTarget({ id: target.id, name: target.folder_name });
    }, [canBulkRename, closeBulkStatusDropdown, openRenameModalForTarget, selectedFolders]);

    const handleBulkFavorite = useCallback(async () => {
        if (selectedFolders.length === 0 || isBulkActionLoading) return;

        const shouldRemoveFromFavorite = selectedFolders.every(
            (folder) => favoriteOverrides[folder.id] ?? Boolean(folder.is_favorite),
        );
        const payloadItems = selectedFolders.map((folder) => ({
            item_id: folder.id,
            item_type: 'FOLDER',
        }));

        setIsBulkActionLoading(true);
        try {
            if (shouldRemoveFromFavorite) {
                await apiPost(ENDPOINTS.USER.MULTIPLE_REMOVE_ITEM_FAVORITE, { items: payloadItems });
            } else {
                await apiPost(ENDPOINTS.USER.MULTIPLE_ITEM_FAVORITE, { items: payloadItems });
            }

            setFavoriteOverrides((prev) => {
                const next = { ...prev };
                selectedFolders.forEach((folder) => {
                    next[folder.id] = !shouldRemoveFromFavorite;
                });
                return next;
            });

            showToast({
                message: shouldRemoveFromFavorite
                    ? 'Berhasil menghapus pilihan dari berbintang'
                    : 'Berhasil menambahkan pilihan ke berbintang',
                variant: 'success',
            });
            setSelectedItems([]);
            setTimeout(() => onRefresh?.(), 300);
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
    }, [favoriteOverrides, isBulkActionLoading, onRefresh, selectedFolders, setSelectedItems, showToast]);

    const handleBulkDownload = useCallback(() => {
        if (selectedFolders.length === 0) return;

        if (selectedFolders.length > 1) {
            showToast({
                message: `Download massal untuk ${selectedFolders.length} folder belum tersedia`,
                variant: 'info',
            });
            return;
        }

        const target = selectedFolders[0];
        if (!target) return;
        void downloadFolderById({ id: target.id, folder_name: target.folder_name });
    }, [downloadFolderById, selectedFolders, showToast]);

    const handleBulkMoveToTrash = useCallback(async () => {
        if (selectedFolders.length === 0 || isBulkActionLoading) return;

        setIsBulkActionLoading(true);
        try {
            await apiPost(ENDPOINTS.USER.MULTIPLE_ITEM_DELETE, {
                items: selectedFolders.map((folder) => ({
                    item_id: folder.id,
                    item_type: 'FOLDER',
                })),
            });

            setSelectedItems([]);
            showToast({
                message: `${selectedFolders.length} folder berhasil dipindahkan ke sampah`,
                variant: 'success',
            });
            setTimeout(() => onRefresh?.(), 300);
        } catch {
            showToast({ message: 'Gagal memindahkan pilihan ke sampah', variant: 'error' });
        } finally {
            setIsBulkActionLoading(false);
        }
    }, [isBulkActionLoading, onRefresh, selectedFolders, setSelectedItems, showToast]);

    const handleOpenBulkStatusDropdown = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            closeDropdown();
            closeStatusDropdown();
            openBulkStatusDropdown(event, 'bulk-status');
        },
        [closeDropdown, closeStatusDropdown, openBulkStatusDropdown],
    );

    const handleBulkUpdateStatus = useCallback(async (nextStatus: FolderStatusValue) => {
        if (selectedFolders.length === 0 || isBulkActionLoading) return;

        const foldersToUpdate = selectedFolders.filter(
            (folder) => toFolderStatusValue(statusOverrides[folder.id] ?? normalizeFolderStatus(folder.status)) !== nextStatus,
        );
        if (foldersToUpdate.length === 0) return;

        setIsBulkActionLoading(true);
        try {
            const updateResults = await Promise.allSettled(
                foldersToUpdate.map((folder) =>
                    apiPatch(ENDPOINTS.USER.UPDATE_STATUS_FOLDER, {
                        folder_id: folder.id,
                        status: nextStatus,
                    }),
                ),
            );

            const successIds = foldersToUpdate
                .filter((_, index) => updateResults[index]?.status === 'fulfilled')
                .map((folder) => folder.id);

            if (successIds.length > 0) {
                setStatusOverrides((prev) => {
                    const next = { ...prev };
                    successIds.forEach((id) => {
                        next[id] = nextStatus;
                    });
                    return next;
                });
            }

            if (successIds.length === foldersToUpdate.length) {
                showToast({
                    message: `Status ${foldersToUpdate.length} folder berhasil diperbarui`,
                    variant: 'success',
                });
            } else if (successIds.length > 0) {
                showToast({
                    message: `Status ${successIds.length} dari ${foldersToUpdate.length} folder berhasil diperbarui`,
                    variant: 'info',
                });
            } else {
                showToast({ message: 'Gagal memperbarui status pilihan', variant: 'error' });
            }
            setTimeout(() => onRefresh?.(), 300);
        } catch {
            showToast({ message: 'Gagal memperbarui status pilihan', variant: 'error' });
        } finally {
            setIsBulkActionLoading(false);
        }
    }, [isBulkActionLoading, onRefresh, selectedFolders, showToast, statusOverrides]);

    return (
        <div className="bg-white shadow-sm hover:shadow-md border border-gray-200 rounded-xl overflow-hidden transition-shadow">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-gray-100 border-b">
                            <th className="px-6 py-4 w-12">
                                <input
                                    type="checkbox"
                                    className="border-gray-300 rounded focus:ring-[#8B7355] text-[#8B7355]"
                                    checked={isAllSelected}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-4 font-semibold text-gray-500 text-xs text-left uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-4 font-semibold text-gray-500 text-xs text-left uppercase tracking-wider">Author</th>
                            <th className="px-6 py-4 font-semibold text-gray-500 text-xs text-left uppercase tracking-wider">Dimodifikasi</th>
                            <th className="px-6 py-4 font-semibold text-gray-500 text-xs text-left uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-500 text-xs text-right uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center">
                                    <div className="flex flex-col justify-center items-center">
                                        <div className="bg-gray-50 mb-3 p-3 rounded-full">
                                            <Search className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="font-medium text-gray-900">Belum ada data</p>
                                        <p className="mt-1 text-gray-500 text-sm">Buat folder baru untuk memulai</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => {
                                const isFavorite = resolveIsFavorite(item);
                                const resolvedStatus = resolveFolderStatus(item);
                                const isUpdatingStatus = updatingStatusFolderId === item.id;

                                return (
                                    <tr
                                        key={item.id}
                                        className="group hover:bg-gray-50/80 transition-colors cursor-pointer"
                                        onClick={() => handleRowClick(item)}
                                    >
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="border-gray-300 rounded focus:ring-[#8B7355] text-[#8B7355]"
                                                checked={isSelected(item.id)}
                                                onChange={() => toggleSelectItem(item.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="">
                                                    <Image src={folderIcon} alt="Folder" width={20} height={20} className="w-5 h-5" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900 group-hover:text-[#8B7355] transition-colors">
                                                        {item.folder_name}
                                                    </span>
                                                    {isFavorite && (
                                                        <button
                                                            type="button"
                                                            onClick={(event) => handleFavoriteIconClick(event, item)}
                                                            disabled={isFavoriteLoading}
                                                            title="Hapus dari Berbintang"
                                                            className={`p-1 rounded-full transition-colors ${
                                                                isFavoriteLoading
                                                                    ? 'cursor-not-allowed opacity-60'
                                                                    : 'cursor-pointer hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            <Star className="fill-gray-900 w-4 h-4 text-gray-900" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">{item.user}</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm text-nowrap">
                                            {new Date(item.updated_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={(event) => handleOpenStatusDropdown(event, item.id)}
                                                disabled={isUpdatingStatus}
                                                className={`inline-flex rounded-md transition-opacity ${statusTriggerClass} ${
                                                    isStatusOpen(item.id)
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
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={(event) => handleOpenActionDropdown(event, item.id)}
                                                className={`p-1 rounded-full cursor-pointer transition-all ${triggerClass} ${isOpen(item.id) ? 'bg-gray-200 text-gray-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
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
            <DropdownMenu
                dropdown={activeDropdown}
                menuClass={menuClass}
                items={folderMenuItems}
                onClose={closeDropdown}
            />
            <FolderStatusPopover
                dropdown={activeStatusDropdown}
                menuClass={statusMenuClass}
                activeStatus={activeFolderStatus}
                isLoading={Boolean(updatingStatusFolderId)}
                onSelect={(status) => {
                    void handleUpdateFolderStatus(status);
                }}
                onClose={closeStatusDropdown}
            />
            <FolderStatusPopover
                dropdown={activeBulkStatusDropdown}
                menuClass={bulkStatusMenuClass}
                activeStatus={activeBulkStatus}
                isLoading={isBulkActionLoading}
                onSelect={(status) => {
                    void handleBulkUpdateStatus(status);
                }}
                onClose={closeBulkStatusDropdown}
            />
            <FolderDetailOffcanvas
                folderId={detailSidebarFolder?.id ?? null}
                folderName={detailSidebarFolder?.name}
                onClose={() => setDetailSidebarFolder(null)}
            />

            <Toast toast={toast} onClose={hideToast} position="bottom-left" />
            {hasSelectedItems && (
                <BulkActionToast
                    onStatusClick={handleOpenBulkStatusDropdown}
                    onRename={handleBulkRename}
                    onToggleFavorite={() => {
                        void handleBulkFavorite();
                    }}
                    onDownload={handleBulkDownload}
                    onMoveToTrash={() => {
                        void handleBulkMoveToTrash();
                    }}
                    onCancel={() => setSelectedItems([])}
                    favoriteLabel={bulkFavoriteLabel}
                    disabled={isBulkActionLoading || isRenamingFolder}
                    showRename={canBulkRename}
                    statusDisabled={isBulkActionLoading || isRenamingFolder}
                />
            )}
        </div>
    );
}
