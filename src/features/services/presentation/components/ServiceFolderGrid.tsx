'use client';

import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Folder, MoreVertical, Download, Info, Star, StarOff, Trash2 } from 'lucide-react';
import { useServiceTypes } from '@/features/services/context/ServiceTypesContext';
import { useFavoriteServiceType } from '@/features/services/presentation/hooks/useFavoriteServiceType';
import { useDropdown } from '@/shared/hooks/useDropdown';
import { useToast } from '@/shared/hooks/useToast';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { DropdownMenu } from '@/shared/components/DropdownMenu';
import { Toast } from '@/shared/components/Toast';
import type { DropdownMenuItem } from '@/shared/components/DropdownMenu';
import { ServiceTypeDetailOffcanvas } from '@/features/services/presentation/components/ServiceTypeDetailOffcanvas';

export function ServiceFolderGrid() {
    const { serviceTypes, isLoading } = useServiceTypes();
    const params = useParams();
    const serviceSlug = params?.slug as string;
    const { addToFavorite, removeFromFavorite, isLoading: isFavoriteLoading } =
        useFavoriteServiceType();
    const { toast, showToast, hideToast } = useToast();
    const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
    const [detailSidebarServiceType, setDetailSidebarServiceType] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const { activeDropdown, openDropdown, closeDropdown, isOpen, triggerClass, menuClass } =
        useDropdown<string>({
            triggerClass: 'folder-dropdown-trigger',
            menuClass: 'folder-dropdown-menu',
        });

    const activeFolder = useMemo(() => {
        if (!activeDropdown) return null;
        return serviceTypes.find((folder) => folder.id === activeDropdown.id) ?? null;
    }, [activeDropdown, serviceTypes]);

    const resolveIsFavorite = useCallback(
        (folder: { id: string; is_favorite?: boolean }) =>
            favoriteOverrides[folder.id] ?? Boolean(folder.is_favorite),
        [favoriteOverrides],
    );

    const activeFolderIsFavorite = useMemo(() => {
        if (!activeFolder) return false;
        return resolveIsFavorite(activeFolder);
    }, [activeFolder, resolveIsFavorite]);

    const handleToggleFavorite = useCallback(
        async (targetFolder?: { id: string; is_favorite?: boolean } | null) => {
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
                    showToast({
                        message: 'Berhasil ditambahkan ke Berbintang',
                        variant: 'success',
                    });
                }
            } catch {
                const message = isFavorite
                    ? 'Gagal menghapus dari Berbintang'
                    : 'Gagal menambahkan ke Berbintang';
                showToast({ message, variant: 'error' });
            }
        },
        [activeFolder, resolveIsFavorite, removeFromFavorite, showToast, addToFavorite],
    );

    const handleFavoriteIconClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>, folder: { id: string; is_favorite?: boolean }) => {
            event.preventDefault();
            event.stopPropagation();
            if (!resolveIsFavorite(folder)) return;
            void handleToggleFavorite(folder);
        },
        [handleToggleFavorite, resolveIsFavorite],
    );

    const handleMoveToTrash = useCallback(async () => {
        if (!activeFolder) return;
        showToast({
            message: 'Tipe layanan belum mendukung aksi pindah ke sampah',
            variant: 'error',
        });
    }, [activeFolder, showToast]);

    const downloadFolderByServiceType = useCallback(async (folder: { id: string; name: string }) => {
        const downloadUrl = ENDPOINTS.USER.SERVICE_TYPE_DOWNLOAD.replace(':tipe_layanan_id', folder.id);

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
            const fallbackName = `${folder.name || 'tipe-layanan'}.zip`;
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
        void downloadFolderByServiceType({ id: activeFolder.id, name: activeFolder.name });
    }, [activeFolder, downloadFolderByServiceType]);

    const handleOpenDetailSidebar = useCallback(() => {
        if (!activeFolder) return;
        setDetailSidebarServiceType({
            id: activeFolder.id,
            name: activeFolder.name,
        });
    }, [activeFolder]);

    const folderMenuItems = useMemo<DropdownMenuItem[]>(
        () => [
            {
                label: 'Download Folder',
                icon: <Download className="w-4 h-4" />,
                onClick: handleDownloadFolder,
                hasDivider: true,
            },
            {
                label: 'Lihat Detail Folder',
                icon: <Info className="w-4 h-4" />,
                onClick: handleOpenDetailSidebar,
            },
            {
                label: activeFolderIsFavorite
                    ? 'Hapus dari Berbintang'
                    : 'Tambahkan ke Berbintang',
                icon: activeFolderIsFavorite ? (
                    <StarOff className="w-4 h-4" />
                ) : (
                    <Star className="w-4 h-4" />
                ),
                hasDivider: true,
                onClick: () => {
                    void handleToggleFavorite();
                },
                className: isFavoriteLoading ? 'pointer-events-none opacity-60' : '',
            },
            {
                label: 'Tambahkan ke Sampah',
                icon: <Trash2 className="w-4 h-4" />,
                onClick: handleMoveToTrash,
            },
        ],
        [
            activeFolderIsFavorite,
            handleDownloadFolder,
            handleMoveToTrash,
            handleOpenDetailSidebar,
            handleToggleFavorite,
            isFavoriteLoading,
        ],
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
                    {serviceTypes.map((folder) => {
                        const isFavorite = resolveIsFavorite(folder);
                        const typeSlug = folder.name.toLowerCase().replace(/\s+/g, '-');

                        return (
                            <Link
                                key={folder.id}
                                href={`/services/${serviceSlug}/${typeSlug}`}
                                className="group flex justify-between items-center bg-gray-100/60 hover:bg-gray-100 px-3 py-2 border border-gray-200 rounded-xl w-[210px] transition-all cursor-pointer shrink-0"
                                title={folder.name}
                            >
                                <div className="flex flex-1 items-center gap-3 min-w-0">
                                    <div className="bg-gray-50 group-hover:bg-[#FDF8F3] p-2 rounded-lg transition-colors shrink-0">
                                        <Folder className="w-5 h-5 text-gray-600 group-hover:text-(--sidebar-primary)" />
                                    </div>
                                    <span className="font-semibold text-gray-700 group-hover:text-gray-900 truncate">
                                        {folder.name}
                                    </span>
                                    {isFavorite && (
                                        <button
                                            type="button"
                                            onClick={(event) => handleFavoriteIconClick(event, folder)}
                                            disabled={isFavoriteLoading}
                                            title="Hapus dari Berbintang"
                                            className={`p-1 rounded-full transition-colors shrink-0 ${isFavoriteLoading
                                                    ? 'cursor-not-allowed opacity-60'
                                                    : 'cursor-pointer hover:bg-gray-200'
                                                }`}
                                        >
                                            <Star className="fill-gray-500 w-3.5 h-3.5 text-gray-500" />
                                        </button>
                                    )}
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
            <ServiceTypeDetailOffcanvas
                serviceTypeId={detailSidebarServiceType?.id ?? null}
                serviceTypeName={detailSidebarServiceType?.name}
                onClose={() => setDetailSidebarServiceType(null)}
            />

            <Toast toast={toast} onClose={hideToast} position="bottom-left" />
        </div>
    );
}
