'use client';

import React, { useState } from 'react';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { AlertCircle, LayoutGrid, List, Trash2 } from 'lucide-react';
import { useTrashItems, TrashItem } from '@/features/dashboard/hooks/useTrashItems';
import { TrashTable } from '@/features/dashboard/presentation/components/TrashTable';
import { Pagination } from '@/shared/components/Pagination';
import { useToast } from '@/shared/hooks/useToast';
import { Toast } from '@/shared/components/Toast';

export default function TrashPage() {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [isEmptyTrashConfirmOpen, setIsEmptyTrashConfirmOpen] = useState(false);
    const {
        items,
        isLoading,
        isEmptyingTrash,
        currentPage,
        totalItems,
        totalPages,
        handlePageChange,
        itemsPerPage,
        restoreItem,
        restoreItems,
        deleteItemPermanently,
        deleteItemsPermanently,
        emptyTrashPermanently,
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
        try {
            await deleteItemPermanently(item);
            showToast({ message: 'Berhasil menghapus item selamanya', variant: 'success' });
        } catch (err) {
            showToast({
                message: err instanceof Error ? err.message : 'Gagal menghapus item selamanya',
                variant: 'error',
            });
        }
    };

    const handleRestoreBulk = async (selectedItems: TrashItem[]) => {
        try {
            await restoreItems(selectedItems);
            showToast({ message: `${selectedItems.length} item berhasil dipulihkan`, variant: 'success' });
        } catch {
            showToast({ message: 'Gagal memulihkan item terpilih', variant: 'error' });
        }
    };

    const handleDeleteForeverBulk = async (selectedItems: TrashItem[]) => {
        try {
            await deleteItemsPermanently(selectedItems);
            showToast({
                message: `${selectedItems.length} item berhasil dihapus selamanya`,
                variant: 'success',
            });
        } catch (err) {
            showToast({
                message: err instanceof Error ? err.message : 'Gagal menghapus item terpilih',
                variant: 'error',
            });
        }
    };

    const handleEmptyTrash = async () => {
        if (isEmptyingTrash) return;

        try {
            await emptyTrashPermanently();
            setIsEmptyTrashConfirmOpen(false);
            showToast({ message: 'Sampah berhasil dikosongkan', variant: 'success' });
        } catch (err) {
            showToast({
                message: err instanceof Error ? err.message : 'Gagal mengosongkan sampah',
                variant: 'error',
            });
        }
    };

    const openEmptyTrashConfirm = () => {
        if (isEmptyingTrash) return;
        setIsEmptyTrashConfirmOpen(true);
    };

    const closeEmptyTrashConfirm = () => {
        if (isEmptyingTrash) return;
        setIsEmptyTrashConfirmOpen(false);
    };

    const hasTrashItems = totalItems > 0;

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

                        {hasTrashItems && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-center justify-between">
                                <p className="text-red-600 text-sm font-medium">
                                    Item dalam sampah akan dihapus selamanya setelah 30 hari
                                </p>
                                <button
                                    type="button"
                                    onClick={openEmptyTrashConfirm}
                                    disabled={isEmptyingTrash}
                                    className="text-red-600 text-sm font-bold hover:text-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isEmptyingTrash ? 'Mengosongkan...' : 'Kosongkan sampah'}
                                </button>
                            </div>
                        )}

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
                                    onRestoreMultiple={handleRestoreBulk}
                                    onDeleteForeverMultiple={handleDeleteForeverBulk}
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
            {isEmptyTrashConfirmOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
                    onClick={closeEmptyTrashConfirm}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="empty-trash-modal-title"
                        className="w-full max-w-[460px] overflow-hidden rounded-2xl bg-white shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 bg-[#F3E8E8] px-5 py-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-red-300 bg-red-100 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                            </div>
                            <h2 id="empty-trash-modal-title" className="text-lg font-semibold text-[#101010]">
                                Hapus Permanen Semua Item
                            </h2>
                        </div>

                        <div className="px-6 py-8 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-700">
                                <AlertCircle className="h-10 w-10" />
                            </div>
                            <p className="mx-auto max-w-[350px] text-sm leading-relaxed text-[#1F1F1F]">
                                Semua item di Sampah akan dihapus secara permanen dan tidak dapat dipulihkan.
                                Pastikan Anda telah memulihkan atau mengekspor data penting sebelum melanjutkan.
                            </p>

                            <div className="mt-8 flex items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        void handleEmptyTrash();
                                    }}
                                    disabled={isEmptyingTrash}
                                    className="inline-flex items-center gap-2 rounded-xl border border-red-500 bg-red-50 px-7 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {isEmptyingTrash ? 'Menghapus...' : 'Hapus Permanen'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeEmptyTrashConfirm}
                                    disabled={isEmptyingTrash}
                                    className="rounded-xl border border-[#7A6A53] bg-[#7A6A53] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#685942] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Toast toast={toast} onClose={hideToast} position="bottom-left" />
        </div>
    );
}
