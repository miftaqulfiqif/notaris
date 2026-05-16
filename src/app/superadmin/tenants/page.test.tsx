import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import SuperadminTenantsPage from './page';

jest.mock('@/features/superadmin/hooks/useSuperadminTenants', () => ({
    useSuperadminTenants: () => ({
        tenants: [
            {
                id: '1',
                name: 'PT Graha Notaris',
                status: 'pending_payment',
                users_count: 10,
                total_transaction: 1000000,
                joined_date: '2024-03-20',
                created_at: '2024-03-18',
                package: 'Pro',
                contact_email: 'admin@grahanotaris.test',
                contact_phone: '08123456789',
                contact_name: 'Admin Graha',
                address: 'Jl. Merdeka No. 10',
                subscription_start_date: '2024-03-20',
                subscription_end_date: '2024-04-20',
            },
            { id: '2', name: 'KN Surya Hukum', status: 'trial', users_count: 5, total_transaction: 500000, joined_date: '2024-03-19', package: 'Starter', contact_email: 'surya@example.test' },
            { id: '3', name: 'KN Mitra Akta', status: 'trial', users_count: 5, total_transaction: 500000, joined_date: '2024-03-19', package: 'Starter' },
            { id: '4', name: 'Firma Hukum', status: 'trial', users_count: 5, total_transaction: 500000, joined_date: '2024-03-19', package: 'Starter' },
            { id: '5', name: 'Test 5', status: 'inactive', users_count: 5, total_transaction: 500000, joined_date: '2024-03-19', package: 'Starter' },
            { id: '6', name: 'Test 6', status: 'inactive', users_count: 5, total_transaction: 500000, joined_date: '2024-03-19', package: 'Starter' },
            { id: '7', name: 'Test 7', status: 'inactive', users_count: 5, total_transaction: 500000, joined_date: '2024-03-19', package: 'Starter' }
        ],
        isLoading: false,
        stats: { total_tenants: 284, active_tenants: 142, new_this_month: 12, suspended_tenants: 4, trial_tenants: 126 },
        fetchTenants: jest.fn(),
        search: '',
        setSearch: jest.fn(),
        statusFilter: 'all',
        setStatusFilter: jest.fn(),
    })
}));

describe('SuperadminTenantsPage', () => {
    it('renders tenant summary and table content', () => {
        render(<SuperadminTenantsPage />);

        expect(screen.getByRole('heading', { name: 'Tenants' })).toBeInTheDocument();
        expect(screen.getByText('TOTAL TENANTS')).toBeInTheDocument();
        expect(screen.getByText('284')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Ekspor' })).toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('PT Graha Notaris')).toBeInTheDocument();
        expect(screen.getByText('KN Surya Hukum')).toBeInTheDocument();
        expect(screen.getByText('Menunggu Pembayaran')).toBeInTheDocument();
        expect(screen.queryByText('pending_payment')).not.toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: 'Detail' })).toHaveLength(7);
    });

    it('opens tenant detail modal with selected tenant data', async () => {
        const user = userEvent.setup();
        render(<SuperadminTenantsPage />);

        await user.click(screen.getAllByRole('button', { name: 'Detail' })[0]);

        const dialog = screen.getByRole('dialog', { name: 'Detail Tenant' });
        expect(within(dialog).getByText('PT Graha Notaris')).toBeInTheDocument();
        expect(within(dialog).getByText('Menunggu Pembayaran')).toBeInTheDocument();
        expect(within(dialog).queryByText('pending_payment')).not.toBeInTheDocument();
        expect(within(dialog).getByText('admin@grahanotaris.test')).toBeInTheDocument();
        expect(within(dialog).getByText('08123456789')).toBeInTheDocument();
        expect(within(dialog).getByText('Admin Graha')).toBeInTheDocument();
        expect(within(dialog).getByText('Jl. Merdeka No. 10')).toBeInTheDocument();
        expect(within(dialog).getByText('10 user aktif')).toBeInTheDocument();
        expect(within(dialog).getByText((content) => content.replace(/\s/g, ' ') === 'Rp 1.000.000')).toBeInTheDocument();
    });

});
