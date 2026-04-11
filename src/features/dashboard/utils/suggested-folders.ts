'use client';

import type { DashboardRecommendation } from '@/features/dashboard/hooks/useDashboard';
import type { Service } from '@/features/dashboard/types/service.types';

declare global {
    interface Window {
        dataLayer?: Array<Record<string, unknown>>;
        gtag?: (
            command: 'event',
            eventName: string,
            params?: Record<string, unknown>,
        ) => void;
    }
}

export interface DashboardSuggestedFolderAnalyticsPayload {
    event: 'dashboard_suggested_open';
    origin: 'dashboard_suggested';
    layanan: string;
    tipe_layanan: string;
    timestamp: string;
    user_id?: string;
    user_role?: string;
}

export const toSlug = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export const buildServiceHref = (layanan: string) =>
    `/services/${toSlug(layanan)}`;

export const buildServiceTypeHref = (layanan: string, tipeLayanan: string) =>
    `/services/${toSlug(layanan)}/${toSlug(tipeLayanan)}`;

export const resolveRecommendationCount = (recommendation: DashboardRecommendation) => {
    const rawCount = recommendation.item_count
        ?? recommendation.total_items
        ?? recommendation.estimated_count
        ?? recommendation.count;

    if (typeof rawCount !== 'number' || !Number.isFinite(rawCount)) {
        return null;
    }

    return rawCount;
};

export const isRecommendationVisible = (
    recommendation: DashboardRecommendation,
    services: Service[],
) => {
    if (!recommendation.tipe_layanan_id?.trim()) return false;
    if (!recommendation.tipe_layanan?.trim()) return false;
    if (!recommendation.layanan?.trim()) return false;

    if (services.length === 0) {
        return true;
    }

    const accessibleServices = new Set(services.map((service) => toSlug(service.name)));
    return accessibleServices.has(toSlug(recommendation.layanan));
};

export const trackDashboardSuggestedFolderClick = (
    payload: Omit<DashboardSuggestedFolderAnalyticsPayload, 'event' | 'origin'>,
) => {
    if (typeof window === 'undefined') return;

    const eventPayload: DashboardSuggestedFolderAnalyticsPayload = {
        event: 'dashboard_suggested_open',
        origin: 'dashboard_suggested',
        ...payload,
    };

    window.dispatchEvent(
        new CustomEvent<DashboardSuggestedFolderAnalyticsPayload>('notarix:analytics', {
            detail: eventPayload,
        }),
    );

    const analyticsRecord: Record<string, unknown> = { ...eventPayload };

    window.dataLayer?.push(analyticsRecord);
    window.gtag?.('event', 'dashboard_suggested_open', analyticsRecord);
};
