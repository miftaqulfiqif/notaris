import { renderHook, waitFor } from '@testing-library/react';
import { useSuperadminTransactions } from '../useSuperadminTransactions';
import { superadminApi } from '../../services/superadmin-api';

jest.mock('../../services/superadmin-api');
jest.mock('@/shared/hooks/useToast', () => ({
    useToast: () => ({
        showToast: jest.fn(),
    }),
}));

describe('useSuperadminTransactions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch transactions successfully', async () => {
        const mockTx = [{ id: 'TX-1', amount: 1000, status: 'success' }];
        const mockStats = { total_value: 1000, success_count: 1 };

        (superadminApi.getTransactions as jest.Mock).mockResolvedValue({ data: mockTx });
        (superadminApi.getTransactionStats as jest.Mock).mockResolvedValue({ data: mockStats });

        const { result } = renderHook(() => useSuperadminTransactions());

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.transactions).toEqual(mockTx);
        expect(result.current.stats).toEqual(mockStats);
        expect(result.current.error).toBeNull();
        expect(result.current.methodFilter).toBe('all');
        expect(result.current.periodFilter).toBe('30days');
    });

    it('should handle fetch errors', async () => {
        (superadminApi.getTransactions as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
        (superadminApi.getTransactionStats as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

        const { result } = renderHook(() => useSuperadminTransactions());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe('Fetch failed');
    });

    it('should refund transaction successfully', async () => {
        (superadminApi.getTransactions as jest.Mock).mockResolvedValue({ data: [] });
        (superadminApi.getTransactionStats as jest.Mock).mockResolvedValue({ data: {} });
        (superadminApi.refundTransaction as jest.Mock).mockResolvedValue({ message: 'Success' });

        const { result } = renderHook(() => useSuperadminTransactions());

        let success;
        await waitFor(async () => {
            success = await result.current.refundTransaction('TX-1');
        });

        expect(success).toBe(true);
        expect(superadminApi.refundTransaction).toHaveBeenCalledWith('TX-1');
    });
});
