'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ArrowDown, ArrowUp, ArrowUpDown, MoreVertical, RotateCcw, Trash2, Search } from 'lucide-react';
import { TrashItem } from '@/features/dashboard/hooks/useTrashItems';
import { useDropdown } from '@/shared/hooks/useDropdown';
import { DropdownMenu, DropdownMenuItem } from '@/shared/components/DropdownMenu';
import { useSelection } from '@/shared/hooks/useSelection';
import pdfIcon from '@/assets/icons/PDF.svg';
import folderIcon from '@/assets/icons/folder.png';
import FolderIcon from '@/assets/icons/folder.png';
import serviceIcon from '@/assets/icons/service.png';

interface TrashTableProps {
    items: TrashItem[];
    onRestore: (item: TrashItem) => Promise<void>;
    onDeleteForever: (item: TrashItem) => Promise<void>;
    onRestoreMultiple?: (items: TrashItem[]) => Promise<void>;
    onDeleteForeverMultiple?: (items: TrashItem[]) => Promise<void>;
}

type TrashSortField = 'name' | 'author' | 'deletedAt' | null;
type SortDirection = 'asc' | 'desc';

const compareText = (left: string, right: string) =>
    left.localeCompare(right, 'id', { sensitivity: 'base', numeric: true });

export function TrashTable({
    items,
    onRestore,
    onDeleteForever,
    onRestoreMultiple,
    onDeleteForeverMultiple
}: TrashTableProps) {
    const { activeDropdown, openDropdown, closeDropdown, triggerClass, menuClass } = useDropdown<string>();
    const [isRestoring, setIsRestoring] = useState<string | null>(null);
    const [isBulkRestoring, setIsBulkRestoring] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState<{ id: string; top: number; left: number } | null>(null);
    const [sortField, setSortField] = useState<TrashSortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const sortedItems = useMemo(() => {
        if (!sortField) return items;

        const sorted = [...items].sort((left, right) => {
            if (sortField === 'name') {
                return compareText(left.detail.item_name, right.detail.item_name);
            }

            if (sortField === 'author') {
                return compareText(left.detail.deleted_by, right.detail.deleted_by);
            }

            const leftTime = Date.parse(left.created_at);
            const rightTime = Date.parse(right.created_at);

            if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime)) {
                return leftTime - rightTime;
            }

            return compareText(left.created_at, right.created_at);
        });

        return sortDirection === 'asc' ? sorted : sorted.reverse();
    }, [items, sortDirection, sortField]);

    const { selectedItems, setSelectedItems, toggleSelectAll, toggleSelectItem, isSelected, isAllSelected } = useSelection({
        items: sortedItems,
        itemIdKey: 'id',
    });

    const handleSort = (field: Exclude<TrashSortField, null>) => {
        setSortField((prev) => {
            if (prev !== field) {
                setSortDirection('asc');
                return field;
            }

            if (sortDirection === 'asc') {
                setSortDirection('desc');
                return field;
            }

            setSortDirection('asc');
            return null;
        });
    };

    const renderSortIcon = (field: Exclude<TrashSortField, null>) => {
        if (sortField !== field) {
            return <ArrowUpDown className="h-4 w-4 text-gray-500" />;
        }

        return sortDirection === 'asc'
            ? <ArrowUp className="h-4 w-4 text-[#8B7355]" />
            : <ArrowDown className="h-4 w-4 text-[#8B7355]" />;
    };

    const getIcon = (type: string) => {
        if (type === 'DOCUMENT') return pdfIcon;
        if (type === 'FOLDER') return folderIcon;
        return serviceIcon;
    };

    const handleRestore = async (item: TrashItem) => {
        try {
            setIsRestoring(item.id);
            await onRestore(item);
            setSelectedItems((prev) => prev.filter((selectedItemId) => selectedItemId !== item.id));
        } finally {
            setIsRestoring(null);
        }
    };

    const selectedTrashItems = useMemo(
        () => sortedItems.filter((item) => selectedItems.includes(item.id)),
        [selectedItems, sortedItems],
    );

    const hasSelectedItems = selectedTrashItems.length > 0;
    const isBulkActionLoading = isBulkDeleting || isBulkRestoring;

    useEffect(() => {
        setSelectedItems((prev) => prev.filter((selectedItemId) => sortedItems.some((item) => item.id === selectedItemId)));
    }, [setSelectedItems, sortedItems]);

    const handleBulkRestore = async () => {
        if (!onRestoreMultiple || !hasSelectedItems || isBulkActionLoading) return;

        try {
            setIsBulkRestoring(true);
            await onRestoreMultiple(selectedTrashItems);
            setSelectedItems([]);
        } finally {
            setIsBulkRestoring(false);
        }
    };

    const handleBulkDeleteForever = async () => {
        if (!hasSelectedItems || isBulkActionLoading) return;

        try {
            setIsBulkDeleting(true);
            if (onDeleteForeverMultiple) {
                await onDeleteForeverMultiple(selectedTrashItems);
            } else {
                await Promise.all(selectedTrashItems.map((item) => onDeleteForever(item)));
            }
            setSelectedItems([]);
        } finally {
            setIsBulkDeleting(false);
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

    const activeDropdownItem = activeDropdown
        ? sortedItems.find((item) => item.id === activeDropdown.id) ?? null
        : null;

    return (
        <div className="relative bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-gray-100 border-b">
                            <th className="px-6 py-4 w-12">
                                <input
                                    type="checkbox"
                                    className="border-gray-300 rounded focus:ring-[#B39B7D] text-[#B39B7D]"
                                    checked={isAllSelected}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() => handleSort('name')}
                                    className={`flex items-center gap-2 font-semibold text-left transition-colors ${sortField === 'name' ? 'text-[#8B7355]' : 'text-gray-800 hover:text-gray-700'}`}
                                >
                                    Nama File
                                    {renderSortIcon('name')}
                                </button>
                            </th>
                            <th className="px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() => handleSort('author')}
                                    className={`flex items-center gap-2 font-semibold text-left transition-colors ${sortField === 'author' ? 'text-[#8B7355]' : 'text-gray-800 hover:text-gray-700'}`}
                                >
                                    Author
                                    {renderSortIcon('author')}
                                </button>
                            </th>
                            <th className="px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() => handleSort('deletedAt')}
                                    className={`flex items-center gap-2 font-semibold text-left transition-colors ${sortField === 'deletedAt' ? 'text-[#8B7355]' : 'text-gray-800 hover:text-gray-700'}`}
                                >
                                    Tanggal dihapus
                                    {renderSortIcon('deletedAt')}
                                </button>
                            </th>
                            <th className="px-6 py-4 font-semibold text-gray-800 text-left">Lokasi awal</th>
                            <th className="px-6 py-4 text-right">
                                <span className="sr-only">Aksi</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedItems.length === 0 ? (
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
                            sortedItems.map((item) => (
                                <tr key={item.id} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="border-gray-300 rounded focus:ring-[#B39B7D] text-[#B39B7D]"
                                            checked={isSelected(item.id)}
                                            onChange={() => toggleSelectItem(item.id)}
                                        />
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
                items={activeDropdownItem ? getMenuItems(activeDropdownItem) : []}
                onClose={closeDropdown}
            />

            {hasSelectedItems && (
                <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
                    <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    void handleBulkDeleteForever();
                                }}
                                disabled={isBulkActionLoading}
                                className="flex-1 rounded-xl border border-red-500 px-5 py-3 font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Hapus selamanya
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    void handleBulkRestore();
                                }}
                                disabled={isBulkActionLoading || !onRestoreMultiple}
                                className="flex-1 rounded-xl bg-[#8A7A62] px-5 py-3 font-medium text-white transition-colors hover:bg-[#766750] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Pulihkan
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedItems([])}
                                disabled={isBulkActionLoading}
                                className="min-w-[120px] rounded-xl border border-gray-200 px-5 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
