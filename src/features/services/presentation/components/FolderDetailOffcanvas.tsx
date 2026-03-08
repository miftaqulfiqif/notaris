'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type UIEvent } from 'react';
import { FileText, FolderArchive, FolderClosed, X } from 'lucide-react';
import { apiGet } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type {
    FolderActivityItem,
    FolderActivitiesResponse,
    FolderSidebarData,
    FolderSidebarResponse,
} from '@/features/services/types';
import { getInitials } from '@/shared/utils/initials';

type DetailTab = 'detail' | 'aktivitas';
type ActivityGroup = 'Hari ini' | 'Kemarin' | 'Sebelumnya';

const ACTIVITIES_PAGE_LIMIT = 20;
const SCROLL_BOTTOM_THRESHOLD = 160;

interface FolderDetailOffcanvasProps {
    folderId: string | null;
    folderName?: string;
    onClose: () => void;
}

interface ActivitySectionProps {
    title: ActivityGroup;
    items: FolderActivityItem[];
    avatarInitials: string;
    fallbackFolderLabel: string;
    withBottomBorder?: boolean;
}

interface ActivityNode {
    kind: 'folder' | 'file';
    label: string;
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

const resolveActivityGroup = (createdAt: string): ActivityGroup => {
    const normalized = createdAt.toLowerCase().trim();

    if (!normalized) return 'Hari ini';
    if (normalized.includes('kemarin')) return 'Kemarin';

    const parsedDate = new Date(createdAt);
    if (!Number.isNaN(parsedDate.getTime())) {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const activityStart = new Date(
            parsedDate.getFullYear(),
            parsedDate.getMonth(),
            parsedDate.getDate(),
        );
        const dayDiff = Math.floor((todayStart.getTime() - activityStart.getTime()) / 86_400_000);

        if (dayDiff <= 0) return 'Hari ini';
        if (dayDiff === 1) return 'Kemarin';
        return 'Sebelumnya';
    }

    const dayMatch = normalized.match(/(\d+)\s+hari/);
    if (dayMatch) {
        const days = Number(dayMatch[1]);
        if (Number.isFinite(days)) {
            if (days <= 0) return 'Hari ini';
            if (days === 1) return 'Kemarin';
            return 'Sebelumnya';
        }
    }

    if (
        normalized.includes('menit') ||
        normalized.includes('jam') ||
        normalized.includes('detik') ||
        normalized.includes('baru')
    ) {
        return 'Hari ini';
    }

    return 'Sebelumnya';
};

const resolveIsFileActivity = (activity: FolderActivityItem): boolean => {
    const combinedText = `${activity.description} ${activity.object}`.toLowerCase();
    if (combinedText.includes('file')) return true;

    return /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png|zip|rar)$/i.test(activity.object);
};

const resolveActivityTitle = (description: string): string => {
    const normalized = description.toLowerCase();

    if (normalized.includes('menghapus')) return 'Anda Menghapus Item di';
    if (normalized.includes('mengupload')) return 'Anda mengupload Item di';
    if (normalized.includes('membuat')) return 'Anda Membuat Item di';
    if (normalized.includes('mengedit') || normalized.includes('merubah')) return 'Anda Mengedit Detail di';
    if (normalized.includes('membuka')) return 'Anda Membuka Item di';

    return formatDisplayValue(description)
        .replace(/^kamu/i, 'Anda')
        .trim();
};

const resolveActivityNodes = (
    activity: FolderActivityItem,
    fallbackFolderLabel: string,
): ActivityNode[] => {
    const nodes: ActivityNode[] = [];
    const folderNodeLabel = formatDisplayValue(activity.folder_name, fallbackFolderLabel);
    const objectValue = formatDisplayValue(activity.object, '');
    const isItemsCount = /^\d+\s+items?$/i.test(objectValue);
    const hasSecondNode =
        Boolean(objectValue) &&
        objectValue !== '-' &&
        !isItemsCount &&
        objectValue.toLowerCase() !== folderNodeLabel.toLowerCase();

    nodes.push({
        kind: 'folder',
        label: folderNodeLabel,
    });

    if (hasSecondNode) {
        nodes.push({
            kind: resolveIsFileActivity(activity) ? 'file' : 'folder',
            label: objectValue,
        });
    }

    return nodes;
};

const parseFolderActivitiesResponse = (payload: FolderActivitiesResponse['data']) => {
    if (Array.isArray(payload)) {
        return {
            items: payload,
            currentPage: 1,
            totalItems: payload.length,
            totalPages: payload.length > 0 ? 1 : 0,
        };
    }

    const items = Array.isArray(payload?.data) ? payload.data : [];

    return {
        items,
        currentPage: payload?.current_page ?? 1,
        totalItems: payload?.total_items ?? items.length,
        totalPages: payload?.total_pages ?? (items.length > 0 ? 1 : 0),
    };
};

function ActivitySection({
    title,
    items,
    avatarInitials,
    fallbackFolderLabel,
    withBottomBorder = false,
}: ActivitySectionProps) {
    if (items.length === 0) return null;

    return (
        <section className={`space-y-5 ${withBottomBorder ? 'border-b border-gray-200 pb-8' : ''}`}>
            <h3 className="text-[18px] font-semibold text-gray-900">{title}</h3>
            {items.map((item) => {
                const nodes = resolveActivityNodes(item, fallbackFolderLabel);
                const activityStatus = item.object_status ? resolveStatusMeta(item.object_status) : null;

                return (
                    <div key={item.id} className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-sm font-semibold text-white">
                            {avatarInitials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[17px] font-medium text-gray-800">
                                {resolveActivityTitle(item.description)}
                            </p>
                            <p className="text-sm text-gray-500">{formatDisplayValue(item.created_at)}</p>

                            <div className="mt-3 space-y-3">
                                {nodes.map((node, index) => (
                                    <div
                                        key={`${item.id}-node-${index}`}
                                        className="flex items-start"
                                        style={index > 0 ? { marginLeft: `${index * 22}px` } : undefined}
                                    >
                                        {index > 0 && (
                                            <span className="mt-0.5 mr-3 h-7 w-8 shrink-0 rounded-bl-[12px] border-gray-500/70 border-b-2 border-l-2" />
                                        )}
                                        <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[17px] text-gray-700">
                                            {node.kind === 'file' ? (
                                                <FileText className="h-5 w-5 shrink-0 text-red-500" />
                                            ) : (
                                                <FolderClosed className="h-5 w-5 shrink-0" />
                                            )}
                                            <span className="truncate">{node.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {activityStatus && (
                                <div className="mt-2">
                                    <span
                                        className={`inline-flex rounded-lg px-3 py-1 text-sm font-medium ${activityStatus.className}`}
                                    >
                                        {activityStatus.label}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </section>
    );
}

export function FolderDetailOffcanvas({ folderId, folderName, onClose }: FolderDetailOffcanvasProps) {
    const [activeTab, setActiveTab] = useState<DetailTab>('detail');
    const [detail, setDetail] = useState<FolderSidebarData | null>(null);
    const [activities, setActivities] = useState<FolderActivityItem[]>([]);
    const [activitiesPage, setActivitiesPage] = useState(1);
    const [activitiesTotalPages, setActivitiesTotalPages] = useState(0);
    const [activitiesTotalItems, setActivitiesTotalItems] = useState(0);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
    const [isLoadingMoreActivities, setIsLoadingMoreActivities] = useState(false);
    const [activitiesError, setActivitiesError] = useState<string | null>(null);
    const [activitiesLoadMoreError, setActivitiesLoadMoreError] = useState<string | null>(null);
    const contentContainerRef = useRef<HTMLDivElement | null>(null);
    const activitiesRequestIdRef = useRef(0);

    const hasMoreActivities = activitiesPage < activitiesTotalPages;

    const fetchFolderActivitiesPage = useCallback(async (targetFolderId: string, page: number) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: ACTIVITIES_PAGE_LIMIT.toString(),
        });
        const url = `${ENDPOINTS.USER.FOLDER_ACTIVITIES.replace(':folder_id', targetFolderId)}?${params.toString()}`;
        const response = await apiGet<FolderActivitiesResponse>(url);
        return parseFolderActivitiesResponse(response.data);
    }, []);

    useEffect(() => {
        if (!folderId) return;

        let isMounted = true;
        setIsDetailLoading(true);
        setDetailError(null);

        const fetchFolderDetail = async () => {
            try {
                const url = ENDPOINTS.USER.DETAIL_FOLDER_SIDEBAR.replace(':folder_id', folderId);
                const response = await apiGet<FolderSidebarResponse>(url);
                if (!isMounted) return;
                setDetail(response.data);
            } catch {
                if (!isMounted) return;
                setDetailError('Gagal memuat detail folder');
                setDetail(null);
            } finally {
                if (isMounted) {
                    setIsDetailLoading(false);
                }
            }
        };

        void fetchFolderDetail();

        return () => {
            isMounted = false;
        };
    }, [folderId]);

    useEffect(() => {
        if (!folderId) return;

        let isMounted = true;
        const requestId = activitiesRequestIdRef.current + 1;
        activitiesRequestIdRef.current = requestId;

        setActivities([]);
        setActivitiesPage(1);
        setActivitiesTotalPages(0);
        setActivitiesTotalItems(0);
        setIsActivitiesLoading(true);
        setIsLoadingMoreActivities(false);
        setActivitiesError(null);
        setActivitiesLoadMoreError(null);

        const fetchFolderActivities = async () => {
            try {
                const result = await fetchFolderActivitiesPage(folderId, 1);
                if (!isMounted || activitiesRequestIdRef.current !== requestId) return;

                setActivities(result.items);
                setActivitiesPage(result.currentPage);
                setActivitiesTotalPages(result.totalPages);
                setActivitiesTotalItems(result.totalItems);
            } catch {
                if (!isMounted || activitiesRequestIdRef.current !== requestId) return;
                setActivitiesError('Gagal memuat aktivitas folder');
                setActivities([]);
            } finally {
                if (isMounted && activitiesRequestIdRef.current === requestId) {
                    setIsActivitiesLoading(false);
                }
            }
        };

        void fetchFolderActivities();

        return () => {
            isMounted = false;
        };
    }, [fetchFolderActivitiesPage, folderId]);

    const loadMoreActivities = useCallback(async () => {
        if (!folderId || isActivitiesLoading || isLoadingMoreActivities || !hasMoreActivities) {
            return;
        }

        const nextPage = activitiesPage + 1;
        const activeRequestId = activitiesRequestIdRef.current;
        setIsLoadingMoreActivities(true);
        setActivitiesLoadMoreError(null);

        try {
            const result = await fetchFolderActivitiesPage(folderId, nextPage);
            if (activitiesRequestIdRef.current !== activeRequestId) return;

            setActivities((prev) => {
                const existingIds = new Set(prev.map((item) => item.id));
                const newItems = result.items.filter((item) => !existingIds.has(item.id));
                return [...prev, ...newItems];
            });
            setActivitiesPage(result.currentPage);
            setActivitiesTotalPages(result.totalPages);
            setActivitiesTotalItems(result.totalItems);
        } catch {
            if (activitiesRequestIdRef.current !== activeRequestId) return;
            setActivitiesLoadMoreError('Gagal memuat aktivitas berikutnya');
        } finally {
            if (activitiesRequestIdRef.current === activeRequestId) {
                setIsLoadingMoreActivities(false);
            }
        }
    }, [
        activitiesPage,
        fetchFolderActivitiesPage,
        folderId,
        hasMoreActivities,
        isActivitiesLoading,
        isLoadingMoreActivities,
    ]);

    const handleContentScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
        if (activeTab !== 'aktivitas' || isActivitiesLoading || isLoadingMoreActivities || !hasMoreActivities) {
            return;
        }

        const container = event.currentTarget;
        const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

        if (distanceToBottom <= SCROLL_BOTTOM_THRESHOLD) {
            void loadMoreActivities();
        }
    }, [activeTab, hasMoreActivities, isActivitiesLoading, isLoadingMoreActivities, loadMoreActivities]);

    useEffect(() => {
        if (
            activeTab !== 'aktivitas' ||
            isActivitiesLoading ||
            isLoadingMoreActivities ||
            !hasMoreActivities
        ) {
            return;
        }

        const container = contentContainerRef.current;
        if (!container) return;

        if (container.scrollHeight <= container.clientHeight + 1) {
            void loadMoreActivities();
        }
    }, [
        activeTab,
        activities.length,
        hasMoreActivities,
        isActivitiesLoading,
        isLoadingMoreActivities,
        loadMoreActivities,
    ]);

    useEffect(() => {
        setActiveTab('detail');
    }, [folderId]);

    const folderLabel = detail?.folder_name || folderName || 'Detail Folder';
    const accessUsers = detail?.have_access ?? [];
    const statusMeta = resolveStatusMeta(detail?.detail_status.status);
    const avatarInitials = getInitials(accessUsers[0]?.name || 'Saya');

    const groupedActivities = useMemo(
        () => ({
            today: activities.filter((item) => resolveActivityGroup(item.created_at) === 'Hari ini'),
            yesterday: activities.filter((item) => resolveActivityGroup(item.created_at) === 'Kemarin'),
            previous: activities.filter((item) => resolveActivityGroup(item.created_at) === 'Sebelumnya'),
        }),
        [activities],
    );

    const detailTabContent = isDetailLoading ? (
        <div className="text-sm text-gray-500">Memuat detail...</div>
    ) : detailError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {detailError}
        </div>
    ) : (
        <div className="space-y-8">
            <section className="space-y-6 border-b border-gray-200 pb-8">
                <div className="flex flex-col items-center justify-center gap-3">
                    <FolderArchive className="h-24 w-24 text-gray-700" />
                    <p className="text-[18px] font-medium text-gray-900 text-center">{folderLabel}</p>
                    <p className="text-sm text-gray-500">{detail?.detail_folder?.tipe_layanan || 'Detail Folder Layanan'}</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[18px] font-semibold text-gray-900">Yang memiliki akses</h3>
                        <button
                            type="button"
                            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                        >
                            Kelola Akses
                        </button>
                    </div>
                    {accessUsers.length === 0 ? (
                        <p className="text-base text-gray-500">Belum ada user yang memiliki akses.</p>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex -space-x-2">
                                {accessUsers.slice(0, 4).map((item, index) => (
                                    <div
                                        key={`${item.name}-${index}`}
                                        className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-[#89A1B5] to-[#3D4957] font-semibold text-sm text-white"
                                        title={item.name}
                                    >
                                        {item.profile_picture ? (
                                            <img src={item.profile_picture} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            getInitials(item.name)
                                        )}
                                    </div>
                                ))}
                                {accessUsers.length > 4 && (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gray-100 font-semibold text-sm text-gray-600">
                                        +{accessUsers.length - 4}
                                    </div>
                                )}
                            </div>
                            <ul className="space-y-3 pt-2">
                                {accessUsers.map((item, index) => (
                                    <li key={`${item.name}-${index}`} className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#89A1B5] to-[#3D4957] font-semibold text-xs text-white">
                                            {item.profile_picture ? (
                                                <img src={item.profile_picture} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                getInitials(item.name)
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            {item.role && <p className="text-sm text-gray-500">{item.role}</p>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </section>

            <section className="space-y-6 border-b border-gray-200 pb-8">
                <div className="space-y-3">
                    <h3 className="text-[18px] font-semibold text-gray-900">Detail Status</h3>
                    <div className="flex items-center gap-3">
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
                </div>

                <div className="space-y-4">
                    <h3 className="text-[18px] font-semibold text-gray-900">Detail Folder Layanan</h3>

                    <div>
                        <p className="text-[17px] font-medium text-gray-800">Dibuat</p>
                        <p className="mt-1 text-base text-gray-700">
                            {formatValueWithActor(
                                detail?.detail_folder.created_at,
                                detail?.detail_folder.created_by,
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
                        <p className="text-[17px] font-medium text-gray-800">Dimodifikasi</p>
                        <p className="mt-1 text-base text-gray-700">
                            {formatValueWithActor(
                                detail?.detail_folder.modified_at,
                                detail?.detail_folder.modified_by,
                            )}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );

    const activityTabContent = isActivitiesLoading && activities.length === 0 ? (
        <div className="text-sm text-gray-500">Memuat aktivitas...</div>
    ) : activitiesError && activities.length === 0 ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {activitiesError}
        </div>
    ) : activities.length === 0 ? (
        <p className="text-sm text-gray-500">Belum ada aktivitas pada folder ini.</p>
    ) : (
        <div className="space-y-8">
            <ActivitySection
                title="Hari ini"
                items={groupedActivities.today}
                avatarInitials={avatarInitials}
                fallbackFolderLabel={folderLabel}
            />
            <ActivitySection
                title="Kemarin"
                items={groupedActivities.yesterday}
                avatarInitials={avatarInitials}
                fallbackFolderLabel={folderLabel}
            />
            <ActivitySection
                title="Sebelumnya"
                items={groupedActivities.previous}
                avatarInitials={avatarInitials}
                fallbackFolderLabel={folderLabel}
                withBottomBorder
            />
            {isLoadingMoreActivities && (
                <p className="text-sm text-gray-500">Memuat aktivitas berikutnya...</p>
            )}
            {activitiesLoadMoreError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {activitiesLoadMoreError}
                </p>
            )}
            {!isLoadingMoreActivities && !hasMoreActivities && activitiesTotalItems > 0 && (
                <p className="text-sm text-gray-500">Semua aktivitas sudah ditampilkan.</p>
            )}
        </div>
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
                        className={`w-1/2 border-b-4 px-4 py-3 text-[18px] transition-colors ${activeTab === 'detail'
                                ? 'border-[#7A6A53] text-[#7A6A53]'
                                : 'border-transparent text-gray-400'
                            }`}
                    >
                        Detail
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('aktivitas')}
                        className={`w-1/2 border-b-4 px-4 py-3 text-[18px] transition-colors ${activeTab === 'aktivitas'
                                ? 'border-[#7A6A53] text-[#7A6A53]'
                                : 'border-transparent text-gray-400'
                            }`}
                    >
                        Aktivitas
                    </button>
                </div>

                <div
                    ref={contentContainerRef}
                    className="flex-1 overflow-y-auto px-5 py-6"
                    onScroll={handleContentScroll}
                >
                    {activeTab === 'detail' ? detailTabContent : activityTabContent}
                </div>
            </div>
        </>
    );
}
