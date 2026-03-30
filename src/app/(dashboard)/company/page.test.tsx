import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompanyPage from './page';
import { apiGet, apiPatch, apiPost } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';

const mockPush = jest.fn();
const mockOpenUploadModal = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

jest.mock('@/layout/DashboardHeader', () => ({
    DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

jest.mock('@/features/dashboard/context/UploadModalContext', () => ({
    useUploadModal: () => ({
        openModal: mockOpenUploadModal,
    }),
}));

jest.mock('@/layout/providers/SidebarContext', () => ({
    useSidebar: () => ({
        services: [],
        isLoadingServices: false,
    }),
}));

jest.mock('@/shared/api/api-client', () => ({
    apiGet: jest.fn(),
    apiPatch: jest.fn(),
    apiPost: jest.fn(),
}));

const mockedApiGet = apiGet as jest.MockedFunction<typeof apiGet>;
const mockedApiPatch = apiPatch as jest.MockedFunction<typeof apiPatch>;
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

const multiFolderListResponse = {
    message: 'Get folder success',
    data: {
        current_page: 1,
        total_items: 2,
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
            {
                id: 'folder-2',
                folder_name: 'PT Satu Lagi',
                layanan: 'PT',
                tipe_layanan: 'Perubahan',
                author: 'Admin',
                updated_at: '31 Januari 2026',
                status: 'tertunda',
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
        mockedApiPatch.mockReset();
        mockedApiPost.mockReset();
        mockPush.mockReset();
        mockOpenUploadModal.mockReset();
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

    it('opens global upload modal when klik Tambah Baru', async () => {
        const user = userEvent.setup();

        render(<CompanyPage />);

        await user.click(screen.getByRole('button', { name: /Tambah Baru/i }));

        expect(mockOpenUploadModal).toHaveBeenCalledWith(
            expect.objectContaining({
                onSuccess: expect.any(Function),
            }),
        );
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

    it('shows more-vertical actions from grid card', async () => {
        const user = userEvent.setup();

        render(<CompanyPage />);

        await waitFor(() => {
            expect(screen.getByText('PT Integrasi')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: 'Grid view' }));
        await user.click(screen.getByRole('button', { name: /Aksi PT Integrasi/i }));

        expect(screen.getByRole('button', { name: 'Ganti nama' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Download folder' })).toBeInTheDocument();
    });

    it('shows bulk action and hides rename when selected data more than one', async () => {
        const user = userEvent.setup();
        mockedApiGet
            .mockReset()
            .mockResolvedValueOnce(multiFolderListResponse as never)
            .mockResolvedValueOnce(favoriteLookupResponse as never);

        render(<CompanyPage />);

        await waitFor(() => {
            expect(screen.getByText('PT Satu Lagi')).toBeInTheDocument();
        });

        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[1]);
        expect(screen.getByRole('button', { name: 'Ganti nama' })).toBeInTheDocument();

        await user.click(checkboxes[2]);
        expect(screen.queryByRole('button', { name: 'Ganti nama' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument();
    });

    it('opens bulk status popover and updates selected status', async () => {
        const user = userEvent.setup();
        mockedApiPatch.mockResolvedValue({ message: 'Update status folder success' } as never);

        render(<CompanyPage />);

        await waitFor(() => {
            expect(screen.getByText('PT Integrasi')).toBeInTheDocument();
        });

        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[1]);

        await user.click(screen.getByRole('button', { name: 'Status' }));
        await user.click(screen.getByRole('button', { name: 'Selesai' }));

        await waitFor(() => {
            expect(mockedApiPatch).toHaveBeenCalledWith(ENDPOINTS.USER.UPDATE_STATUS_FOLDER, {
                folder_id: 'folder-1',
                status: 'selesai',
            });
        });
    });

    it('can update folder status inline from table', async () => {
        const user = userEvent.setup();
        mockedApiPatch.mockResolvedValue({ message: 'Update status folder success' } as never);

        render(<CompanyPage />);

        await waitFor(() => {
            expect(screen.getByText('PT Integrasi')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: /Ubah status PT Integrasi/i }));
        await user.click(screen.getByRole('button', { name: 'Selesai' }));

        await waitFor(() => {
            expect(mockedApiPatch).toHaveBeenCalledWith(ENDPOINTS.USER.UPDATE_STATUS_FOLDER, {
                folder_id: 'folder-1',
                status: 'selesai',
            });
        });
    });

    it('can rename folder from actions menu', async () => {
        const user = userEvent.setup();
        mockedApiPatch.mockResolvedValue({ message: 'Rename folder success' } as never);

        render(<CompanyPage />);

        await waitFor(() => {
            expect(screen.getByText('PT Integrasi')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: /Aksi PT Integrasi/i }));
        await user.click(screen.getByRole('button', { name: 'Ganti nama' }));

        expect(screen.getByRole('heading', { name: 'Ganti nama folder' })).toBeInTheDocument();

        const input = screen.getByRole('textbox', { name: /Nama Folder/i });
        await user.clear(input);
        await user.type(input, 'PT Integrasi Baru');
        await user.click(screen.getByRole('button', { name: 'Simpan' }));

        await waitFor(() => {
            expect(mockedApiPatch).toHaveBeenCalledWith(
                ENDPOINTS.USER.RENAME_FOLDER.replace(':folder_id', 'folder-1'),
                { folder_name: 'PT Integrasi Baru' },
            );
        });

        expect(screen.getByText('PT Integrasi Baru')).toBeInTheDocument();
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
