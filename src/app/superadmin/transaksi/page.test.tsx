import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import SuperadminTransactionsPage from './page';

describe('SuperadminTransactionsPage', () => {
    it('renders transaction summary and table content', () => {
        render(<SuperadminTransactionsPage />);

        expect(screen.getByRole('heading', { name: 'Transaksi' })).toBeInTheDocument();
        expect(screen.getByText('TOTAL TRANSAKSI')).toBeInTheDocument();
        expect(screen.getByText('1.247')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Ekspor' })).toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('#TXN-2402-0891')).toBeInTheDocument();
        expect(screen.getByText('Firma Hukum')).toBeInTheDocument();
    });

    it('filters table rows by search and status', async () => {
        const user = userEvent.setup();
        render(<SuperadminTransactionsPage />);

        await user.type(screen.getByLabelText('Cari tenant atau ID transaksi'), 'Surya');

        expect(screen.getByText('KN Surya Hukum')).toBeInTheDocument();
        expect(screen.queryByText('PT Graha Notaris')).not.toBeInTheDocument();

        await user.clear(screen.getByLabelText('Cari tenant atau ID transaksi'));
        await user.selectOptions(screen.getByLabelText('Filter status transaksi'), 'pending');

        const table = screen.getByRole('table');
        expect(within(table).getByText('KN Mitra Akta')).toBeInTheDocument();
        expect(within(table).queryByText('KN Surya Hukum')).not.toBeInTheDocument();
    });

    it('opens transaction detail modal and can trigger a refund', async () => {
        const user = userEvent.setup();
        render(<SuperadminTransactionsPage />);

        await user.type(screen.getByLabelText('Cari tenant atau ID transaksi'), '#TXN-2402-0891');
        await user.click(screen.getByRole('button', { name: 'Detail transaksi #TXN-2402-0891' }));

        const dialog = screen.getByRole('dialog', { name: 'Detail' });
        expect(within(dialog).getByText('ERR_TIMEOUT')).toBeInTheDocument();
        expect(within(dialog).getByRole('button', { name: 'Trigger Refund' })).toBeInTheDocument();

        await user.click(within(dialog).getByRole('button', { name: 'Trigger Refund' }));
        await user.click(within(dialog).getByRole('button', { name: 'Tutup' }));

        const table = screen.getByRole('table');
        expect(within(table).getByText('Refund')).toBeInTheDocument();
    });
});
