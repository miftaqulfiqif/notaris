import { render, screen, waitFor } from '@testing-library/react';
import InstansiPage from './page';
import { apiGet } from '@/shared/api/api-client';

jest.mock('@/layout/DashboardHeader', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

jest.mock('@/shared/api/api-client', () => ({
  apiGet: jest.fn(),
}));

describe('InstansiPage', () => {
  it('renders instansi page content', async () => {
    (apiGet as jest.Mock)
      .mockResolvedValueOnce({
        message: 'Get info notaris success',
        data: {
          avatar: null,
          notaris_name: 'Johny Marteen SH. M.Kn',
          email: 'example@mail.com',
          alamat: 'Jl. Contoh',
          paket: 'basic',
        },
      })
      .mockResolvedValueOnce({
        message: 'Get users by notaris success',
        data: [
          {
            id: '1',
            role: 'Kepala Staff',
            name: 'Johny Marteen',
            profile_picture: null,
            created_at: 'Januari, 31 2026',
          },
        ],
      })
      .mockResolvedValueOnce({
        message: 'Get detail user success',
        data: {
          informasi_user: {
            profile_picture: null,
            name: 'Johny Marteen',
            gender: null,
            phone: null,
            jabatan: null,
          },
          detail_akun: {
            username: 'johny',
            email: 'example@mail.com',
            password: '***',
            role: 'KEPALA NOTARIS',
            created_at: '2026-02-18T13:43:35.126Z',
            last_login: null,
            last_updated_password: null,
          },
          informasi_instansi: {
            notaris_name: 'Johny Marteen SH. M.Kn',
            email: 'example@mail.com',
            phone: null,
            paket: null,
          },
        },
      });

    render(<InstansiPage />);

    await waitFor(() => {
      expect(screen.getByText('Johny Marteen')).toBeInTheDocument();
    });

    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /teams/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Umum' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Member Team' })).toBeInTheDocument();
    expect(screen.getByText('Tambah member baru')).toBeInTheDocument();
  });
});
