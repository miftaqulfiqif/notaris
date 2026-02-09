import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from './page';

jest.mock('@/features/auth/presentation/components/LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form" />,
}));

jest.mock('@/features/auth/presentation/components/PublicOnlyRoute', () => ({
  PublicOnlyRoute: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('LoginPage', () => {
  it('renders login page', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });
}); 
