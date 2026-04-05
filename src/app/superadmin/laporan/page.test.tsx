import { render, screen } from '@testing-library/react';
import SuperadminReportsPage from './page';

describe('SuperadminReportsPage', () => {
    it('renders report builder, report history table, and scheduled reports', () => {
        render(<SuperadminReportsPage />);

        expect(screen.getByRole('heading', { name: 'Laporan' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Ekspor' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Buat Laporan baru' })).toBeInTheDocument();
        expect(screen.getByLabelText('Pilih jenis laporan')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Generate Laporan/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Riwayat Laporan' })).toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('Transaksi Jan 2026')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Laporan Terjadwal' })).toBeInTheDocument();
        expect(screen.getByText('Dikirim ke cto@id')).toBeInTheDocument();
    });
});
