import { render, screen, waitFor } from '@testing-library/react';
import NotificationsPage from './page';
import { apiGet } from '@/shared/api/api-client';

jest.mock('@/layout/DashboardHeader', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

jest.mock('@/features/auth/context/auth.context', () => ({
  useAuthContext: () => ({
    user: { name: 'Admin 1' },
  }),
}));

jest.mock('@/shared/api/api-client', () => ({
  apiGet: jest.fn(),
}));

describe('NotificationsPage', () => {
  it('renders notification list from api', async () => {
    (apiGet as jest.Mock).mockResolvedValue({
      message: 'Get notifikasi success',
      data: {
        current_page: 1,
        total_items: 1,
        total_pages: 1,
        total_not_read: 1,
        data: [
          {
            id: 'notif-1',
            type: 'general',
            action: 'update_status',
            description: 'Saya mengubah status layanan PT ABC',
            object: 'FOLDER',
            object_id: 'folder-1',
            object_name: 'PT ABC',
            object_updated: 'terjeda',
            has_read: false,
            file_path: null,
            created_at: 'Sekarang',
          },
        ],
      },
    });

    render(<NotificationsPage />);

    expect(screen.getByRole('heading', { name: 'Notifikasi' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Saya mengubah status layanan PT ABC')).toBeInTheDocument();
      expect(screen.getByText('Tandai semua dibaca')).toBeInTheDocument();
    });
  });
});
