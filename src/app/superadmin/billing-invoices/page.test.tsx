import { render, screen, within } from '@testing-library/react';
import SuperadminBillingInvoicesPage from './page';

jest.mock('@/features/superadmin/hooks/useSuperadminBilling', () => ({
    useSuperadminBilling: () => ({
        invoices: [
            { id: 'INV-001', invoice_number: '#INV-2602-001', tenant_name: 'PT Graha Notaris', amount: 2500000, status: 'paid', due_date: '2024-03-25', created_at: '2024-03-01' },
            { id: 'INV-002', invoice_number: '#INV-2602-002', tenant_name: 'KN Surya Hukum', amount: 1500000, status: 'pending_payment', due_date: '2024-03-28', created_at: '2024-03-05' }
        ],
        isLoading: false,
        stats: { total_revenue: 124500000, total_invoices: 25, pending_invoices: 15, overdue_invoices: 0, overdue_value: 0, paid_invoices: 10 },
        fetchInvoices: jest.fn(), search: '', setSearch: jest.fn(), statusFilter: 'all', setStatusFilter: jest.fn(), revenueTrend: []
    })
}));

describe('SuperadminBillingInvoicesPage', () => {
    it('renders billing summary, table, and side panels', () => {
        render(<SuperadminBillingInvoicesPage />);

        expect(screen.getByRole('heading', { name: 'Billing & Invoice' })).toBeInTheDocument();
        expect(screen.getByText('TOTAL INVOICE')).toBeInTheDocument();
        expect(screen.getByText('25')).toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Pendapatan Bulanan' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Aging Receivables' })).toBeInTheDocument();
        expect(screen.getByText('INV-001')).toBeInTheDocument();
        expect(screen.getByText('KN Surya Hukum')).toBeInTheDocument();
        const table = screen.getByRole('table');
        expect(within(table).getByText('Lunas')).toBeInTheDocument();
        expect(within(table).getByText('Menunggu Pembayaran')).toBeInTheDocument();
        expect(screen.queryByText('pending_payment')).not.toBeInTheDocument();
    });

    
});
