import { render, screen } from '@testing-library/react';
import { ServiceActivityTable } from './ServiceActivityTable';
import type { Activity } from '@/features/dashboard/types';

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

describe('ServiceActivityTable', () => {
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

    it('renders without activities by default', () => {
        render(<ServiceActivityTable />);

        expect(screen.getByText('Belum ada aktivitas')).toBeInTheDocument();
    });
});
