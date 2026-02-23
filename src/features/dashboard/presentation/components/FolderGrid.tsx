'use client';

import { useMemo } from 'react';
import { Folder } from 'lucide-react';
import { folders as staticFolders } from '@/features/dashboard/data';
import { DashboardRecommendation } from '@/features/dashboard/hooks/useDashboard';

interface FolderGridProps {
    recommendations?: DashboardRecommendation[];
    isLoading?: boolean;
}

export function FolderGrid({ recommendations = [], isLoading = false }: FolderGridProps) {
    const displayFolders = useMemo(() => {
        if (isLoading) return [];
        if (recommendations && recommendations.length > 0) {
            return recommendations.map(rec => ({
                id: rec.tipe_layanan_id,
                name: rec.tipe_layanan,
                layanan: rec.layanan
            }));
        }
        return staticFolders.map((f, i) => ({
            id: `static-${i}`,
            name: f.name,
            layanan: 'Layanan Umum'
        }));
    }, [recommendations, isLoading]);

    if (isLoading) {
        return (
            <div className="mb-10 w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Folder yang disarankan</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-xl border border-gray-100"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="mb-10 w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
                {recommendations?.length > 0 ? "Folder yang disarankan" : "Folder yang disarankan"}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayFolders.map((folder) => (
                    <div
                        key={folder.id}
                        className="group flex items-center py-3 px-4 bg-[#FAFAFA] rounded-xl hover:bg-[#f1f1f1] border border-gray-100/50 hover:border-gray-200 transition-all cursor-pointer h-full"
                    >
                        <Folder className="w-6 h-6 text-[#FFB020] fill-[#FFB020] shrink-0 mr-3" />
                        <span className="font-semibold text-gray-800 truncate text-sm leading-tight">{folder.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
