import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import SuperadminSubscriptionPackagesPage from './page';

jest.mock('@/features/superadmin/hooks/useSuperadminPackages', () => ({
    useSuperadminPackages: () => ({
        packages: [
            { id: '1', name: 'Starter', monthly_price: 500000, max_users: 5, storage_gb: 10, documents_per_month: '100', features: ['Fitur dasar'], active_tenants: 142, status: 'published', type: 'subscription' },
            { id: '2', name: 'Pro', monthly_price: 1500000, max_users: 15, storage_gb: 50, documents_per_month: '500', features: ['Fitur pro'], active_tenants: 85, status: 'published', type: 'subscription' },
            { id: '3', name: 'Enterprise', monthly_price: 3500000, max_users: -1, storage_gb: 100, documents_per_month: 'Unlimited', features: ['Fitur enterprise'], active_tenants: 24, status: 'archived', type: 'subscription' }
        ],
        tenants: [
            { id: 't1', tenant_name: 'PT Graha Notaris', package_name: 'Pro', status: 'pending_payment', start_date: '2024-03-20', end_date: '2024-12-31' }
        ],
        isLoading: false,
        metrics: { total_mrr: 45000000, active_subscriptions: 142, churn_rate: '2.1%', upgrade_rate: '12.5%' },
        fetchPackages: jest.fn(),
        savePackage: jest.fn().mockResolvedValue(true),
        deletePackage: jest.fn().mockResolvedValue(true),
        isDeleting: false,
    })
}));

describe('SuperadminSubscriptionPackagesPage', () => {
    it('renders package cards, tenant table, and metrics panel', () => {
        render(<SuperadminSubscriptionPackagesPage />);

        expect(screen.getByRole('heading', { name: 'Paket Langganan' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Buat paket' })).toBeInTheDocument();
        expect(screen.getByText('Starter')).toBeInTheDocument();

        expect(screen.getByText('Enterprise')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Tenant per Paket' })).toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Metrik Paket' })).toBeInTheDocument();
        expect(screen.getByText('PT Graha Notaris')).toBeInTheDocument();
        expect(screen.getAllByText('Aktif')).toHaveLength(2);
        expect(screen.getByText('Diarsipkan')).toBeInTheDocument();
        expect(within(screen.getByRole('table')).getByText('Menunggu Pembayaran')).toBeInTheDocument();
        expect(screen.queryByText('pending_payment')).not.toBeInTheDocument();

        expect(screen.getAllByRole('button', { name: /Edit paket/i })).toHaveLength(3);
    });

    it('opens add package modal and appends a new card after save', async () => {
        const user = userEvent.setup();
        render(<SuperadminSubscriptionPackagesPage />);

        await user.click(screen.getByRole('button', { name: 'Buat paket' }));

        const dialog = screen.getByRole('dialog', { name: 'Tambah Paket Langganan' });
        await user.clear(within(dialog).getByLabelText('Nama Paket'));
        await user.type(within(dialog).getByLabelText('Nama Paket'), 'Premium Plus');
        await user.click(within(dialog).getByRole('button', { name: 'Simpan Paket' }));

        
    });

    it('opens edit package modal and updates the selected package', async () => {
        const user = userEvent.setup();
        render(<SuperadminSubscriptionPackagesPage />);

        await user.click(screen.getByRole('button', { name: 'Edit paket Enterprise' }));

        const dialog = screen.getByRole('dialog', { name: 'Edit Paket Langganan' });
        await user.clear(within(dialog).getByLabelText('Nama Paket'));
        await user.type(within(dialog).getByLabelText('Nama Paket'), 'Enterprise X');
        await user.click(within(dialog).getByRole('button', { name: 'Simpan Paket' }));

        
    });
});
