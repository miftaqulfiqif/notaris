import { useState, useEffect, useCallback } from 'react';
import { superadminApi } from '../services/superadmin-api';
import type { SupportTicket, SupportStats } from '../types';
import { useToast } from '@/shared/hooks/useToast';

const getErrorMessage = (error: unknown, fallbackMessage: string) =>
    error instanceof Error ? error.message : fallbackMessage;

export function useSuperadminSupport(initialSearch = '', initialStatus = 'all', initialPriority = 'all') {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [stats, setStats] = useState<SupportStats | null>(null);
    const [replies, setReplies] = useState<Record<string, import('../types').TicketReply[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const [search, setSearch] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [priorityFilter, setPriorityFilter] = useState(initialPriority);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [ticketsRes, statsRes] = await Promise.all([
                superadminApi.getTickets({ search, status: statusFilter, priority: priorityFilter }),
                superadminApi.getTicketStats()
            ]);

            setTickets(ticketsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            setError(getErrorMessage(error, 'Failed to fetch support tickets'));
        } finally {
            setIsLoading(false);
        }
    }, [search, statusFilter, priorityFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateTicket = async (id: string, data: Partial<SupportTicket>) => {
        setIsSaving(id);
        try {
            await superadminApi.updateTicket(id, data);
            showToast({ variant: 'success', message: 'Ticket berhasil diperbarui' });
            await fetchData();
            return true;
        } catch (error) {
            showToast({ variant: 'error', message: getErrorMessage(error, 'Gagal memperbarui ticket') });
            return false;
        } finally {
            setIsSaving(null);
        }
    };

    const createTicket = async (data: Partial<SupportTicket>) => {
        setIsSaving('new');
        try {
            await superadminApi.createTicket(data);
            showToast({ variant: 'success', message: 'Ticket berhasil dibuat' });
            await fetchData();
            return true;
        } catch (error) {
            showToast({ variant: 'error', message: getErrorMessage(error, 'Gagal membuat ticket') });
            return false;
        } finally {
            setIsSaving(null);
        }
    };

    const fetchReplies = async (ticketId: string) => {
        try {
            const res = await superadminApi.getTicketReplies(ticketId);
            setReplies(prev => ({ ...prev, [ticketId]: res.data }));
            return res.data;
        } catch (error) {
            console.error('Failed to fetch replies', error);
            return [];
        }
    };

    const sendReply = async (ticketId: string, message: string, is_internal = false) => {
        setIsSaving(`reply-${ticketId}`);
        try {
            const res = await superadminApi.replyTicket(ticketId, { message, is_internal });
            showToast({ variant: 'success', message: 'Balasan berhasil dikirim' });
            
            // Optimistically update replies
            setReplies(prev => {
                const existing = prev[ticketId] || [];
                return { ...prev, [ticketId]: [...existing, res.data] };
            });
            
            return true;
        } catch (error) {
            showToast({ variant: 'error', message: getErrorMessage(error, 'Gagal mengirim balasan') });
            return false;
        } finally {
            setIsSaving(null);
        }
    };

    return { 
        tickets, 
        stats, 
        replies,
        isLoading, 
        isSaving,
        error, 
        search, 
        setSearch, 
        statusFilter, 
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        createTicket,
        updateTicket,
        fetchReplies,
        sendReply,
        refetch: fetchData 
    };
}
