'use client';

import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import { MoreVertical, Search, Download, Edit3, Info, Star, StarOff, Trash2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import folderIcon from '@/assets/icons/folder.png';
import { FolderItem } from '@/features/services/types';
import { StatusBadge } from '@/shared/components';
import { useFavoriteFolder } from '@/features/services/presentation/hooks/useFavoriteFolder';
import { useDropdown } from '@/shared/hooks/useDropdown';
import { useToast } from '@/shared/hooks/useToast';
import { DropdownMenu } from '@/shared/components/DropdownMenu';
import { Toast } from '@/shared/components/Toast';
import { apiPost } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { DropdownMenuItem } from '@/shared/components/DropdownMenu';

interface FolderTableProps {
    items: FolderItem[];
    onRefresh?: () => void;
}

export function FolderTable({ items, onRefresh }: FolderTableProps) {
    const router = useRouter();
    const params = useParams();
    const { slug, typeSlug } = params as { slug: string; typeSlug: string };
    const { addToFavorite, removeFromFavorite, isLoading: isFavoriteLoading } = useFavoriteFolder();
    const { toast, showToast, hideToast } = useToast();
    const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
    const [isTrashLoading, setIsTrashLoading] = useState(false);
    const { activeDropdown, openDropdown, closeDropdown, isOpen, triggerClass, menuClass } =
        useDropdown<string>({
            triggerClass: 'folder-table-dropdown-trigger',
            menuClass: 'folder-table-dropdown-menu',
        });

    const activeFolder = useMemo(() => {
        if (!activeDropdown) return null;
        return items.find((item) => item.id === activeDropdown.id) ?? null;
    }, [activeDropdown, items]);

    const resolveIsFavorite = useCallback(
        (folder: { id: string; is_favorite?: boolean }) =>
            favoriteOverrides[folder.id] ?? Boolean(folder.is_favorite),
        [favoriteOverrides],
    );

    const activeFolderIsFavorite = useMemo(() => {
        if (!activeFolder) return false;
        return resolveIsFavorite(activeFolder);
    }, [activeFolder, resolveIsFavorite]);

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

    const folderMenuItems = useMemo<DropdownMenuItem[]>(
        () => [
            { label: 'Download file', icon: <Download className="w-4 h-4" /> },
            { label: 'Ganti nama', icon: <Edit3 className="w-4 h-4" />, hasDivider: true },
            { label: 'Lihat Detail', icon: <Info className="w-4 h-4" /> },
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
        [activeFolderIsFavorite, handleMoveToTrash, handleToggleFavorite, isFavoriteLoading, isTrashLoading],
    );

    const handleRowClick = (folderId: string) => {
        router.push(`/services/${slug}/${typeSlug}/${folderId}`);
    };

    return (
        <div className="bg-white shadow-sm hover:shadow-md border border-gray-200 rounded-xl overflow-hidden transition-shadow">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-gray-100 border-b">
                            <th className="px-6 py-4 w-12">
                                <input type="checkbox" className="border-gray-300 rounded focus:ring-[#8B7355] text-[#8B7355]" />
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

                                return (
                                    <tr
                                        key={item.id}
                                        className="group hover:bg-gray-50/80 transition-colors cursor-pointer"
                                        onClick={() => handleRowClick(item.id)}
                                    >
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <input type="checkbox" className="border-gray-300 rounded focus:ring-[#8B7355] text-[#8B7355]" />
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
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={(e) => openDropdown(e, item.id)}
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

            <DropdownMenu
                dropdown={activeDropdown}
                menuClass={menuClass}
                items={folderMenuItems}
                onClose={closeDropdown}
            />

            <Toast toast={toast} onClose={hideToast} position="bottom-left" />
        </div>
    );
}
