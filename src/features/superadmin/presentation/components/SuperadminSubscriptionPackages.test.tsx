import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuperadminSubscriptionPackages } from './SuperadminSubscriptionPackages';

jest.mock('../../hooks/useSuperadminPackages', () => ({
    useSuperadminPackages: jest.fn(),
}));

jest.mock('@/features/superadmin/presentation/components/SuperadminShell', () => ({
    SuperadminShell: ({
        children,
        headerActions,
        title,
    }: {
        children: React.ReactNode;
        headerActions?: React.ReactNode;
        title: string;
    }) => (
        <div>
            <h1>{title}</h1>
            {headerActions}
            {children}
        </div>
    ),
    SuperadminStatusBadge: ({ value }: { value: string }) => <span>{value}</span>,
}));

const { useSuperadminPackages } = jest.requireMock('../../hooks/useSuperadminPackages') as {
    useSuperadminPackages: jest.Mock;
};

const baseHookValue = {
    deletePackage: jest.fn(),
    error: null,
    isDeleting: false,
    isLoading: false,
    isSaving: false,
    metrics: {
        active_subscriptions: 1,
        churn_rate: '0.0%',
        total_mrr: 500000,
        upgrade_rate: '0.0%',
    },
    packages: [
        {
            active_tenants: 0,
            can_delete: true,
            documents_per_month: '100',
            features: JSON.stringify(['Feature A']),
            id: 'pkg-free',
            max_users: 10,
            monthly_price: 500000,
            name: 'Basic',
            status: 'published',
            storage_gb: 25,
            total_subscriptions: 0,
        },
        {
            active_tenants: 2,
            can_delete: false,
            documents_per_month: '500',
            features: JSON.stringify(['Feature B']),
            id: 'pkg-used',
            max_users: 20,
            monthly_price: 1000000,
            name: 'Enterprise',
            status: 'published',
            storage_gb: 100,
            total_subscriptions: 3,
        },
    ],
    refetch: jest.fn(),
    savePackage: jest.fn(),
    tenants: [],
};

describe('SuperadminSubscriptionPackages', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useSuperadminPackages.mockReturnValue(baseHookValue);
    });

    it('only shows delete action for packages without buyers', () => {
        render(<SuperadminSubscriptionPackages />);

        expect(screen.getByRole('button', { name: 'Hapus paket Basic' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Hapus paket Enterprise' })).not.toBeInTheDocument();
        expect(screen.getByText('Sudah memiliki pembeli, paket tidak bisa dihapus.')).toBeInTheDocument();
    });

    it('deletes a package after confirmation', async () => {
        const deletePackage = jest.fn().mockResolvedValue(true);
        const user = userEvent.setup();

        useSuperadminPackages.mockReturnValue({
            ...baseHookValue,
            deletePackage,
        });

        render(<SuperadminSubscriptionPackages />);

        await user.click(screen.getByRole('button', { name: 'Hapus paket Basic' }));

        expect(screen.getByText(/Apakah anda yakin ingin menghapus paket Basic/i)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Ya, Hapus' }));

        await waitFor(() => {
            expect(deletePackage).toHaveBeenCalledWith('pkg-free');
        });
    });
});
