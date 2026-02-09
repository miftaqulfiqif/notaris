import { render, screen } from '@testing-library/react';
import StarredPage from './page';

jest.mock('@/layout/DashboardHeader', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

jest.mock('@/features/dashboard/presentation/components/StarredTable', () => ({
  StarredTable: () => <div data-testid="starred-table" />,
}));

describe('StarredPage', () => {
  it('renders starred page', () => {
    render(<StarredPage />);
    expect(screen.getByRole('heading', { name: /berbintang/i })).toBeInTheDocument();
  });
});
