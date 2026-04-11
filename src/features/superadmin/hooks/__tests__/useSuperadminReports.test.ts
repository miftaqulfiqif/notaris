import { renderHook, waitFor } from '@testing-library/react';
import { useSuperadminReports } from '../useSuperadminReports';
import { superadminApi } from '../../services/superadmin-api';

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

        let response: any;
        await waitFor(async () => {
            response = await result.current.generateReport({ report_type: 'test' } as any);
        });

        expect(response.success).toBe(true);
        expect(superadminApi.generateReport).toHaveBeenCalledWith({ report_type: 'test' });
    });

    it('should schedule report successfully', async () => {
        (superadminApi.getReports as jest.Mock).mockResolvedValue({ data: [] });
        (superadminApi.getScheduledReports as jest.Mock).mockResolvedValue({ data: [] });
        (superadminApi.createScheduledReport as jest.Mock).mockResolvedValue({ message: 'Success' });

        const { result } = renderHook(() => useSuperadminReports());

        let success;
        await waitFor(async () => {
            success = await result.current.scheduleReport({ schedule: 'test' });
        });

        expect(success).toBe(true);
        expect(superadminApi.createScheduledReport).toHaveBeenCalledWith({ schedule: 'test' });
    });
});
