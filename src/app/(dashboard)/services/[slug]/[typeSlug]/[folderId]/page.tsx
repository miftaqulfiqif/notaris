'use client';

import { useState, useEffect, use, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Pencil, Plus, LayoutGrid, List } from 'lucide-react';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { apiGet } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { StatusBadge } from '@/shared/components';
import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';
import { useDragDropContext } from '@/features/dashboard/context/DragDropContext';
import { useEditFolderModal } from '@/features/dashboard/context/EditFolderModalContext';
import { useSidebar } from '@/layout/providers/SidebarContext';
import { FolderDetail, FolderDetailResponse } from '@/features/services/types';
import { FileItem, FilesResponse } from '@/features/services/types/file.types';
import { FileTable } from '@/features/services/presentation/components/FileTable';
import { FileGrid } from '@/features/services/presentation/components/FileGrid';
import { useServiceTypes } from '@/features/services/context/ServiceTypesContext';

export default function FolderDetailPage({
    params
}: {
    params: Promise<{ slug: string; typeSlug: string; folderId: string }>
}) {
    const { slug, typeSlug, folderId } = use(params);
    const { openModal } = useUploadModal();
    const { openModal: openEditFolderModal } = useEditFolderModal();
    const { setPreSelection } = useDragDropContext();
    const { services } = useSidebar();
    const { serviceTypes } = useServiceTypes();

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

    const [folder, setFolder] = useState<FolderDetail | null>(null);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const serviceName = currentService?.name || slug.replace(/-/g, ' ').toUpperCase();
    const typeName = currentServiceType?.name || typeSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    useEffect(() => {
        const fetchFolderDetail = async () => {
            try {
                const url = ENDPOINTS.USER.FOLDER_DETAIL.replace(':folderId', folderId);
                const data = await apiGet<FolderDetailResponse>(url);
                setFolder(data.data);
            } catch (err) {
                console.error('Failed to fetch folder detail', err);
            }
        };

        if (folderId) {
            fetchFolderDetail();
        }
    }, [folderId, refreshKey]);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                setIsLoading(true);
                const url = ENDPOINTS.USER.FOLDER_FILES.replace(':folderId', folderId) + '?page=1&limit=100&search=';
                const data = await apiGet<FilesResponse>(url);
                setFiles(data.data.data);
            } catch (err) {
                console.error('Failed to fetch files', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (folderId) {
            fetchFiles();
        }
    }, [folderId, refreshKey]);

    useEffect(() => {
        if (currentService && currentServiceType) {
            setPreSelection({
                layananId: currentService.id,
                layananName: currentService.name,
                tipeLayananId: currentServiceType.id,
                tipeLayananName: typeName,
                onSuccess: () => setRefreshKey(prev => prev + 1)
            });
        }

        return () => setPreSelection(null);
    }, [currentService, currentServiceType, typeName, setPreSelection]);

    const handleUploadDefault = () => {
        openModal({
            layananId: currentService?.id,
            layananName: currentService?.name,
            tipeLayananId: currentServiceType?.id,
            tipeLayananName: typeName,
            onSuccess: () => setRefreshKey(prev => prev + 1)
        });
    };

    const handleEditFolder = () => {
        if (!folder) return;

        openEditFolderModal({
            folderId,
            initialData: {
                folder_name: folder.folder_name || '',
                kedudukan: folder.kedudukan || '',
                nomor_akta: folder.nomor_akta || '',
            },
            onSuccess: () => setRefreshKey(prev => prev + 1)
        });
    };

    if (!folder && isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex bg-white h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="flex flex-col w-full min-h-screen">
                    <div className="top-0 z-10 sticky bg-white/80 backdrop-blur-md px-8 pt-8 pb-4 border-gray-100/50 border-b">
                        <DashboardHeader />
                    </div>

                    <div className="flex-1 px-8 pb-8">
                        <div className="flex flex-col gap-6 mt-4 mb-8">
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
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
                                <Link href={`/services/${slug}/${typeSlug}`} className="hover:text-(--sidebar-primary) transition-colors">
                                    {typeName}
                                </Link>
                                <ChevronRight className="w-4 h-4" />
                                <span className="font-semibold text-gray-900">{folder?.folder_name || '...'}</span>
                            </div>

                            <div className="flex justify-between items-start">
                                <div className="space-y-6 max-w-2xl">
                                    <div className="flex items-center gap-3">
                                        <h1 className="font-bold text-gray-900 text-3xl">{folder?.folder_name}</h1>
                                        <button
                                            onClick={handleEditFolder}
                                            disabled={!folder}
                                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="gap-y-3 grid grid-cols-[140px_auto] text-sm">
                                        <span className="font-medium text-gray-900">Kedudukan</span>
                                        <span className="text-gray-600">: <span className="font-semibold">{folder?.kedudukan || '-'}</span></span>

                                        <span className="font-medium text-gray-900">Nomor akta</span>
                                        <span className="text-gray-600">: <span className="font-semibold">{folder?.nomor_akta || '-'}</span></span>

                                        <span className="font-medium text-gray-900">Status</span>
                                        <div className="flex items-center gap-2 text-gray-900">
                                            : <StatusBadge status={folder?.status || 'proses'} />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleUploadDefault}
                                    className="flex items-center gap-2 bg-white hover:bg-gray-50 shadow-sm px-6 py-3 border border-gray-200 hover:border-gray-300 rounded-xl font-semibold text-gray-900 transition-all cursor-pointer"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Tambah File Baru</span>
                                </button>
                            </div>
                        </div>

                        <div className="my-8 border-gray-100 border-t" />

                        <div className="space-y-4">
                            <div className="flex justify-end items-center gap-2">
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                                            ? 'bg-white shadow-sm text-gray-900'
                                            : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-md transition-all ${viewMode === 'list'
                                            ? 'bg-white shadow-sm text-gray-900'
                                            : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {viewMode === 'grid' ? (
                                <FileGrid items={files} onRefresh={() => setRefreshKey(prev => prev + 1)} />
                            ) : (
                                <FileTable items={files} onRefresh={() => setRefreshKey(prev => prev + 1)} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
