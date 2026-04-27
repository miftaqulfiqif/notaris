import { render, waitFor } from '@testing-library/react';
import { ProtectedPath } from './ProtectedPath';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/features/auth/context/auth.context', () => ({
    useAuthContext: jest.fn(),
}));

const { useRouter } = jest.requireMock('next/navigation') as {
    useRouter: jest.Mock;
};

const { useAuthContext } = jest.requireMock('@/features/auth/context/auth.context') as {
    useAuthContext: jest.Mock;
};

describe('ProtectedPath', () => {
    it('redirects pending-payment users to checkout', async () => {
        const push = jest.fn();
        useRouter.mockReturnValue({ push });
        useAuthContext.mockReturnValue({
            isAuthenticated: true,
            isVerified: true,
            isLoading: false,
            user: {
                role: 'KEPALA NOTARIS',
                subscription: { status: 'pending_payment' },
            },
        });

        render(
            <ProtectedPath>
                <div>Dashboard</div>
            </ProtectedPath>,
        );

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith('/register/checkout');
        });
    });

    it('redirects unverified pending-payment users to verify-email before checkout', async () => {
        const push = jest.fn();
        useRouter.mockReturnValue({ push });
        useAuthContext.mockReturnValue({
            isAuthenticated: true,
            isVerified: false,
            isLoading: false,
            user: {
                role: 'KEPALA NOTARIS',
                subscription: { status: 'pending_payment' },
            },
        });

        render(
            <ProtectedPath>
                <div>Dashboard</div>
            </ProtectedPath>,
        );

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith('/verify-email');
        });
    });
});
