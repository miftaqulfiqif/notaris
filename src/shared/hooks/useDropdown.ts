'use client';

import { useState, useEffect, useCallback } from 'react';

export interface DropdownPosition {
    top: number;
    right: number;
}

export interface DropdownState<T = string> {
    id: T;
    top: number;
    right: number;
}

interface UseDropdownOptions {
    /** CSS class on the trigger button to exclude from outside-click detection */
    triggerClass?: string;
    /** CSS class on the menu to exclude from outside-click detection */
    menuClass?: string;
}

export function useDropdown<T = string>(options?: UseDropdownOptions) {
    const {
        triggerClass = 'dropdown-trigger',
        menuClass = 'dropdown-menu',
    } = options ?? {};

    const [activeDropdown, setActiveDropdown] = useState<DropdownState<T> | null>(null);

    // Close dropdown on outside click or scroll
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Element;
            if (
                activeDropdown &&
                !target.closest(`.${triggerClass}`) &&
                !target.closest(`.${menuClass}`)
            ) {
                setActiveDropdown(null);
            }
        }

        function handleScroll() {
            if (activeDropdown) setActiveDropdown(null);
        }

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [activeDropdown, triggerClass, menuClass]);

    const openDropdown = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>, id: T) => {
            e.preventDefault();
            e.stopPropagation();

            if (activeDropdown?.id === id) {
                setActiveDropdown(null);
            } else {
                const rect = e.currentTarget.getBoundingClientRect();
                setActiveDropdown({
                    id,
                    top: rect.bottom + 4,
                    right: window.innerWidth - rect.right,
                });
            }
        },
        [activeDropdown],
    );

    const closeDropdown = useCallback(() => {
        setActiveDropdown(null);
    }, []);

    const isOpen = useCallback(
        (id: T) => activeDropdown?.id === id,
        [activeDropdown],
    );

    return {
        activeDropdown,
        openDropdown,
        closeDropdown,
        isOpen,
        triggerClass,
        menuClass,
    };
}
