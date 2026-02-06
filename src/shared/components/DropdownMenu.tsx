'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import type { DropdownState } from '@/shared/hooks/useDropdown';

export interface DropdownMenuItem {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    hasDivider?: boolean;
}

interface DropdownMenuProps {
    dropdown: DropdownState | null;
    menuClass?: string;
    items: DropdownMenuItem[];
    onClose: () => void;
    widthClass?: string;
}

export function DropdownMenu({
    dropdown,
    menuClass = 'dropdown-menu',
    items,
    onClose,
    widthClass = 'w-65',
}: DropdownMenuProps) {
    if (!dropdown || typeof document === 'undefined') return null;

    return createPortal(
        <div
            className={`fixed z-50 px-2 bg-white rounded shadow-lg border border-gray-400 py-1 ${widthClass} ${menuClass} animate-in fade-in zoom-in-95 duration-100`}
            style={{
                top: dropdown.top,
                right: dropdown.right,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {items.map((item, index) => (
                <div key={index} className={item.hasDivider ? 'border-b border-gray-300/90' : ''}>
                    <button
                        className={`w-full cursor-pointer text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100/90 flex items-center gap-3 transition-colors ${item.className ?? ''}`}
                        onClick={() => {
                            item.onClick?.();
                            onClose();
                        }}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                </div>
            ))}
        </div>,
        document.body,
    );
}
