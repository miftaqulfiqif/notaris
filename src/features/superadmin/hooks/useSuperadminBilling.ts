import { useState, useEffect, useCallback } from 'react';
import { superadminApi } from '../services/superadmin-api';
import type { InvoiceRecord, InvoiceStats, RevenueData, AgingData } from '../types';
import { useToast } from '@/shared/hooks/useToast';

const getErrorMessage = (error: unknown, fallbackMessage: string) =>
    error instanceof Error ? error.message : fallbackMessage;

export function useSuperadminBilling(initialSearch = '', initialStatus = 'all') {
    const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
    const [stats, setStats] = useState<InvoiceStats | null>(null);
    const [revenueTrend, setRevenueTrend] = useState<RevenueData[]>([]);
    const [aging, setAging] = useState<AgingData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMarkingPaid, setIsMarkingPaid] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const [search, setSearch] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState(initialStatus);

    const fetchBillingData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [invoicesRes, statsRes, revenueRes, agingRes] = await Promise.all([
                superadminApi.getInvoices({ search, status: statusFilter }),
                superadminApi.getInvoiceStats(),
                superadminApi.getInvoiceRevenueTrend(),
                superadminApi.getInvoiceAging()
            ]);

            setInvoices(invoicesRes.data);
            setStats(statsRes.data);
            setRevenueTrend(revenueRes.data);
            setAging(agingRes.data);
        } catch (error) {
            setError(getErrorMessage(error, 'Failed to fetch billing data'));
        } finally {
            setIsLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        fetchBillingData();
    }, [fetchBillingData]);

    const markAsPaid = async (id: string) => {
        setIsMarkingPaid(id);
        try {
            await superadminApi.markInvoicePaid(id);
            showToast({ variant: 'success', message: 'Invoice berhasil ditandai sebagai Lunas' });
            await fetchBillingData();
        } catch (error) {
            showToast({ variant: 'error', message: getErrorMessage(error, 'Gagal menandai invoice') });
        } finally {
            setIsMarkingPaid(null);
        }
    };

    return { 
        invoices, 
        stats, 
        revenueTrend,
        aging,
        isLoading, 
        isMarkingPaid,
        error, 
        search, 
        setSearch, 
        statusFilter, 
        setStatusFilter,
        markAsPaid,
        refetch: fetchBillingData 
    };
}
