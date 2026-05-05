import type { Metadata } from 'next';
import { LandingFooter } from '@/features/landing/components/LandingFooter';
import { LandingNavbar } from '@/features/landing/components/LandingNavbar';
import { LandingPricing } from '@/features/landing/components/LandingPricing';

export const metadata: Metadata = {
    title: 'Harga - Notarix',
    description: 'Lihat harga paket Notarix dan pertanyaan yang sering muncul sebelum mulai berlangganan.',
    alternates: {
        canonical: '/harga',
    },
};

export default function HargaPage() {
    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-12 px-4 py-8 sm:px-6 sm:py-10 lg:px-[60px] lg:py-11">
                <div>
                    <LandingNavbar ctaHref="/#demo" />
                    <div className="-mt-[1px]">
                        <LandingPricing />
                    </div>
                </div>
            </div>
            <LandingFooter />
        </main>
    );
}
