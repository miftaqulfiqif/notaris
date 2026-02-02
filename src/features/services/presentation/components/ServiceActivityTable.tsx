'use client';

import {
    Star,
    Folder,
    MoreVertical
} from 'lucide-react';
import { Activity } from '@/features/dashboard/types';
import { serviceActivities } from '@/features/services/data/mock';
import { SortableHeader } from '@/shared/components/SortableHeader';
import { FilterTabs } from '@/shared/components/FilterTabs';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useActivityTabs } from '@/features/dashboard/presentation/hooks/useActivityTabs';
import { useSelection } from '@/shared/hooks/useSelection';
import { usePagination } from '@/shared/hooks/usePagination';
import { Pagination } from '@/shared/components/Pagination';

interface ServiceActivityTableProps {
    onSelectActivity?: (activity: Activity) => void;
}

export function ServiceActivityTable({ onSelectActivity }: ServiceActivityTableProps) {
    const { activeTab, setActiveTab } = useActivityTabs();

    const {
        selectedItems,
        toggleSelectAll,
        toggleSelectItem,
        isSelected,
        isAllSelected
    } = useSelection({ items: serviceActivities, itemIdKey: 'id' });

    const {
        currentPage,
        totalPages,
        paginatedItems,
        setPage,
        startIndex,
        endIndex,
        totalItems
    } = usePagination({ items: serviceActivities, itemsPerPage: 5 });

    return (
        <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Aktivitas</h3>

            {/* Filter Tabs */}
            <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Table */}
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
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 first:pl-6">
                                    <SortableHeader label="Nama Perusahaan" />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <SortableHeader label="Nama Penghadap" />
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
                                    <span className="sr-only">Aksi</span>
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
                                    <td className="px-6 py-4 min-w-70">
                                        <button
                                            onClick={() => onSelectActivity?.(activity)}
                                            className="flex items-center gap-3 hover:opacity-70 transition-opacity w-full text-left"
                                        >
                                            <div className="p-2 bg-gray-100 rounded-lg text-gray-600 shrink-0">
                                                <Folder className="w-5 h-5" />
                                            </div>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="min-w-0">
                                                    <span className="font-medium text-gray-900 block max-w-60 truncate">{activity.companyName}</span>
                                                    {activity.isFavorite && <Star className="w-3 h-3 fill-gray-900 text-gray-900 mt-1" />}
                                                </div>
                                            </div>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 min-w-[150px] truncate text-gray-600">
                                        {activity.clientName}
                                    </td>
                                    <td className="px-6 py-4 min-w-[150px] truncate text-gray-600">
                                        {activity.service}
                                    </td>
                                    <td className="px-6 py-4 min-w-[150px] truncate text-gray-600">
                                        {activity.author}
                                    </td>
                                    <td className="px-6 py-4 min-w-[150px] truncate text-gray-600">
                                        {activity.modifiedDate}
                                    </td>
                                    <td className="px-6 py-4 min-w-[150px] truncate">
                                        <StatusBadge status={activity.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
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
