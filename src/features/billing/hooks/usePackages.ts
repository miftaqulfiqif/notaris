'use client';

import { useCallback, useEffect, useState } from 'react';
import type { BillingPackage } from '../types/billing.types';
import { billingService } from '../services/billing.service';

export function usePackages() {
    const [packages, setPackages] = useState<BillingPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPackages = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const nextPackages = await billingService.getPackages();
            setPackages(nextPackages);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat paket');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    return { packages, isLoading, error, refetch: fetchPackages };
}
