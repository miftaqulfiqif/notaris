'use client';

import { useState, useEffect, useCallback } from 'react';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { apiGet } from '@/shared/api/api-client';

export type ItemType = 'DOCUMENT' | 'FOLDER' | 'TIPE_LAYANAN';

export interface StarredItemDetail {
    author: string;
    item_name: string;
    item_path: string | null;
    location: string;
    hover: string[];
}

export interface StarredItem {
    id: string;
    item_id: string;
    item_type: ItemType;
    created_at: string;
    detail: StarredItemDetail;
}

export interface StarredItemsResponse {
    message: string;
    data: {
        current_page: number;
        total_items: number;
        total_pages: number;
        data: StarredItem[];
    };
}

interface UseStarredItemsProps {
    limit?: number;
    initialSearch?: string;
}

export function useStarredItems({ limit = 10, initialSearch = '' }: UseStarredItemsProps = {}) {
    const [items, setItems] = useState<StarredItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState(initialSearch);

    const fetchItems = useCallback(async (page: number, searchQuery: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const url = `${ENDPOINTS.USER.ITEM_FAVORITE}?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`;
            const response = await apiGet<StarredItemsResponse>(url);

            setItems(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.total_pages);
            setTotalItems(response.data.total_items);
        } catch (err) {
            console.error('Failed to fetch starred items', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch starred items');
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchItems(currentPage, search);
    }, [currentPage, search, fetchItems]);

    const setPage = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    const handleSearch = useCallback((query: string) => {
        setSearch(query);
        setCurrentPage(1);
    }, []);

    const refresh = useCallback(() => {
        fetchItems(currentPage, search);
    }, [currentPage, search, fetchItems]);

    const startIndex = (currentPage - 1) * limit;
    const endIndex = Math.min(currentPage * limit, totalItems);

    return {
        items,
        currentPage,
        totalPages,
        totalItems,
        isLoading,
        error,
        search,
        setPage,
        setSearch: handleSearch,
        refresh,
        startIndex,
        endIndex,
    };
}
