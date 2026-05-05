import { render, screen } from '@testing-library/react';
import SuperadminReportsPage from './page';

jest.mock('@/features/superadmin/hooks/useSuperadminReports', () => ({
    useSuperadminReports: () => ({
        recentReports: [
            { id: '1', report_type: 'Transaksi Bulanan', period_start: '2024-03-01', period_end: '2024-03-31', status: 'ready', format: 'csv', created_at: '2024-04-01' },
            { id: '2', report_type: 'Aktivitas Login', period_start: '2024-03-01', period_end: '2024-03-31', status: 'ready', format: 'pdf', created_at: '2024-04-01' }
        ],
        scheduledReports: [
            { id: '1', report_type: 'Rekap Transaksi', schedule: 'weekly', recipient_email: 'superadmin@notarix.com', status: 'active', next_run: '2024-04-08' }
        ],
        isLoading: false,
        generateReport: jest.fn().mockResolvedValue({ success: true, data: [] }),
        downloadReport: jest.fn().mockResolvedValue({ success: true, data: [] }),
        scheduleReport: jest.fn().mockResolvedValue(true),
        fetchData: jest.fn(),
        page: 1,
        setPage: jest.fn(),
        paginationMeta: { totalItems: 2, totalPages: 1 }
    })
}));

describe('SuperadminReportsPage', () => {
    it('renders report builder, report history table, and scheduled reports', () => {
        render(<SuperadminReportsPage />);

        expect(screen.getByRole('heading', { name: 'Laporan' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Buat Laporan baru' })).toBeInTheDocument();
        expect(screen.getByLabelText('Pilih jenis laporan')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Generate Laporan/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Riwayat Laporan' })).toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('Transaksi Bulanan')).toBeInTheDocument();
    });
});
