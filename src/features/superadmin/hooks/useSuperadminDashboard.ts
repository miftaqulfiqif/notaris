import { useState, useEffect, useCallback } from 'react';
import { superadminApi } from '../services/superadmin-api';
import type { SuperadminDashboardStats, TrendDataPoint, RecentTransaction } from '../types';

const getErrorMessage = (error: unknown, fallbackMessage: string) =>
    error instanceof Error ? error.message : fallbackMessage;

export function useSuperadminDashboard() {
    const [stats, setStats] = useState<SuperadminDashboardStats | null>(null);
    const [trend, setTrend] = useState<TrendDataPoint[]>([]);
    const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [statsRes, trendRes, txRes] = await Promise.all([
                superadminApi.getDashboardStats(),
                superadminApi.getDashboardTrend(),
                superadminApi.getRecentTransactions(),
            ]);

            setStats(statsRes.data);
            setTrend(trendRes.data);
            setRecentTransactions(txRes.data);
        } catch (error) {
            setError(getErrorMessage(error, 'Failed to fetch dashboard data'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { stats, trend, recentTransactions, isLoading, error, refetch: fetchData };
}
