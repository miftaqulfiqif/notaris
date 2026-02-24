'use client';

import { useMemo, useCallback, useState, useEffect, type MouseEvent } from 'react';
import { MoreVertical, Search, FileText, Star, Download, Pencil, Info, Trash2, StarOff } from 'lucide-react';
import { FileItem } from '@/features/services/types';
import { useDropdown } from '@/shared/hooks/useDropdown';
import { DropdownMenu } from '@/shared/components/DropdownMenu';
import { BulkActionToast } from '@/shared/components/BulkActionToast';
import { useFavoriteFile } from '@/features/services/presentation/hooks/useFavoriteFile';
import { useToast } from '@/shared/hooks/useToast';
import { Toast } from '@/shared/components/Toast';
import { useSelection } from '@/shared/hooks/useSelection';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { apiPost } from '@/shared/api/api-client';
import type { DropdownMenuItem } from '@/shared/components/DropdownMenu';

interface FileTableProps {
    items: FileItem[];
    onRefresh?: () => void;
}

export function FileTable({ items, onRefresh }: FileTableProps) {
    const { activeDropdown, openDropdown, closeDropdown, triggerClass, menuClass } = useDropdown<string>();
    const { addToFavorite, removeFromFavorite, isLoading: isFavoriteLoading } = useFavoriteFile();
    const { toast, showToast, hideToast } = useToast();
    const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
    const { selectedItems, setSelectedItems, toggleSelectAll, toggleSelectItem, isSelected, isAllSelected } = useSelection({
        items,
        itemIdKey: 'id',
    });

    const activeFile = useMemo(() => {
        if (!activeDropdown) return null;
        return items.find((item) => item.id === activeDropdown.id) ?? null;
    }, [activeDropdown, items]);

    const selectedFiles = useMemo(
        () => items.filter((item) => selectedItems.includes(item.id)),
        [items, selectedItems],
    );

    const hasSelectedItems = selectedFiles.length > 0;

    useEffect(() => {
        setSelectedItems((prev) => prev.filter((selectedId) => items.some((item) => item.id === selectedId)));
    }, [items, setSelectedItems]);

    const resolveIsFavorite = useCallback(
        (file: { id: string; is_favorite?: boolean }) =>
            favoriteOverrides[file.id] ?? Boolean(file.is_favorite),
        [favoriteOverrides],
    );

    const activeFileIsFavorite = useMemo(() => {
        if (!activeFile) return false;
        return resolveIsFavorite(activeFile);
    }, [activeFile, resolveIsFavorite]);

    const handleToggleFavorite = useCallback(async (targetFile?: { id: string; is_favorite?: boolean } | null) => {
        const file = targetFile ?? activeFile;
        if (!file) return;

        const isFavorite = resolveIsFavorite(file);
        try {
            if (isFavorite) {
                await removeFromFavorite(file.id);
                setFavoriteOverrides((prev) => ({ ...prev, [file.id]: false }));
                showToast({ message: 'Berhasil dihapus dari Berbintang', variant: 'success' });
            } else {
                await addToFavorite(file.id);
                setFavoriteOverrides((prev) => ({ ...prev, [file.id]: true }));
                showToast({ message: 'Berhasil ditambahkan ke Berbintang', variant: 'success' });
            }
            setTimeout(() => onRefresh?.(), 500);
        } catch {
            const message = isFavorite
                ? 'Gagal menghapus dari Berbintang'
                : 'Gagal menambahkan ke Berbintang';
            showToast({ message, variant: 'error' });
        }
    }, [activeFile, addToFavorite, removeFromFavorite, showToast, onRefresh, resolveIsFavorite]);

    const handleFavoriteIconClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>, file: { id: string; is_favorite?: boolean }) => {
            event.preventDefault();
            event.stopPropagation();
            if (!resolveIsFavorite(file) || isFavoriteLoading) return;
            void handleToggleFavorite(file);
        },
        [handleToggleFavorite, isFavoriteLoading, resolveIsFavorite],
    );

    const handleMoveToTrash = useCallback(async () => {
        if (!activeFile) return;

        try {
            await apiPost(ENDPOINTS.USER.ITEM_DELETE, {
                item_id: activeFile.id,
                item_type: 'DOCUMENT',
            });
            showToast({ message: 'Berhasil dipindahkan ke sampah', variant: 'success' });
            setTimeout(() => onRefresh?.(), 500);
        } catch {
            showToast({ message: 'Gagal memindahkan ke sampah', variant: 'error' });
        }
    }, [activeFile, showToast, onRefresh]);

    const handleDownloadFile = useCallback(() => {
        if (!activeFile) return;

        const downloadUrl = ENDPOINTS.USER.DOCUMENT_DOWNLOAD.replace(':documentId', activeFile.id);
        const downloadWindow = window.open(downloadUrl, '_blank', 'noopener,noreferrer');
        if (!downloadWindow) {
            showToast({ message: 'Gagal membuka download file', variant: 'error' });
            return;
        }

        showToast({ message: 'Download file dimulai', variant: 'success' });
    }, [activeFile, showToast]);

    const handleRenameFile = useCallback(() => {
        showToast({ message: 'Fitur ganti nama file belum tersedia', variant: 'info' });
    }, [showToast]);

    const handleViewDetail = useCallback(() => {
        showToast({ message: 'Fitur lihat detail file belum tersedia', variant: 'info' });
    }, [showToast]);

    const fileMenuItems = useMemo<DropdownMenuItem[]>(
        () => [
            { label: 'Download file', icon: <Download className="w-4 h-4" />, onClick: handleDownloadFile },
            { label: 'Ganti nama', icon: <Pencil className="w-4 h-4" />, hasDivider: true, onClick: handleRenameFile },
            { label: 'Lihat Detail', icon: <Info className="w-4 h-4" />, onClick: handleViewDetail },
            {
                label: activeFileIsFavorite ? 'Hapus dari Berbintang' : 'Tambahkan ke berbintang',
                icon: activeFileIsFavorite ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />,
                onClick: () => {
                    void handleToggleFavorite();
                },
                className: isFavoriteLoading ? 'pointer-events-none opacity-60' : '',
            },
            {
                label: 'Tambahkan ke sampah',
                icon: <Trash2 className="w-4 h-4" />,
                onClick: handleMoveToTrash,
                className: 'text-red-600 hover:bg-red-50',
            },
        ],
        [
            activeFileIsFavorite,
            handleDownloadFile,
            handleMoveToTrash,
            handleRenameFile,
            handleToggleFavorite,
            handleViewDetail,
            isFavoriteLoading,
        ],
    );

    const handleBulkRename = useCallback(() => {
        showToast({ message: `Ganti nama massal untuk ${selectedFiles.length} file belum tersedia`, variant: 'info' });
    }, [selectedFiles.length, showToast]);

    const handleBulkFavorite = useCallback(() => {
        showToast({ message: `Aksi berbintang massal untuk ${selectedFiles.length} file belum tersedia`, variant: 'info' });
    }, [selectedFiles.length, showToast]);

    const handleBulkDownload = useCallback(() => {
        showToast({ message: `Download massal untuk ${selectedFiles.length} file belum tersedia`, variant: 'info' });
    }, [selectedFiles.length, showToast]);

    const handleBulkMoveToTrash = useCallback(() => {
        showToast({ message: `Pindah ke sampah massal untuk ${selectedFiles.length} file belum tersedia`, variant: 'info' });
    }, [selectedFiles.length, showToast]);

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
                            <th className="px-6 py-4 font-semibold text-gray-900 group-hover:text-gray-900 text-xs text-left uppercase tracking-wider">Nama File</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 group-hover:text-gray-900 text-xs text-left uppercase tracking-wider">Author</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 group-hover:text-gray-900 text-xs text-left uppercase tracking-wider">Dimodifikasi</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 group-hover:text-gray-900 text-xs text-right uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col justify-center items-center">
                                        <div className="bg-gray-50 mb-3 p-3 rounded-full">
                                            <Search className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="font-medium text-gray-900">Belum ada file</p>
                                        <p className="mt-1 text-gray-500 text-sm">Upload file baru untuk memulai</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => {
                                const isFavorite = resolveIsFavorite(item);

                                return (
                                    <tr key={item.id} className="group hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                className="border-gray-300 rounded focus:ring-[#8B7355] text-[#8B7355]"
                                                checked={isSelected(item.id)}
                                                onChange={() => toggleSelectItem(item.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-red-50 group-hover:bg-red-100 p-2 border border-transparent group-hover:border-red-200 rounded-lg transition-all">
                                                    <FileText className="w-5 h-5 text-red-500" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900 transition-colors">
                                                        {item.file_name}
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
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                className={`${triggerClass} hover:bg-gray-100 p-1 rounded-full text-gray-400 hover:text-gray-600 transition-all`}
                                                onClick={(e) => openDropdown(e, item.id)}
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
            <DropdownMenu
                dropdown={activeDropdown}
                menuClass={menuClass}
                items={fileMenuItems}
                onClose={closeDropdown}
            />
            <Toast toast={toast} onClose={hideToast} position="bottom-left" />
            {hasSelectedItems && (
                <BulkActionToast
                    onRename={handleBulkRename}
                    onToggleFavorite={handleBulkFavorite}
                    onDownload={handleBulkDownload}
                    onMoveToTrash={handleBulkMoveToTrash}
                    onCancel={() => setSelectedItems([])}
                />
            )}
        </div>
    );
}
