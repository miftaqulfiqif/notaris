import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompanyPage from './page';
import { apiGet, apiPost } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

jest.mock('@/layout/DashboardHeader', () => ({
    DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

jest.mock('@/shared/api/api-client', () => ({
    apiGet: jest.fn(),
    apiPost: jest.fn(),
}));

const mockedApiGet = apiGet as jest.MockedFunction<typeof apiGet>;
const mockedApiPost = apiPost as jest.MockedFunction<typeof apiPost>;

const folderListResponse = {
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
};

const favoriteLookupResponse = {
    message: 'Get favorite success',
    data: {
        current_page: 1,
        total_items: 0,
        total_pages: 1,
        data: [],
    },
};

describe('CompanyPage', () => {
    beforeEach(() => {
        mockedApiGet.mockReset();
        mockedApiPost.mockReset();
        mockPush.mockReset();
        mockedApiGet
            .mockResolvedValueOnce(folderListResponse as never)
            .mockResolvedValueOnce(favoriteLookupResponse as never);
    });

    it('renders company page content', async () => {
        render(<CompanyPage />);

        expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Perusahaan' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Tambah Baru/i })).toBeInTheDocument();
        expect(screen.queryByText('Nama penghadap')).not.toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('PT Integrasi')).toBeInTheDocument();
        });
    });

    it('opens actions menu and can add item to favorite', async () => {
        const user = userEvent.setup();
        mockedApiPost.mockResolvedValue({ message: 'success' } as never);

        render(<CompanyPage />);

        await waitFor(() => {
            expect(screen.getByText('PT Integrasi')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: /Aksi PT Integrasi/i }));
        await user.click(screen.getByRole('button', { name: /Tambahkan ke berbintang/i }));

        await waitFor(() => {
            expect(mockedApiPost).toHaveBeenCalledWith(ENDPOINTS.USER.ITEM_FAVORITE, {
                item_id: 'folder-1',
                item_type: 'FOLDER',
            });
        });

        expect(screen.getByRole('button', { name: /Hapus PT Integrasi dari berbintang/i })).toBeInTheDocument();
    });

    it('navigates to folder detail page when row is clicked', async () => {
        const user = userEvent.setup();

        render(<CompanyPage />);

        await waitFor(() => {
            expect(screen.getByText('PT Integrasi')).toBeInTheDocument();
        });

        await user.click(screen.getByText('PT Integrasi'));

        expect(mockPush).toHaveBeenCalledWith('/services/pt/pendirian/folder-1');
    });
});
