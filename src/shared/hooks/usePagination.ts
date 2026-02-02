import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
    items: T[];
    itemsPerPage?: number;
}

export function usePagination<T>({ items, itemsPerPage = 10 }: UsePaginationProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    }, [items, currentPage, itemsPerPage]);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const setPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const resetPagination = () => {
        setCurrentPage(1);
    };

    return {
        currentPage,
        totalPages,
        paginatedItems,
        nextPage,
        prevPage,
        setPage,
        resetPagination,
        startIndex: (currentPage - 1) * itemsPerPage,
        endIndex: Math.min(currentPage * itemsPerPage, items.length),
        totalItems: items.length
    };
}
