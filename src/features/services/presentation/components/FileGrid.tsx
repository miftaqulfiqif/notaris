'use client';

import { useCallback, useMemo } from 'react';
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

    const activeFile = useMemo(() => {
        if (!activeDropdown) return null;
        return items.find((item) => item.id === activeDropdown.id) ?? null;
    }, [activeDropdown, items]);

    const handleToggleFavorite = useCallback(async () => {
        if (!activeFile) return;

        const isFavorite = activeFile.is_favorite;
        try {
            if (isFavorite) {
                await removeFromFavorite(activeFile.id);
                showToast({ message: 'Berhasil dihapus dari Berbintang', variant: 'success' });
            } else {
                await addToFavorite(activeFile.id);
                showToast({ message: 'Berhasil ditambahkan ke Berbintang', variant: 'success' });
            }
            setTimeout(() => onRefresh?.(), 500);
        } catch {
            const message = isFavorite
                ? 'Gagal menghapus dari Berbintang'
                : 'Gagal menambahkan ke Berbintang';
            showToast({ message, variant: 'error' });
        }
    }, [activeFile, addToFavorite, removeFromFavorite, showToast, onRefresh]);

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

    const fileMenuItems = useMemo<DropdownMenuItem[]>(
        () => [
            { label: 'Download file', icon: <Download className="w-4 h-4" /> },
            { label: 'Ganti nama', icon: <Pencil className="w-4 h-4" />, hasDivider: true },
            { label: 'Lihat Detail', icon: <Info className="w-4 h-4" /> },
            {
                label: activeFile?.is_favorite ? 'Hapus dari berbintang' : 'Tambahkan ke berbintang',
                icon: activeFile?.is_favorite ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />,
                onClick: handleToggleFavorite,
                className: isFavoriteLoading ? 'pointer-events-none opacity-60' : '',
            },
            {
                label: 'Tambahkan ke sampah',
                icon: <Trash2 className="w-4 h-4" />,
                onClick: handleMoveToTrash,
            },
        ],
        [handleToggleFavorite, handleMoveToTrash, isFavoriteLoading, activeFile],
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
                {items.map((item) => (
                    <div key={item.id} className="group bg-white hover:shadow-md border border-gray-200 rounded-xl overflow-hidden transition-shadow">
                        <div className="relative flex justify-center items-center bg-gray-50 p-4 border-gray-100 border-b aspect-4/3">
                            <div className="relative flex justify-center items-center bg-white shadow-sm border border-gray-200 w-full h-full overflow-hidden">
                                <div className="absolute inset-2 border-2 border-gray-200 border-double" />
                                <div className="flex justify-center items-center bg-gray-100 rounded-full w-12 h-12">
                                    <FileText className="w-6 h-6 text-gray-300" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4">
                            <div className="w-6 h-6">
                                <Image src={pdfIcon} alt="PDF" width={24} height={24} className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <h3 className="font-semibold text-gray-900 truncate" title={item.file_name}>
                                        {item.file_name}
                                    </h3>
                                    {item.is_favorite && (
                                        <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900 shrink-0" />
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
                ))}
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
