import { useState, useCallback } from 'react';

interface UseSelectionProps<T> {
    items: T[];
    itemIdKey: keyof T;
}

export function useSelection<T>({ items, itemIdKey }: UseSelectionProps<T>) {
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);

    const toggleSelectAll = useCallback(() => {
        if (selectedItems.length === items.length && items.length > 0) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map(item => item[itemIdKey] as unknown as (string | number)));
        }
    }, [items, itemIdKey, selectedItems.length]);

    const toggleSelectItem = useCallback((id: string | number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    }, []);

    const isSelected = useCallback((id: string | number) => {
        return selectedItems.includes(id);
    }, [selectedItems]);

    const isAllSelected = items.length > 0 && selectedItems.length === items.length;

    return {
        selectedItems,
        setSelectedItems,
        toggleSelectAll,
        toggleSelectItem,
        isSelected,
        isAllSelected
    };
}
