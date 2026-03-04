import { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import ServicePage from './page';

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

jest.mock('@/features/dashboard/hooks/useDashboard', () => ({
  useDashboard: () => ({
    activities: null,
    recommendations: [],
    isLoadingActivities: false,
    isLoadingRecommendations: false,
    error: null,
    fetchActivities: jest.fn(),
  }),
}));

jest.mock('@/features/services/presentation/components/ServiceFolderGrid', () => ({
  ServiceFolderGrid: () => <div data-testid="service-folder-grid" />,
}));

jest.mock('@/features/dashboard/presentation/components/ActivitySection', () => ({
  ActivitySection: () => <div data-testid="activity-section" />,
}));

jest.mock('@/features/dashboard/presentation/components/ActivityDetailSidebar', () => ({
  ActivityDetailSidebar: () => <div data-testid="activity-detail" />,
}));

describe('ServicePage', () => {
  it('renders service page', async () => {
    const params = {
      status: 'fulfilled',
      value: { slug: 'pendirian' },
      then: () => {},
    } as unknown as Promise<{ slug: string }>;
    render(
      <Suspense fallback={<div>loading</div>}>
        <ServicePage params={params} />
      </Suspense>
    );

    expect(screen.getByText('Pendirian')).toBeInTheDocument();
    expect(screen.getByText('Tambah Baru')).toBeInTheDocument();
    expect(screen.getByTestId('service-folder-grid')).toBeInTheDocument();
  });
});
