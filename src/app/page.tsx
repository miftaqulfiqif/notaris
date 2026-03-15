import type { Metadata } from 'next';
import { LandingPage } from '@/features/landing/LandingPage';

export const metadata: Metadata = {
    title: 'Notarix',
    description: 'Satu platform untuk mengelola seluruh operasional notaris.',
};

export default function HomePage() {
    return <LandingPage />;
}
