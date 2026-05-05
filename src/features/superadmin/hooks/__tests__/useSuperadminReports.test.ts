import { renderHook, waitFor } from '@testing-library/react';
import { useSuperadminReports } from '../useSuperadminReports';
import { superadminApi } from '../../services/superadmin-api';
import type { ReportGenerateRequest, ScheduledReportRequest } from '../../types';

jest.mock('../../services/superadmin-api');
jest.mock('@/shared/hooks/useToast', () => ({
    useToast: () => ({
        showToast: jest.fn(),
    }),
}));

describe('useSuperadminReports', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch reports successfully', async () => {
        const mockReports = [{ id: '1', title: 'Test Report', report_type: 'Test' }];
        const mockScheduled = [{ id: '1', report_type: 'Test Schedule' }];

        (superadminApi.getReports as jest.Mock).mockResolvedValue({ data: mockReports });
        (superadminApi.getScheduledReports as jest.Mock).mockResolvedValue({ data: mockScheduled });

        const { result } = renderHook(() => useSuperadminReports());

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.recentReports).toEqual(mockReports);
        expect(result.current.scheduledReports).toEqual(mockScheduled);
        expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
        (superadminApi.getReports as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
        (superadminApi.getScheduledReports as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

        const { result } = renderHook(() => useSuperadminReports());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe('Fetch failed');
    });

    it('should generate report successfully', async () => {
        (superadminApi.getReports as jest.Mock).mockResolvedValue({ data: [] });
        (superadminApi.getScheduledReports as jest.Mock).mockResolvedValue({ data: [] });
        (superadminApi.generateReport as jest.Mock).mockResolvedValue({ message: 'Success' });

        const { result } = renderHook(() => useSuperadminReports());
        const request: ReportGenerateRequest = {
            format: 'csv',
            period_end: '2024-03-31',
            period_start: '2024-03-01',
            report_type: 'test',
        };

        let response: Awaited<ReturnType<typeof result.current.generateReport>> = { success: false, data: null };
        await waitFor(async () => {
            response = await result.current.generateReport(request);
        });

        expect(response!.success).toBe(true);
        expect(superadminApi.generateReport).toHaveBeenCalledWith(request);
    });

    it('should download report successfully', async () => {
        (superadminApi.getReports as jest.Mock).mockResolvedValue({ data: [] });
        (superadminApi.getScheduledReports as jest.Mock).mockResolvedValue({ data: [] });
        (superadminApi.downloadReport as jest.Mock).mockResolvedValue({ data: [] });

        const { result } = renderHook(() => useSuperadminReports());

        let response: Awaited<ReturnType<typeof result.current.downloadReport>> = { success: false, data: null };
        await waitFor(async () => {
            response = await result.current.downloadReport('1');
        });

        expect(response!.success).toBe(true);
        expect(superadminApi.downloadReport).toHaveBeenCalledWith('1');
    });

    it('should schedule report successfully', async () => {
        (superadminApi.getReports as jest.Mock).mockResolvedValue({ data: [] });
        (superadminApi.getScheduledReports as jest.Mock).mockResolvedValue({ data: [] });
        (superadminApi.createScheduledReport as jest.Mock).mockResolvedValue({ message: 'Success' });

        const { result } = renderHook(() => useSuperadminReports());
        const request: ScheduledReportRequest = {
            recipient_email: 'admin@notarix.com',
            report_type: 'test',
            schedule: 'weekly',
        };

        let success;
        await waitFor(async () => {
            success = await result.current.scheduleReport(request);
        });

        expect(success).toBe(true);
        expect(superadminApi.createScheduledReport).toHaveBeenCalledWith(request);
    });
});
