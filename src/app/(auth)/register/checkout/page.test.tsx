import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutPage from './page';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/features/billing/hooks/useCheckout', () => ({
    useCheckout: jest.fn(),
}));

jest.mock('@/features/billing/presentation/components/PendingPaymentGuard', () => ({
    PendingPaymentGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const { useRouter } = jest.requireMock('next/navigation') as {
    useRouter: jest.Mock;
};

const { useCheckout } = jest.requireMock('@/features/billing/hooks/useCheckout') as {
    useCheckout: jest.Mock;
};

describe('CheckoutPage', () => {
    it('renders quote and submits selected payment method', async () => {
        const push = jest.fn();
        const submitCharge = jest.fn().mockResolvedValue(undefined);
        const setSelectedChannel = jest.fn();
        const setSelectedGroup = jest.fn();
        useRouter.mockReturnValue({ push });
        useCheckout.mockReturnValue({
            checkout: {
                invoice: { amount: 555000, billing_cycle: 'intro_monthly', discount_amount: 250000, id: 'inv-1', period: 'Bulan 1 (Intro)', status: 'pending', subtotal_amount: 750000, tax_amount: 55000 },
                package: { id: 'pkg-1', name: 'Paket Notarix', storage_gb: 15, max_users: 2 },
                payment_methods: [
                    { group: 'qris', label: 'QRIS', channels: [{ code: 'qris', label: 'QRIS' }] },
                    { group: 'bank_transfer', label: 'Transfer Bank', channels: [{ code: 'bca', label: 'BCA Virtual Account' }] },
                ],
                quote: { charge_amount: 500000, discount: 250000, subtotal: 750000, tax: 55000, total: 555000 },
                subscription: null,
                transaction: null,
            },
            error: null,
            isLoading: false,
            isSubmitting: false,
            selectedChannel: 'qris',
            selectedGroup: 'qris',
            setSelectedChannel,
            setSelectedGroup,
            submitCharge,
        });

        render(<CheckoutPage />);

        expect(screen.getByText('Total Pembayaran')).toBeInTheDocument();
        expect(screen.getByText('Rp 555.000')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Lanjutkan ke pembayaran' }));

        await waitFor(() => {
            expect(submitCharge).toHaveBeenCalledTimes(1);
            expect(push).toHaveBeenCalledWith('/register/payment');
        });
    });
});
