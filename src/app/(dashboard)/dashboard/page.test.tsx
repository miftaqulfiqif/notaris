import { render, screen } from '@testing-library/react';
import DashboardPage from './page';

jest.mock('@/features/auth/context/auth.context', () => ({
  useAuthContext: () => ({ user: { name: 'Test User' } }),
}));

jest.mock('@/features/dashboard/context/UploadModalContext', () => ({
  useUploadModal: () => ({ openModal: jest.fn() }),
}));

jest.mock('@/layout/DashboardHeader', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header" />,
}));

jest.mock('@/features/dashboard/presentation/components/FolderGrid', () => ({
  FolderGrid: () => <div data-testid="folder-grid" />,
}));

jest.mock('@/features/dashboard/presentation/components/RecommendationSection', () => ({
  RecommendationSection: () => <div data-testid="recommendation-section" />,
}));

jest.mock('@/features/dashboard/presentation/components/ActivitySection', () => ({
  ActivitySection: () => <div data-testid="activity-section" />,
}));

jest.mock('@/features/dashboard/presentation/components/ActivityDetailSidebar', () => ({
  ActivityDetailSidebar: () => <div data-testid="activity-detail" />,
}));

jest.mock('@/features/dashboard/hooks/useDashboard', () => ({
  useDashboard: () => ({
    activities: null,
    recommendations: [],
    isLoadingActivities: false,
    isLoadingRecommendations: false,
    error: null,
    fetchRecommendations: jest.fn(),
  }),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('lastLoginDate', today);
    localStorage.setItem('dailyLoginCount', '2');
    sessionStorage.setItem('session_initialized', 'true');
  });

  it('renders dashboard page', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
