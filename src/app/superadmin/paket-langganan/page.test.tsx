import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import SuperadminSubscriptionPackagesPage from './page';

describe('SuperadminSubscriptionPackagesPage', () => {
    it('renders package cards, tenant table, and metrics panel', () => {
        render(<SuperadminSubscriptionPackagesPage />);

        expect(screen.getByRole('heading', { name: 'Paket Langganan' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Buat paket' })).toBeInTheDocument();
        expect(screen.getByText('Basic (Starter)')).toBeInTheDocument();
        expect(screen.getByText('Yearly')).toBeInTheDocument();
        expect(screen.getByText('Enterprise')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Tenant per Paket' })).toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Metrik Paket' })).toBeInTheDocument();
        expect(screen.getByText('PT Graha Notaris')).toBeInTheDocument();
        expect(screen.getByText('ARPU Enterprise')).toBeInTheDocument();
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

        expect(screen.getByText('Premium Plus')).toBeInTheDocument();
    });

    it('opens edit package modal and updates the selected package', async () => {
        const user = userEvent.setup();
        render(<SuperadminSubscriptionPackagesPage />);

        await user.click(screen.getByRole('button', { name: 'Edit paket Enterprise' }));

        const dialog = screen.getByRole('dialog', { name: 'Edit Paket Langganan' });
        await user.clear(within(dialog).getByLabelText('Nama Paket'));
        await user.type(within(dialog).getByLabelText('Nama Paket'), 'Enterprise X');
        await user.click(within(dialog).getByRole('button', { name: 'Simpan Paket' }));

        expect(screen.getByText('Enterprise X')).toBeInTheDocument();
    });
});
