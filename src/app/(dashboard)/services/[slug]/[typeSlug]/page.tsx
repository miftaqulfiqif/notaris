'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { ChevronRight, Plus, Folder, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';
import { useDragDropContext } from '@/features/dashboard/context/DragDropContext';
import { FilterTabs } from '@/shared/components/FilterTabs';
import { apiGet } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { FolderTable } from '@/features/services/presentation/components/FolderTable';
import { FolderItem, FoldersResponse } from '@/features/services/types';
import { useSidebar } from '@/layout/providers/SidebarContext';

const normalizeFolders = (response: FoldersResponse): FolderItem[] => {
    if (Array.isArray(response.data)) {
        return response.data;
    }

    if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
    }

    return [];
};

export default function ServiceTypeDetailPage({
    params
}: {
    params: Promise<{ slug: string; typeSlug: string }>
}) {
    const { slug, typeSlug } = use(params);
    const searchParams = useSearchParams();
    const typeId = searchParams.get('id');
    const { openModal } = useUploadModal();
    const { setPreSelection } = useDragDropContext();
    const { services } = useSidebar();

    const currentService = useMemo(() => {
        if (!services.length) return null;
        return services.find(s =>
            s.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase() ||
            s.name.toLowerCase() === slug.toLowerCase()
        );
    }, [services, slug]);

    const [activeTab, setActiveTab] = useState('baru');
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const serviceName = slug.replace(/-/g, ' ').toUpperCase();
    const typeName = typeSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Fetch folders
    useEffect(() => {
        const fetchFolders = async () => {
            if (!typeId) return;

            setIsLoading(true);
            try {
                const url = `${ENDPOINTS.USER.FOLDERS}?tipe_layanan_id=${typeId}`;
                const data = await apiGet<FoldersResponse>(url);
                setFolders(normalizeFolders(data));
            } catch (err) {
                console.error('Failed to fetch folders', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFolders();
    },
        [typeId, refreshKey]
    );



    // Set pre-selection for upload modal
    useEffect(() => {
        if (typeId && currentService) {
            setPreSelection({
                layananId: currentService.id,
                layananName: currentService.name,
                tipeLayananId: typeId,
                tipeLayananName: typeName
            });
        }

        return () => setPreSelection(null);
    }, [typeId, typeName, currentService, setPreSelection]);

    const tabs = [
        { id: 'baru', label: 'Baru di tambahkan', icon: Clock },
        { id: 'favorite', label: 'Favorite', icon: Star },
    ];

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="flex flex-col w-full min-h-screen">
                    <div className="top-0 z-10 sticky bg-white/80 backdrop-blur-md px-8 pt-8 pb-4 border-gray-100/50 border-b">
                        <DashboardHeader />
                    </div>

                    <div className="flex-1 px-8 pb-8">
                        {/* Breadcrumb & Header */}
                        <div className="flex sm:flex-row flex-col justify-between sm:items-end gap-4 mt-4 mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm">
                                    <Link href="/dashboard" className="hover:text-(--sidebar-primary) transition-colors">
                                        Dashboard
                                    </Link>
                                    <ChevronRight className="w-4 h-4" />
                                    <p>Layanan</p>
                                    <ChevronRight className="w-4 h-4" />
                                    <Link href={`/services/${slug}`} className="hover:text-(--sidebar-primary) transition-colors">
                                        {serviceName}
                                    </Link>
                                    <ChevronRight className="w-4 h-4" />
                                    <span className="font-semibold text-gray-500">{typeName}</span>
                                </div>
                                <h1 className="font-bold text-gray-900 text-3xl">{typeName}</h1>
                            </div>

                            <button
                                onClick={() => openModal({
                                    layananId: currentService?.id,
                                    layananName: currentService?.name,
                                    tipeLayananId: typeId || undefined,
                                    tipeLayananName: typeName,
                                    onSuccess: () => setRefreshKey(prev => prev + 1),
                                })}
                                className="flex items-center gap-2 bg-white hover:bg-gray-50 shadow-sm px-6 py-3 border border-gray-200 hover:border-gray-300 rounded-xl font-semibold text-gray-900 transition-all cursor-pointer"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Tambah Baru</span>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="mb-6">
                            <FilterTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
                        </div>

                        {/* Table */}
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-gray-100 rounded-xl h-16 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <FolderTable items={folders} onRefresh={() => setRefreshKey(prev => prev + 1)} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
