import { render, screen, waitFor } from '@testing-library/react';
import { ServiceActivityTable } from './ServiceActivityTable';
import type { Activity } from '@/features/dashboard/types';
import { apiGet } from '@/shared/api/api-client';

jest.mock('@/shared/api/api-client', () => ({
    apiGet: jest.fn(),
}));

jest.mock('@/shared/components/SortableHeader', () => ({
    SortableHeader: ({ label }: { label: string }) => <span>{label}</span>,
}));

jest.mock('@/shared/components/FilterTabs', () => ({
    FilterTabs: () => <div data-testid="filter-tabs" />,
}));

jest.mock('@/shared/components/StatusBadge', () => ({
    StatusBadge: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>,
}));

jest.mock('@/shared/components/Pagination', () => ({
    Pagination: () => <div data-testid="pagination" />,
}));

jest.mock('@/shared/components/Toast', () => ({
    Toast: () => null,
}));

jest.mock('@/shared/components/DropdownMenu', () => ({
    DropdownMenu: () => null,
}));

jest.mock('@/features/dashboard/presentation/hooks/useActivityTabs', () => ({
    useActivityTabs: () => ({
        activeTab: 'recent',
        setActiveTab: jest.fn(),
    }),
}));

const mockActivities: Activity[] = [
    {
        id: '1',
        companyName: 'PT. Test Corp',
        clientName: 'Bpk. Test',
        service: 'Pendirian',
        author: 'Admin 1',
        modifiedDate: 'April, 15 2025',
        status: 'Selesai',
        isFavorite: false,
    },
    {
        id: '2',
        companyName: 'PT. Demo Inc',
        clientName: 'Ny. Demo',
        service: 'Perubahan',
        author: 'Admin 2',
        modifiedDate: 'April, 16 2025',
        status: 'Proses',
        isFavorite: true,
    },
];

const mockedApiGet = jest.mocked(apiGet);

describe('ServiceActivityTable', () => {
    beforeEach(() => {
        mockedApiGet.mockReset();
    });

    it('renders activities from props', () => {
        render(<ServiceActivityTable activities={mockActivities} />);

        expect(screen.getByText('PT. Test Corp')).toBeInTheDocument();
        expect(screen.getByText('PT. Demo Inc')).toBeInTheDocument();
    });

    it('renders empty state when no activities provided', () => {
        render(<ServiceActivityTable activities={[]} />);

        expect(screen.getByText('Belum ada aktivitas')).toBeInTheDocument();
    });

    it('renders column headers', () => {
        render(<ServiceActivityTable activities={mockActivities} />);

        expect(screen.getByText('Nama Perusahaan')).toBeInTheDocument();
        expect(screen.getByText('Layanan')).toBeInTheDocument();
        expect(screen.getByText('Author')).toBeInTheDocument();
        expect(screen.getByText('Dimodifikasi')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('renders status badges for each activity', () => {
        render(<ServiceActivityTable activities={mockActivities} />);

        const badges = screen.getAllByTestId('status-badge');
        expect(badges).toHaveLength(2);
        expect(badges[0]).toHaveTextContent('Selesai');
        expect(badges[1]).toHaveTextContent('Proses');
    });

    it('renders loading skeleton when isLoading is true', () => {
        const { container } = render(<ServiceActivityTable isLoading />);

        const skeletons = container.querySelectorAll('.animate-pulse');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it('fetches folder activities from the list endpoint by default', async () => {
        mockedApiGet.mockResolvedValueOnce({
            message: 'success',
            data: {
                current_page: 1,
                total_items: 1,
                total_pages: 1,
                data: [
                    {
                        id: 'remote-1',
                        folder_id: 'folder-1',
                        folder_name: 'PT. Remote Corp',
                        tipe_layanan: 'Pendirian',
                        author: 'Admin API',
                        updated_at: '2026-03-31 09:00:00',
                        status: 'selesai',
                        is_favorite: false,
                    },
                ],
            },
        });

        render(<ServiceActivityTable />);

        expect(await screen.findByText('PT. Remote Corp')).toBeInTheDocument();

        await waitFor(() => {
            expect(mockedApiGet).toHaveBeenCalledWith(
                expect.stringContaining('/aktifitas/folder?page=1&limit=10&search='),
            );
        });
    });

    it('renders empty state when remote activities are empty', async () => {
        mockedApiGet.mockResolvedValueOnce({
            message: 'success',
            data: {
                current_page: 1,
                total_items: 0,
                total_pages: 0,
                data: [],
            },
        });

        render(<ServiceActivityTable />);

        expect(await screen.findByText('Belum ada aktivitas')).toBeInTheDocument();
    });
});
