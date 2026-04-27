'use client';

import type { PaymentMethodChannel } from '../../types/billing.types';

export function PaymentMethodItem({
    channel,
    isSelected,
    onSelect,
}: Readonly<{
    channel: PaymentMethodChannel;
    isSelected: boolean;
    onSelect: (channelCode: string) => void;
}>) {
    return (
        <button
            type="button"
            onClick={() => onSelect(channel.code)}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                isSelected
                    ? 'border-[#8B7355] bg-[#F8F4EE] text-[#2D2925]'
                    : 'border-[#E8DED3] bg-white text-[#4C443C] hover:border-[#C9B69D]'
            }`}
        >
            <span className="text-sm font-medium">{channel.label}</span>
            <span
                className={`inline-flex h-4 w-4 rounded-full border ${
                    isSelected ? 'border-[#8B7355] bg-[#8B7355]' : 'border-[#CFC3B4] bg-transparent'
                }`}
            />
        </button>
    );
}
