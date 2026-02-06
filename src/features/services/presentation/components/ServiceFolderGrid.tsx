'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Folder, MoreVertical, Download, Info, Star, Trash2 } from 'lucide-react';
import { useServiceTypes } from '@/features/services/context/ServiceTypesContext';
import { useFavoriteServiceType } from '@/features/services/presentation/hooks/useFavoriteServiceType';
import { useDropdown } from '@/shared/hooks/useDropdown';
import { useToast } from '@/shared/hooks/useToast';
import { DropdownMenu } from '@/shared/components/DropdownMenu';
import { Toast } from '@/shared/components/Toast';
import type { DropdownMenuItem } from '@/shared/components/DropdownMenu';

export function ServiceFolderGrid() {
    const { serviceTypes, isLoading } = useServiceTypes();
    const params = useParams();
    const serviceSlug = params?.slug as string;
    const { addToFavorite, isLoading: isFavoriteLoading } = useFavoriteServiceType();
    const { toast, showToast, hideToast } = useToast();

    const { activeDropdown, openDropdown, closeDropdown, isOpen, triggerClass, menuClass } =
        useDropdown<string>({
            triggerClass: 'folder-dropdown-trigger',
            menuClass: 'folder-dropdown-menu',
        });

    const activeFolder = useMemo(() => {
        if (!activeDropdown) return null;
        return serviceTypes.find((folder) => folder.id === activeDropdown.id) ?? null;
    }, [activeDropdown, serviceTypes]);

    const handleAddToFavorite = useCallback(async () => {
        if (!activeFolder) return;

        try {
            await addToFavorite(activeFolder.id);
            showToast({ message: 'Berhasil ditambahkan ke Berbintang', variant: 'success' });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Gagal menambahkan ke Berbintang';
            showToast({ message, variant: 'error' });
        }
    }, [activeFolder, addToFavorite, showToast]);

    const folderMenuItems = useMemo<DropdownMenuItem[]>(
        () => [
            { label: 'Download Folder', icon: <Download className="w-4 h-4" />, hasDivider: true },
            { label: 'Lihat Detail Folder', icon: <Info className="w-4 h-4" /> },
            {
                label: 'Tambahkan ke Berbintang',
                icon: <Star className="w-4 h-4" />,
                hasDivider: true,
                onClick: handleAddToFavorite,
                className: isFavoriteLoading ? 'pointer-events-none opacity-60' : '',
            },
            { label: 'Tambahkan ke Sampah', icon: <Trash2 className="w-4 h-4" /> },
        ],
        [handleAddToFavorite, isFavoriteLoading],
    );

    if (isLoading) {
        return <div className="bg-gray-100 mb-10 rounded-xl w-full h-32 animate-pulse"></div>;
    }

    return (
        <div className="mb-10 w-full overflow-hidden">
            <div className="pb-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                <div
                    className="gap-3 grid grid-rows-2 grid-flow-col"
                    style={{ width: 'max-content' }}
                >
                    {serviceTypes.map((folder, index) => {
                        const typeSlug = folder.name.toLowerCase().replace(/\s+/g, '-');

                        return (
                            <Link
                                key={index}
                                href={`/services/${serviceSlug}/${typeSlug}?id=${folder.id}`}
                                className="group flex justify-between items-center bg-gray-100/60 hover:bg-gray-100 px-3 py-2 border border-gray-200 rounded-xl w-[210px] transition-all cursor-pointer shrink-0"
                                title={folder.name}
                            >
                                <div className="flex flex-1 items-center gap-3 min-w-0">
                                    <div className="bg-gray-50 group-hover:bg-[#FDF8F3] p-2 rounded-lg transition-colors shrink-0">
                                        <Folder className="w-5 h-5 text-gray-600 group-hover:text-(--sidebar-primary)" />
                                    </div>
                                    <span className="font-semibold text-gray-700 group-hover:text-gray-900 truncate">{folder.name}</span>
                                </div>
                                <button
                                    onClick={(e) => openDropdown(e, folder.id)}
                                    className={`p-1 rounded-full cursor-pointer transition-all shrink-0 ${triggerClass} ${isOpen(folder.id) ? 'bg-gray-200 text-gray-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </Link>
                        );
                    })}
                </div>
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
