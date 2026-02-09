'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { MoreVertical, Star, ArrowUpDown, ArrowUp, ArrowDown, Folder } from 'lucide-react';
import { StarredItem, ItemType } from '@/features/dashboard/hooks/useStarredItems';
import { useSelection } from '@/shared/hooks/useSelection';
import { Pagination } from '@/shared/components/Pagination';
import PDFIcon from '@/assets/icons/PDF.svg';
import FolderIcon from '@/assets/icons/folder.png';
import ServiceIcon from '@/assets/icons/service.png';

type SortField = 'name' | 'author' | 'date' | null;
type SortDirection = 'asc' | 'desc';

interface StarredTableProps {
    items: StarredItem[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    onPageChange: (page: number) => void;
}

export function StarredTable({
    items,
    isLoading,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    onPageChange,
}: StarredTableProps) {
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const sortedItems = useMemo(() => {
        if (!sortField) return items;

        return [...items].sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'name':
                    comparison = a.detail.item_name.localeCompare(b.detail.item_name);
                    break;
                case 'author':
                    comparison = a.detail.author.localeCompare(b.detail.author);
                    break;
                case 'date':
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [items, sortField, sortDirection]);

    const { toggleSelectAll, toggleSelectItem, isSelected, isAllSelected } = useSelection({
        items: sortedItems,
        itemIdKey: 'id',
    });

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
        }
        return sortDirection === 'asc' ? (
            <ArrowUp className="w-3 h-3 text-[#8B7355]" />
        ) : (
            <ArrowDown className="w-3 h-3 text-[#8B7355]" />
        );
    };

    const getIcon = (itemType: ItemType) => {
        if (itemType === 'DOCUMENT') {
            return (
                <Image
                    src={PDFIcon}
                    alt="PDF"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                />
            );
        } else if (itemType === 'FOLDER') {
            return (
                <Image
                    src={FolderIcon}
                    alt="Folder"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                />
            );
        }
        return (
            <Image
                src={ServiceIcon}
                alt="Service"
                width={20}
                height={20}
                className="w-5 h-5"
            />
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="w-full bg-white p-8 text-center">
                <div className="animate-pulse flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="w-full bg-white p-8 text-center text-gray-500">
                Tidak ada item berbintang
            </div>
        );
    }

    return (
        <div className="w-full bg-white">
            <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-white border-b border-gray-100 text-xs uppercase text-gray-700 font-medium">
                    <tr>
                        <th scope="col" className="p-4 w-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-[#8B7355] bg-gray-100 border-gray-300 rounded focus:ring-[#8B7355] focus:ring-2"
                                    checked={isAllSelected}
                                    onChange={toggleSelectAll}
                                />
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-3">
                            <button
                                onClick={() => handleSort('name')}
                                className={`flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors ${sortField === 'name' ? 'text-[#8B7355]' : ''}`}
                            >
                                Nama File
                                {getSortIcon('name')}
                            </button>
                        </th>
                        <th scope="col" className="px-6 py-3">
                            <button
                                onClick={() => handleSort('author')}
                                className={`flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors ${sortField === 'author' ? 'text-[#8B7355]' : ''}`}
                            >
                                Author
                                {getSortIcon('author')}
                            </button>
                        </th>
                        <th scope="col" className="px-6 py-3">
                            <button
                                onClick={() => handleSort('date')}
                                className={`flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors ${sortField === 'date' ? 'text-[#8B7355]' : ''}`}
                            >
                                Ditambahkan
                                {getSortIcon('date')}
                            </button>
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Lokasi
                        </th>
                        <th scope="col" className="px-4 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {sortedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 group">
                            <td className="p-4 w-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-[#8B7355] bg-gray-100 border-gray-300 rounded focus:ring-[#8B7355] focus:ring-2"
                                        checked={isSelected(item.id)}
                                        onChange={() => toggleSelectItem(item.id)}
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center gap-3">
                                {getIcon(item.item_type)}
                                <span>{item.detail.item_name}</span>
                                <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900 ml-1" />
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {item.detail.author}
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {formatDate(item.created_at)}
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Folder className="w-4 h-4" />
                                    <span>{item.detail.location}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                                <button className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={totalItems}
            />
        </div>
    );
}
