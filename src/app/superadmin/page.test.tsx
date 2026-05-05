import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import SuperadminPage from './page';

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn()
    })
}));

jest.mock('@/shared/hooks/useToast', () => ({
    useToast: () => ({
        showToast: jest.fn()
    })
}));

jest.mock('@/features/superadmin/hooks/useSuperadminDashboard', () => ({
    useSuperadminDashboard: () => ({
        stats: { active_tenants: 284, monthly_revenue: 218000000, total_transactions: 1250, open_tickets: 2 },
        trend: [],
        recentTransactions: [
            { id: 'TXN-1', tenant_name: 'PT Graha Notaris', amount: 500000, status: 'success', method: 'transfer', created_at: '2024-03-20' }
        ],
        isLoading: false,
        error: null,
        fetchDashboardData: jest.fn()
    })
}));
jest.mock('@/features/superadmin/hooks/useSuperadminTenants', () => ({
    useSuperadminTenants: () => ({
        tenants: [
            { id: '1', name: 'PT Graha Notaris', status: 'active' },
            { id: '2', name: 'KN Surya Hukum', status: 'active' }
        ],
        isLoading: false,
        fetchTenants: jest.fn()
    })
}));
jest.mock('@/features/superadmin/hooks/useSuperadminTransactions', () => ({
    useSuperadminTransactions: () => ({
        transactions: [
            { id: '1', tenant_name: 'PT Graha Notaris', amount: 500000, status: 'success' }
        ],
        isLoading: false,
        fetchTransactions: jest.fn()
    })
}));

describe('SuperadminPage', () => {
    it('renders the main dashboard sections', () => {
        render(<SuperadminPage />);

        expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
        expect(screen.getByText('Master Admin Panel')).toBeInTheDocument();
        expect(screen.getByText('TENANT AKTIF')).toBeInTheDocument();
        expect(screen.getAllByText(/218/)[0]).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Notifikasi' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Transaksi terbaru' })).toBeInTheDocument();
        expect(screen.getAllByText('PT Graha Notaris').length).toBeGreaterThanOrEqual(1);

    });



    it('opens and closes the top bar notification popup', async () => {
        const user = userEvent.setup();

        render(<SuperadminPage />);

        await user.click(screen.getByRole('button', { name: 'Buka notifikasi' }));

        const dialog = screen.getByRole('dialog', { name: 'Popup notifikasi' });
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByText('PT. Graha Notaris')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Tutup notifikasi' }));

        expect(screen.queryByRole('dialog', { name: 'Popup notifikasi' })).not.toBeInTheDocument();
    });

    it('opens and closes the mobile navigation drawer', async () => {
        const user = userEvent.setup();

        render(<SuperadminPage />);

        await user.click(screen.getByRole('button', { name: 'Buka navigasi superadmin' }));

        const dialog = screen.getByRole('dialog', { name: 'Navigasi superadmin' });
        expect(within(dialog).getByText('Master Admin Panel')).toBeInTheDocument();

        await user.click(within(dialog).getByRole('button', { name: 'Tutup navigasi superadmin' }));

        expect(screen.queryByRole('dialog', { name: 'Navigasi superadmin' })).not.toBeInTheDocument();
    });
});
