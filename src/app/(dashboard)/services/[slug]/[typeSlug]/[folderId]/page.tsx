'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Pencil, Plus, LayoutGrid, List } from 'lucide-react';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { apiGet } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { StatusBadge } from '@/shared/components';
import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';
import { useSidebar } from '@/layout/providers/SidebarContext';
import { FolderDetail, FolderDetailResponse } from '@/features/services/types';
import { FileItem, FilesResponse } from '@/features/services/types/file.types';
import { FileTable } from '@/features/services/presentation/components/FileTable';
import { FileGrid } from '@/features/services/presentation/components/FileGrid';

export default function FolderDetailPage({
    params
}: {
    params: Promise<{ slug: string; typeSlug: string; folderId: string }>
}) {
    const { slug, typeSlug, folderId } = use(params);
    const searchParams = useSearchParams();
    const typeId = searchParams.get('id');
    const { openModal } = useUploadModal();
    const { services } = useSidebar();

    const [folder, setFolder] = useState<FolderDetail | null>(null);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const serviceName = slug.replace(/-/g, ' ').toUpperCase();
    const typeName = typeSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Fetch Folder Detail
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

    // Fetch Files
    useEffect(() => {
        const fetchFiles = async () => {
            try {
                setIsLoading(true);
                // Hardcoded page=1&limit=10 for now as per requirement implying list
                // User requirement said: /api/files/:folder_id?page=1&limit=1&search=
                // But normally we'd want more than 1 file. I'll stick to a reasonable default or what they asked.
                // They provided example response for limit=1, but probably want a list.
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

    const handleUploadDefault = () => {
        // Find current service IDs logic (simplified)
        const currentService = services.find(s =>
            s.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase() ||
            s.name.toLowerCase() === slug.toLowerCase()
        );

        openModal({
            layananId: currentService?.id,
            layananName: currentService?.name,
            tipeLayananName: typeName,
            // We can't pass folderId/Name yet to UploadModal based on current types, 
            // but we invoke it as requested.
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
                        {/* Breadcrumb & Header */}
                        <div className="flex flex-col gap-6 mt-4 mb-8">
                            {/* Breadcrumb */}
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
                                <Link href={`/services/${slug}/${typeSlug}?id=${typeId || ''}`} className="hover:text-(--sidebar-primary) transition-colors">
                                    {typeName}
                                </Link>
                                <ChevronRight className="w-4 h-4" />
                                <span className="font-semibold text-gray-900">{folder?.folder_name || '...'}</span>
                            </div>

                            {/* Header Content */}
                            <div className="flex justify-between items-start">
                                <div className="space-y-6 max-w-2xl">
                                    <div className="flex items-center gap-3">
                                        <h1 className="font-bold text-gray-900 text-3xl">{folder?.folder_name}</h1>
                                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="gap-y-3 grid grid-cols-[140px_auto] text-sm">
                                        <span className="font-medium text-gray-900">Kedudukan</span>
                                        <span className="text-gray-600">: <span className="font-semibold">{folder?.kedudukan || '-'}</span></span>

                                        <span className="font-medium text-gray-900">Nomor akta</span>
                                        <span className="text-gray-600">: <span className="font-semibold">{folder?.nomor_akta || '-'}</span></span>

                                        <span className="font-medium text-gray-900">Nomor PT</span>
                                        <span className="text-gray-600">: <span className="font-semibold">{folder?.nomor_pt || '-'}</span></span>

                                        <span className="font-medium text-gray-900">NIK</span>
                                        <span className="text-gray-600">: <span className="font-semibold">{folder?.nik_penghadap || '-'}</span></span>

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

                        {/* Files Section */}
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
                                <FileGrid items={files} />
                            ) : (
                                <FileTable items={files} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
