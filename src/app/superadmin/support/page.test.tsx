import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import SuperadminSupportPage from './page';

describe('SuperadminSupportPage', () => {
    it('renders support stats and ticket list', () => {
        render(<SuperadminSupportPage />);

        expect(screen.getByRole('heading', { name: 'Support' })).toBeInTheDocument();
        expect(screen.getByText('TIKET TERBUKA')).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Buat Tiket' })).toBeInTheDocument();
        expect(screen.getByRole('list', { name: 'Daftar tiket support' })).toBeInTheDocument();
        expect(screen.getByText('Tidak bisa login - akun terkunci setelah reset password')).toBeInTheDocument();
        expect(screen.getByText('Dokumen tidak bisa diunduh - error 500')).toBeInTheDocument();
    });

    it('filters tickets by search and ticket status', async () => {
        const user = userEvent.setup();
        render(<SuperadminSupportPage />);

        await user.type(screen.getByLabelText('Cari tiket'), 'dokumen');

        expect(screen.getByText('Dokumen tidak bisa diunduh - error 500')).toBeInTheDocument();
        expect(screen.queryByText('Tidak bisa login - akun terkunci setelah reset password')).not.toBeInTheDocument();

        await user.clear(screen.getByLabelText('Cari tiket'));
        await user.selectOptions(screen.getByLabelText('Filter status tiket'), 'slaBreach');

        expect(screen.getByText('Invoice tidak terkirim ke email klien')).toBeInTheDocument();
        expect(screen.getByText('Tidak bisa login - akun terkunci setelah reset password')).toBeInTheDocument();
        expect(screen.queryByText('Dokumen tidak bisa diunduh - error 500')).not.toBeInTheDocument();
    });

    it('opens ticket detail modal and saves updated status', async () => {
        const user = userEvent.setup();
        render(<SuperadminSupportPage />);

        await user.click(screen.getByRole('button', { name: 'Buka detail tiket #TKT-2402-041' }));

        const dialog = screen.getByRole('dialog', { name: 'Detail Tiket #TKT-2402-041' });
        expect(within(dialog).getByText('PT Graha Notaris · budi@graha.id')).toBeInTheDocument();

        await user.selectOptions(within(dialog).getByLabelText('Status'), 'resolved');
        await user.click(within(dialog).getByRole('button', { name: 'Simpan & balas' }));

        expect(screen.queryByRole('dialog', { name: 'Detail Tiket #TKT-2402-041' })).not.toBeInTheDocument();
        expect(within(screen.getByRole('list', { name: 'Daftar tiket support' })).getByText('Resolved')).toBeInTheDocument();
    });
});
