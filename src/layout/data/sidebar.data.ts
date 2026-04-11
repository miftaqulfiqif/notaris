'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/shared/api/api-client';
import { API_FILE_BASE_URL, ENDPOINTS } from '@/shared/api/endpoints';
import type { User } from '@/shared/types/user.types';

interface NotarisDetailResponse {
    message: string;
    data: {
        avatar: string | null;
        notaris_name: string | null;
        email: string | null;
        alamat: string | null;
        paket: string | null;
    };
}

const DEFAULT_CURRENT_USER: User = {
    name: 'User',
    email: '-',
    avatar: null,
};

const resolveAvatarUrl = (avatar?: string | null) => {
    if (!avatar) return null;
    if (/^https?:\/\//i.test(avatar)) return avatar;

    const cleanedPath = avatar.replace(/^\/+/, '');
    if (!API_FILE_BASE_URL) return `/${cleanedPath}`;

    return `${API_FILE_BASE_URL}/${cleanedPath}`;
};

export function useCurrentUser() {
    const [currentUser, setCurrentUser] = useState<User>(DEFAULT_CURRENT_USER);

    useEffect(() => {
        let mounted = true;

        const loadCurrentUser = async () => {
            try {
                const response = await apiGet<NotarisDetailResponse>(ENDPOINTS.NOTARIS.DETAIL);
                if (!mounted) return;

                setCurrentUser({
                    name: response.data.notaris_name?.trim() || DEFAULT_CURRENT_USER.name,
                    email: response.data.email?.trim() || DEFAULT_CURRENT_USER.email,
                    avatar: resolveAvatarUrl(response.data.avatar),
                });
            } catch {
                if (!mounted) return;
                setCurrentUser(DEFAULT_CURRENT_USER);
            }
        };

        void loadCurrentUser();

        return () => {
            mounted = false;
        };
    }, []);

    return currentUser;
}
