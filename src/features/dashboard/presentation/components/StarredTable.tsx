'use client';

import React, { useState } from 'react';
import { Folder, FileText, File, MoreVertical, Star, ArrowUpDown } from 'lucide-react';
import { StarredItem } from '@/features/dashboard/data/starred.data';

interface StarredTableProps {
    items: StarredItem[];
}

export function StarredTable({ items }: StarredTableProps) {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const toggleSelectAll = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map(item => item.id));
        }
    };

    const toggleSelectItem = (id: string) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(item => item !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const getIcon = (type: 'folder' | 'file', name: string) => {
        if (type === 'folder') {
            return <Folder className="w-5 h-5 text-gray-500 fill-transparent stroke-gray-500" />;
        }
        if (name.endsWith('.pdf')) {
            return <FileText className="w-5 h-5 text-red-500 fill-red-500 stroke-white" />;
        }
        return <File className="w-5 h-5 text-gray-400" />;
    };

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
                                    checked={selectedItems.length === items.length && items.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-3">
                            <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                                Nama File
                                <ArrowUpDown className="w-3 h-3 text-gray-400" />
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-3">
                            <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                                Author
                                <ArrowUpDown className="w-3 h-3 text-gray-400" />
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-3">
                            <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                                Dimodifikasi
                                <ArrowUpDown className="w-3 h-3 text-gray-400" />
                            </div>
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
                    {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 group">
                            <td className="p-4 w-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-[#8B7355] bg-gray-100 border-gray-300 rounded focus:ring-[#8B7355] focus:ring-2"
                                        checked={selectedItems.includes(item.id)}
                                        onChange={() => toggleSelectItem(item.id)}
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center gap-3">
                                {getIcon(item.type, item.name)}
                                <span>{item.name}</span>
                                {item.isStarred && (
                                    <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900 ml-1" />
                                )}
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {item.author}
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {item.modifiedDate}
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Folder className="w-4 h-4" />
                                    <span>{item.location}</span>
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
        </div>
    );
}
