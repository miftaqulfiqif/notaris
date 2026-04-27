import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import ResetPasswordPage from './page';

jest.mock('@/features/auth/presentation/components/ResetPasswordForm', () => ({
  ResetPasswordForm: () => <div data-testid="reset-password-form" />,
}));

jest.mock('@/features/auth/presentation/components/PublicOnlyRoute', () => ({
  PublicOnlyRoute: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('ResetPasswordPage', () => {
  it('renders reset password page', () => {
    render(<ResetPasswordPage />);
    expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
  });
}); 
