import { render, screen } from '@testing-library/react';
import { LandingFeatures } from './LandingFeatures';

describe('LandingFeatures', () => {
    it('renders the features heading, cta, and preview images', () => {
        render(<LandingFeatures />);

        expect(
            screen.getByRole('heading', {
                level: 2,
                name: /kelola layanan notaris lebih cepat, rapi, dan terpusat/i,
            }),
        ).toBeInTheDocument();

        expect(screen.getByRole('link', { name: /request demo/i })).toHaveAttribute('href', '#demo');

        expect(
            screen.getByAltText(/preview dashboard notarix untuk pengelolaan jobfile dan aktivitas/i),
        ).toBeInTheDocument();
        expect(screen.getByAltText(/preview form upload dokumen layanan notaris/i)).toBeInTheDocument();
        expect(screen.getByAltText(/preview riwayat aktivitas untuk audit layanan notaris/i)).toBeInTheDocument();
    });

    it('renders all three feature titles', () => {
        render(<LandingFeatures />);

        expect(screen.getByRole('heading', { level: 3, name: /terorganisir cepat/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 3, name: /smart docs upload/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 3, name: /audit activity/i })).toBeInTheDocument();
    });
});
