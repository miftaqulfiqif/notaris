import { render, screen } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import ProfilePage from './page';
import { apiGet } from '@/shared/api/api-client';

jest.mock('@/layout/DashboardHeader', () => ({
    DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

jest.mock('@/features/auth/context/auth.context', () => ({
    useAuthContext: () => ({
        user: {
            name: 'Dummy Name',
            email: 'dummy@example.com',
            username: 'dummyname',
            notaris_name: 'PPAT Dummy',
            created_at: '2026-03-27T00:00:00.000Z',
            role: {
                role_name: 'Admin',
            },
        },
        logout: jest.fn(),
    }),
}));

jest.mock('@/shared/api/api-client', () => ({
    apiGet: jest.fn(),
}));

describe('ProfilePage', () => {
    it('renders profile page content', async () => {
        (apiGet as jest.Mock).mockResolvedValue({
            message: 'Get detail user success',
            data: {
                informasi_user: {
                    profile_picture: null,
                    name: 'Rosyam',
                    gender: null,
                    phone: null,
                    jabatan: null,
                },
                detail_akun: {
                    username: 'rosyam',
                    email: 'rosyam@notarix.com',
                    password: 'hashed-password',
                    role: 'KEPALA NOTARIS',
                    created_at: '2026-02-18T13:43:35.126Z',
                    last_login: null,
                    last_updated_password: null,
                },
                informasi_instansi: {
                    notaris_name: 'Rosyam',
                    email: null,
                    phone: null,
                    paket: null,
                },
            },
        });

        render(<ProfilePage />);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Rosyam' })).toBeInTheDocument();
        });

        expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Informasi User' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Detail Akun' })).toBeInTheDocument();
        expect(screen.getByText('KEPALA NOTARIS')).toBeInTheDocument();
        expect(screen.getByText('Danger Zone')).toBeInTheDocument();
    });
});
