'use client';

import { MoreVertical, LayoutGrid, List, Download, Info, Star, StarOff } from 'lucide-react';
import FolderIcon from '@/assets/icons/folders Icons.svg';
import Image from 'next/image';
import { PaginatedActivities } from '@/features/dashboard/hooks/useDashboard';
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropdown } from '@/shared/hooks/useDropdown';
import { useToast } from '@/shared/hooks/useToast';
import { useFavoriteServiceType } from '@/features/services/presentation/hooks/useFavoriteServiceType';
import { DropdownMenu } from '@/shared/components/DropdownMenu';
import type { DropdownMenuItem } from '@/shared/components/DropdownMenu';
import { Toast } from '@/shared/components/Toast';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { ServiceTypeDetailOffcanvas } from '@/features/services/presentation/components/ServiceTypeDetailOffcanvas';

interface RecommendationItem {
    id: string;
    tipeLayananId: string;
    layanan: string;
    tipeLayanan: string;
    layananSlug: string;
    tipeLayananSlug: string;
    author: string;
    modifiedDate: string;
}

interface RecommendationSectionProps {
    dashboardActivities?: PaginatedActivities | null;
    isLoading?: boolean;
}

const toSlug = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export function RecommendationSection({
    dashboardActivities,
    isLoading = false,
}: RecommendationSectionProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const { addToFavorite, removeFromFavorite, isLoading: isFavoriteLoading } = useFavoriteServiceType();
    const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
    const [detailSidebarServiceType, setDetailSidebarServiceType] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const { activeDropdown, openDropdown, closeDropdown, isOpen, triggerClass, menuClass } =
        useDropdown<string>({
            triggerClass: 'rec-dropdown-trigger',
            menuClass: 'rec-dropdown-menu',
        });

    const recommendations = useMemo<RecommendationItem[]>(() => {
        if (!dashboardActivities?.data) return [];

        const seen = new Map<string, RecommendationItem>();
        for (const act of dashboardActivities.data) {
            const layanan = act.layanan || '-';
            const tipeLayanan = act.tipe_layanan || '-';
            const key = `${layanan}::${tipeLayanan}`;
            if (!seen.has(key)) {
                seen.set(key, {
                    id: act.tipe_layanan_id || act.folder_id || `fallback-${seen.size}`,
                    tipeLayananId: act.tipe_layanan_id || '',
                    layanan,
                    tipeLayanan,
                    layananSlug: act.layanan_slug || toSlug(layanan),
                    tipeLayananSlug: act.tipe_layanan_slug || toSlug(tipeLayanan),
                    author: act.author || '-',
                    modifiedDate: String(act.updated_at || '-'),
                });
            }
        }

        return Array.from(seen.values()).slice(0, 4);
    }, [dashboardActivities]);

    const activeItem = useMemo(() => {
        if (!activeDropdown) return null;
        return recommendations.find((r) => r.id === activeDropdown.id) ?? null;
    }, [activeDropdown, recommendations]);

    const resolveIsFavorite = useCallback(
        (item: RecommendationItem) => favoriteOverrides[item.id] ?? false,
        [favoriteOverrides],
    );

    const activeItemIsFavorite = useMemo(() => {
        if (!activeItem) return false;
        return resolveIsFavorite(activeItem);
    }, [activeItem, resolveIsFavorite]);

    const handleClick = (item: RecommendationItem) => {
        if (item.layananSlug && item.tipeLayananSlug) {
            router.push(`/services/${item.layananSlug}/${item.tipeLayananSlug}`);
        }
    };

    const handleToggleFavorite = useCallback(async () => {
        if (!activeItem || !activeItem.tipeLayananId) return;

        const isFavorite = resolveIsFavorite(activeItem);
        try {
            if (isFavorite) {
                await removeFromFavorite(activeItem.tipeLayananId);
                setFavoriteOverrides((prev) => ({ ...prev, [activeItem.id]: false }));
                showToast({ message: 'Berhasil dihapus dari Berbintang', variant: 'success' });
            } else {
                await addToFavorite(activeItem.tipeLayananId);
                setFavoriteOverrides((prev) => ({ ...prev, [activeItem.id]: true }));
                showToast({ message: 'Berhasil ditambahkan ke Berbintang', variant: 'success' });
            }
        } catch {
            const message = isFavorite
                ? 'Gagal menghapus dari Berbintang'
                : 'Gagal menambahkan ke Berbintang';
            showToast({ message, variant: 'error' });
        }
    }, [activeItem, resolveIsFavorite, removeFromFavorite, addToFavorite, showToast]);

    const handleDownload = useCallback(async () => {
        if (!activeItem || !activeItem.tipeLayananId) return;

        const downloadUrl = ENDPOINTS.USER.SERVICE_TYPE_DOWNLOAD.replace(':tipe_layanan_id', activeItem.tipeLayananId);

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
                    // Ignore JSON parse error
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
            const fileNameMatch = contentDisposition?.match(/filename\*?=(?:UTF-8''|")?([^\\";]+)/i);
            const fallbackName = `${activeItem.tipeLayanan || 'tipe-layanan'}.zip`;
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
    }, [activeItem, showToast]);

    const handleOpenDetailSidebar = useCallback(() => {
        if (!activeItem || !activeItem.tipeLayananId) return;
        setDetailSidebarServiceType({
            id: activeItem.tipeLayananId,
            name: activeItem.tipeLayanan,
        });
    }, [activeItem]);

    const menuItems = useMemo<DropdownMenuItem[]>(
        () => [
            {
                label: 'Download Folder',
                icon: <Download className="w-4 h-4" />,
                onClick: () => void handleDownload(),
                hasDivider: true,
            },
            {
                label: 'Lihat Detail',
                icon: <Info className="w-4 h-4" />,
                onClick: handleOpenDetailSidebar,
            },
            {
                label: activeItemIsFavorite
                    ? 'Hapus dari Berbintang'
                    : 'Tambahkan ke Berbintang',
                icon: activeItemIsFavorite ? (
                    <StarOff className="w-4 h-4" />
                ) : (
                    <Star className="w-4 h-4" />
                ),
                onClick: () => void handleToggleFavorite(),
                className: isFavoriteLoading ? 'pointer-events-none opacity-60' : '',
            },
        ],
        [activeItemIsFavorite, handleDownload, handleOpenDetailSidebar, handleToggleFavorite, isFavoriteLoading],
    );

    if (recommendations.length === 0 && !isLoading) {
        return null;
    }

    return (
        <>
            <div className="mb-10 w-full hover:-translate-y-0.5 transition-all">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                        Disarankan dari aktivitas Anda
                    </h3>
                    <div className="flex bg-gray-100/80 p-1 rounded-lg border border-gray-200/60">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-800 border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Tampilan Grid"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-800 border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Tampilan List"
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-[180px] bg-gray-100 animate-pulse rounded-2xl border border-gray-100"></div>
                        ))}
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-1 border-none shadow-none bg-transparent">
                        {recommendations.map((item) => (
                            <div key={item.id} className="group relative border border-gray-200/80 bg-white rounded-2xl p-4 flex flex-col hover:border-[#B39B7D] hover:shadow-md transition-all cursor-pointer h-[180px]">
                                <div className="flex-1 flex justify-center items-center py-2" onClick={() => handleClick(item)}>
                                    <Image src={FolderIcon} alt="Folder" width={84} height={84} className="group-hover:scale-105 transition-transform" />
                                </div>
                                <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-100/60">
                                    <div className="flex-1 truncate pr-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span className="font-medium truncate">{item.layanan}</span>
                                            <span className="text-gray-400 text-xs text-[10px]">•</span>
                                            <span className="truncate">{item.tipeLayanan}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => openDropdown(e, item.id)}
                                        className={`p-1 rounded-full cursor-pointer transition-all shrink-0 ${triggerClass} ${isOpen(item.id) ? 'bg-gray-200 text-gray-600' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {recommendations.map((item, idx) => (
                            <div key={item.id} className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${idx !== recommendations.length - 1 ? 'border-b border-gray-100' : ''}`} onClick={() => handleClick(item)}>
                                <div className="flex items-center gap-4">
                                    <Image src={FolderIcon} alt="Folder" width={32} height={32} />
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.layanan}</p>
                                        <p className="text-sm text-gray-500">{item.tipeLayanan} • Dimodifikasi {item.modifiedDate}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => openDropdown(e, item.id)}
                                    className={`p-2 rounded-full cursor-pointer transition-all shrink-0 ${triggerClass} ${isOpen(item.id) ? 'bg-gray-200 text-gray-600' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <DropdownMenu
                dropdown={activeDropdown}
                menuClass={menuClass}
                items={menuItems}
                onClose={closeDropdown}
            />

            <ServiceTypeDetailOffcanvas
                serviceTypeId={detailSidebarServiceType?.id ?? null}
                serviceTypeName={detailSidebarServiceType?.name}
                onClose={() => setDetailSidebarServiceType(null)}
            />

            <Toast toast={toast} onClose={hideToast} position="bottom-left" />
        </>
    );
}
