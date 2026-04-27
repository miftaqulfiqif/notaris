'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/shared/components';
import { PendingPaymentGuard } from '@/features/billing/presentation/components/PendingPaymentGuard';
import { CheckoutSummary } from '@/features/billing/presentation/components/CheckoutSummary';
import { PaymentMethodGroup } from '@/features/billing/presentation/components/PaymentMethodGroup';
import { useCheckout } from '@/features/billing/hooks/useCheckout';

export default function CheckoutPage() {
    const router = useRouter();
    const {
        checkout,
        error,
        isLoading,
        isSubmitting,
        selectedChannel,
        selectedGroup,
        setSelectedChannel,
        setSelectedGroup,
        submitCharge,
    } = useCheckout();
    const [openGroup, setOpenGroup] = useState<string | null>(null);

    const resolvedOpenGroup = useMemo(
        () => openGroup ?? selectedGroup ?? checkout.payment_methods[0]?.group ?? null,
        [checkout.payment_methods, openGroup, selectedGroup],
    );

    const handleSubmit = async () => {
        await submitCharge();
        router.push('/register/payment');
    };

    return (
        <PendingPaymentGuard>
            <div className="min-h-screen bg-[#F6F3EF]">
                <header className="border-b border-[#E7DED5] bg-white px-6 py-4">
                    <BrandLogo width={122} height={45} priority />
                </header>

                <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.4fr_420px]">
                    <section className="space-y-5">
                        <div>
                            <p className="text-sm uppercase tracking-[0.24em] text-[#8B7355]">Checkout</p>
                            <h1 className="mt-2 text-[34px] font-semibold text-[#2D2925]">Pilih metode pembayaran</h1>
                            <p className="mt-2 text-sm text-[#6E6359]">
                                Pastikan metode yang dipilih sesuai preferensi Anda. Instruksi pembayaran akan dibuat secara otomatis setelah tombol lanjut ditekan.
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                <div className="h-24 animate-pulse rounded-[18px] bg-white" />
                                <div className="h-24 animate-pulse rounded-[18px] bg-white" />
                                <div className="h-24 animate-pulse rounded-[18px] bg-white" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {checkout.payment_methods.map((group) => (
                                    <PaymentMethodGroup
                                        key={group.group}
                                        group={group}
                                        isOpen={resolvedOpenGroup === group.group}
                                        onSelectChannel={(channelCode) => {
                                            setSelectedGroup(group.group);
                                            setSelectedChannel(channelCode);
                                        }}
                                        onToggle={(groupName) => setOpenGroup((current) => current === groupName ? null : groupName)}
                                        selectedChannel={selectedChannel}
                                    />
                                ))}
                            </div>
                        )}

                        {error ? (
                            <div className="rounded-2xl border border-[#F0D2CF] bg-[#FFF2F0] px-4 py-3 text-sm text-[#8A3730]">
                                {error}
                            </div>
                        ) : null}

                        <div className="flex items-center justify-end">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading || isSubmitting || !selectedGroup || !selectedChannel}
                                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#7D674E] px-6 text-sm font-medium text-white transition-colors hover:bg-[#6E5943] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? 'Membuat instruksi...' : 'Lanjutkan ke pembayaran'}
                            </button>
                        </div>
                    </section>

                    <CheckoutSummary checkout={checkout} />
                </main>
            </div>
        </PendingPaymentGuard>
    );
}
