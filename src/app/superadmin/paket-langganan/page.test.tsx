import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import SuperadminSubscriptionPackagesPage from './page';

jest.mock('@/features/superadmin/hooks/useSuperadminPackages', () => ({
    useSuperadminPackages: () => ({
        packages: [
            { id: '1', name: 'Starter', price: 500000, user_limit: 5, active_tenants: 142, status: 'active', type: 'subscription' },
            { id: '2', name: 'Pro', price: 1500000, user_limit: 15, active_tenants: 85, status: 'active', type: 'subscription' },
            { id: '3', name: 'Enterprise', price: 3500000, user_limit: -1, active_tenants: 24, status: 'active', type: 'subscription' }
        ],
        tenants: [
            { id: 't1', tenant_name: 'PT Graha Notaris', current_plan: 'Pro', subscription_status: 'active', renewal_date: '2024-12-31' }
        ],
        isLoading: false,
        summary: { totalActive: 142, mrr: 45000000, conversionRate: '12.5%', churnRate: '2.1%' },
        fetchPackages: jest.fn(),
        savePackage: jest.fn().mockResolvedValue(true)
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
