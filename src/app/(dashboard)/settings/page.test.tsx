import { render, screen, waitFor } from '@testing-library/react';
import SettingsPage from './page';
import { apiGet } from '@/shared/api/api-client';

jest.mock('@/layout/DashboardHeader', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

jest.mock('@/shared/api/api-client', () => ({
  apiGet: jest.fn(),
}));

describe('SettingsPage', () => {
  it('renders setting page content', async () => {
    (apiGet as jest.Mock).mockResolvedValue({
      message: 'Get setting success',
      data: {
        setting: {
          default_view: 'grid',
          umum: 'grid',
          halaman_awal: 'dashboard',
          ukuran_font: 'sedang',
        },
        paket: {
          paket: null,
        },
        member: [
          {
            id: '4402eb34-9689-4d7f-baaa-925d2d4378a3',
            name: 'Rosyam',
            profile_picture: null,
            access: 'access_penuh',
          },
        ],
        notifikasi: {
          notifikasi_dalam_aplikasi: true,
          notifikasi_email: false,
        },
      },
    });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Rosyam')).toBeInTheDocument();
    });

    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Setting' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Umum' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Paket saat ini' })).toBeInTheDocument();
    expect(screen.getByText('Belum ada paket aktif')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Simpan perubahan' })).toBeInTheDocument();
  });
});
