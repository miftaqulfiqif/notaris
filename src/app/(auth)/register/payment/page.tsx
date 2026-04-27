'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/shared/components';
import { useAuthContext } from '@/features/auth/context/auth.context';
import { getAuthenticatedHomePath } from '@/features/auth/utils/user';
import { usePaymentStatus } from '@/features/billing/hooks/usePaymentStatus';
import { PendingPaymentGuard } from '@/features/billing/presentation/components/PendingPaymentGuard';
import { PaymentInstructions } from '@/features/billing/presentation/components/PaymentInstructions';
import { PaymentStatusBanner } from '@/features/billing/presentation/components/PaymentStatusBanner';

export default function RegisterPaymentPage() {
    const router = useRouter();
    const { checkAuth, user } = useAuthContext();
    const { checkout, error, isLoading, isRefreshing, refreshStatus } = usePaymentStatus();

    useEffect(() => {
        if (checkout?.transaction?.status === 'settled') {
            checkAuth().then((nextUser) => {
                if (nextUser?.verified_at) {
                    router.push(getAuthenticatedHomePath(nextUser));
                    return;
                }

                router.push('/verify-email');
            });
        }
    }, [checkAuth, checkout?.transaction?.status, router]);

    const expiresAtLabel = checkout?.transaction?.expires_at
        ? new Date(checkout.transaction.expires_at).toLocaleString('id-ID')
        : null;

    return (
        <PendingPaymentGuard>
            <div className="min-h-screen bg-[#F6F3EF]">
                <header className="border-b border-[#E7DED5] bg-white px-6 py-4">
                    <BrandLogo width={122} height={45} priority />
                </header>

                <main className="mx-auto max-w-4xl px-4 py-10">
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm uppercase tracking-[0.24em] text-[#8B7355]">Pembayaran</p>
                            <h1 className="mt-2 text-[34px] font-semibold text-[#2D2925]">Selesaikan pembayaran paket Anda</h1>
                            <p className="mt-2 text-sm text-[#6E6359]">
                                {user?.subscription?.package ? `Akun ${user.subscription.package} akan aktif otomatis setelah pembayaran berhasil.` : 'Akun Anda akan aktif otomatis setelah pembayaran berhasil.'}
                            </p>
                        </div>

                        <PaymentStatusBanner status={checkout?.transaction?.status} />

                        <div className="rounded-[24px] border border-[#E9E1D8] bg-white p-6 shadow-[0_24px_64px_rgba(79,58,28,0.1)]">
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm text-[#7C7064]">Metode dipilih</p>
                                    <p className="mt-1 text-lg font-semibold text-[#2D2925]">
                                        {checkout?.transaction?.payment_channel ?? checkout?.transaction?.method ?? 'Belum ada instruksi'}
                                    </p>
                                </div>
                                {expiresAtLabel ? (
                                    <div className="rounded-2xl bg-[#FFFCF8] px-4 py-3 text-sm text-[#6E6359]">
                                        Berlaku sampai <strong className="text-[#2D2925]">{expiresAtLabel}</strong>
                                    </div>
                                ) : null}
                            </div>

                            <PaymentInstructions transaction={checkout?.transaction ?? null} />
                        </div>

                        {error ? (
                            <div className="rounded-2xl border border-[#F0D2CF] bg-[#FFF2F0] px-4 py-3 text-sm text-[#8A3730]">
                                {error}
                            </div>
                        ) : null}

                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => refreshStatus()}
                                disabled={isLoading || isRefreshing}
                                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#7D674E] px-5 text-sm font-medium text-white transition-colors hover:bg-[#6E5943] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isRefreshing ? 'Memeriksa status...' : 'Cek status pembayaran'}
                            </button>

                            <Link
                                href="/register/checkout"
                                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#D5C7B8] px-5 text-sm font-medium text-[#7D674E] transition-colors hover:bg-white"
                            >
                                Kembali ke metode pembayaran
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </PendingPaymentGuard>
    );
}
