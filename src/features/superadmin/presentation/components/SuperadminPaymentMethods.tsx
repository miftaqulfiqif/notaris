'use client';

import { CreditCard, QrCode, Store, WalletCards } from 'lucide-react';
import { useSuperadminPaymentMethods } from '@/features/superadmin/hooks/useSuperadminPaymentMethods';
import type { PaymentMethodGroup } from '@/features/superadmin/types';
import { SuperadminShell, SuperadminStatusBadge } from './SuperadminShell';

const groupIcons = {
    card: CreditCard,
    convenience_store: Store,
    ewallet: WalletCards,
    qris: QrCode,
};

function PaymentMethodGroupCard({
    group,
    onToggle,
    updatingCode,
}: Readonly<{
    group: PaymentMethodGroup;
    onToggle: (code: string, isEnabled: boolean) => void;
    updatingCode: string | null;
}>) {
    const Icon = groupIcons[group.group as keyof typeof groupIcons] ?? CreditCard;
    const enabledCount = group.channels.filter((channel) => channel.is_enabled).length;

    return (
        <section className="overflow-hidden rounded-[12px] border border-[#25282D] bg-[#16181C]">
            <header className="flex items-center justify-between border-b border-[#25282D] px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#202328] text-[#C9AA6F]">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-[15px] font-semibold text-white">{group.label}</h2>
                        <p className="text-[12px] text-[#797F8F]">
                            {enabledCount} dari {group.channels.length} channel aktif
                        </p>
                    </div>
                </div>
                <SuperadminStatusBadge
                    tone={enabledCount > 0 ? 'success' : 'muted'}
                    value={enabledCount > 0 ? 'Aktif' : 'Nonaktif'}
                />
            </header>

            <div className="divide-y divide-[#25282D]">
                {group.channels.map((channel) => {
                    const isUpdating = updatingCode === channel.code;

                    return (
                        <div key={channel.code} className="flex items-center justify-between gap-4 px-4 py-3">
                            <div>
                                <p className="text-[14px] font-medium text-white">{channel.label}</p>
                                <p className="text-[12px] text-[#6F6F6F]">{channel.code}</p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={channel.is_enabled}
                                aria-label={`${channel.is_enabled ? 'Nonaktifkan' : 'Aktifkan'} ${channel.label}`}
                                disabled={isUpdating}
                                onClick={() => onToggle(channel.code, !channel.is_enabled)}
                                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                                    channel.is_enabled ? 'bg-[#C9AA6F]' : 'bg-[#3B3F48]'
                                }`}
                            >
                                <span
                                    className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                                        channel.is_enabled ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export function SuperadminPaymentMethods() {
    const { error, groups, isLoading, updatePaymentMethod, updatingCode } = useSuperadminPaymentMethods();

    const handleToggle = (code: string, isEnabled: boolean) => {
        void updatePaymentMethod(code, isEnabled);
    };

    if (isLoading) {
        return (
            <SuperadminShell activePage="paymentMethods" title="Metode Pembayaran">
                <div className="flex h-64 items-center justify-center text-[#6F6F6F]">
                    Loading...
                </div>
            </SuperadminShell>
        );
    }

    return (
        <SuperadminShell activePage="paymentMethods" title="Metode Pembayaran">
            {error ? (
                <div className="rounded-[12px] border border-[#7A3030] bg-[#2B1F22] px-4 py-3 text-[14px] text-[#E05A5A]">
                    {error}
                </div>
            ) : null}

            <section className="grid gap-3 xl:grid-cols-2">
                {groups.map((group) => (
                    <PaymentMethodGroupCard
                        key={group.group}
                        group={group}
                        onToggle={handleToggle}
                        updatingCode={updatingCode}
                    />
                ))}
            </section>
        </SuperadminShell>
    );
}
