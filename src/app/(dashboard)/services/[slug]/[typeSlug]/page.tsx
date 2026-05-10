'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { ChevronRight, Plus, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';
import { useDragDropContext } from '@/features/dashboard/context/DragDropContext';
import { FilterTabs } from '@/shared/components/FilterTabs';
import { apiGet } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { FolderTable } from '@/features/services/presentation/components/FolderTable';
import { FolderItem, FoldersResponse } from '@/features/services/types';
import { useSidebar } from '@/layout/providers/SidebarContext';
import { useServiceTypes } from '@/features/services/context/ServiceTypesContext';
import { useAuthContext } from '@/features/auth/context/auth.context';

const normalizeFolders = (response: FoldersResponse): FolderItem[] => {
    if (Array.isArray(response.data)) {
        return response.data;
    }

    if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
    }

    return [];
};

const isAccessDeniedError = (message?: string | null) => {
    if (!message) return false;

    const normalizedMessage = message.toLowerCase();
    return (
        normalizedMessage.includes('403')
        || normalizedMessage.includes('forbidden')
        || normalizedMessage.includes('unauthorized')
        || normalizedMessage.includes('akses')
        || normalizedMessage.includes('permission')
    );
};

export default function ServiceTypeDetailPage({
    params
}: {
    params: Promise<{ slug: string; typeSlug: string }>
}) {
    const { slug, typeSlug } = use(params);
    const { user } = useAuthContext();
    const { openModal } = useUploadModal();
    const { setPreSelection } = useDragDropContext();
    const { services, isLoadingServices = false } = useSidebar();
    const {
        serviceTypes,
        isLoading: isLoadingServiceTypes = false,
        error: serviceTypesError = null,
    } = useServiceTypes();

    const currentService = useMemo(() => {
        if (!services.length) return null;
        return services.find(s =>
            s.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase() ||
            s.name.toLowerCase() === slug.toLowerCase()
        );
    }, [services, slug]);

    const currentServiceType = useMemo(() => {
        if (!serviceTypes.length) return null;
        return serviceTypes.find(t =>
            t.name.toLowerCase().replace(/\s+/g, '-') === typeSlug.toLowerCase()
        );
    }, [serviceTypes, typeSlug]);

    const typeId = currentServiceType?.id || null;

    const [activeTab, setActiveTab] = useState<'baru' | 'favorite'>('baru');
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [folderError, setFolderError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const serviceName = currentService?.name || slug.replace(/-/g, ' ').toUpperCase();
    const typeName = currentServiceType?.name || typeSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const isResolvingRoute = isLoadingServices || isLoadingServiceTypes;

    useEffect(() => {
        const fetchFolders = async () => {
            if (!typeId) {
                if (!isResolvingRoute) {
                    setFolders([]);
                    setIsLoading(false);
                }
                return;
            }

            setIsLoading(true);
            setFolderError(null);
            try {
                const url = `${ENDPOINTS.USER.FOLDERS}?tipe_layanan_id=${typeId}`;
                const data = await apiGet<FoldersResponse>(url);
                setFolders(normalizeFolders(data));
            } catch (err) {
                console.error('Failed to fetch folders', err);
                setFolderError(err instanceof Error ? err.message : 'Gagal memuat folder');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFolders();
    },
        [typeId, refreshKey, isResolvingRoute]
    );

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

    const filteredFolders = useMemo(() => {
        if (activeTab === 'favorite') {
            return folders.filter((folder) => Boolean(folder.is_favorite));
        }

        return folders;
    }, [activeTab, folders]);

    const isRouteUnavailable = !isResolvingRoute && (!currentService || !currentServiceType);
    const isAccessDenied = isRouteUnavailable
        || isAccessDeniedError(serviceTypesError)
        || isAccessDeniedError(folderError);
    const visibleError = isAccessDenied
        ? 'Akses ke tipe layanan ini ditolak atau sudah tidak tersedia.'
        : (folderError || serviceTypesError);
    const isEmptyState = !isLoading && !visibleError && filteredFolders.length === 0;

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="flex flex-col w-full min-h-screen">
                    <div className="top-0 z-10 sticky bg-white/80 backdrop-blur-md px-8 pt-8 pb-4 border-gray-100/50 border-b">
                        <DashboardHeader />
                    </div>

                    <div className="flex-1 px-8 pb-8">
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

                            { user?.access === "READ_ONLY" ? null : (
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
                            )}

                        </div>

                        <div className="mb-6">
                            <FilterTabs
                                tabs={tabs}
                                activeTab={activeTab}
                                onChange={(tabId) => setActiveTab(tabId as 'baru' | 'favorite')}
                            />
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-gray-100 rounded-xl h-16 animate-pulse" />
                                ))}
                            </div>
                        ) : visibleError ? (
                            <section className={`rounded-2xl border px-6 py-8 text-center ${
                                isAccessDenied
                                    ? 'border-amber-200 bg-amber-50'
                                    : 'border-red-200 bg-red-50'
                            }`}>
                                <h2 className={`text-lg font-semibold ${
                                    isAccessDenied ? 'text-amber-900' : 'text-red-900'
                                }`}>
                                    {isAccessDenied ? 'Akses ditolak' : 'Gagal memuat data'}
                                </h2>
                                <p className={`mx-auto mt-2 max-w-xl text-sm ${
                                    isAccessDenied ? 'text-amber-800' : 'text-red-700'
                                }`}>
                                    {visibleError}
                                </p>
                                {!isAccessDenied && (
                                    <button
                                        type="button"
                                        onClick={() => setRefreshKey((prev) => prev + 1)}
                                        className="mt-5 inline-flex items-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                                    >
                                        Coba lagi
                                    </button>
                                )}
                            </section>
                        ) : isEmptyState ? (
                            <section className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Belum ada item untuk {typeName}
                                </h2>
                                <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
                                    Folder untuk tipe layanan ini belum memiliki item. Tambahkan
                                    item baru untuk mulai bekerja lebih cepat dari konteks {typeName}.
                                </p>
                                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                                    {user?.access === "READ_ONLY" ? null : (
                                        <button
                                            type="button"
                                            onClick={() => openModal({
                                                layananId: currentService?.id,
                                                layananName: currentService?.name,
                                                tipeLayananId: typeId || undefined,
                                                tipeLayananName: typeName,
                                                onSuccess: () => setRefreshKey(prev => prev + 1),
                                            })}
                                            className="inline-flex items-center justify-center rounded-xl bg-[#7A6A53] px-5 py-3 text-sm font-semibold text-white hover:bg-[#685942]"
                                        >
                                            Tambah Baru
                                        </button>
                                    )}

                                    <Link
                                        href={`/services/${slug}`}
                                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Kembali ke layanan
                                    </Link>
                                </div>
                            </section>
                        ) : (
                            <FolderTable
                                items={filteredFolders}
                                onRefresh={() => setRefreshKey(prev => prev + 1)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
