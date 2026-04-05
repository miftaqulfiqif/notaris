import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import SuperadminTenantsPage from './page';

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

    it('filters table rows by search and status', async () => {
        const user = userEvent.setup();
        render(<SuperadminTenantsPage />);

        await user.type(screen.getByLabelText('Cari tenant atau kontak'), 'Surya');

        expect(screen.getByText('KN Surya Hukum')).toBeInTheDocument();
        expect(screen.queryByText('PT Graha Notaris')).not.toBeInTheDocument();

        await user.clear(screen.getByLabelText('Cari tenant atau kontak'));
        await user.selectOptions(screen.getByLabelText('Filter status tenant'), 'trial');

        const table = screen.getByRole('table');
        expect(within(table).getByText('KN Mitra Akta')).toBeInTheDocument();
        expect(within(table).getByText('Firma Hukum')).toBeInTheDocument();
        expect(within(table).queryByText('KN Surya Hukum')).not.toBeInTheDocument();
    });
});
