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

jest.mock('@/layout/providers/SidebarContext', () => ({
  useSidebar: () => ({
    services: [],
  }),
}));

jest.mock('@/features/notifications/hooks/useNotificationRedirect', () => ({
  useNotificationRedirect: () => ({
    navigatingNotificationId: null,
    openNotification: jest.fn(),
  }),
}));

describe('NotificationsPage', () => {
  it('renders notification list from api', async () => {
    (apiGet as jest.Mock).mockResolvedValue({
      message: 'Get notifikasi success',
      data: {
        current_page: 1,
        total_items: 3,
        total_pages: 1,
        total_not_read: 3,
        data: [
          {
            id: 'notif-1',
            type: 'general',
            action: 'update_status',
            description: 'Saya mengubah status layanan PT ABC',
            object: 'FOLDER',
            object_id: 'folder-1',
            object_name: 'PT ABC',
            object_updated: 'selesai',
            has_read: false,
            file_path: null,
            created_at: 'Sekarang',
          },
          {
            id: 'notif-2',
            type: 'general',
            action: 'update_status',
            description: 'Saya mengubah status layanan PT DEF',
            object: 'FOLDER',
            object_id: 'folder-2',
            object_name: 'PT DEF',
            object_updated: 'proses',
            has_read: false,
            file_path: null,
            created_at: 'Sekarang',
          },
          {
            id: 'notif-3',
            type: 'general',
            action: 'update_status',
            description: 'Saya mengubah status layanan PT GHI',
            object: 'FOLDER',
            object_id: 'folder-3',
            object_name: 'PT GHI',
            object_updated: 'tertunda',
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

    expect(screen.getByText('Selesai')).toHaveClass('bg-green-100', 'text-green-600');
    expect(screen.getByText('Proses')).toHaveClass('bg-yellow-100', 'text-yellow-600');
    expect(screen.getByText('Tertunda')).toHaveClass('bg-red-100', 'text-red-600');
  });
});
