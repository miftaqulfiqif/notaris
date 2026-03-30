import { render, screen } from '@testing-library/react';
import StarredPage from './page';

jest.mock('@/layout/DashboardHeader', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

jest.mock('@/features/dashboard/presentation/components/StarredTable', () => ({
  StarredTable: () => <div data-testid="starred-table" />,
}));

jest.mock('@/features/dashboard/hooks/useStarredItems', () => ({
  useStarredItems: () => ({
    items: [],
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    startIndex: 0,
    endIndex: 0,
    setPage: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe('StarredPage', () => {
  it('renders starred page', () => {
    render(<StarredPage />);
    expect(screen.getByRole('heading', { name: /berbintang/i })).toBeInTheDocument();
  });
});
