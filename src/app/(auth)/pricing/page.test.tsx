import { render, screen } from '@testing-library/react';
import PricingPage from './page';

jest.mock('@/features/billing/hooks/usePackages', () => ({
    usePackages: jest.fn(),
}));

const { usePackages } = jest.requireMock('@/features/billing/hooks/usePackages') as {
    usePackages: jest.Mock;
};

describe('PricingPage', () => {
    it('renders package card and continue link', () => {
        usePackages.mockReturnValue({
            isLoading: false,
            error: null,
            packages: [
                {
                    id: 'pkg-1',
                    name: 'Paket Notarix',
                    current_monthly_price: 500000,
                    list_monthly_price: 750000,
                    annual_price: 1500000,
                    features: ['15GB storage', '2 pengguna'],
                    promo_badge: 'Pembelian pertama',
                    promo_ends_at: '2026-06-30T00:00:00.000Z',
                },
            ],
        });

        render(<PricingPage />);

        expect(screen.getByText('Paket & Harga')).toBeInTheDocument();
        expect(screen.getByText('Pembelian pertama')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Lanjutkan' })).toHaveAttribute('href', '/register?package=pkg-1');
    });
});
