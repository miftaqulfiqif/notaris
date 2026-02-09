import { render, screen } from '@testing-library/react';
import TrashPage from './page';

jest.mock('@/layout/DashboardHeader', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

jest.mock('@/shared/components/SortableHeader', () => ({
  SortableHeader: ({ label }: { label: string }) => <span>{label}</span>,
}));

describe('TrashPage', () => {
  it('renders trash page', () => {
    render(<TrashPage />);
    expect(screen.getByText('Sampah')).toBeInTheDocument();
    expect(screen.getByText('Kosongkan sampah')).toBeInTheDocument();
  });
});
