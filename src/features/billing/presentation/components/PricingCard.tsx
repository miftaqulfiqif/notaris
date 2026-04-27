'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import type { BillingPackage } from '../../types/billing.types';

const formatCurrency = (value: number) => `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;

export function PricingCard({ packageItem }: Readonly<{ packageItem: BillingPackage }>) {
    return (
        <article className="w-full max-w-[320px] rounded-[20px] border border-[#E5DFD8] bg-white p-5 shadow-[0_24px_70px_rgba(79,58,28,0.12)]">
            <div className="border-b border-[#ECE6DE] pb-5">
                {packageItem.promo_badge ? (
                    <span className="inline-flex rounded-xl border border-[#ECE6DE] px-3 py-2 text-sm text-[#2D2A26]">
                        {packageItem.promo_badge}
                    </span>
                ) : null}

                <div className="mt-4 flex items-end gap-3 text-[#8B8176]">
                    <p className="text-sm line-through">{formatCurrency(packageItem.list_monthly_price)}</p>
                    <p className="text-xs">
                        {packageItem.promo_ends_at ? `berlaku sampai ${new Date(packageItem.promo_ends_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}` : 'promo terbatas'}
                    </p>
                </div>

                <div className="mt-2 flex items-end gap-1 text-[#2C2925]">
                    <p className="text-[15px]">Rp</p>
                    <p className="text-[34px] font-semibold leading-none">
                        {new Intl.NumberFormat('id-ID').format(packageItem.current_monthly_price)}
                    </p>
                    <p className="pb-1 text-sm">/ Bulan</p>
                </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-[#6F655A]">
                Pembayaran selanjutnya sebesar {formatCurrency(packageItem.annual_price)} (atau setara {formatCurrency(Math.round(packageItem.annual_price / 12))}/bulan)
            </p>

            <ul className="mt-5 space-y-2 border-b border-[#ECE6DE] pb-5">
                {packageItem.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[#2D2A26]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#8B7355]" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-4 flex items-center justify-between gap-3">
                <Link
                    href="/login"
                    className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-[#7D6A53] transition-colors hover:bg-[#F7F2EB]"
                >
                    Ajukan demo
                </Link>
                <Link
                    href={`/register?package=${packageItem.id}`}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-[#7D674E] px-5 text-sm font-medium text-white transition-colors hover:bg-[#6E5943]"
                >
                    Lanjutkan
                </Link>
            </div>
        </article>
    );
}
