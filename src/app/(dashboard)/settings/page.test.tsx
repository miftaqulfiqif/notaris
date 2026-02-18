import { render, screen } from '@testing-library/react';
import SettingsPage from './page';

jest.mock('@/layout/DashboardHeader', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

describe('SettingsPage', () => {
  it('renders setting page content', () => {
    render(<SettingsPage />);

    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Setting' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Umum' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Paket saat ini' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Simpan perubahan' })).toBeInTheDocument();
  });
});
