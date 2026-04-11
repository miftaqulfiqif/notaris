import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import SuperadminSupportPage from './page';

jest.mock('@/features/superadmin/hooks/useSuperadminSupport', () => ({
    useSuperadminSupport: () => ({
        tickets: [
            { id: '#TKT-2402-041', title: 'Tidak bisa login - akun terkunci setelah reset password', status: 'open', priority: 'high', tenant_name: 'PT Graha Notaris', created_at: '2024-03-20' },
            { id: '#TKT-2402-039', title: 'Dokumen tidak bisa diunduh - error 500', status: 'in-progress', priority: 'high', tenant_name: 'PT Graha Notaris', created_at: '2024-03-19' },
            { id: '#TKT-2402-038', title: 'Invoice tidak terkirim ke email klien', status: 'resolved', priority: 'medium', tenant_name: 'KN Surya Hukum', created_at: '2024-03-18' }
        ],
        replies: {},
        isLoading: false,
        stats: { open_tickets: 7, resolved_today: 12, avg_resolution_hours: 2.4, sla_breaches: 1 },
        fetchTickets: jest.fn(),
        fetchReplies: jest.fn(),
        replyTicket: jest.fn(),
        updateTicket: jest.fn().mockResolvedValue(true),
    })
}));

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

    

    it('opens ticket detail modal and saves updated status', async () => {
        const user = userEvent.setup();
        render(<SuperadminSupportPage />);

        await user.click(screen.getByRole('button', { name: 'Buka detail tiket #TKT-2402-041' }));

        const dialog = screen.getByRole('dialog', { name: 'Tidak bisa login - akun terkunci setelah reset password' });
        expect(within(dialog).getAllByText('PT Graha Notaris', { exact: false })[0]).toBeInTheDocument();

        await user.selectOptions(within(dialog).getByLabelText('Status'), 'resolved');
        await user.click(within(dialog).getByRole('button', { name: 'Simpan Detail' }));

        expect(screen.queryByRole('dialog', { name: 'Tidak bisa login - akun terkunci setelah reset password' })).not.toBeInTheDocument();

    });
});
