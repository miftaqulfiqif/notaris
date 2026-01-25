'use client';

import { useState } from 'react';
import {
    Clock,
    Star,
    Folder,
    ArrowUpDown,
    MoreVertical
} from 'lucide-react';
import { Activity } from '@/features/dashboard/types';
import { mockActivities } from '@/features/dashboard/data';
import { getStatusColor } from '@/features/dashboard/utils';

interface ActivitySectionProps {
    onSelectActivity?: (activity: Activity) => void;
}

export function ActivitySection({ onSelectActivity }: ActivitySectionProps) {
    const [activeTab, setActiveTab] = useState<'recent' | 'favorite'>('recent');

    return (
        <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Aktivitas</h3>

            {/* Filter Tabs */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('recent')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${activeTab === 'recent'
                        ? 'bg-white border-gray-200 text-gray-900 font-medium shadow-sm'
                        : 'bg-transparent border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Clock className="w-4 h-4" />
                    Baru di tambahkan
                </button>
                <button
                    onClick={() => setActiveTab('favorite')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${activeTab === 'favorite'
                        ? 'bg-white border-gray-200 text-gray-900 font-medium shadow-sm'
                        : 'bg-transparent border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Star className="w-4 h-4" />
                    Favorite
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 first:pl-6">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-gray-700">
                                        Nama Perusahaan
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-gray-700">
                                        Nama Klien
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-gray-700">
                                        Layanan
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-gray-700">
                                        Author
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-gray-700">
                                        Dimodifikasi
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-gray-700">
                                        Status
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockActivities.map((activity) => (
                                <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
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
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 fill-gray-900 text-gray-900" />
                                            {activity.clientName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 min-w-[200px] text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 fill-gray-900 text-gray-900" />
                                            {activity.service}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 min-w-[200px] text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 fill-gray-900 text-gray-900" />
                                            {activity.author}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 min-w-[200px] text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 fill-gray-900 text-gray-900" />
                                            {activity.modifiedDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 min-w-[200px]">
                                        <div className="flex items-center gap-4">
                                            <Star className="w-4 h-4 fill-gray-900 text-gray-900" />
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)} min-w-[100px] text-center`}>
                                                {activity.status}
                                            </span>
                                        </div>
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
        </div>
    );
}
