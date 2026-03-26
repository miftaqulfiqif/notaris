'use client';

import { useMemo, type KeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import FolderIcon from '@/assets/icons/folders Icons.svg';
import Image from 'next/image';
import { useAuthContext } from '@/features/auth/context/auth.context';
import { DashboardRecommendation } from '@/features/dashboard/hooks/useDashboard';
import {
    buildServiceHref,
    isRecommendationVisible,
    trackDashboardSuggestedFolderClick,
    toSlug,
} from '@/features/dashboard/utils';
import { useSidebar } from '@/layout/providers/SidebarContext';

interface FolderGridProps {
    recommendations?: DashboardRecommendation[];
    isLoading?: boolean;
}

interface DisplayFolder {
    id: string;
    layanan: string;
    typeName: string;
    href: string;
}

export function FolderGrid({ recommendations = [], isLoading = false }: FolderGridProps) {
    const pathname = usePathname();
    const { user } = useAuthContext();
    const { services, isLoadingServices = false } = useSidebar();

    const displayFolders = useMemo<DisplayFolder[]>(() => {
        if (isLoading || isLoadingServices || recommendations.length === 0) {
            return [];
        }

        const visibleFolders = recommendations.filter((recommendation) =>
            isRecommendationVisible(recommendation, services),
        );

        const deduplicatedFolders = new Map<string, DisplayFolder>();

        visibleFolders.forEach((recommendation, index) => {
            const href = buildServiceHref(recommendation.layanan);

            const key = toSlug(recommendation.layanan) || recommendation.tipe_layanan_id || `${href}-${index}`;
            if (deduplicatedFolders.has(key)) {
                return;
            }

            deduplicatedFolders.set(key, {
                id: key,
                layanan: recommendation.layanan.trim(),
                typeName: recommendation.tipe_layanan.trim(),
                href,
            });
        });

        return Array.from(deduplicatedFolders.values());
    }, [isLoading, isLoadingServices, recommendations, services]);

    const handleTrackOpen = (folder: DisplayFolder) => {
        trackDashboardSuggestedFolderClick({
            layanan: folder.layanan,
            tipe_layanan: folder.typeName,
            timestamp: new Date().toISOString(),
            user_id: user?.id,
            user_role: user?.role?.role_name,
        });
    };

    const handleTileClick = (
        event: ReactMouseEvent<HTMLAnchorElement>,
        folder: DisplayFolder,
    ) => {
        if (event.defaultPrevented) return;
        handleTrackOpen(folder);
    };

    const handleTileAuxClick = (
        event: ReactMouseEvent<HTMLAnchorElement>,
        folder: DisplayFolder,
    ) => {
        if (event.button !== 1) return;
        handleTrackOpen(folder);
    };

    const handleTileKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
        if (event.key !== ' ') return;
        event.preventDefault();
        event.currentTarget.click();
    };

    if (isLoading || isLoadingServices) {
        return (
            <div className="mb-10 w-full">
                <h3 className="mb-4 text-lg font-bold text-gray-800">Folder yang disarankan</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6, 7].map((index) => (
                        <div
                            key={index}
                            className="h-12 rounded-lg bg-[#F5F5F5] animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (displayFolders.length === 0) {
        return null;
    }

    return (
        <div className="mb-10 w-full">
            <h3 className="mb-4 text-lg font-bold text-gray-800">Folder yang disarankan</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {displayFolders.map((folder) => {
                    const layananSlug = toSlug(folder.layanan);
                    const isActive = pathname === folder.href || pathname.startsWith(`/services/${layananSlug}/`);
                    const tooltip = `Lihat semua item ${folder.layanan}`;

                    return (
                        <Link
                            key={folder.id}
                            href={folder.href}
                            title={tooltip}
                            aria-label={`Buka ${folder.layanan} - layanan`}
                            aria-current={isActive ? 'page' : undefined}
                            onClick={(event) => handleTileClick(event, folder)}
                            onAuxClick={(event) => handleTileAuxClick(event, folder)}
                            onKeyDown={handleTileKeyDown}
                            className={`group flex min-h-12 items-center gap-2.5 rounded-lg px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B39B7D] focus-visible:ring-offset-2 ${
                                isActive
                                    ? 'bg-[#FFF1CC] text-gray-900'
                                    : 'bg-[#F7F7F7] text-gray-800 hover:bg-[#F1F1F1]'
                                }`}
                        >
                            <Image src={FolderIcon} alt="Folder" width={20} height={20} className="shrink-0" />

                            <span className="truncate text-base font-semibold leading-none">
                                {folder.layanan}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
