import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuperadminShell } from './SuperadminShell';

jest.mock('@/features/auth/context/auth.context', () => ({
    useOptionalAuthContext: jest.fn(),
}));

jest.mock('@/features/superadmin/services/superadmin-api', () => ({
    superadminApi: {
        getPackages: jest.fn(),
    },
}));

const { useOptionalAuthContext } = jest.requireMock('@/features/auth/context/auth.context') as {
    useOptionalAuthContext: jest.Mock;
};
const { superadminApi } = jest.requireMock('@/features/superadmin/services/superadmin-api') as {
    superadminApi: {
        getPackages: jest.Mock;
    };
};

const mockAuthContext = () => {
    useOptionalAuthContext.mockReturnValue({
        user: {
            email: 'superadmin@example.com',
            name: 'Super Admin',
            role: {
                code: 'SUPADM',
                name: 'SUPERADMIN',
            },
            username: 'superadmin',
        },
        logout: jest.fn(),
    });
};

describe('SuperadminShell', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        superadminApi.getPackages.mockResolvedValue({ data: [] });
    });

    it('renders real superadmin profile data from auth context', async () => {
        mockAuthContext();

        render(
            <SuperadminShell activePage="dashboard" title="Dashboard">
                <div>Dashboard content</div>
            </SuperadminShell>,
        );

        await waitFor(() => {
            expect(superadminApi.getPackages).toHaveBeenCalledTimes(1);
        });

        expect(screen.getByText('Super Admin')).toBeInTheDocument();
        expect(screen.getByText('SUPERADMIN')).toBeInTheDocument();
        expect(screen.getByText('superadmin@example.com')).toBeInTheDocument();
    });

    it('calls logout after the user confirms the action', async () => {
        const logout = jest.fn().mockResolvedValue(undefined);
        const user = userEvent.setup();

        useOptionalAuthContext.mockReturnValue({
            user: {
                email: 'superadmin@example.com',
                name: 'Super Admin',
                role: {
                    code: 'SUPADM',
                    name: 'SUPERADMIN',
                },
                username: 'superadmin',
            },
            logout,
        });

        render(
            <SuperadminShell activePage="dashboard" title="Dashboard">
                <div>Dashboard content</div>
            </SuperadminShell>,
        );

        await waitFor(() => {
            expect(superadminApi.getPackages).toHaveBeenCalledTimes(1);
        });

        await user.click(screen.getByRole('button', { name: 'Keluar' }));

        expect(screen.getByText('Apakah anda yakin ingin keluar dari panel superadmin?')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Ya, Keluar' }));

        await waitFor(() => {
            expect(logout).toHaveBeenCalledTimes(1);
        });
    });

    it('shows real sidebar badge counts and hides zero values', async () => {
        mockAuthContext();
        superadminApi.getPackages.mockResolvedValue({
            data: [
                { id: 'pkg-1', name: 'Basic' },
                { id: 'pkg-2', name: 'Pro' },
            ],
        });
        render(
            <SuperadminShell activePage="dashboard" title="Dashboard">
                <div>Dashboard content</div>
            </SuperadminShell>,
        );

        const packageLink = screen.getByRole('link', { name: /Paket Langganan/i });
        expect(screen.getByRole('link', { name: /Metode Pembayaran/i })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /Support/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Integrasi & API/i })).not.toBeInTheDocument();

        await waitFor(() => {
            expect(within(packageLink).getByText('2')).toBeInTheDocument();
        });
    });

    it('does not render sidebar badges when the real count is zero', async () => {
        mockAuthContext();

        render(
            <SuperadminShell activePage="dashboard" title="Dashboard">
                <div>Dashboard content</div>
            </SuperadminShell>,
        );

        await waitFor(() => {
            expect(superadminApi.getPackages).toHaveBeenCalledTimes(1);
        });

        expect(within(screen.getByRole('link', { name: /Paket Langganan/i })).queryByText('0')).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /Support/i })).not.toBeInTheDocument();
    });
});
