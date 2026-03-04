'use client';

import { useState, useEffect, use, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, Pencil, Plus, LayoutGrid, List, ChevronDown, ChevronUp } from 'lucide-react';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { apiGet, apiPatch } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { StatusBadge } from '@/shared/components';
import { Toast } from '@/shared/components/Toast';
import { useToast } from '@/shared/hooks/useToast';
import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';
import { useDragDropContext } from '@/features/dashboard/context/DragDropContext';
import { useEditFolderModal } from '@/features/dashboard/context/EditFolderModalContext';
import { useSidebar } from '@/layout/providers/SidebarContext';
import { FolderDetail, FolderDetailResponse } from '@/features/services/types';
import { FileItem, FilesResponse } from '@/features/services/types/file.types';
import { FileTable } from '@/features/services/presentation/components/FileTable';
import { FileGrid } from '@/features/services/presentation/components/FileGrid';
import { useServiceTypes } from '@/features/services/context/ServiceTypesContext';

type FolderStatusValue = 'selesai' | 'tertunda' | 'proses';

interface StatusOption {
    value: FolderStatusValue;
    label: string;
    badgeClassName: string;
}

const STATUS_OPTIONS: StatusOption[] = [
    {
        value: 'selesai',
        label: 'Selesai',
        badgeClassName: 'bg-green-100 text-green-700',
    },
    {
        value: 'tertunda',
        label: 'Tertunda',
        badgeClassName: 'bg-red-100 text-red-700',
    },
    {
        value: 'proses',
        label: 'Proses',
        badgeClassName: 'bg-yellow-100 text-yellow-700',
    },
];

const normalizeFolderStatus = (status?: string): FolderStatusValue => {
    const normalizedStatus = status?.toLowerCase().trim() || 'proses';

    if (normalizedStatus === 'terutunda' || normalizedStatus === 'terjeda') {
        return 'tertunda';
    }

    if (normalizedStatus === 'selesai' || normalizedStatus === 'tertunda' || normalizedStatus === 'proses') {
        return normalizedStatus as FolderStatusValue;
    }

    return 'proses';
};

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
    const { toast, showToast, hideToast } = useToast();
    const statusDropdownRef = useRef<HTMLDivElement | null>(null);

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
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const serviceName = currentService?.name || slug.replace(/-/g, ' ').toUpperCase();
    const typeName = currentServiceType?.name || typeSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const resolvedFolderStatus = normalizeFolderStatus(folder?.status);

    const handleUpdateStatus = useCallback(async (nextStatus: FolderStatusValue) => {
        if (!folder || isUpdatingStatus) return;

        const currentStatus = normalizeFolderStatus(folder.status);
        if (currentStatus === nextStatus) {
            setIsStatusDropdownOpen(false);
            return;
        }

        setIsUpdatingStatus(true);
        try {
            await apiPatch(ENDPOINTS.USER.UPDATE_STATUS_FOLDER, {
                folder_id: folder.id,
                status: nextStatus,
            });

            setFolder((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    status: nextStatus,
                };
            });
            showToast({ message: 'Status folder berhasil diperbarui', variant: 'success' });
            setIsStatusDropdownOpen(false);
        } catch {
            showToast({ message: 'Gagal memperbarui status folder', variant: 'error' });
        } finally {
            setIsUpdatingStatus(false);
        }
    }, [folder, isUpdatingStatus, showToast]);

    useEffect(() => {
        function handleOutsideClick(event: MouseEvent) {
            const target = event.target as Node;
            if (!statusDropdownRef.current?.contains(target)) {
                setIsStatusDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    useEffect(() => {
        setIsStatusDropdownOpen(false);
    }, [folderId]);

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
                folderName: folder?.folder_name,
                onSuccess: () => setRefreshKey(prev => prev + 1)
            });
        }

        return () => setPreSelection(null);
    }, [currentService, currentServiceType, typeName, folder?.folder_name, setPreSelection]);

    const handleUploadDefault = () => {
        openModal({
            layananId: currentService?.id,
            layananName: currentService?.name,
            tipeLayananId: currentServiceType?.id,
            tipeLayananName: typeName,
            folderName: folder?.folder_name,
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
                                            :{' '}
                                            <div className="relative inline-flex items-center gap-2" ref={statusDropdownRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (isUpdatingStatus) return;
                                                        setIsStatusDropdownOpen((prev) => !prev);
                                                    }}
                                                    disabled={!folder || isUpdatingStatus}
                                                    aria-label="Ubah status folder"
                                                    className="inline-flex rounded-md transition-opacity disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer hover:opacity-90"
                                                >
                                                    <StatusBadge status={resolvedFolderStatus} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (isUpdatingStatus) return;
                                                        setIsStatusDropdownOpen((prev) => !prev);
                                                    }}
                                                    disabled={!folder || isUpdatingStatus}
                                                    aria-label="Buka pilihan status folder"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {isStatusDropdownOpen ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </button>

                                                {isStatusDropdownOpen && (
                                                    <div className="absolute left-0 top-[calc(100%+10px)] z-40 w-48 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                                                        <div className="space-y-2">
                                                            {STATUS_OPTIONS.map((option) => {
                                                                const isActive = option.value === resolvedFolderStatus;
                                                                return (
                                                                    <button
                                                                        key={option.value}
                                                                        type="button"
                                                                        disabled={isUpdatingStatus}
                                                                        onClick={() => {
                                                                            void handleUpdateStatus(option.value);
                                                                        }}
                                                                        className={`flex w-full items-center justify-center rounded-lg px-3 py-2 text-base font-medium transition-colors ${
                                                                            isUpdatingStatus
                                                                                ? 'cursor-not-allowed opacity-60'
                                                                                : isActive
                                                                                    ? option.badgeClassName
                                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                        }`}
                                                                    >
                                                                        {option.label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
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
            <Toast toast={toast} onClose={hideToast} position="bottom-left" />
        </div>
    );
}
