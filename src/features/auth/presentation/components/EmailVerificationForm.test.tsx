import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailVerificationForm } from './EmailVerificationForm';
import { ENDPOINTS } from '@/shared/api/endpoints';

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

describe('EmailVerificationForm', () => {
    const push = jest.fn();
    const checkAuth = jest.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue({ push });
        useAuthContext.mockReturnValue({
            user: {
                email: 'johny@example.com',
            },
            checkAuth,
        });
        global.fetch = jest.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    message: 'OTP berhasil dikirim',
                    data: {
                        ttl_ms: 120000,
                    },
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    message: 'OTP berhasil diverifikasi',
                }),
            }) as jest.Mock;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('requests OTP on mount, verifies the code, and redirects to success', async () => {
        const user = userEvent.setup();

        render(<EmailVerificationForm />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenNthCalledWith(
                1,
                ENDPOINTS.USER.OTP_REQUEST,
                expect.objectContaining({
                    method: 'POST',
                    credentials: 'include',
                }),
            );
        });

        await waitFor(() => {
            expect(screen.getAllByRole('textbox')[0]).toBeEnabled();
        });
        expect(screen.getByText('01:00')).toBeInTheDocument();

        const otpInputs = screen.getAllByRole('textbox');
        for (const [index, input] of otpInputs.entries()) {
            await user.type(input, String(index + 1));
        }

        await user.click(screen.getByRole('button', { name: 'Verifikasi Email' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenNthCalledWith(
                2,
                ENDPOINTS.USER.OTP_VERIFY,
                expect.objectContaining({
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        otp: '123456',
                    }),
                }),
            );
        });

        await waitFor(() => {
            expect(checkAuth).toHaveBeenCalledTimes(1);
            expect(push).toHaveBeenCalledWith('/verification-success');
        });
    });

    it('keeps resend cooldown at one minute and catches up after window focus', async () => {
        let now = 1_000_000;
        jest.spyOn(Date, 'now').mockImplementation(() => now);

        render(<EmailVerificationForm />);

        await waitFor(() => {
            expect(screen.getByText('01:00')).toBeInTheDocument();
        });

        const resendButton = screen.getByRole('button', { name: 'Kirim ulang' });
        expect(resendButton).toBeDisabled();

        now += 61_000;
        act(() => {
            window.dispatchEvent(new Event('focus'));
        });

        await waitFor(() => {
            expect(screen.getByText('00:00')).toBeInTheDocument();
            expect(resendButton).toBeEnabled();
        });
    });
});
