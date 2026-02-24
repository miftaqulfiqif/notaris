'use client';

import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import { MoreVertical, FileText, Download, Pencil, Info, Star, StarOff, Trash2 } from 'lucide-react';
import { FileItem } from '@/features/services/types';
import Image from 'next/image';
import pdfIcon from '@/assets/icons/PDF.svg';
import { useDropdown } from '@/shared/hooks/useDropdown';
import { DropdownMenu } from '@/shared/components/DropdownMenu';
import { useFavoriteFile } from '@/features/services/presentation/hooks/useFavoriteFile';
import { useToast } from '@/shared/hooks/useToast';
import { Toast } from '@/shared/components/Toast';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { apiPost } from '@/shared/api/api-client';
import type { DropdownMenuItem } from '@/shared/components/DropdownMenu';

interface FileGridProps {
    items: FileItem[];
    onRefresh?: () => void;
}

export function FileGrid({ items, onRefresh }: FileGridProps) {
    const { activeDropdown, openDropdown, closeDropdown, triggerClass, menuClass } = useDropdown<string>();
    const { addToFavorite, removeFromFavorite, isLoading: isFavoriteLoading } = useFavoriteFile();
    const { toast, showToast, hideToast } = useToast();
    const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
    const [previewErrors, setPreviewErrors] = useState<Record<string, boolean>>({});

    const activeFile = useMemo(() => {
        if (!activeDropdown) return null;
        return items.find((item) => item.id === activeDropdown.id) ?? null;
    }, [activeDropdown, items]);

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

    const handlePreviewError = useCallback((fileId: string) => {
        setPreviewErrors((prev) => ({ ...prev, [fileId]: true }));
    }, []);

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
                label: activeFileIsFavorite ? 'Hapus dari berbintang' : 'Tambahkan ke berbintang',
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

    if (items.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center bg-gray-50 p-12 border-2 border-gray-200 border-dashed rounded-xl">
                <div className="bg-white shadow-sm mb-3 p-3 rounded-full">
                    <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900">Belum ada file</p>
                <p className="mt-1 text-gray-500 text-sm">Upload file baru untuk memulai</p>
            </div>
        );
    }

    return (
        <>
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => {
                    const isFavorite = resolveIsFavorite(item);
                    const previewUrl = ENDPOINTS.USER.DOCUMENT_VIEW.replace(':documentId', item.id);
                    const hasPreviewError = Boolean(previewErrors[item.id]);

                    return (
                        <div key={item.id} className="group bg-white hover:shadow-md border border-gray-200 rounded-xl overflow-hidden transition-shadow">
                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                            >
                                <div className="relative flex justify-center items-center bg-gray-50 p-4 border-gray-100 border-b aspect-4/3">
                                    <div className="relative bg-white shadow-sm border border-gray-200 w-full h-full overflow-hidden">
                                        {hasPreviewError ? (
                                            <div className="flex justify-center items-center bg-gray-100 w-full h-full">
                                                <div className="flex justify-center items-center bg-gray-200 rounded-full w-12 h-12">
                                                    <FileText className="w-6 h-6 text-gray-400" />
                                                </div>
                                            </div>
                                        ) : (
                                            <iframe
                                                src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                                title={`Preview ${item.file_name}`}
                                                loading="lazy"
                                                className="border-0 w-full h-full pointer-events-none"
                                                onError={() => handlePreviewError(item.id)}
                                            />
                                        )}
                                    </div>
                                    <div className="absolute inset-4 flex justify-center items-end opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <span className="bg-black/65 px-3 py-1.5 rounded-full font-medium text-white text-xs">
                                            Klik untuk preview
                                        </span>
                                    </div>
                                </div>
                            </a>

                            <div className="flex items-center gap-3 p-4">
                                <div className="w-6 h-6">
                                    <Image src={pdfIcon} alt="PDF" width={24} height={24} className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <a
                                            href={previewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block font-semibold text-gray-900 hover:text-[#8B7355] truncate transition-colors"
                                            title={`Preview ${item.file_name}`}
                                        >
                                            {item.file_name}
                                        </a>
                                        {isFavorite && (
                                            <button
                                                type="button"
                                                onClick={(event) => handleFavoriteIconClick(event, item)}
                                                disabled={isFavoriteLoading}
                                                title="Hapus dari Berbintang"
                                                className={`p-1 rounded-full transition-colors shrink-0 ${
                                                    isFavoriteLoading
                                                        ? 'cursor-not-allowed opacity-60'
                                                        : 'cursor-pointer hover:bg-gray-200'
                                                }`}
                                            >
                                                <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900 shrink-0" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-xs">
                                        <span className="max-w-20 truncate">{item.user}</span>
                                        <span className="bg-gray-300 rounded-full w-1 h-1 shrink-0" />
                                        <span className="truncate">
                                            {new Date(item.updated_at).toLocaleDateString('id-ID', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className={`${triggerClass} hover:bg-gray-100 p-1 rounded-full text-gray-400 hover:text-gray-600 transition-all shrink-0`}
                                    onClick={(e) => openDropdown(e, item.id)}
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <DropdownMenu
                dropdown={activeDropdown}
                menuClass={menuClass}
                items={fileMenuItems}
                onClose={closeDropdown}
            />
            <Toast toast={toast} onClose={hideToast} position="bottom-left" />
        </>
    );
}
