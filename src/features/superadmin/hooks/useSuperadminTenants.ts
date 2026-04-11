import { useState, useEffect, useCallback } from 'react';
import { superadminApi } from '../services/superadmin-api';
import type { TenantRecord, TenantStats } from '../types';

const getErrorMessage = (error: unknown, fallbackMessage: string) =>
    error instanceof Error ? error.message : fallbackMessage;

export function useSuperadminTenants(initialSearch = '', initialStatus = 'all') {
    const [tenants, setTenants] = useState<TenantRecord[]>([]);
    const [stats, setStats] = useState<TenantStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState(initialStatus);

    const fetchTenants = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [tenantsRes, statsRes] = await Promise.all([
                superadminApi.getTenants({ search, status: statusFilter }),
                superadminApi.getTenantStats()
            ]);

            setTenants(tenantsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            setError(getErrorMessage(error, 'Failed to fetch tenants data'));
        } finally {
            setIsLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    return { 
        tenants, 
        stats, 
        isLoading, 
        error, 
        search, 
        setSearch, 
        statusFilter, 
        setStatusFilter,
        refetch: fetchTenants 
    };
}
