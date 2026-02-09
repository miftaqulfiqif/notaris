'use client';

import React, { useState } from 'react';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { LayoutGrid, List } from 'lucide-react';
import { useTrashItems, TrashItem } from '@/features/dashboard/hooks/useTrashItems';
import { TrashTable } from '@/features/dashboard/presentation/components/TrashTable';
import { Pagination } from '@/shared/components/Pagination';
import { useToast } from '@/shared/hooks/useToast';
import { Toast } from '@/shared/components/Toast';

export default function TrashPage() {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const {
        items,
        isLoading,
        currentPage,
        totalItems,
        totalPages,
        handlePageChange,
        itemsPerPage,
        restoreItem
    } = useTrashItems();

    const { toast, showToast, hideToast } = useToast();

    const handleRestore = async (item: TrashItem) => {
        try {
            await restoreItem(item);
            showToast({ message: 'Berhasil memulihkan item', variant: 'success' });
        } catch {
            showToast({ message: 'Gagal memulihkan item', variant: 'error' });
        }
    };

    const handleDeleteForever = async (item: TrashItem) => {
        // TODO: Implement hard delete endpoint integration
        showToast({ message: 'Fitur hapus selamanya belum tersedia', variant: 'info' });
        console.log('Delete forever:', item);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 lg:bg-white">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="w-full min-h-screen flex flex-col">
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-8 pt-8 pb-4 border-b border-gray-100/50">
                        <DashboardHeader />
                    </div>

                    <div className="px-8 pb-8 flex-1">
                        <div className="flex items-center justify-between mb-6 mt-6">
                            <h1 className="text-2xl font-bold text-gray-900">Sampah</h1>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                        aria-label="Grid View"
                                    >
                                        <LayoutGrid className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                        aria-label="List View"
                                    >
                                        <List className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-center justify-between">
                            <p className="text-red-600 text-sm font-medium">
                                Item dalam sampah akan dihapus selamanya setelah 30 hari
                            </p>
                            <button className="text-red-600 text-sm font-bold hover:text-red-700 transition-colors">
                                Kosongkan sampah
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-gray-100 rounded-xl h-16 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <>
                                <TrashTable
                                    items={items}
                                    onRestore={handleRestore}
                                    onDeleteForever={handleDeleteForever}
                                />
                                <div className="mt-4">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        startIndex={(currentPage - 1) * itemsPerPage + 1}
                                        endIndex={Math.min(currentPage * itemsPerPage, totalItems)}
                                        totalItems={totalItems}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Toast toast={toast} onClose={hideToast} position="bottom-left" />
        </div>
    );
}
