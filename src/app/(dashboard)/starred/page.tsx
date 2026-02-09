'use client';

import { DashboardHeader } from '@/layout/DashboardHeader';
import { StarredTable } from '@/features/dashboard/presentation/components/StarredTable';
import { useStarredItems } from '@/features/dashboard/hooks/useStarredItems';
import { LayoutGrid, Rows } from 'lucide-react';

export default function StarredPage() {
    const {
        items,
        isLoading,
        error,
        currentPage,
        totalPages,
        totalItems,
        startIndex,
        endIndex,
        setPage,
    } = useStarredItems({ limit: 10 });

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex flex-col w-full min-h-screen">
                <div className="top-0 z-10 sticky bg-white/80 backdrop-blur-md px-8 pt-8 pb-4 border-gray-100/50 border-b">
                    <DashboardHeader />
                </div>

                <div className="flex-1 px-8 pb-8 overflow-y-auto">
                    <div className="flex sm:flex-row flex-col justify-between sm:items-end gap-4 mt-4 mb-8">
                        <div>
                            <div className="mb-2">
                                <span className="font-semibold text-gray-900 text-sm">Berbintang</span>
                            </div>
                            <h1 className="font-bold text-gray-900 text-3xl">Berbintang</h1>
                        </div>
                    </div>

                    <div className="flex justify-end mb-4">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button className="p-1.5 rounded text-gray-400 hover:text-gray-600">
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button className="bg-white shadow-sm p-1.5 rounded text-gray-900">
                                <Rows className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {error ? (
                        <div className="shadow-sm border border-red-100 rounded-xl overflow-hidden p-4 bg-red-50 text-red-600 text-center">
                            {error}
                        </div>
                    ) : (
                        <div className="shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                            <StarredTable
                                items={items}
                                isLoading={isLoading}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                startIndex={startIndex}
                                endIndex={endIndex}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
