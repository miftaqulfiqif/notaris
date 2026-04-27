'use client';

import Link from 'next/link';
import { BrandLogo } from '@/shared/components';
import { usePackages } from '@/features/billing/hooks/usePackages';
import { PricingGrid } from '@/features/billing/presentation/components/PricingGrid';

export default function PricingPage() {
    const { packages, isLoading, error } = usePackages();

    return (
        <div className="min-h-screen bg-[#F6F7F8]">
            <header className="flex items-center justify-between border-b border-[#ECECEC] bg-white px-6 py-3">
                <BrandLogo width={122} height={45} priority />
                <Link href="/login" className="text-sm font-medium text-[#7D674E]">
                    Hubungi Tim Marketing
                </Link>
            </header>

            <main className="px-4 py-10">
                <div className="mx-auto max-w-5xl text-center">
                    <h1 className="text-[40px] font-semibold text-[#6B5C48]">Paket &amp; Harga</h1>
                    <p className="mt-3 text-base text-[#6F655A]">
                        Pilih paket harga dan mulai arsip dokumen notaris mu di Notarix
                    </p>
                </div>

                <div className="mx-auto mt-12 flex max-w-5xl justify-center">
                    {isLoading ? (
                        <div className="h-[360px] w-full max-w-[320px] animate-pulse rounded-[24px] bg-white shadow-[0_24px_70px_rgba(79,58,28,0.08)]" />
                    ) : error ? (
                        <div className="rounded-2xl border border-[#F0D2CF] bg-white px-6 py-5 text-sm text-[#8A3730]">
                            {error}
                        </div>
                    ) : (
                        <PricingGrid packages={packages} />
                    )}
                </div>
            </main>
        </div>
    );
}
