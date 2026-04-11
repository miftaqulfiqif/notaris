import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import SuperadminTenantsPage from './page';

jest.mock('@/features/superadmin/hooks/useSuperadminTenants', () => ({
    useSuperadminTenants: () => ({
        tenants: [
            { id: '1', name: 'PT Graha Notaris', status: 'active', users_count: 10, total_transaction: 1000000, joined_date: '2024-03-20', package: 'Pro' },
            { id: '2', name: 'KN Surya Hukum', status: 'trial', users_count: 5, total_transaction: 500000, joined_date: '2024-03-19', package: 'Starter' },
            { id: '3', name: 'KN Mitra Akta', status: 'trial', users_count: 5, total_transaction: 500000, joined_date: '2024-03-19', package: 'Starter' },
            { id: '4', name: 'Firma Hukum', status: 'trial', users_count: 5, total_transaction: 500000, joined_date: '2024-03-19', package: 'Starter' },
            { id: '5', name: 'Test 5', status: 'inactive', users_count: 5, total_transaction: 500000, joined_date: '2024-03-19', package: 'Starter' },
            { id: '6', name: 'Test 6', status: 'inactive', users_count: 5, total_transaction: 500000, joined_date: '2024-03-19', package: 'Starter' },
            { id: '7', name: 'Test 7', status: 'inactive', users_count: 5, total_transaction: 500000, joined_date: '2024-03-19', package: 'Starter' }
        ],
        isLoading: false,
        stats: { total_tenants: 284, active_tenants: 142, new_this_month: 12, suspended_tenants: 4, trial_tenants: 126 },
        fetchTenants: jest.fn(),
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
        expect(screen.getAllByRole('button', { name: 'Detail' })).toHaveLength(7);
    });


});
