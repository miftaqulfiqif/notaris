'use client';

import { Folder, MoreVertical, LayoutGrid, List } from 'lucide-react';
import { Activity } from '@/features/dashboard/types';
import { PaginatedActivities } from '@/features/dashboard/hooks/useDashboard';
import { useMemo, useState } from 'react';

interface RecommendationSectionProps {
    onSelectActivity?: (activity: Activity) => void;
    dashboardActivities?: PaginatedActivities | null;
    isLoading?: boolean;
}

const toActivityStatus = (
    ...statuses: Array<string | null | undefined>
): Activity['status'] => {
    for (const status of statuses) {
        if (status === 'Selesai' || status === 'Terjeda' || status === 'Proses') {
            return status;
        }
    }
    return 'Proses';
};

export function RecommendationSection({
    onSelectActivity,
    dashboardActivities,
    isLoading = false,
}: RecommendationSectionProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const realActivities = useMemo<Activity[]>(() => {
        if (!dashboardActivities?.data) return [];
        return dashboardActivities.data.map((act, index) => ({
            id: act.folder_id || `fallback-id-${index}`,
            companyName: act.folder_name || '-',
            clientName: '-',
            service: act.tipe_layanan || '-',
            author: act.author || '-',
            modifiedDate: String(act.updated_at || '-'),
            status: toActivityStatus(act.status, act.object_status),
            isFavorite: false
        })).slice(0, 4); // Only show top 4 for recommendations
    }, [dashboardActivities]);

    if (realActivities.length === 0 && !isLoading) {
        return null;
    }

    return (
        <div className="mb-10 w-full hover:-translate-y-0.5 transition-all">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                    Disarankan dari aktivitas Anda
                </h3>
                <div className="flex bg-gray-100/80 p-1 rounded-lg border border-gray-200/60">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-800 border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Tampilan Grid"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-800 border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Tampilan List"
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-[180px] bg-gray-100 animate-pulse rounded-2xl border border-gray-100"></div>
                    ))}
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-1 border-none shadow-none bg-transparent">
                    {realActivities.map((activity) => (
                        <div key={activity.id} className="group relative border border-gray-200/80 bg-white rounded-2xl p-4 flex flex-col hover:border-[#B39B7D] hover:shadow-md transition-all cursor-pointer h-[180px]">
                            <div className="flex-1 flex justify-center items-center py-2" onClick={() => onSelectActivity?.(activity)}>
                                <Folder className="w-[84px] h-[84px] text-[#FFB020] fill-[#FFB020] group-hover:scale-105 transition-transform" />
                            </div>
                            <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-100/60">
                                <div className="flex-1 truncate pr-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="font-medium truncate">{activity.companyName}</span>
                                        <span className="text-gray-400 text-xs text-[10px]">•</span>
                                        <span className="truncate">{activity.service}</span>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors shrink-0">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Simplified list view for recommendations if they toggle it */}
                    {realActivities.map((activity, idx) => (
                        <div key={activity.id} className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${idx !== realActivities.length - 1 ? 'border-b border-gray-100' : ''}`} onClick={() => onSelectActivity?.(activity)}>
                            <div className="flex items-center gap-4">
                                <Folder className="w-8 h-8 text-[#FFB020] fill-[#FFB020]" />
                                <div>
                                    <p className="font-semibold text-gray-800">{activity.companyName}</p>
                                    <p className="text-sm text-gray-500">{activity.service} • Dimodifikasi {activity.modifiedDate}</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors shrink-0">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
