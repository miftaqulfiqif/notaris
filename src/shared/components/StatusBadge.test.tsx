import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

jest.mock('@/features/dashboard/utils', () => ({
    getStatusColor: jest.fn((status: string) => {
        const normalized = status.toLowerCase();
        if (normalized === 'selesai') return 'bg-green-100 text-green-600';
        if (normalized === 'terjeda' || normalized === 'tertunda' || normalized === 'terutunda')
            return 'bg-red-100 text-red-600';
        if (normalized === 'proses') return 'bg-yellow-100 text-yellow-600';
        return 'bg-gray-100 text-gray-600';
    }),
}));

describe('StatusBadge', () => {
    it('renders the status label text', () => {
        render(<StatusBadge status="Selesai" />);
        expect(screen.getByText('Selesai')).toBeInTheDocument();
    });

    it('applies green classes for Selesai status', () => {
        render(<StatusBadge status="Selesai" />);
        const badge = screen.getByText('Selesai');
        expect(badge).toHaveClass('bg-green-100', 'text-green-600');
    });

    it('applies yellow classes for Proses status', () => {
        render(<StatusBadge status="Proses" />);
        const badge = screen.getByText('Proses');
        expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-600');
    });

    it('applies red classes for Tertunda status', () => {
        render(<StatusBadge status="Tertunda" />);
        const badge = screen.getByText('Tertunda');
        expect(badge).toHaveClass('bg-red-100', 'text-red-600');
    });

    it('applies gray classes for unknown status', () => {
        render(<StatusBadge status="Unknown" />);
        const badge = screen.getByText('Unknown');
        expect(badge).toHaveClass('bg-gray-100', 'text-gray-600');
    });

    it('applies additional className when provided', () => {
        render(<StatusBadge status="Selesai" className="custom-class" />);
        expect(screen.getByText('Selesai')).toHaveClass('custom-class');
    });
});
