'use client';

import { useMemo, useCallback } from 'react';
import { MoreVertical, Search, FileText, Star, Download, Pencil, Info, Trash2, StarOff } from 'lucide-react';
import { FileItem } from '@/features/services/types';
import { useDropdown } from '@/shared/hooks/useDropdown';
import { DropdownMenu } from '@/shared/components/DropdownMenu';
import { useFavoriteFile } from '@/features/services/presentation/hooks/useFavoriteFile';
import { useToast } from '@/shared/hooks/useToast';
import { Toast } from '@/shared/components/Toast';
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
                label: activeFile?.is_favorite ? 'Hapus dari Berbintang' : 'Tambahkan ke berbintang',
                icon: activeFile?.is_favorite ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />,
                onClick: handleToggleFavorite,
                className: isFavoriteLoading ? 'pointer-events-none opacity-60' : '',
            },
            {
                label: 'Tambahkan ke sampah',
                icon: <Trash2 className="w-4 h-4" />,
                onClick: handleMoveToTrash,
                className: 'text-red-600 hover:bg-red-50',
            },
        ],
        [handleToggleFavorite, handleMoveToTrash, isFavoriteLoading, activeFile],
    );

    return (
        <div className="bg-white shadow-sm hover:shadow-md border border-gray-200 rounded-xl overflow-hidden transition-shadow">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-gray-100 border-b">
                            <th className="px-6 py-4 w-12">
                                <input type="checkbox" className="border-gray-300 rounded focus:ring-[#8B7355] text-[#8B7355]" />
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
                            items.map((item) => (
                                <tr key={item.id} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="border-gray-300 rounded focus:ring-[#8B7355] text-[#8B7355]" />
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
                                                {item.is_favorite && (
                                                    <Star className="fill-gray-900 w-4 h-4 text-gray-900" />
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
                            ))
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
        </div>
    );
}
