import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import RegisterPage from './page';

jest.mock('@/features/auth/presentation/components/RegisterForm', () => ({
  RegisterForm: () => <div data-testid="register-form" />,
}));

jest.mock('@/features/auth/presentation/components/PublicOnlyRoute', () => ({
  PublicOnlyRoute: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('RegisterPage', () => {
  it('renders register page', () => {
    render(<RegisterPage />);
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
    expect(screen.getByAltText('Notarix')).toBeInTheDocument();
  });
});
