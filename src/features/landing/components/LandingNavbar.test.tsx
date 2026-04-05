import { fireEvent, render, screen } from '@testing-library/react';
import { LandingNavbar } from './LandingNavbar';

describe('LandingNavbar', () => {
    it('opens the fitur mega dropdown and switches category content', () => {
        render(<LandingNavbar />);

        fireEvent.click(screen.getByRole('button', { name: /^fitur$/i }));

        expect(screen.getByText(/manajemen dokumen/i)).toBeInTheDocument();
        expect(screen.getByText(/quick upload/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /quick upload\. halaman detail belum tersedia/i })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /^layanan$/i }));
        expect(screen.getByText(/konfigurasi layanan/i)).toBeInTheDocument();
        expect(screen.getByText(/kelola jenis layanan/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /^keamanan$/i }));
        expect(screen.getByText(/keamanan data/i)).toBeInTheDocument();
        expect(screen.getByText(/enkripsi aes-256/i)).toBeInTheDocument();
    });

    it('opens the mega dropdown from the solusi nav item and closes it on outside click', () => {
        render(<LandingNavbar />);

        expect(screen.getByRole('button', { name: /^fitur$/i })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /solusi/i }));

        expect(screen.getByText(/solusi untuk kantor notaris/i)).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /digitalisasi arsip fisik\. halaman detail belum tersedia/i }),
        ).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /konsultasi gratis/i })).toHaveAttribute('href', '#demo');

        fireEvent.mouseDown(document.body);

        expect(screen.queryByText(/solusi untuk kantor notaris/i)).not.toBeInTheDocument();
    });

    it('closes the mega dropdown when escape is pressed', () => {
        render(<LandingNavbar />);

        fireEvent.click(screen.getByRole('button', { name: /^fitur$/i }));
        expect(screen.getByText(/manajemen dokumen/i)).toBeInTheDocument();

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(screen.queryByText(/manajemen dokumen/i)).not.toBeInTheDocument();
    });
});
