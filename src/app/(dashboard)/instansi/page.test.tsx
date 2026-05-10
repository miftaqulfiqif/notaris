import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InstansiPage from './page';
import { apiGet, apiPost } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';

jest.mock('@/features/auth/context/auth.context', () => ({
  useAuthContext: () => ({ user: { access: "FULL_ACCESS" } }),
}));

jest.mock('@/layout/DashboardHeader', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

jest.mock('@/shared/api/api-client', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}));

describe('InstansiPage', () => {
  const mockedCurrentUserResponse = {
    message: 'Get current user success',
    data: {
      notaris_name: 'Johny Marteen SH. M.Kn',
      name: 'Johny Marteen',
      profile_picture: null,
      email: 'example@mail.com',
      verified_at: null,
      role: 'KEPALA NOTARIS',
    },
  };
  const mockedCurrentUserStaffResponse = {
    message: 'Get current user success',
    data: {
      notaris_name: 'Johny Marteen SH. M.Kn',
      name: 'Johny Marteen',
      profile_picture: null,
      email: 'example@mail.com',
      verified_at: null,
      role: 'STAFF',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
      .mockResolvedValueOnce(mockedCurrentUserResponse);

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

  it('opens avatar crop modal when clicking avatar profile button', async () => {
    const user = userEvent.setup();

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
            role: 'KEPALA NOTARIS',
            name: 'Johny Marteen',
            profile_picture: null,
            created_at: 'Januari, 31 2026',
          },
        ],
      })
      .mockResolvedValueOnce(mockedCurrentUserResponse);

    render(<InstansiPage />);

    await waitFor(() => {
      expect(screen.getByText('Johny Marteen')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Ubah avatar instansi' }));

    expect(screen.getByRole('heading', { name: 'Upload Gambar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
  });

  it('submits create member form to /api/user/create with expected payload', async () => {
    const user = userEvent.setup();

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
            role: 'KEPALA NOTARIS',
            name: 'Johny Marteen',
            profile_picture: null,
            created_at: 'Januari, 31 2026',
          },
        ],
      })
      .mockResolvedValueOnce(mockedCurrentUserResponse)
      .mockResolvedValueOnce({
        message: 'Get users by notaris success',
        data: {
          data: [
            {
              id: '1',
              role: 'KEPALA NOTARIS',
              name: 'Johny Marteen',
              profile_picture: null,
              created_at: 'Januari, 31 2026',
            },
            {
              id: '2',
              role: 'STAFF',
              name: 'Staff Rosyam',
              profile_picture: null,
              created_at: 'Maret, 1 2026',
            },
          ],
        },
      });

    (apiPost as jest.Mock).mockResolvedValue({
      message: 'Create user success',
      data: null,
    });

    render(<InstansiPage />);

    await waitFor(() => {
      expect(screen.getByText('Johny Marteen')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Tambah member baru' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Tambah member baru' })).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('email@example.com'), 'staffrosyam@notarix.com');
    await user.type(screen.getByPlaceholderText('staff_notaris'), 'staffrosyam');
    await user.type(screen.getByPlaceholderText('Nama staff'), 'Staff Rosyam');
    await user.type(screen.getByPlaceholderText('Minimal 8 karakter'), 'password123');
    await user.type(screen.getByPlaceholderText('Ulangi password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Tambah member' }));

    await waitFor(() => {
      expect(apiPost).toHaveBeenCalledWith(ENDPOINTS.USER.CREATE, {
        name: 'Staff Rosyam',
        email: 'staffrosyam@notarix.com',
        username: 'staffrosyam',
        password: 'password123',
        confirm_password: 'password123',
      });
    });
  });

  it('hides action buttons for staff role', async () => {
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
        data: {
          data: [
            {
              id: '1',
              role: 'STAFF',
              name: 'Staff Rosyam',
              profile_picture: null,
              created_at: 'Maret, 1 2026',
            },
          ],
        },
      })
      .mockResolvedValueOnce(mockedCurrentUserStaffResponse);

    render(<InstansiPage />);

    await waitFor(() => {
      expect(screen.getByText('Staff Rosyam')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: 'Ubah avatar instansi' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tambah member baru' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'setting' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keluar' })).toBeInTheDocument();
  });
});
