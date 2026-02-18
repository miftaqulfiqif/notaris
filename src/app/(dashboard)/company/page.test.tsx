import { render, screen } from '@testing-library/react';
import CompanyPage from './page';

jest.mock('@/layout/DashboardHeader', () => ({
    DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

describe('CompanyPage', () => {
    it('renders company page content', () => {
        render(<CompanyPage />);

        expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Perusahaan' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Tambah Baru/i })).toBeInTheDocument();
        expect(screen.getByText('Nama penghadap')).toBeInTheDocument();
        expect(screen.getAllByText('PT. Dummy').length).toBeGreaterThan(0);
    });
});
