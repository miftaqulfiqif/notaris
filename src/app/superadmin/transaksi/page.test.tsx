import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import SuperadminTransactionsPage from './page';

jest.mock('@/features/superadmin/hooks/useSuperadminTransactions', () => ({
    useSuperadminTransactions: () => ({
        transactions: [
            { id: '#TXN-2402-0891', reference_number: '#TXN-2402-0891', tenant_name: 'Firma Hukum', amount: 2500000, type: 'subscription', status: 'success', date: '2024-03-20', method: 'va', error_code: 'ERR_TIMEOUT' },
            { id: 'TRX-124', reference_number: 'TRX-124', tenant_name: 'KN Surya Hukum', amount: 1500000, type: 'subscription', status: 'success', date: '2024-03-20', method: 'ewallet' },
            { id: 'TRX-125', reference_number: 'TRX-125', tenant_name: 'KN Mitra Akta', amount: 1500000, type: 'subscription', status: 'pending_payment', date: '2024-03-20', method: 'ewallet' }
        ],
        isLoading: false,
        stats: { success_count: 1247, total_value: 124500000, pending_count: 15, refund_count: 2 },
        fetchTransactions: jest.fn(),
        search: '',
        setSearch: jest.fn(),
        statusFilter: 'all',
        setStatusFilter: jest.fn(),
        methodFilter: 'all',
        setMethodFilter: jest.fn(),
        periodFilter: 'all',
        setPeriodFilter: jest.fn()
    })
}));

describe('SuperadminTransactionsPage', () => {
    it('renders transaction summary and table content', () => {
        render(<SuperadminTransactionsPage />);

        expect(screen.getByRole('heading', { name: 'Transaksi' })).toBeInTheDocument();
        expect(screen.getByText('TOTAL TRANSAKSI')).toBeInTheDocument();
        expect(screen.getByText('1247')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Ekspor' })).toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('#TXN-2402-0891')).toBeInTheDocument();
        expect(screen.getByText('Firma Hukum')).toBeInTheDocument();
        const table = screen.getByRole('table');
        expect(within(table).getAllByText('Berhasil')).toHaveLength(2);
        expect(within(table).getByText('Menunggu Pembayaran')).toBeInTheDocument();
        expect(screen.queryByText('pending_payment')).not.toBeInTheDocument();
    });



    it('opens transaction detail modal and can trigger a refund', async () => {
        const user = userEvent.setup();
        render(<SuperadminTransactionsPage />);

        await user.type(screen.getByLabelText('Cari tenant atau ID transaksi'), '#TXN-2402-0891');
        await user.click(screen.getByRole('button', { name: 'Detail transaksi #TXN-2402-0891' }));

        const dialog = screen.getByRole('dialog', { name: 'Detail' });
        expect(within(dialog).getByText('Berhasil')).toBeInTheDocument();
        expect(within(dialog).getByText('ERR_TIMEOUT')).toBeInTheDocument();
        expect(within(dialog).getByRole('button', { name: 'Trigger Refund' })).toBeInTheDocument();

    });
});
