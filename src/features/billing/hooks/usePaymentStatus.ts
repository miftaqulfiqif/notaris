'use client';

import { useCallback, useEffect, useState } from 'react';
import { billingService } from '../services/billing.service';
import type { CheckoutContext } from '../types/billing.types';

const POLLING_INTERVAL_MS = 10000;

export function usePaymentStatus(initialContext?: CheckoutContext | null) {
    const [checkout, setCheckout] = useState<CheckoutContext | null>(initialContext ?? null);
    const [isLoading, setIsLoading] = useState(!initialContext);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshStatus = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
        if (!silent) {
            setIsRefreshing(true);
        }
        setError(null);

        try {
            const nextContext = await billingService.getCheckoutStatus();
            setCheckout(nextContext);
            return nextContext;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memeriksa status pembayaran');
            return null;
        } finally {
            setIsLoading(false);
            if (!silent) {
                setIsRefreshing(false);
            }
        }
    }, []);

    useEffect(() => {
        if (!initialContext) {
            refreshStatus();
        }
    }, [initialContext, refreshStatus]);

    useEffect(() => {
        if (!checkout?.transaction || checkout.transaction.status !== 'pending') {
            return undefined;
        }

        const interval = window.setInterval(() => {
            refreshStatus({ silent: true });
        }, POLLING_INTERVAL_MS);

        return () => window.clearInterval(interval);
    }, [checkout?.transaction, refreshStatus]);

    return {
        checkout,
        error,
        isLoading,
        isRefreshing,
        refreshStatus,
        setCheckout,
    };
}
