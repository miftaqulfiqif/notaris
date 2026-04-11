import { render, screen, fireEvent } from '@testing-library/react';
import VerificationSuccessPage from './page';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('VerificationSuccessPage', () => {
  it('navigates to login on button click', () => {
    render(<VerificationSuccessPage />);
    const button = screen.getByRole('button', { name: /login/i });
    fireEvent.click(button);
    expect(pushMock).toHaveBeenCalledWith('/login');
  });
});
