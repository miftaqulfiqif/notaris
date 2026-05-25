import { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import FolderDetailPage from './page';
import { apiGet } from '@/shared/api/api-client';


jest.mock('@/features/auth/context/auth.context', () => ({
  useAuthContext: () => ({ user: { access: "FULL_ACCESS" } }),
}));

jest.mock('@/layout/DashboardHeader', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

jest.mock('@/shared/components', () => ({
  StatusBadge: () => <span data-testid="status-badge" />,
}));

jest.mock('@/features/dashboard/context/UploadModalContext', () => ({
  useUploadModal: () => ({ openModal: jest.fn() }),
}));

jest.mock('@/features/dashboard/context/DragDropContext', () => ({
  useDragDropContext: () => ({ setPreSelection: jest.fn() }),
}));

jest.mock('@/features/dashboard/context/EditFolderModalContext', () => ({
  useEditFolderModal: () => ({ openModal: jest.fn() }),
}));

jest.mock('@/layout/providers/SidebarContext', () => ({
  useSidebar: () => ({ services: [{ id: '1', name: 'Pendirian' }] }),
}));

jest.mock('@/features/services/context/ServiceTypesContext', () => ({
  useServiceTypes: () => ({ serviceTypes: [{ id: 10, name: 'Akta' }] }),
}));

jest.mock('@/shared/api/api-client', () => ({
  apiGet: jest.fn(),
  apiPatch: jest.fn(),
}));

jest.mock('@/features/services/presentation/components/FileTable', () => ({
  FileTable: () => <div data-testid="file-table" />,
}));

jest.mock('@/features/services/presentation/components/FileGrid', () => ({
  FileGrid: () => <div data-testid="file-grid" />,
}));

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        refresh: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        prefetch: jest.fn(),
    }),
    useParams: () => ({
        slug: "test-slug",
        typeSlug: "test-type",
        folderId: "1",
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => "/services/test/test/1",
}));

describe('FolderDetailPage', () => {
  it('renders folder detail page', async () => {
    (apiGet as jest.Mock)
      .mockResolvedValueOnce({
        data: {
          folder_name: 'Folder A',
          kedudukan: 'Jakarta',
          nomor_akta: '123',
          status: 'proses',
        },
      })
      .mockResolvedValueOnce({
        data: { data: [] },
      });

    const params = {
      status: 'fulfilled',
      value: { slug: 'pendirian', typeSlug: 'akta', folderId: 'folder-1' },
      then: () => {},
    } as unknown as Promise<{ slug: string; typeSlug: string; folderId: string }>;
    render(
      <Suspense fallback={<div>loading</div>}>
        <FolderDetailPage params={params} />
      </Suspense>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Folder A' })).toBeInTheDocument();
    });

    expect(screen.getByText('Tambah File Baru')).toBeInTheDocument();
  });
});
