'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Star,
    Folder,
    MoreVertical,
    Clock
} from 'lucide-react';
import { Activity, ActivityStatus } from '@/features/dashboard/types';
import { mockActivities } from '@/features/dashboard/data';
import { SortableHeader } from '@/shared/components/SortableHeader';
import { FilterTabs } from '@/shared/components/FilterTabs';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useActivityTabs } from '@/features/dashboard/presentation/hooks/useActivityTabs';
import { useSelection } from '@/shared/hooks/useSelection';
import { usePagination } from '@/shared/hooks/usePagination';
import { Pagination } from '@/shared/components/Pagination';
import { BulkActionToast } from '@/shared/components/BulkActionToast';
import { useToast } from '@/shared/hooks/useToast';
import { Toast } from '@/shared/components/Toast';
import { ConfirmationModal } from '@/shared/components/ConfirmationModal';
import { PaginatedActivities } from '@/features/dashboard/hooks/useDashboard';
import { apiPost } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';

interface ActivitySectionProps {
    onSelectActivity?: (activity: Activity) => void;
    activities?: Activity[];
    dashboardActivities?: PaginatedActivities | null;
    isLoading?: boolean;
    error?: string | null;
    clientHeaderLabel?: string;
}

export function ActivitySection({
    onSelectActivity,
    activities,
    dashboardActivities,
    isLoading = false,
    error,
    clientHeaderLabel = 'Nama Klien'
}: ActivitySectionProps) {
    const { activeTab, setActiveTab } = useActivityTabs();
    const { toast, showToast, hideToast } = useToast();

    const realActivities = useMemo(() => {
        if (!dashboardActivities?.data) return [];
        return dashboardActivities.data.map((act, index) => ({
            id: act.folder_id || `fallback-id-${index}`,
            companyName: act.folder_name || '-',
            clientName: '-',
            service: act.tipe_layanan || '-',
            author: act.author || '-',
            modifiedDate: String(act.updated_at || '-'),
            status: (act.status || act.object_status || 'Proses') as ActivityStatus,
            isFavorite: false,
            itemType: (act.folder_id ? 'FOLDER' : 'DOCUMENT') as 'FOLDER' | 'DOCUMENT'
        }));
    }, [dashboardActivities]);

    const initialActivityData = dashboardActivities !== undefined ? realActivities : (activities ?? mockActivities);
    const [localActivities, setLocalActivities] = useState<Activity[]>(initialActivityData);

    // Sync local state when external data changes
    useEffect(() => {
        setLocalActivities(initialActivityData);
    }, [initialActivityData]);

    const {
        selectedItems,
        setSelectedItems,
        toggleSelectAll,
        toggleSelectItem,
        isSelected,
        isAllSelected
    } = useSelection({ items: localActivities, itemIdKey: 'id' });

    const selectedActivities = useMemo(
        () => localActivities.filter((activity) => selectedItems.includes(activity.id)),
        [localActivities, selectedItems],
    );

    const hasSelectedItems = selectedActivities.length > 0;

    useEffect(() => {
        setSelectedItems((prev) =>
            prev.filter((selectedId) => localActivities.some((activity) => activity.id === selectedId)),
        );
    }, [localActivities, setSelectedItems]);

    const {
        currentPage,
        totalPages,
        paginatedItems,
        setPage,
        startIndex,
        endIndex,
        totalItems
    } = usePagination({ items: localActivities, itemsPerPage: 5 });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isProcessingBulk, setIsProcessingBulk] = useState(false);

    const handleBulkRename = useCallback(() => {
        showToast({ message: `Ganti nama massal belum didukung sepenuhnya`, variant: 'info' });
        setSelectedItems([]);
    }, [showToast, setSelectedItems]);

    const handleBulkFavorite = useCallback(async () => {
        setIsProcessingBulk(true);
        try {
            // Prepare payload extracting item_type dynamically
            const payloadItems = selectedActivities.map(act => ({
                item_id: act.id,
                item_type: act.itemType ?? 'FOLDER'
            }));

            await apiPost(ENDPOINTS.USER.MULTIPLE_ITEM_FAVORITE, { items: payloadItems });

            // Optimistic UI update
            setLocalActivities(prev => prev.map(act =>
                selectedItems.includes(act.id) ? { ...act, isFavorite: true } : act
            ));

            showToast({ message: `${selectedActivities.length} item berhasil ditambahkan ke berbintang`, variant: 'success' });
            setSelectedItems([]);
        } catch (err) {
            console.error('Bulk Favorite Error:', err);
            showToast({ message: 'Gagal menambahkan ke berbintang', variant: 'error' });
        } finally {
            setIsProcessingBulk(false);
        }
    }, [selectedItems, selectedActivities.length, showToast, setSelectedItems]);

    const handleBulkDownload = useCallback(() => {
        showToast({ message: `Mendownload ${selectedActivities.length} item...`, variant: 'info' });
        setSelectedItems([]);
    }, [selectedActivities.length, showToast, setSelectedItems]);

    const handleBulkMoveToTrash = useCallback(() => {
        // Just open the confirmation modal
        setIsDeleteModalOpen(true);
    }, []);

    const confirmBulkDelete = useCallback(async () => {
        setIsProcessingBulk(true);
        try {
            // Extract and map itemType safely from the local activities context
            const payloadItems = selectedActivities.map(act => ({
                item_id: act.id,
                item_type: act.itemType ?? 'FOLDER'
            }));

            await apiPost(ENDPOINTS.USER.MULTIPLE_ITEM_DELETE, { items: payloadItems });

            // Optimistic UI update by filtering out the deleted IDs
            setLocalActivities(prev => prev.filter(act => !selectedItems.includes(act.id)));

            showToast({ message: `${selectedActivities.length} item berhasil dipindahkan ke sampah`, variant: 'success' });
            setSelectedItems([]);
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error('Bulk Delete Error:', err);
            showToast({ message: 'Gagal memindahkan ke sampah', variant: 'error' });
        } finally {
            setIsProcessingBulk(false);
        }
    }, [selectedItems, selectedActivities.length, showToast, setSelectedItems]);

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-lg">
                    Aktivitas
                </h3>
            </div>

            <FilterTabs
                tabs={[
                    { id: 'recent', label: 'Baru di tambahkan', icon: Clock },
                    { id: 'favorite', label: 'Favorite', icon: Star },
                ]}
                activeTab={activeTab}
                onChange={(id) => setActiveTab(id as 'recent' | 'favorite')}
            />

            <div className={`bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden min-h-[300px]`}>
                {isLoading ? (
                    <div className="py-24 text-center text-gray-500 animate-pulse">Memuat aktivitas...</div>
                ) : localActivities.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <Folder className="w-12 h-12 text-gray-300 fill-gray-200" />
                        </div>
                        <h4 className="text-gray-900 font-semibold mb-1">Belum ada aktivitas arsip Dokumen</h4>
                        <p className="text-gray-500 text-sm">Aktivitas dokumen atau folder yang Anda akses akan muncul di sini</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-gray-100 border-b">
                                    <th className="p-4 w-4">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="bg-gray-100 border-gray-300 rounded focus:ring-[#8B7355] focus:ring-2 w-4 h-4 text-[#8B7355]"
                                                checked={isAllSelected && localActivities.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 font-medium text-gray-500 text-sm text-left">
                                        <SortableHeader label="Nama Perusahaan" />
                                    </th>
                                    <th className="px-6 py-4 font-medium text-gray-500 text-sm text-left">
                                        <SortableHeader label={clientHeaderLabel} />
                                    </th>
                                    <th className="px-6 py-4 font-medium text-gray-500 text-sm text-left">
                                        <SortableHeader label="Layanan" />
                                    </th>
                                    <th className="px-6 py-4 font-medium text-gray-500 text-sm text-left">
                                        <SortableHeader label="Author" />
                                    </th>
                                    <th className="px-6 py-4 font-medium text-gray-500 text-sm text-left">
                                        <SortableHeader label="Dimodifikasi" />
                                    </th>
                                    <th className="px-6 py-4 font-medium text-gray-500 text-sm text-left">
                                        <SortableHeader label="Status" />
                                    </th>
                                    <th className="px-6 py-4 font-medium text-gray-500 text-sm text-left">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedItems.map((activity) => (
                                    <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 w-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="bg-gray-100 border-gray-300 rounded focus:ring-[#8B7355] focus:ring-2 w-4 h-4 text-[#8B7355]"
                                                    checked={isSelected(activity.id)}
                                                    onChange={() => toggleSelectItem(activity.id)}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 min-w-[200px]">
                                            <button
                                                onClick={() => onSelectActivity?.(activity)}
                                                className="flex items-center gap-3 hover:opacity-70 transition-opacity"
                                            >
                                                <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                                                    <Folder className="w-5 h-5 text-[#FFB020] fill-[#FFB020]" />
                                                </div>
                                                <span className="font-medium text-gray-900 text-left">{activity.companyName}</span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 min-w-[200px] text-gray-600">
                                            {activity.clientName}
                                        </td>
                                        <td className="px-6 py-4 min-w-[200px] text-gray-600">
                                            {activity.service}
                                        </td>
                                        <td className="px-6 py-4 min-w-[200px] text-gray-600">
                                            {activity.author}
                                        </td>
                                        <td className="px-6 py-4 min-w-[200px] text-gray-600">
                                            {activity.modifiedDate}
                                        </td>
                                        <td className="px-6 py-4 min-w-[200px]">
                                            <StatusBadge status={activity.status} />
                                        </td>
                                        <td className="px-6 py-4 min-w-[200px] text-gray-600">
                                            <button className="hover:bg-gray-100 p-1 rounded-lg transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {localActivities.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalItems={totalItems}
                />
            )}
            <Toast toast={toast} onClose={hideToast} position="bottom-left" />

            {hasSelectedItems && (
                <BulkActionToast
                    onRename={handleBulkRename}
                    onToggleFavorite={handleBulkFavorite}
                    onDownload={handleBulkDownload}
                    onMoveToTrash={handleBulkMoveToTrash}
                    onCancel={() => setSelectedItems([])}
                    disabled={isProcessingBulk}
                    statusLabel={`${selectedActivities.length} Terpilih`}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmBulkDelete}
                isProcessing={isProcessingBulk}
                title="Pindahkan ke sampah"
                description={
                    <span>
                        Apakah Anda yakin ingin memindahkan <b>{selectedActivities.length} item</b> yang dipilih ke tempat sampah? Tindakan ini dapat dibalikkan dari halaman sampah.
                    </span>
                }
                confirmText="Ya, Pindahkan"
                cancelText="Batal"
                variant="danger"
            />
        </div>
    );
}

