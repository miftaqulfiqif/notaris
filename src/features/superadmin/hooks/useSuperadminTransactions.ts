import { useState, useEffect, useCallback } from 'react';
import { superadminApi } from '../services/superadmin-api';
import type { TransactionRecord, TransactionStats } from '../types';
import { useToast } from '@/shared/hooks/useToast';

const getErrorMessage = (error: unknown, fallbackMessage: string) =>
    error instanceof Error ? error.message : fallbackMessage;

export function useSuperadminTransactions() {
    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
    const [stats, setStats] = useState<TransactionStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefunding, setIsRefunding] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');
    const [periodFilter, setPeriodFilter] = useState('30days');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            let start_date;
            const end_date = new Date().toISOString();
            
            const now = new Date();

            if (periodFilter === 'today') {
                const start = new Date(now.setHours(0,0,0,0));
                start_date = start.toISOString();
            } else if (periodFilter === '7days') {
                const start = new Date();
                start.setDate(start.getDate() - 7);
                start_date = start.toISOString();
            } else if (periodFilter === 'month') {
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                start_date = start.toISOString();
            } else if (periodFilter === '30days') {
                const start = new Date();
                start.setDate(start.getDate() - 30);
                start_date = start.toISOString();
            }

            const [txRes, statsRes] = await Promise.all([
                superadminApi.getTransactions({ 
                    search, 
                    status: statusFilter,
                    method: methodFilter,
                    start_date,
                    end_date
                }),
                superadminApi.getTransactionStats()
            ]);

            setTransactions(txRes.data);
            setStats(statsRes.data);
        } catch (error) {
            setError(getErrorMessage(error, 'Failed to fetch transactions data'));
        } finally {
            setIsLoading(false);
        }
    }, [search, statusFilter, methodFilter, periodFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refundTransaction = async (id: string) => {
        setIsRefunding(id);
        try {
            await superadminApi.refundTransaction(id);
            showToast({ variant: 'success', message: 'Transaksi berhasil di-refund' });
            await fetchData();
            return true;
        } catch (error) {
            showToast({ variant: 'error', message: getErrorMessage(error, 'Gagal refund transaksi') });
            return false;
        } finally {
            setIsRefunding(null);
        }
    };

    return { 
        transactions, 
        stats, 
        isLoading, 
        isRefunding,
        error, 
        search, 
        setSearch, 
        statusFilter, 
        setStatusFilter,
        methodFilter,
        setMethodFilter,
        periodFilter,
        setPeriodFilter,
        refundTransaction,
        refetch: fetchData 
    };
}
