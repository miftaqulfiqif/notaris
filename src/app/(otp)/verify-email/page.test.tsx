import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import VerifyEmailPage from './page';

jest.mock('@/features/auth/presentation/components/EmailVerificationForm', () => ({
  EmailVerificationForm: () => <div data-testid="email-verification-form" />,
}));

jest.mock('@/features/auth/presentation/components/UnverifiedOnlyRoute', () => ({
  UnverifiedOnlyRoute: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('VerifyEmailPage', () => {
  it('renders verify email page', () => {
    render(<VerifyEmailPage />);
    expect(screen.getByTestId('email-verification-form')).toBeInTheDocument();
  });
});
