'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileText, FolderArchive, FolderClosed, X } from 'lucide-react';
import { apiGet } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { FolderSidebarData, FolderSidebarResponse } from '@/features/services/types';
import { getInitials } from '@/shared/utils/initials';

type DetailTab = 'detail' | 'aktivitas';

interface FolderDetailOffcanvasProps {
    folderId: string | null;
    folderName?: string;
    onClose: () => void;
}

interface ActivityTimelineItem {
    id: string;
    group: 'Hari ini' | 'Kemarin';
    action: string;
    time: string;
    itemType: 'folder' | 'file';
    itemName: string;
}

const formatDisplayValue = (value?: string | null, fallback = '-'): string => {
    if (!value) return fallback;
    const trimmedValue = value.trim();
    return trimmedValue || fallback;
};

const formatValueWithActor = (value?: string | null, actor?: string | null): string => {
    const safeValue = formatDisplayValue(value, '');
    const safeActor = formatDisplayValue(actor, '');

    if (safeValue && safeActor) return `${safeValue} Oleh ${safeActor}`;
    if (safeValue) return safeValue;
    if (safeActor) return `Oleh ${safeActor}`;

    return '-';
};

const resolveStatusMeta = (status?: string | null): { label: string; className: string } => {
    const normalizedStatus = formatDisplayValue(status, '')
        .toLowerCase()
        .trim();

    if (normalizedStatus === 'selesai') {
        return {
            label: 'Selesai',
            className: 'bg-green-100 text-green-700',
        };
    }

    if (normalizedStatus === 'proses' || normalizedStatus === 'dalam_proses') {
        return {
            label: 'Proses',
            className: 'bg-yellow-100 text-yellow-700',
        };
    }

    if (
        normalizedStatus === 'terjeda' ||
        normalizedStatus === 'tertunda' ||
        normalizedStatus === 'terutunda'
    ) {
        return {
            label: 'Tertunda',
            className: 'bg-red-100 text-red-700',
        };
    }

    return {
        label: formatDisplayValue(status, '-'),
        className: 'bg-gray-100 text-gray-700',
    };
};

export function FolderDetailOffcanvas({ folderId, folderName, onClose }: FolderDetailOffcanvasProps) {
    const [activeTab, setActiveTab] = useState<DetailTab>('detail');
    const [detail, setDetail] = useState<FolderSidebarData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!folderId) return;

        let isMounted = true;
        setIsLoading(true);
        setError(null);

        const fetchFolderDetail = async () => {
            try {
                const url = ENDPOINTS.USER.DETAIL_FOLDER_SIDEBAR.replace(':folder_id', folderId);
                const response = await apiGet<FolderSidebarResponse>(url);
                if (!isMounted) return;
                setDetail(response.data);
            } catch {
                if (!isMounted) return;
                setError('Gagal memuat detail folder');
                setDetail(null);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchFolderDetail();

        return () => {
            isMounted = false;
        };
    }, [folderId]);

    useEffect(() => {
        setActiveTab('detail');
    }, [folderId]);

    const folderLabel = detail?.folder_name || folderName || 'Detail Folder';
    const accessUsers = detail?.have_access ?? [];
    const statusMeta = resolveStatusMeta(detail?.detail_status.status);

    const activityItems = useMemo<ActivityTimelineItem[]>(
        () => [
            {
                id: 'today-upload',
                group: 'Hari ini',
                action: 'Anda mengupload Item',
                time: '08.00 26 Jan',
                itemType: 'file',
                itemName: 'Akta.pdf',
            },
            {
                id: 'today-edit',
                group: 'Hari ini',
                action: 'Anda Mengedit Detail di',
                time: '08.00 26 Jan',
                itemType: 'folder',
                itemName: folderLabel,
            },
            {
                id: 'yesterday-upload',
                group: 'Kemarin',
                action: 'Anda mengupload Item',
                time: '08.00 26 Jan',
                itemType: 'file',
                itemName: 'Legalitas.pdf',
            },
        ],
        [folderLabel],
    );

    const actorForAvatar = accessUsers[0]?.name || 'Saya';
    const groupedActivities = useMemo(
        () => ({
            today: activityItems.filter((item) => item.group === 'Hari ini'),
            yesterday: activityItems.filter((item) => item.group === 'Kemarin'),
        }),
        [activityItems],
    );

    if (!folderId) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/30 transition-opacity" onClick={onClose} />

            <div className="fixed top-0 right-0 z-50 flex h-full w-[420px] max-w-full flex-col border-l border-gray-200 bg-white shadow-2xl animate-slide-in-right">
                <div className="border-b border-gray-200 px-5 py-6">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <FolderArchive className="h-8 w-8 shrink-0 text-gray-700" />
                            <h2 className="truncate text-[18px] font-semibold text-gray-900">{folderLabel}</h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Tutup detail folder"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="flex border-b border-gray-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab('detail')}
                        className={`w-1/2 border-b-4 px-4 py-3 text-[18px] transition-colors ${
                            activeTab === 'detail'
                                ? 'border-[#7A6A53] text-[#7A6A53]'
                                : 'border-transparent text-gray-400'
                        }`}
                    >
                        Detail
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('aktivitas')}
                        className={`w-1/2 border-b-4 px-4 py-3 text-[18px] transition-colors ${
                            activeTab === 'aktivitas'
                                ? 'border-[#7A6A53] text-[#7A6A53]'
                                : 'border-transparent text-gray-400'
                        }`}
                    >
                        Aktivitas
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-6">
                    {isLoading ? (
                        <div className="text-sm text-gray-500">Memuat detail...</div>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    ) : activeTab === 'detail' ? (
                        <div className="space-y-8">
                            <section className="space-y-6 border-b border-gray-200 pb-8">
                                <div className="flex flex-col items-center justify-center gap-3">
                                    <FolderArchive className="h-24 w-24 text-gray-700" />
                                    <p className="text-[18px] font-medium text-gray-900 text-center">{folderLabel}</p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[18px] font-semibold text-gray-900">Yang memiliki akses</h3>
                                    {accessUsers.length === 0 ? (
                                        <p className="text-base text-gray-500">
                                            Belum ada user yang memiliki akses.
                                        </p>
                                    ) : (
                                        <>
                                            <div className="flex -space-x-2">
                                                {accessUsers.slice(0, 4).map((item, index) => (
                                                    <div
                                                        key={`${item.name}-${index}`}
                                                        className="flex h-14 w-14 items-center justify-center rounded-full border border-white bg-gradient-to-br from-[#89A1B5] to-[#3D4957] text-sm font-semibold text-white"
                                                    >
                                                        {getInitials(item.name)}
                                                    </div>
                                                ))}
                                            </div>
                                            <ul className="list-disc space-y-1 pl-6 text-base text-gray-700">
                                                {accessUsers.map((item, index) => (
                                                    <li key={`${item.name}-${index}`}>{item.name}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            </section>

                            <section className="space-y-6 border-b border-gray-200 pb-8">
                                <div className="space-y-3">
                                    <h3 className="text-[18px] font-semibold text-gray-900">Detail Status</h3>
                                    <span
                                        className={`inline-flex rounded-xl px-6 py-2 text-lg font-medium ${statusMeta.className}`}
                                    >
                                        {statusMeta.label}
                                    </span>
                                    <p className="text-base text-gray-700">
                                        {formatValueWithActor(
                                            detail?.detail_status.last_modified,
                                            detail?.detail_status.modification_by,
                                        )}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[18px] font-semibold text-gray-900">Detail Folder</h3>

                                    <div>
                                        <p className="text-[17px] font-medium text-gray-800">Dimodifikasi</p>
                                        <p className="mt-1 text-base text-gray-700">
                                            {formatValueWithActor(
                                                detail?.detail_folder.modified_at,
                                                detail?.detail_folder.modified_by,
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[17px] font-medium text-gray-800">Dibuka</p>
                                        <p className="mt-1 text-base text-gray-700">
                                            {formatValueWithActor(
                                                detail?.detail_folder.opened_at,
                                                detail?.detail_folder.opened_by,
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[17px] font-medium text-gray-800">Dibuat</p>
                                        <p className="mt-1 text-base text-gray-700">
                                            {formatValueWithActor(
                                                detail?.detail_folder.created_at,
                                                detail?.detail_folder.created_by,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <section className="space-y-4">
                                <h3 className="text-[18px] font-semibold text-gray-900">Hari ini</h3>
                                {groupedActivities.today.map((item) => (
                                    <div key={item.id} className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#89A1B5] to-[#3D4957] text-sm font-semibold text-white">
                                            {getInitials(actorForAvatar)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[18px] font-medium text-gray-800">{item.action}</p>
                                            <p className="text-sm text-gray-500">{item.time}</p>
                                            <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-[17px] text-gray-700">
                                                {item.itemType === 'folder' ? (
                                                    <FolderClosed className="h-5 w-5 shrink-0" />
                                                ) : (
                                                    <FileText className="h-5 w-5 shrink-0 text-red-500" />
                                                )}
                                                <span className="truncate">{item.itemName}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </section>

                            <section className="space-y-4 border-b border-gray-200 pb-8">
                                <h3 className="text-[18px] font-semibold text-gray-900">Kemarin</h3>
                                {groupedActivities.yesterday.map((item) => (
                                    <div key={item.id} className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#89A1B5] to-[#3D4957] text-sm font-semibold text-white">
                                            {getInitials(actorForAvatar)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[18px] font-medium text-gray-800">{item.action}</p>
                                            <p className="text-sm text-gray-500">{item.time}</p>
                                            <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-[17px] text-gray-700">
                                                {item.itemType === 'folder' ? (
                                                    <FolderClosed className="h-5 w-5 shrink-0" />
                                                ) : (
                                                    <FileText className="h-5 w-5 shrink-0 text-red-500" />
                                                )}
                                                <span className="truncate">{item.itemName}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
