import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import SuperadminBillingInvoicesPage from './page';

describe('SuperadminBillingInvoicesPage', () => {
    it('renders billing summary, table, and side panels', () => {
        render(<SuperadminBillingInvoicesPage />);

        expect(screen.getByRole('heading', { name: 'Billing & Invoice' })).toBeInTheDocument();
        expect(screen.getByText('TOTAL INVOICE BULAN INI')).toBeInTheDocument();
        expect(screen.getByText('284')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Kirim invoice manual' })).toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Pendapatan Bulanan' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Aging Receivables' })).toBeInTheDocument();
        expect(screen.getByText('#INV-2602-001')).toBeInTheDocument();
        expect(screen.getByText('KN Surya Hukum')).toBeInTheDocument();
    });

    it('filters invoice rows by search and status', async () => {
        const user = userEvent.setup();
        render(<SuperadminBillingInvoicesPage />);

        await user.type(screen.getByLabelText('Cari invoice atau tenant'), 'Surya');

        expect(screen.getByText('KN Surya Hukum')).toBeInTheDocument();
        expect(screen.queryByText('PT Graha Notaris')).not.toBeInTheDocument();

        await user.clear(screen.getByLabelText('Cari invoice atau tenant'));
        await user.selectOptions(screen.getByLabelText('Filter status invoice'), 'overdue');

        const table = screen.getByRole('table');
        expect(within(table).getByText('KN Surya Hukum')).toBeInTheDocument();
        expect(within(table).getByText('CV Legaltama')).toBeInTheDocument();
        expect(within(table).queryByText('PT Graha Notaris')).not.toBeInTheDocument();
    });
});
