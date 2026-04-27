'use client';

import type { CheckoutContext } from '../../types/billing.types';

const formatCurrency = (value: number) => `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;

export function CheckoutSummary({ checkout }: Readonly<{ checkout: CheckoutContext }>) {
    const packageItem = checkout.package;

    return (
        <aside className="rounded-[24px] border border-[#E9E1D8] bg-white p-6 shadow-[0_24px_64px_rgba(79,58,28,0.1)]">
            <div className="rounded-[20px] border border-[#ECE4DB] bg-[#FFFCF8] p-5">
                <p className="text-sm text-[#7C7064]">Paket terpilih</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#2D2925]">{packageItem?.name ?? 'Paket Langganan'}</h2>
                <p className="mt-3 text-sm leading-6 text-[#6E6359]">
                    {checkout.invoice?.period ?? 'Bulan pertama'} dengan ruang simpan {packageItem?.storage_gb ?? 0}GB dan akses hingga {packageItem?.max_users ?? 0} pengguna.
                </p>
            </div>

            <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm text-[#6E6359]">
                    <span>Subtotal</span>
                    <span>{formatCurrency(checkout.quote.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-[#6E6359]">
                    <span>Diskon promo</span>
                    <span>-{formatCurrency(checkout.quote.discount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-[#6E6359]">
                    <span>PPN</span>
                    <span>{formatCurrency(checkout.quote.tax)}</span>
                </div>
                <div className="border-t border-[#ECE4DB] pt-4">
                    <div className="flex items-center justify-between text-lg font-semibold text-[#2D2925]">
                        <span>Total Pembayaran</span>
                        <span>{formatCurrency(checkout.quote.total)}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
