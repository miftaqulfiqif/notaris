import { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ServiceTypeDetailPage from './page';
import { apiGet } from '@/shared/api/api-client';

jest.mock('@/layout/DashboardHeader', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

jest.mock('@/features/dashboard/context/UploadModalContext', () => ({
  useUploadModal: () => ({ openModal: jest.fn() }),
}));

jest.mock('@/features/dashboard/context/DragDropContext', () => ({
  useDragDropContext: () => ({ setPreSelection: jest.fn() }),
}));

jest.mock('@/layout/providers/SidebarContext', () => ({
  useSidebar: () => ({ services: [{ id: '1', name: 'Pendirian' }] }),
}));

jest.mock('@/features/services/context/ServiceTypesContext', () => ({
  useServiceTypes: () => ({ serviceTypes: [{ id: 10, name: 'Akta' }] }),
}));

jest.mock('@/shared/api/api-client', () => ({
  apiGet: jest.fn(),
}));

jest.mock('@/shared/components/FilterTabs', () => ({
  FilterTabs: () => <div data-testid="filter-tabs" />,
}));

jest.mock('@/features/services/presentation/components/FolderTable', () => ({
  FolderTable: () => <div data-testid="folder-table" />,
}));

describe('ServiceTypeDetailPage', () => {
  it('renders service type detail page', async () => {
    (apiGet as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'folder-1',
          folder_name: 'Folder Akta',
          tipe_layanan: 'Akta',
          user: 'Rosyam',
          is_favorite: false,
          updated_at: '2026-03-20T00:00:00.000Z',
          status: 'proses',
        },
      ],
    });

    const params = {
      status: 'fulfilled',
      value: { slug: 'pendirian', typeSlug: 'akta' },
      then: () => {},
    } as unknown as Promise<{ slug: string; typeSlug: string }>;
    render(
      <Suspense fallback={<div>loading</div>}>
        <ServiceTypeDetailPage params={params} />
      </Suspense>
    );

    await waitFor(() => {
      expect(screen.getByTestId('folder-table')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Akta' })).toBeInTheDocument();
  });

  it('renders an empty state when the selected service type has no items', async () => {
    (apiGet as jest.Mock).mockResolvedValue({ data: [] });

    const params = {
      status: 'fulfilled',
      value: { slug: 'pendirian', typeSlug: 'akta' },
      then: () => {},
    } as unknown as Promise<{ slug: string; typeSlug: string }>;

    render(
      <Suspense fallback={<div>loading</div>}>
        <ServiceTypeDetailPage params={params} />
      </Suspense>
    );

    await waitFor(() => {
      expect(screen.getByText('Belum ada item untuk Akta')).toBeInTheDocument();
    });

    expect(screen.getAllByRole('button', { name: 'Tambah Baru' })).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Kembali ke layanan' })).toBeInTheDocument();
  });
});
