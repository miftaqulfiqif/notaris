import { render, screen } from '@testing-library/react';
import InstansiPage from './page';

jest.mock('@/layout/DashboardHeader', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

describe('InstansiPage', () => {
  it('renders instansi page content', () => {
    render(<InstansiPage />);

    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /teams/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Umum' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Member Team' })).toBeInTheDocument();
    expect(screen.getByText('Tambah member baru')).toBeInTheDocument();
  });
});
