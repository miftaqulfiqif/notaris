'use client';

import { useCallback, useState } from 'react';
import { apiPost } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';

const FAVORITE_ITEM_TYPE = 'FOLDER' as const;

interface FavoritePayload {
    item_id: string;
    item_type: typeof FAVORITE_ITEM_TYPE;
}

export function useFavoriteFolder() {
    const [isLoading, setIsLoading] = useState(false);

    const addToFavorite = useCallback(async (itemId: string) => {
        setIsLoading(true);
        try {
            const payload: FavoritePayload = {
                item_id: itemId,
                item_type: FAVORITE_ITEM_TYPE,
            };

            await apiPost<unknown>(ENDPOINTS.USER.ITEM_FAVORITE, payload);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const removeFromFavorite = useCallback(async (itemId: string) => {
        setIsLoading(true);
        try {
            await apiPost<unknown>(
                `${ENDPOINTS.USER.REMOVE_ITEM_FAVORITE}/${FAVORITE_ITEM_TYPE}/${itemId}`,
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { addToFavorite, removeFromFavorite, isLoading };
}
