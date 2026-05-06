import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SuperadminPaymentMethodsPage from './page';

jest.mock('@/features/superadmin/services/superadmin-api', () => ({
    superadminApi: {
        getPackages: jest.fn().mockResolvedValue({ data: [] }),
        getPaymentMethods: jest.fn(),
        updatePaymentMethod: jest.fn(),
    },
}));

jest.mock('@/features/auth/context/auth.context', () => ({
    useOptionalAuthContext: () => ({
        user: { email: 'superadmin@example.com', name: 'Super Admin', role: { code: 'SUPADM', name: 'SUPERADMIN' } },
        logout: jest.fn(),
    }),
}));

const mockPaymentMethods = [
    {
        group: 'qris',
        label: 'QRIS',
        channels: [{ code: 'qris', is_enabled: true, label: 'QRIS' }],
    },
    {
        group: 'bank_transfer',
        label: 'Transfer Bank',
        channels: [{ code: 'bca', is_enabled: false, label: 'BCA Virtual Account' }],
    },
];

const { superadminApi } = jest.requireMock('@/features/superadmin/services/superadmin-api') as {
    superadminApi: {
        getPaymentMethods: jest.Mock;
        updatePaymentMethod: jest.Mock;
    };
};

describe('SuperadminPaymentMethodsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        superadminApi.getPaymentMethods.mockResolvedValue({ data: mockPaymentMethods });
        superadminApi.updatePaymentMethod.mockResolvedValue({
            data: [
                mockPaymentMethods[0],
                {
                    group: 'bank_transfer',
                    label: 'Transfer Bank',
                    channels: [{ code: 'bca', is_enabled: true, label: 'BCA Virtual Account' }],
                },
            ],
        });
    });

    it('renders payment method groups and toggles a channel', async () => {
        const user = userEvent.setup();

        render(<SuperadminPaymentMethodsPage />);

        expect(await screen.findByRole('heading', { name: 'Metode Pembayaran' })).toBeInTheDocument();
        expect(screen.getAllByText('QRIS').length).toBeGreaterThan(0);
        expect(screen.getByText('BCA Virtual Account')).toBeInTheDocument();

        await user.click(screen.getByRole('switch', { name: 'Aktifkan BCA Virtual Account' }));

        await waitFor(() => {
            expect(superadminApi.updatePaymentMethod).toHaveBeenCalledWith('bca', { is_enabled: true });
        });
        expect(await screen.findByRole('switch', { name: 'Nonaktifkan BCA Virtual Account' })).toBeInTheDocument();
    });

    it('shows an error message when payment methods cannot be loaded', async () => {
        superadminApi.getPaymentMethods.mockRejectedValue(new Error('API gagal'));

        render(<SuperadminPaymentMethodsPage />);

        expect(await screen.findByText('API gagal')).toBeInTheDocument();
    });
});
