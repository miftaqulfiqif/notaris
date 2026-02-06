'use client';

import {
    Star,
    Folder,
    MoreVertical,
    Clock
} from 'lucide-react';
import { Activity } from '@/features/dashboard/types';
import { mockActivities } from '@/features/dashboard/data';
import { SortableHeader } from '@/shared/components/SortableHeader';
import { FilterTabs } from '@/shared/components/FilterTabs';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useActivityTabs } from '@/features/dashboard/presentation/hooks/useActivityTabs';
import { useSelection } from '@/shared/hooks/useSelection';
import { usePagination } from '@/shared/hooks/usePagination';
import { Pagination } from '@/shared/components/Pagination';

interface ActivitySectionProps {
    onSelectActivity?: (activity: Activity) => void;
    activities?: Activity[];
    clientHeaderLabel?: string;
}

export function ActivitySection({
    onSelectActivity,
    activities,
    clientHeaderLabel = 'Nama Klien'
}: ActivitySectionProps) {
    const { activeTab, setActiveTab } = useActivityTabs();

    const activityData = activities ?? mockActivities;

    const {
        selectedItems,
        toggleSelectAll,
        toggleSelectItem,
        isSelected,
        isAllSelected
    } = useSelection({ items: activityData, itemIdKey: 'id' });

    const {
        currentPage,
        totalPages,
        paginatedItems,
        setPage,
        startIndex,
        endIndex,
        totalItems
    } = usePagination({ items: activityData, itemsPerPage: 5 });

    return (
        <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Aktivitas</h3>

            <FilterTabs
                tabs={[
                    { id: 'recent', label: 'Baru di tambahkan', icon: Clock },
                    { id: 'favorite', label: 'Favorite', icon: Star },
                ]}
                activeTab={activeTab}
                onChange={(id) => setActiveTab(id as any)}
            />

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="p-4 w-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-[#8B7355] bg-gray-100 border-gray-300 rounded focus:ring-[#8B7355] focus:ring-2"
                                            checked={isAllSelected}
                                            onChange={toggleSelectAll}
                                        />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <SortableHeader label="Nama Perusahaan" />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <SortableHeader label={clientHeaderLabel} />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <SortableHeader label="Layanan" />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <SortableHeader label="Author" />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <SortableHeader label="Dimodifikasi" />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <SortableHeader label="Status" />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
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
                                                className="w-4 h-4 text-[#8B7355] bg-gray-100 border-gray-300 rounded focus:ring-[#8B7355] focus:ring-2"
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
                                            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                                <Folder className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-gray-900">{activity.companyName}</span>
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
                                        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={totalItems}
            />
        </div>
    );
}
