'use client';

import { useMemo, useState } from 'react';
import { ArrowUpDown, Clock3, Folder, LayoutGrid, List, Plus, Star } from 'lucide-react';
import { DashboardHeader } from '@/layout/DashboardHeader';

interface CompanyItem {
    id: string;
    name: string;
    principalName: string;
    service: string;
    serviceType: string;
    author: string;
    modifiedAt: string;
}

const companyItems: CompanyItem[] = [
    {
        id: 'company-1',
        name: 'PT. Dummy',
        principalName: 'Pak. Dummy',
        service: 'PT',
        serviceType: 'Pendirian',
        author: 'Admin 1',
        modifiedAt: 'Januari, 31 2026',
    },
    {
        id: 'company-2',
        name: 'PT. Dummy',
        principalName: 'Pak. Dummy',
        service: 'CV',
        serviceType: 'Perubahan',
        author: 'Admin 2',
        modifiedAt: 'Januari, 31 2026',
    },
    {
        id: 'company-3',
        name: 'PT. Dummy',
        principalName: 'Pak. Dummy',
        service: 'Fidusia',
        serviceType: 'Pembubaran',
        author: 'Admin 2',
        modifiedAt: 'Januari, 31 2026',
    },
    {
        id: 'company-4',
        name: 'PT. Dummy',
        principalName: 'Pak. Dummy',
        service: 'Firma',
        serviceType: 'Pembukaan cabang',
        author: 'Admin 1',
        modifiedAt: 'Januari, 31 2026',
    },
    {
        id: 'company-5',
        name: 'PT. Dummy',
        principalName: 'Pak. Dummy',
        service: 'Yayasan',
        serviceType: 'Pendirian',
        author: 'Admin 1',
        modifiedAt: 'Januari, 31 2026',
    },
    {
        id: 'company-6',
        name: 'PT. Dummy',
        principalName: 'Pak. Dummy',
        service: 'CV',
        serviceType: 'Pendirian',
        author: 'Admin 1',
        modifiedAt: 'Januari, 31 2026',
    },
    {
        id: 'company-7',
        name: 'PT. Dummy',
        principalName: 'Pak. Dummy',
        service: 'Koperasi',
        serviceType: 'Pendirian',
        author: 'Admin 1',
        modifiedAt: 'Januari, 31 2026',
    },
    {
        id: 'company-8',
        name: 'PT. Dummy',
        principalName: 'Pak. Dummy',
        service: 'CV',
        serviceType: 'Pendirian',
        author: 'Admin 1',
        modifiedAt: 'Januari, 31 2026',
    },
    {
        id: 'company-9',
        name: 'PT. Dummy',
        principalName: 'Pak. Dummy',
        service: 'Koperasi',
        serviceType: 'Pendirian',
        author: 'Admin 1',
        modifiedAt: 'Januari, 31 2026',
    },
    {
        id: 'company-10',
        name: 'PT. Dummy',
        principalName: 'Pak. Dummy',
        service: 'CV',
        serviceType: 'Pendirian',
        author: 'Admin 1',
        modifiedAt: 'Januari, 31 2026',
    },
];

export default function CompanyPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const isAllSelected = useMemo(
        () => companyItems.length > 0 && selectedIds.length === companyItems.length,
        [selectedIds],
    );

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
            return;
        }

        setSelectedIds(companyItems.map((item) => item.id));
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((selectedId) => selectedId !== id);
            }

            return [...prev, id];
        });
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 lg:bg-white">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="w-full min-h-screen flex flex-col">
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-100/50">
                        <DashboardHeader />
                    </div>

                    <div className="flex-1 px-4 sm:px-8 pb-8">
                        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">Perusahaan</h1>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-base font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
                            >
                                <Plus className="h-5 w-5" />
                                Tambah Baru
                            </button>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-base text-gray-800 hover:bg-gray-50"
                                >
                                    <Clock3 className="h-5 w-5" />
                                    Baru di tambahkan
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-base text-gray-800 hover:bg-gray-50"
                                >
                                    <Star className="h-5 w-5" />
                                    Favorite
                                </button>
                            </div>

                            <div className="flex items-center rounded-lg bg-gray-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid')}
                                    className={`rounded-md p-1.5 transition-colors ${
                                        viewMode === 'grid'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                    aria-label="Grid view"
                                >
                                    <LayoutGrid className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className={`rounded-md p-1.5 transition-colors ${
                                        viewMode === 'list'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                    aria-label="List view"
                                >
                                    <List className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white">
                            <div className="overflow-x-auto">
                                <table className="min-w-[1080px] w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50/60">
                                            <th className="w-12 px-3 py-3.5 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllSelected}
                                                    onChange={toggleSelectAll}
                                                    className="h-5 w-5 rounded border-gray-300 text-[#8A7A62] focus:ring-[#8A7A62]"
                                                />
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">
                                                <button type="button" className="inline-flex items-center gap-2">
                                                    Nama
                                                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                                                </button>
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">
                                                <button type="button" className="inline-flex items-center gap-2">
                                                    Nama penghadap
                                                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                                                </button>
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">
                                                <button type="button" className="inline-flex items-center gap-2">
                                                    Layanan
                                                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                                                </button>
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">
                                                <button type="button" className="inline-flex items-center gap-2">
                                                    Tipe layanan
                                                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                                                </button>
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">
                                                <button type="button" className="inline-flex items-center gap-2">
                                                    Author
                                                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                                                </button>
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">Dimodifikasi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companyItems.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-gray-200 text-base text-gray-800 transition-colors last:border-b-0 hover:bg-gray-50"
                                            >
                                                <td className="px-3 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(item.id)}
                                                        onChange={() => toggleSelectOne(item.id)}
                                                        className="h-5 w-5 rounded border-gray-300 text-[#8A7A62] focus:ring-[#8A7A62]"
                                                    />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="inline-flex items-center gap-2.5">
                                                        <Folder className="h-6 w-6 text-gray-700" />
                                                        <span>{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">{item.principalName}</td>
                                                <td className="px-3 py-3">{item.service}</td>
                                                <td className="px-3 py-3">{item.serviceType}</td>
                                                <td className="px-3 py-3">{item.author}</td>
                                                <td className="px-3 py-3 text-nowrap">{item.modifiedAt}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
