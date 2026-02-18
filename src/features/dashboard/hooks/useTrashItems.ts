'use client';

import { useState, useEffect, useCallback } from 'react';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { apiGet, apiPost } from '@/shared/api/api-client';

export type TrashItemType = 'DOCUMENT' | 'FOLDER' | 'TIPE_LAYANAN';

export interface TrashItem {
    id: string;
    item_id: string;
    item_type: TrashItemType;
    created_at: string;
    detail: {
        deleted_by: string;
        item_name: string;
        item_path: string | null;
        location: string;
        hover: string[];
    };
}

interface TrashResponse {
    message: string;
    data: {
        current_page: number;
        total_items: number;
        total_pages: number;
        data: TrashItem[];
    };
}

interface MultipleRestorePayload {
    items: Array<{
        item_id: string;
        item_type: TrashItemType;
    }>;
}

export function useTrashItems() {
    const [items, setItems] = useState<TrashItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [itemsPerPage] = useState(10);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchItems = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                search: searchQuery,
            });

            const response = await apiGet<TrashResponse>(
                `${ENDPOINTS.USER.ITEM_DELETE}?${queryParams.toString()}`
            );

            setItems(response.data.data);
            setTotalPages(response.data.total_pages);
            setTotalItems(response.data.total_items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch trash items');
            console.error('Error fetching trash items:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, itemsPerPage, searchQuery]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems, refreshKey]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const refresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const restoreItem = async (item: TrashItem) => {
        try {
            await apiPost(`${ENDPOINTS.USER.RESTORE_ITEM_DELETED}/${item.item_type}/${item.item_id}`);
            refresh();
            return true;
        } catch (err) {
            console.error('Failed to restore item:', err);
            throw err;
        }
    };

    const restoreItems = async (selectedItems: TrashItem[]) => {
        if (selectedItems.length === 0) return true;

        try {
            const payload: MultipleRestorePayload = {
                items: selectedItems.map((item) => ({
                    item_id: item.item_id,
                    item_type: item.item_type,
                })),
            };

            await apiPost(ENDPOINTS.USER.MULTIPLE_ITEM_RESTORE, payload);
            refresh();
            return true;
        } catch (err) {
            console.error('Failed to restore selected items:', err);
            throw err;
        }
    };

    return {
        items,
        isLoading,
        error,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        handlePageChange,
        handleSearch,
        refresh,
        restoreItem,
        restoreItems,
    };
}
