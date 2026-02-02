import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    startIndex: number;
    endIndex: number;
    totalItems: number;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    startIndex,
    endIndex,
    totalItems
}: PaginationProps) {
    if (totalItems === 0) return null;

    return (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
            <div className="text-sm text-gray-500">
                Show <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{endIndex}</span> of <span className="font-medium">{totalItems}</span> entries
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                    ? 'bg-[#B39B7D] text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
