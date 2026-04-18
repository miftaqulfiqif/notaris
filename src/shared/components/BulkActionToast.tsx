'use client';

import { type MouseEvent as ReactMouseEvent } from 'react';
import { Download, Pencil, Star, Trash2 } from 'lucide-react';

interface BulkActionToastProps {
    onRename: () => void;
    onToggleFavorite: () => void;
    onDownload: () => void;
    onMoveToTrash: () => void;
    onCancel: () => void;
    statusLabel?: string;
    favoriteLabel?: string;
    trashLabel?: string;
    disabled?: boolean;
    showRename?: boolean;
    onStatusClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
    statusDisabled?: boolean;
}

const filledButtonClass =
    'inline-flex items-center justify-center gap-2 rounded-lg bg-[#8A7A62] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#75674F] disabled:cursor-not-allowed disabled:opacity-60';

const outlinedButtonClass =
    'inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-5 py-2.5 text-sm font-medium text-[#6B5C45] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60';

export function BulkActionToast({
    onRename,
    onToggleFavorite,
    onDownload,
    onMoveToTrash,
    onCancel,
    statusLabel = 'Status',
    favoriteLabel = 'Tambahkan ke berbintang',
    trashLabel = 'Tambahkan ke sampah',
    disabled = false,
    showRename = true,
    onStatusClick,
    statusDisabled,
}: BulkActionToastProps) {
    const isStatusDisabled = (statusDisabled ?? disabled) || !onStatusClick;

    return (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
            <div className="w-fit rounded-2xl border border-[#B39B7D]/60 bg-white p-3 shadow-[0_12px_30px_rgba(0,0,0,0.15)]">
                <div className="flex flex-wrap items-center gap-3 text-[#6B5C45]">
                    <button
                        type="button"
                        onClick={onStatusClick}
                        disabled={isStatusDisabled}
                        className={outlinedButtonClass}
                    >
                        {statusLabel}
                    </button>
                    <div className="h-8 w-px bg-gray-200" />
                    {showRename && (
                        <button type="button" onClick={onRename} disabled={disabled} className={filledButtonClass}>
                            <Pencil className="h-4 w-4" />
                            Ganti nama
                        </button>
                    )}
                    <button type="button" onClick={onToggleFavorite} disabled={disabled} className={filledButtonClass}>
                        <Star className="h-4 w-4" />
                        {favoriteLabel}
                    </button>
                    <button type="button" onClick={onDownload} disabled={disabled} className={filledButtonClass}>
                        <Download className="h-4 w-4" />
                        Download
                    </button>
                    <div className="h-8 w-px bg-gray-200" />
                    <button type="button" onClick={onMoveToTrash} disabled={disabled} className={outlinedButtonClass}>
                        <Trash2 className="h-4 w-4" />
                        {trashLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={disabled}
                        className="px-4 py-2.5 text-[#6B5C45] text-sm font-medium transition-colors hover:text-[#554732] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
}
