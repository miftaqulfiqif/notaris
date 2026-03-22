import { useState, useCallback, useEffect } from 'react';
import { ENDPOINTS } from '@/shared/api/endpoints';

export interface DashboardRecommendation {
    tipe_layanan_id: string;
    tipe_layanan: string;
    layanan: string;
    is_favorite?: boolean;
    item_count?: number | null;
    total_items?: number | null;
    estimated_count?: number | null;
    count?: number | null;
}

export interface DashboardActivity {
    folder_id: string;
    folder_name: string;
    document_id?: string | null;
    item_id?: string;
    item_type?: 'FOLDER' | 'DOCUMENT' | 'LAYANAN' | 'TIPE_LAYANAN' | string;
    layanan?: string;
    tipe_layanan: string;
    tipe_layanan_id?: string;
    route_path?: string;
    author: string;
    updated_at: string;
    status?: string;
    object_status?: string;
    status_folder?: string;
    folder_status?: string;
    detail_status?: { status?: string | null } | string | null;
    is_favorite?: boolean;
    created_at?: string;
}

export interface PaginatedActivities {
    current_page: number;
    total_items: number;
    total_pages: number;
    data: DashboardActivity[];
}

export const useDashboard = () => {
    const [isLoadingActivities, setIsLoadingActivities] = useState(false);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
    const [activities, setActivities] = useState<PaginatedActivities | null>(null);
    const [recommendations, setRecommendations] = useState<DashboardRecommendation[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchActivities = useCallback(async (page: number = 1, limit: number = 10, search: string = '') => {
        setIsLoadingActivities(true);
        setError(null);
        try {
            const url = new URL(ENDPOINTS.DASHBOARD.ACTIVITIES);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('limit', limit.toString());
            if (search) url.searchParams.append('search', search);

            const res = await fetch(url.toString(), {
                credentials: 'include',
            });
            const data = await res.json();
            if (res.ok && data.data) {
                setActivities(data.data[0] || data.data); // sometimes backend wraps in array
            } else {
                setError(data.message || 'Gagal memuat aktivitas');
            }
        } catch {
            setError('Terjadi kesalahan jaringan');
        } finally {
            setIsLoadingActivities(false);
        }
    }, []);

    const fetchRecommendations = useCallback(async () => {
        setIsLoadingRecommendations(true);
        try {
            const res = await fetch(ENDPOINTS.DASHBOARD.RECOMMENDATIONS, {
                credentials: 'include',
            });
            const data = await res.json();
            if (res.ok && data.data) {
                setRecommendations(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingRecommendations(false);
        }
    }, []);

    useEffect(() => {
        fetchActivities();
        fetchRecommendations();
    }, [fetchActivities, fetchRecommendations]);

    return {
        activities,
        recommendations,
        isLoadingActivities,
        isLoadingRecommendations,
        error,
        fetchActivities,
        fetchRecommendations
    };
};
