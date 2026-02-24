import { render, screen, waitFor } from '@testing-library/react';
import CompanyPage from './page';
import { apiGet } from '@/shared/api/api-client';

jest.mock('@/layout/DashboardHeader', () => ({
    DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

jest.mock('@/shared/api/api-client', () => ({
    apiGet: jest.fn(),
}));

const mockedApiGet = apiGet as jest.MockedFunction<typeof apiGet>;

describe('CompanyPage', () => {
    beforeEach(() => {
        mockedApiGet.mockResolvedValue({
            message: 'Get folder success',
            data: {
                current_page: 1,
                total_items: 1,
                total_pages: 1,
                data: [
                    {
                        id: 'folder-1',
                        folder_name: 'PT Integrasi',
                        layanan: 'PT',
                        tipe_layanan: 'Pendirian',
                        author: 'Admin',
                        updated_at: '31 Januari 2026',
                        status: 'proses',
                    },
                ],
            },
        } as never);
    });

    it('renders company page content', async () => {
        render(<CompanyPage />);

        expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Perusahaan' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Tambah Baru/i })).toBeInTheDocument();
        expect(screen.getByText('Nama penghadap')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('PT Integrasi')).toBeInTheDocument();
        });
    });
});
