'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { ChevronRight, Plus, Folder, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';
import { useDragDropContext } from '@/features/dashboard/context/DragDropContext';
import { FilterTabs } from '@/shared/components/FilterTabs';
import { apiGet, ApiResponse } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { FolderTable } from '@/features/services/presentation/components/FolderTable';
import { FolderItem, FoldersResponse } from '@/features/services/types';
import { useSidebar } from '@/layout/providers/SidebarContext';

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
                setFolders(data.data || []);
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
                <div className="max-w-[1600px] mx-auto min-h-screen w-full flex flex-col">
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-8 pt-8 pb-4 border-b border-gray-100/50">
                        <DashboardHeader />
                    </div>

                    <div className="px-8 pb-8 flex-1">
                        {/* Breadcrumb & Header */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 mt-4">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
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
                                <h1 className="text-3xl font-bold text-gray-900">{typeName}</h1>
                            </div>

                            <button
                                onClick={() => openModal({
                                    layananId: currentService?.id,
                                    layananName: currentService?.name,
                                    tipeLayananId: typeId || undefined,
                                    tipeLayananName: typeName,
                                    onSuccess: () => setRefreshKey(prev => prev + 1),
                                })}
                                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer"
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
                                    <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />
                                ))}
                            </div>
                        ) : (
                            <FolderTable items={folders} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
