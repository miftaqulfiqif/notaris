'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { MoreVertical, RotateCcw, Trash2, Search } from 'lucide-react';
import { TrashItem } from '@/features/dashboard/hooks/useTrashItems';
import { useDropdown } from '@/shared/hooks/useDropdown';
import { DropdownMenu, DropdownMenuItem } from '@/shared/components/DropdownMenu';
import pdfIcon from '@/assets/icons/PDF.svg';
import folderIcon from '@/assets/icons/folder.png';
import FolderIcon from '@/assets/icons/folder.png';
import serviceIcon from '@/assets/icons/service.png';

interface TrashTableProps {
    items: TrashItem[];
    onRestore: (item: TrashItem) => Promise<void>;
    onDeleteForever: (item: TrashItem) => Promise<void>;
}

export function TrashTable({ items, onRestore, onDeleteForever }: TrashTableProps) {
    const { activeDropdown, openDropdown, closeDropdown, triggerClass, menuClass } = useDropdown<string>();
    const [isRestoring, setIsRestoring] = useState<string | null>(null);
    const [activeTooltip, setActiveTooltip] = useState<{ id: string; top: number; left: number } | null>(null);

    const getIcon = (type: string) => {
        if (type === 'DOCUMENT') return pdfIcon;
        if (type === 'FOLDER') return folderIcon;
        return serviceIcon;
    };

    const handleRestore = async (item: TrashItem) => {
        try {
            setIsRestoring(item.id);
            await onRestore(item);
        } finally {
            setIsRestoring(null);
        }
    };

    const getMenuItems = (item: TrashItem): DropdownMenuItem[] => [
        {
            label: 'Pulihkan',
            icon: <RotateCcw className="w-4 h-4" />,
            onClick: () => handleRestore(item),
            className: isRestoring === item.id ? 'opacity-50 pointer-events-none' : '',
        },
        {
            label: 'Hapus selamanya',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: () => onDeleteForever(item),
            className: 'text-red-600 hover:bg-red-50',
        },
    ];

    const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (id: string, rect: DOMRect) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setActiveTooltip({
            id,
            top: rect.top,
            left: rect.left
        });
    };

    const handleMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setActiveTooltip(null);
        }, 100);
    };

    return (
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* ... (existing code) ... */}
                    <tbody className="divide-y divide-gray-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col justify-center items-center">
                                        <div className="bg-gray-50 mb-3 p-3 rounded-full">
                                            <Search className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="font-medium text-gray-900">Sampah kosong</p>
                                        <p className="mt-1 text-gray-500 text-sm">Tidak ada item yang dihapus</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="border-gray-300 rounded focus:ring-[#B39B7D] text-[#B39B7D]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={getIcon(item.item_type)}
                                                alt={item.item_type}
                                                width={20}
                                                height={20}
                                                className="w-5 h-5"
                                            />
                                            <span className="font-medium text-gray-900 group-hover:text-[#B39B7D] transition-colors">
                                                {item.detail.item_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        {item.detail.deleted_by}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm text-nowrap">
                                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div
                                            onMouseEnter={(e) => handleMouseEnter(item.id, e.currentTarget.getBoundingClientRect())}
                                            onMouseLeave={handleMouseLeave}
                                            className="inline-flex items-center gap-1 text-gray-600 text-sm hover:text-gray-900 transition-colors cursor-default py-1"
                                        >
                                            <Image
                                                src={FolderIcon}
                                                alt="Folder"
                                                width={20}
                                                height={20}
                                                className="w-5 h-5"
                                            />
                                            <span>{item.detail.location}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            className={`${triggerClass} p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all`}
                                            onClick={(e) => openDropdown(e, item.id)}
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <DropdownMenu
                dropdown={activeDropdown}
                menuClass={menuClass}
                items={activeDropdown ? getMenuItems(items.find((i) => i.id === activeDropdown.id)!) : []}
                onClose={closeDropdown}
            />

            {activeTooltip && typeof document !== 'undefined' && createPortal(
                (() => {
                    const item = items.find((i) => i.id === activeTooltip.id);
                    if (!item || !item.detail.hover) return null;

                    return (
                        <div
                            className="fixed z-50 bg-white shadow-lg border border-gray-100 rounded-lg px-3 py-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-200"
                            style={{
                                top: activeTooltip.top - 8, // Adjust for padding
                                left: activeTooltip.left - 12, // Adjust for padding
                            }}
                            onMouseEnter={() => {
                                if (hoverTimeoutRef.current) {
                                    clearTimeout(hoverTimeoutRef.current);
                                    hoverTimeoutRef.current = null;
                                }
                            }}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Image
                                    src={FolderIcon}
                                    alt="Folder"
                                    width={20}
                                    height={20}
                                    className="w-5 h-5"
                                />
                                <div className="flex items-center flex-wrap gap-1">
                                    {item.detail.hover.map((path, index) => (
                                        <React.Fragment key={index}>
                                            {index > 0 && <span className="text-gray-400">/</span>}
                                            <span className={index === item.detail.hover.length - 1 ? 'font-medium text-gray-900' : ''}>
                                                {path}
                                            </span>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })(),
                document.body
            )}
        </div>
    );
}
