import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FolderGrid } from './FolderGrid';

jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

jest.mock('@/features/auth/context/auth.context', () => ({
    useAuthContext: jest.fn(),
}));

jest.mock('@/layout/providers/SidebarContext', () => ({
    useSidebar: jest.fn(),
}));

const { usePathname } = jest.requireMock('next/navigation') as {
    usePathname: jest.Mock;
};

const { useAuthContext } = jest.requireMock('@/features/auth/context/auth.context') as {
    useAuthContext: jest.Mock;
};

const { useSidebar } = jest.requireMock('@/layout/providers/SidebarContext') as {
    useSidebar: jest.Mock;
};

describe('FolderGrid', () => {
    beforeEach(() => {
        usePathname.mockReturnValue('/dashboard');
        useAuthContext.mockReturnValue({
            user: {
                id: 'user-1',
                role: 'Staff',
            },
        });
        useSidebar.mockReturnValue({
            services: [
                { id: 'service-1', name: 'PT', item_count: 4 },
                { id: 'service-2', name: 'Fidusia', item_count: null },
                { id: 'service-3', name: 'PT', item_count: 99 },
            ],
            isLoadingServices: false,
        });
    });

    it('renders only accessible suggested folders and tracks analytics on click', async () => {
        const user = userEvent.setup();
        const analyticsEvents: Array<Record<string, unknown>> = [];

        const handleAnalytics = (event: Event) => {
            analyticsEvents.push((event as CustomEvent<Record<string, unknown>>).detail);
        };

        window.addEventListener('notarix:analytics', handleAnalytics as EventListener);

        render(<FolderGrid />);

        const link = screen.getByRole('link', {
            name: 'Buka PT - layanan',
        });

        expect(link).toHaveAttribute('href', '/services/pt');
        expect(screen.getByText('PT')).toBeInTheDocument();
        expect(screen.getByText('Fidusia')).toBeInTheDocument();
        expect(screen.queryAllByRole('link', { name: 'Buka PT - layanan' })).toHaveLength(1);
        expect(screen.queryByText('4')).not.toBeInTheDocument();
        expect(screen.queryByText('99')).not.toBeInTheDocument();

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await user.click(link);
        consoleErrorSpy.mockRestore();

        expect(analyticsEvents).toEqual([
            expect.objectContaining({
                event: 'dashboard_suggested_open',
                origin: 'dashboard_suggested',
                layanan: 'PT',
                tipe_layanan: 'PT',
                user_id: 'user-1',
                user_role: 'Staff',
            }),
        ]);

        window.removeEventListener('notarix:analytics', handleAnalytics as EventListener);
    });

    it('marks the matching tile as active when the current path matches the target route', () => {
        usePathname.mockReturnValue('/services/pt/perubahan');

        render(<FolderGrid />);

        expect(
            screen.getByRole('link', {
                name: 'Buka PT - layanan',
            }),
        ).toHaveAttribute('aria-current', 'page');
    });
});
