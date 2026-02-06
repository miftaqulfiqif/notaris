'use client';

import { useCallback, useState } from 'react';
import { apiPost } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';

const FAVORITE_ITEM_TYPE = 'FILE' as const;

interface FavoritePayload {
    item_id: string;
    item_type: typeof FAVORITE_ITEM_TYPE;
}

export function useFavoriteFile() {
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

    return { addToFavorite, isLoading };
}
