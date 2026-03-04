import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrashPage from './page';
import { useTrashItems } from '@/features/dashboard/hooks/useTrashItems';

jest.mock('@/layout/DashboardHeader', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

jest.mock('@/shared/components/SortableHeader', () => ({
  SortableHeader: ({ label }: { label: string }) => <span>{label}</span>,
}));

jest.mock('@/features/dashboard/hooks/useTrashItems', () => ({
  useTrashItems: jest.fn(),
}));

jest.mock('@/features/dashboard/presentation/components/TrashTable', () => ({
  TrashTable: () => <div data-testid="trash-table" />,
}));

jest.mock('@/shared/components/Pagination', () => ({
  Pagination: () => <div data-testid="pagination" />,
}));

describe('TrashPage', () => {
  const mockUseTrashItems = useTrashItems as jest.Mock;

  beforeEach(() => {
    mockUseTrashItems.mockReturnValue({
      items: [],
      isLoading: false,
      isEmptyingTrash: false,
      currentPage: 1,
      totalItems: 0,
      totalPages: 1,
      handlePageChange: jest.fn(),
      itemsPerPage: 10,
      restoreItem: jest.fn(),
      restoreItems: jest.fn(),
      deleteItemPermanently: jest.fn(),
      deleteItemsPermanently: jest.fn(),
      emptyTrashPermanently: jest.fn(),
    });
  });

  it('renders trash page without empty-trash alert when there is no item', () => {
    render(<TrashPage />);
    expect(screen.getByText('Sampah')).toBeInTheDocument();
    expect(screen.queryByText('Kosongkan sampah')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Item dalam sampah akan dihapus selamanya setelah 30 hari')
    ).not.toBeInTheDocument();
  });

  it('shows empty-trash alert and button when trash has items', () => {
    mockUseTrashItems.mockReturnValue({
      items: [{ id: '1', item_id: '1', item_type: 'DOCUMENT', created_at: '2026-01-01', detail: { deleted_by: 'A', item_name: 'Doc', item_path: null, location: 'Folder', hover: [] } }],
      isLoading: false,
      isEmptyingTrash: false,
      currentPage: 1,
      totalItems: 1,
      totalPages: 1,
      handlePageChange: jest.fn(),
      itemsPerPage: 10,
      restoreItem: jest.fn(),
      restoreItems: jest.fn(),
      deleteItemPermanently: jest.fn(),
      deleteItemsPermanently: jest.fn(),
      emptyTrashPermanently: jest.fn(),
    });

    render(<TrashPage />);

    expect(screen.getByText('Kosongkan sampah')).toBeInTheDocument();
    expect(
      screen.getByText('Item dalam sampah akan dihapus selamanya setelah 30 hari')
    ).toBeInTheDocument();
  });

  it('shows confirmation modal before emptying trash', async () => {
    const user = userEvent.setup();
    mockUseTrashItems.mockReturnValue({
      items: [{ id: '1', item_id: '1', item_type: 'DOCUMENT', created_at: '2026-01-01', detail: { deleted_by: 'A', item_name: 'Doc', item_path: null, location: 'Folder', hover: [] } }],
      isLoading: false,
      isEmptyingTrash: false,
      currentPage: 1,
      totalItems: 1,
      totalPages: 1,
      handlePageChange: jest.fn(),
      itemsPerPage: 10,
      restoreItem: jest.fn(),
      restoreItems: jest.fn(),
      deleteItemPermanently: jest.fn(),
      deleteItemsPermanently: jest.fn(),
      emptyTrashPermanently: jest.fn(),
    });

    render(<TrashPage />);

    await user.click(screen.getByRole('button', { name: 'Kosongkan sampah' }));

    expect(screen.getByRole('heading', { name: 'Hapus Permanen Semua Item' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hapus Permanen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Batal' })).toBeInTheDocument();
  });
});
