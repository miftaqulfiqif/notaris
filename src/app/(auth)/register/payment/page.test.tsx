import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPaymentPage from './page';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/features/auth/context/auth.context', () => ({
    useAuthContext: jest.fn(),
}));

jest.mock('@/features/billing/hooks/usePaymentStatus', () => ({
    usePaymentStatus: jest.fn(),
}));

jest.mock('@/features/billing/presentation/components/PendingPaymentGuard', () => ({
    PendingPaymentGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const { useRouter } = jest.requireMock('next/navigation') as {
    useRouter: jest.Mock;
};

const { useAuthContext } = jest.requireMock('@/features/auth/context/auth.context') as {
    useAuthContext: jest.Mock;
};

const { usePaymentStatus } = jest.requireMock('@/features/billing/hooks/usePaymentStatus') as {
    usePaymentStatus: jest.Mock;
};

describe('RegisterPaymentPage', () => {
    it('refreshes payment status manually', async () => {
        const push = jest.fn();
        const refreshStatus = jest.fn().mockResolvedValue(undefined);
        useRouter.mockReturnValue({ push });
        useAuthContext.mockReturnValue({
            checkAuth: jest.fn().mockResolvedValue({ verified_at: null }),
            user: { subscription: { package: 'Paket Notarix' } },
        });
        usePaymentStatus.mockReturnValue({
            checkout: {
                transaction: {
                    payment_channel: 'qris',
                    status: 'pending',
                    instruction_payload: { qr_url: 'https://example.com/qr.png' },
                },
            },
            error: null,
            isLoading: false,
            isRefreshing: false,
            refreshStatus,
        });

        render(<RegisterPaymentPage />);

        await userEvent.click(screen.getByRole('button', { name: 'Cek status pembayaran' }));

        expect(refreshStatus).toHaveBeenCalledTimes(1);
        expect(push).not.toHaveBeenCalled();
    });

    it('redirects settled payments to verify-email when account is still unverified', async () => {
        const push = jest.fn();
        const checkAuth = jest.fn().mockResolvedValue({ verified_at: null });
        useRouter.mockReturnValue({ push });
        useAuthContext.mockReturnValue({
            checkAuth,
            user: { subscription: { package: 'Paket Notarix' } },
        });
        usePaymentStatus.mockReturnValue({
            checkout: {
                transaction: {
                    payment_channel: 'qris',
                    status: 'settled',
                    instruction_payload: {},
                },
            },
            error: null,
            isLoading: false,
            isRefreshing: false,
            refreshStatus: jest.fn(),
        });

        render(<RegisterPaymentPage />);

        await waitFor(() => {
            expect(checkAuth).toHaveBeenCalledTimes(1);
            expect(push).toHaveBeenCalledWith('/verify-email');
        });
    });
});
