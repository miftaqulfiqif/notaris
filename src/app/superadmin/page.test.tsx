import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import SuperadminPage from './page';

describe('SuperadminPage', () => {
    it('renders the main dashboard sections', () => {
        render(<SuperadminPage />);

        expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
        expect(screen.getByText('Master Admin Panel')).toBeInTheDocument();
        expect(screen.getByText('TENANT AKTIF')).toBeInTheDocument();
        expect(screen.getByText('Rp 218 jt')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Notifikasi' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Transaksi terbaru' })).toBeInTheDocument();
        expect(screen.getAllByText('PT Graha Notaris')).toHaveLength(2);
        expect(screen.getByText('KN Surya Hukum')).toBeInTheDocument();
    });

    it('allows dismissing the alert banner', async () => {
        const user = userEvent.setup();

        render(<SuperadminPage />);

        await user.click(screen.getByRole('button', { name: 'Tutup alert' }));

        expect(screen.queryByText(/Error rate payment gateway 5\.2% melampaui threshold/i)).not.toBeInTheDocument();
    });

    it('opens and closes the top bar notification popup', async () => {
        const user = userEvent.setup();

        render(<SuperadminPage />);

        await user.click(screen.getByRole('button', { name: 'Buka notifikasi' }));

        const dialog = screen.getByRole('dialog', { name: 'Popup notifikasi' });
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByText('PT. Graha Notaris')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Tutup notifikasi' }));

        expect(screen.queryByRole('dialog', { name: 'Popup notifikasi' })).not.toBeInTheDocument();
    });

    it('opens and closes the mobile navigation drawer', async () => {
        const user = userEvent.setup();

        render(<SuperadminPage />);

        await user.click(screen.getByRole('button', { name: 'Buka navigasi superadmin' }));

        const dialog = screen.getByRole('dialog', { name: 'Navigasi superadmin' });
        expect(within(dialog).getByText('Master Admin Panel')).toBeInTheDocument();

        await user.click(within(dialog).getByRole('button', { name: 'Tutup navigasi superadmin' }));

        expect(screen.queryByRole('dialog', { name: 'Navigasi superadmin' })).not.toBeInTheDocument();
    });
});
