'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { SortableHeader } from '@/shared/components/SortableHeader';
import {
    LayoutGrid,
    List,
    Folder,
    FileText,
    MoreVertical,
    RotateCcw,
    Trash2
} from 'lucide-react';
import { useSelection } from '@/shared/hooks/useSelection';
import { usePagination } from '@/shared/hooks/usePagination';

const trashItems = [
    {
        id: 1,
        name: 'PT. Abibas Sport',
        type: 'folder',
        author: 'Admin 2',
        deletedDate: 'Januari, 13 2026',
        originalLocation: 'Pendirian'
    },
    {
        id: 2,
        name: 'Akta.pdf',
        type: 'file',
        author: 'Admin 2',
        deletedDate: 'Januari, 13 2026',
        originalLocation: 'PT. Abibas Sport'
    }
];

export default function TrashPage() {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const {
        selectedItems,
        toggleSelectAll,
        toggleSelectItem,
        isSelected,
        isAllSelected
    } = useSelection({ items: trashItems, itemIdKey: 'id' });

    const {
        currentPage,
        totalPages,
        paginatedItems,
        setPage,
        startIndex,
        endIndex,
        totalItems
    } = usePagination({ items: trashItems, itemsPerPage: 10 });

    const [activeDropdown, setActiveDropdown] = useState<{ id: number; top: number; right: number } | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Element;
            if (activeDropdown &&
                !target.closest('.action-dropdown-btn') &&
                !target.closest('.action-dropdown-menu')) {
                setActiveDropdown(null);
            }
        }

        function handleScroll() {
            if (activeDropdown) setActiveDropdown(null);
        }

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll, true);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [activeDropdown]);

    const handleDropdownClick = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
        e.stopPropagation();
        e.preventDefault();

        if (activeDropdown?.id === id) {
            setActiveDropdown(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setActiveDropdown({
                id,
                top: rect.bottom + 4,
                right: window.innerWidth - rect.right
            });
        }
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

                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="px-6 py-4 text-left w-12">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-[#B39B7D] focus:ring-[#B39B7D]"
                                                    checked={isAllSelected}
                                                    onChange={toggleSelectAll}
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                                <SortableHeader label="Nama File" />
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                                <SortableHeader label="Author" />
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                                <SortableHeader label="Tanggal dihapus" />
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                                <SortableHeader label="Lokasi awal" />
                                            </th>
                                            <th className="px-6 py-4 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paginatedItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-[#B39B7D] focus:ring-[#B39B7D]"
                                                        checked={isSelected(item.id)}
                                                        onChange={() => toggleSelectItem(item.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {item.type === 'folder' ? (
                                                            <Folder className="w-5 h-5 text-gray-400 fill-gray-100" />
                                                        ) : (
                                                            <FileText className="w-5 h-5 text-red-500" />
                                                        )}
                                                        <span className="font-medium text-gray-900">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">
                                                    {item.author}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">
                                                    {item.deletedDate}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                        <Folder className="w-4 h-4 text-gray-400" />
                                                        {item.originalLocation}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={(e) => handleDropdownClick(e, item.id)}
                                                        className={`p-1 rounded-lg transition-colors action-dropdown-btn ${activeDropdown?.id === item.id ? 'bg-gray-100 text-gray-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                                                    >
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
                </div>
            </div>

            {activeDropdown && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-48 action-dropdown-menu animate-in fade-in zoom-in-95 duration-100"
                    style={{
                        top: activeDropdown.top,
                        right: activeDropdown.right
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        onClick={() => setActiveDropdown(null)}
                    >
                        <RotateCcw className="w-4 h-4" />
                        Pulihkan
                    </button>
                    <button
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        onClick={() => setActiveDropdown(null)}
                    >
                        <Trash2 className="w-4 h-4" />
                        Hapus selamanya
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
}
