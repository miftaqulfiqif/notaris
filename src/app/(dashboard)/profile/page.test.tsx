import { render, screen } from '@testing-library/react';
import ProfilePage from './page';

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

describe('ProfilePage', () => {
    it('renders profile page content', () => {
        render(<ProfilePage />);

        expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Dummy Name' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Informasi User' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Detail Akun' })).toBeInTheDocument();
        expect(screen.getByText('Danger Zone')).toBeInTheDocument();
    });
});
