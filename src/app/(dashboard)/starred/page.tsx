'use client';

import { DashboardHeader } from '@/layout/DashboardHeader';
import { StarredTable } from '@/features/dashboard/presentation/components/StarredTable';
import { starredItems } from '@/features/dashboard/data/starred.data';
import { Plus, LayoutGrid, Rows } from 'lucide-react';
import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';

export default function StarredPage() {
    const { openModal } = useUploadModal();

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="max-w-[1600px] mx-auto min-h-screen w-full flex flex-col">
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-8 pt-8 pb-4 border-b border-gray-100/50">
                    <DashboardHeader />
                </div>

                <div className="px-8 pb-8 flex-1 overflow-y-auto">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 mt-4">
                        <div>
                            <div className="mb-2">
                                <span className="text-sm font-semibold text-gray-900">Berbintang</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Berbintang</h1>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Tambah Baru</span>
                        </button>
                    </div>

                    {/* Toolbar */}
                    <div className="flex justify-end mb-4">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button className="p-1.5 bg-white text-gray-900 shadow-sm rounded">
                                <Rows className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <StarredTable items={starredItems} />
                    </div>
                </div>
            </div>
        </div>
    );
}
