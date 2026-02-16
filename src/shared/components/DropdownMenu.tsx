'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
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
    const menuRef = useRef<HTMLDivElement | null>(null);

    const repositionMenu = useCallback(() => {
        if (!dropdown) return;

        const menuElement = menuRef.current;
        if (!menuElement) return;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const menuWidth = menuElement.offsetWidth;
        const menuHeight = menuElement.offsetHeight;
        const viewportPadding = 8;

        // right is stored as distance from viewport right. Convert to left for clamping.
        const initialLeft = viewportWidth - dropdown.right - menuWidth;
        const minLeft = viewportPadding;
        const maxLeft = Math.max(viewportPadding, viewportWidth - menuWidth - viewportPadding);
        const clampedLeft = Math.min(Math.max(initialLeft, minLeft), maxLeft);
        const clampedRight = viewportWidth - clampedLeft - menuWidth;

        const minTop = viewportPadding;
        const maxTop = Math.max(viewportPadding, viewportHeight - menuHeight - viewportPadding);
        const clampedTop = Math.min(Math.max(dropdown.top, minTop), maxTop);

        menuElement.style.top = `${clampedTop}px`;
        menuElement.style.right = `${clampedRight}px`;
    }, [dropdown]);

    useLayoutEffect(() => {
        repositionMenu();
    }, [repositionMenu, items, widthClass, dropdown]);

    useEffect(() => {
        function handleResize() {
            repositionMenu();
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [repositionMenu]);

    if (!dropdown || typeof document === 'undefined') return null;

    return createPortal(
        <div
            ref={menuRef}
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
