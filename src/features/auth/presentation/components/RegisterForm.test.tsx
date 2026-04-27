import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from './RegisterForm';
import { ENDPOINTS } from '@/shared/api/endpoints';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

jest.mock('@/features/auth/context/auth.context', () => ({
    useAuthContext: jest.fn(),
}));

jest.mock('@/features/billing/hooks/usePackages', () => ({
    usePackages: jest.fn(),
}));

const { useRouter } = jest.requireMock('next/navigation') as {
    useRouter: jest.Mock;
};

const { useSearchParams } = jest.requireMock('next/navigation') as {
    useSearchParams: jest.Mock;
};

const { useAuthContext } = jest.requireMock('@/features/auth/context/auth.context') as {
    useAuthContext: jest.Mock;
};

const { usePackages } = jest.requireMock('@/features/billing/hooks/usePackages') as {
    usePackages: jest.Mock;
};

describe('RegisterForm', () => {
    const push = jest.fn();
    const checkAuth = jest.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue({ push });
        useSearchParams.mockReturnValue({
            get: jest.fn().mockImplementation((key: string) => key === 'package' ? 'pkg-1' : null),
        });
        useAuthContext.mockReturnValue({ checkAuth });
        usePackages.mockReturnValue({
            packages: [
                {
                    id: 'pkg-1',
                    name: 'Paket Notarix',
                    current_monthly_price: 500000,
                },
            ],
        });
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                message: 'Create new notaris success',
                data: { id: 'user-1' },
            }),
        }) as jest.Mock;
    });

    it('submits create-notaris payload with package_id, refreshes auth, and redirects to verify-email', async () => {
        const user = userEvent.setup();

        render(<RegisterForm />);

        await user.type(
            screen.getByPlaceholderText('Cth : PPAT Agus Trisaka, S.H. (Kota Palembang)'),
            'Kantor Notaris Utama',
        );
        await user.type(screen.getByPlaceholderText('Cth : Johny Marteen'), 'Johny Marteen');
        await user.type(screen.getByPlaceholderText('Johny'), 'johny');
        await user.type(screen.getByPlaceholderText('Example@gmail.com'), 'johny@example.com');
        await user.type(screen.getByPlaceholderText('+62'), '+628123456789');
        await user.type(screen.getAllByPlaceholderText('••••••••')[0], 'rahasia123');
        await user.type(screen.getAllByPlaceholderText('••••••••')[1], 'rahasia123');
        await user.click(screen.getByRole('checkbox', { name: /saya setuju/i }));
        await user.click(screen.getByRole('button', { name: 'Buat Akun' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                ENDPOINTS.AUTH.CREATE_NOTARIS,
                expect.objectContaining({
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        notaris_name: 'Kantor Notaris Utama',
                        user_name: 'Johny Marteen',
                        username: 'johny',
                        email: 'johny@example.com',
                        phone: '+628123456789',
                        password: 'rahasia123',
                        confirm_password: 'rahasia123',
                        package_id: 'pkg-1',
                    }),
                }),
            );
        });

        await waitFor(() => {
            expect(checkAuth).toHaveBeenCalledTimes(1);
            expect(push).toHaveBeenCalledWith('/verify-email');
        });
    });
});
