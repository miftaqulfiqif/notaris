'use client';

import type { PaymentMethodGroup as PaymentMethodGroupType } from '../../types/billing.types';
import { PaymentMethodItem } from './PaymentMethodItem';

export function PaymentMethodGroup({
    group,
    isOpen,
    onSelectChannel,
    onToggle,
    selectedChannel,
}: Readonly<{
    group: PaymentMethodGroupType;
    isOpen: boolean;
    onSelectChannel: (channelCode: string) => void;
    onToggle: (groupName: string) => void;
    selectedChannel: string | null;
}>) {
    return (
        <section className="overflow-hidden rounded-[18px] border border-[#E8DED3] bg-white">
            <button
                type="button"
                onClick={() => onToggle(group.group)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
                <span className="text-base font-semibold text-[#2D2925]">{group.label}</span>
                <span className={`text-xl text-[#7C7064] transition-transform ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
            </button>

            {isOpen ? (
                <div className="space-y-3 border-t border-[#F0E7DD] px-4 py-4">
                    {group.channels.map((channel) => (
                        <PaymentMethodItem
                            key={channel.code}
                            channel={channel}
                            isSelected={selectedChannel === channel.code}
                            onSelect={onSelectChannel}
                        />
                    ))}
                </div>
            ) : null}
        </section>
    );
}
