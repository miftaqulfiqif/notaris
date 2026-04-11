import { useState, useEffect, useCallback } from 'react';
import { superadminApi } from '../services/superadmin-api';
import type { ReportGenerateRequest, ReportRecord, ScheduledReport, ScheduledReportRequest } from '../types';
import { useToast } from '@/shared/hooks/useToast';

const getErrorMessage = (error: unknown, fallbackMessage: string) =>
    error instanceof Error ? error.message : fallbackMessage;

export function useSuperadminReports() {
    const [recentReports, setRecentReports] = useState<ReportRecord[]>([]);
    const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [reportsRes, scheduledRes] = await Promise.all([
                superadminApi.getReports(),
                superadminApi.getScheduledReports()
            ]);

            setRecentReports(reportsRes.data);
            setScheduledReports(scheduledRes.data);
        } catch (error) {
            setError(getErrorMessage(error, 'Failed to fetch reports data'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const generateReport = async (data: ReportGenerateRequest) => {
        setIsGenerating(true);
        try {
            const res = await superadminApi.generateReport(data);
            showToast({ variant: 'success', message: res.message || 'Laporan berhasil di-generate' });
            await fetchData();
            return { success: true, data: res.data };
        } catch (error) {
            showToast({ variant: 'error', message: getErrorMessage(error, 'Gagal generate laporan') });
            return { success: false, data: null };
        } finally {
            setIsGenerating(false);
        }
    };

    const scheduleReport = async (data: ScheduledReportRequest) => {
        setIsScheduling(true);
        try {
            const res = await superadminApi.createScheduledReport(data);
            showToast({ variant: 'success', message: res.message || 'Jadwal laporan berhasil dibuat' });
            await fetchData();
            return true;
        } catch (error) {
            showToast({ variant: 'error', message: getErrorMessage(error, 'Gagal membuat jadwal laporan') });
            return false;
        } finally {
            setIsScheduling(false);
        }
    };

    return { 
        recentReports, 
        scheduledReports, 
        isLoading, 
        isGenerating,
        isScheduling,
        error, 
        generateReport,
        scheduleReport,
        refetch: fetchData 
    };
}
