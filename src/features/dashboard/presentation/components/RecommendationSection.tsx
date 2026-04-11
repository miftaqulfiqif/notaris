'use client';

import { MoreVertical, LayoutGrid, List, Download, Info, Star, StarOff } from 'lucide-react';
import FolderIcon from '@/assets/icons/folders Icons.svg';
import Image from 'next/image';
import { DashboardRecommendation } from '@/features/dashboard/hooks/useDashboard';
import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropdown } from '@/shared/hooks/useDropdown';
import { useToast } from '@/shared/hooks/useToast';
import { Toast } from '@/shared/components/Toast';
import { DropdownMenu } from '@/shared/components/DropdownMenu';
import type { DropdownMenuItem } from '@/shared/components/DropdownMenu';
import { ServiceTypeDetailOffcanvas } from '@/features/services/presentation/components/ServiceTypeDetailOffcanvas';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useFavoriteServiceType } from '@/features/services/presentation/hooks/useFavoriteServiceType';

interface RecommendationSectionProps {
    recommendations?: DashboardRecommendation[];
    isLoading?: boolean;
    onRefresh?: () => void;
}

const toSlug = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export function RecommendationSection({
    recommendations,
    isLoading = false,
    onRefresh,
}: RecommendationSectionProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const { addToFavorite, removeFromFavorite, isLoading: isFavoriteLoading } = useFavoriteServiceType();

    // For offcanvas details
    const [detailSidebarServiceType, setDetailSidebarServiceType] = useState<{
        id: string;
        name: string;
    } | null>(null);

    // Dropdown state
    const { activeDropdown, openDropdown, closeDropdown, isOpen, triggerClass, menuClass } =
        useDropdown<string>({
            triggerClass: 'recommendation-dropdown-trigger',
            menuClass: 'recommendation-dropdown-menu',
        });

    const realActivities = useMemo(() => {
        if (!recommendations) return [];
        return recommendations.map((rec, index) => ({
            id: rec.tipe_layanan_id || `rec-${index}`,
            companyName: rec.layanan || '-',
            service: rec.tipe_layanan || '-',
            is_favorite: rec.is_favorite || false,
        })).slice(0, 4);
    }, [recommendations]);

    const activeServiceType = useMemo(() => {
        if (!activeDropdown) return null;
        return realActivities.find((act) => act.id === activeDropdown.id) ?? null;
    }, [activeDropdown, realActivities]);

    const handleClick = (activity: { companyName: string; service: string }) => {
        const slug = toSlug(activity.companyName);
        const typeSlug = toSlug(activity.service);
        router.push(`/services/${slug}/${typeSlug}`);
    };

    const handleToggleFavorite = useCallback(async () => {
        if (!activeServiceType) return;

        const isFavorite = activeServiceType.is_favorite;
        try {
            if (isFavorite) {
                await removeFromFavorite(activeServiceType.id);
                showToast({ message: 'Berhasil dihapus dari Berbintang', variant: 'success' });
            } else {
                await addToFavorite(activeServiceType.id);
                showToast({ message: 'Berhasil ditambahkan ke Berbintang', variant: 'success' });
            }
            if (onRefresh) onRefresh();
        } catch {
            showToast({ message: isFavorite ? 'Gagal menghapus dari Berbintang' : 'Gagal menambahkan ke Berbintang', variant: 'error' });
        }
    }, [activeServiceType, addToFavorite, removeFromFavorite, showToast, onRefresh]);

    const downloadFolderByServiceType = useCallback(async (folder: { id: string; name: string }) => {
        const downloadUrl = ENDPOINTS.USER.SERVICE_TYPE_DOWNLOAD.replace(':tipe_layanan_id', folder.id);

        try {
            const response = await fetch(downloadUrl, { method: 'GET', credentials: 'include' });

            if (!response.ok) {
                let errorMessage = 'Gagal mengunduh folder';
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
            showToast({ message: error instanceof Error ? error.message : 'Gagal mengunduh folder', variant: 'error' });
        }
    }, [showToast]);

    const handleDownloadFolder = useCallback(() => {
        if (!activeServiceType) return;
        void downloadFolderByServiceType({ id: activeServiceType.id, name: activeServiceType.service });
    }, [activeServiceType, downloadFolderByServiceType]);

    const handleOpenDetailSidebar = useCallback(() => {
        if (!activeServiceType) return;
        setDetailSidebarServiceType({
            id: activeServiceType.id,
            name: activeServiceType.service,
        });
    }, [activeServiceType]);

    const dropdownMenuItems = useMemo<DropdownMenuItem[]>(() => {
        if (!activeServiceType) return [];
        return [
            {
                label: 'Download Folder',
                icon: <Download className="w-4 h-4" />,
                onClick: handleDownloadFolder,
                hasDivider: true,
            },
            {
                label: 'Lihat Detail Tipe Layanan',
                icon: <Info className="w-4 h-4" />,
                onClick: handleOpenDetailSidebar,
            },
            {
                label: activeServiceType.is_favorite ? 'Hapus dari Berbintang' : 'Tambahkan ke Berbintang',
                icon: activeServiceType.is_favorite ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />,
                onClick: () => { void handleToggleFavorite() },
                className: isFavoriteLoading ? 'pointer-events-none opacity-60' : '',
            },
        ];
    }, [activeServiceType, handleDownloadFolder, handleOpenDetailSidebar, handleToggleFavorite, isFavoriteLoading]);

    if (realActivities.length === 0 && !isLoading) {
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
                        {realActivities.map((activity) => (
                            <div key={activity.id} className="group relative border border-gray-200/80 bg-white rounded-2xl p-4 flex flex-col hover:border-[#B39B7D] hover:shadow-md transition-all cursor-pointer h-[180px]">
                                <div className="flex-1 flex justify-center items-center py-2" onClick={() => handleClick(activity)}>
                                    <Image src={FolderIcon} alt="Folder" width={84} height={84} className="group-hover:scale-105 transition-transform" />
                                </div>
                                <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-100/60">
                                    <div className="flex-1 truncate pr-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span className="font-medium truncate">{activity.companyName}</span>
                                            <span className="text-gray-400 text-xs text-[10px]">•</span>
                                            <span className="truncate">{activity.service}</span>
                                        </div>
                                    </div>
                                    <button
                                        className={`p-1 rounded-full transition-all shrink-0 ${triggerClass} ${isOpen(activity.id) ? 'bg-gray-200 text-gray-600' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openDropdown(e, activity.id);
                                        }}
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {realActivities.map((activity, idx) => (
                            <div key={activity.id} className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${idx !== realActivities.length - 1 ? 'border-b border-gray-100' : ''}`} onClick={() => handleClick(activity)}>
                                <div className="flex items-center gap-4">
                                    <Image src={FolderIcon} alt="Folder" width={32} height={32} />
                                    <div>
                                        <p className="font-semibold text-gray-800">{activity.companyName}</p>
                                        <p className="text-sm text-gray-500">{activity.service}</p>
                                    </div>
                                </div>
                                <button
                                    className={`p-2 rounded-full transition-colors shrink-0 ${triggerClass} ${isOpen(activity.id) ? 'bg-gray-200 text-gray-600' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openDropdown(e, activity.id);
                                    }}
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
                items={dropdownMenuItems}
                onClose={closeDropdown}
            />

            <ServiceTypeDetailOffcanvas
                serviceTypeId={detailSidebarServiceType?.id ?? null}
                serviceTypeName={detailSidebarServiceType?.name}
                onClose={() => setDetailSidebarServiceType(null)}
            />

            {toast && (
                <Toast
                    toast={toast}
                    onClose={hideToast}
                />
            )}
        </>
    );
}
