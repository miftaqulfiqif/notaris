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
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="max-w-[1600px] mx-auto min-h-screen w-full flex flex-col">
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-8 pt-8 pb-4 border-b border-gray-100/50">
                        <DashboardHeader />
                    </div>

                    <div className="px-8 pb-8 flex-1">
                        {/* Breadcrumb & Header */}
                        <div className="flex flex-col gap-6 mb-8 mt-4">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
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
                            <div className="flex items-start justify-between">
                                <div className="space-y-6 max-w-2xl">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-bold text-gray-900">{folder?.folder_name}</h1>
                                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-[140px_auto] gap-y-3 text-sm">
                                        <span className="font-medium text-gray-900">Kedudukan</span>
                                        <span className="text-gray-600">: <span className="font-semibold">{folder?.kedudukan || '-'}</span></span>

                                        <span className="font-medium text-gray-900">Nomor akta</span>
                                        <span className="text-gray-600">: <span className="font-semibold">{folder?.nomor_akta || '-'}</span></span>

                                        <span className="font-medium text-gray-900">Nomor PT</span>
                                        <span className="text-gray-600">: <span className="font-semibold">{folder?.nomor_pt || '-'}</span></span>

                                        <span className="font-medium text-gray-900">Nama Pengadap</span>
                                        <span className="text-gray-600">: <span className="font-semibold">{folder?.nama_penghadap || '-'}</span></span>

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
                                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Tambah File Baru</span>
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-8" />

                        {/* Files Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-end gap-2">
                                <div className="flex bg-gray-100 rounded-lg p-1">
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
