'use client';

import { X } from 'lucide-react';
import { SuperadminActionButton } from '@/features/superadmin/presentation/components/SuperadminOverlay';

type NotificationTone = 'danger' | 'warning';

type NotificationItem = {
    highlight?: string;
    prefix: string;
    time: string;
    tone: NotificationTone;
};

const notificationItems: NotificationItem[] = [
    {
        prefix: 'Pembayaran gagal -',
        highlight: 'PT. Graha Notaris',
        time: '5 menit yang lalu',
        tone: 'danger',
    },
    {
        prefix: 'Tiket support baru dari',
        highlight: 'KN Budi santoso',
        time: '23 menit yang lalu',
        tone: 'warning',
    },
    {
        prefix: 'Job queue error: invoice generator gagal (3x retry)',
        time: '1 jam yang lalu',
        tone: 'danger',
    },
    {
        prefix: 'Tenant baru terdaftar -',
        highlight: 'CV Arsip Prima',
        time: '2 jam yang lalu',
        tone: 'danger',
    },
    {
        prefix: 'Tenant baru terdaftar -',
        highlight: 'CV Arsip Prima',
        time: '2 jam yang lalu',
        tone: 'danger',
    },
];

function NotificationDot({ tone }: Readonly<{ tone: NotificationTone }>) {
    return (
        <span
            className={`mt-1.5 inline-flex h-2 w-2 shrink-0 rounded-full ${
                tone === 'warning' ? 'bg-[#E0A030]' : 'bg-[#FF6161]'
            }`}
            aria-hidden="true"
        />
    );
}

export function SuperadminNotificationPopover({
    onClose,
}: Readonly<{
    onClose: () => void;
}>) {
    return (
        <div
            role="dialog"
            aria-label="Popup notifikasi"
            className="absolute right-0 top-full z-30 mt-3 w-[calc(100vw-2rem)] max-w-[347px] overflow-hidden rounded-[12px] border border-[#2D2D2D] bg-[#16181C] shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
        >
            <div className="flex items-center gap-3 border-b border-[#2D2D2D] px-4 py-3">
                <h2 className="flex-1 text-[16px] font-medium text-white">Notifikasi</h2>
                <button
                    type="button"
                    aria-label="Tutup notifikasi"
                    onClick={onClose}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-[#202328] hover:text-white"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="max-h-[min(26rem,70vh)] overflow-y-auto px-4">
                {notificationItems.map((item, index) => (
                    <div
                        key={`${item.prefix}-${index}`}
                        className="flex gap-3 border-b border-[#292929] py-3 last:border-b-0"
                    >
                        <NotificationDot tone={item.tone} />
                        <div className="min-w-0">
                            <p className="text-[12px] text-white">
                                <span className="font-light">{item.prefix}</span>
                                {item.highlight ? <span className="ml-1 font-medium">{item.highlight}</span> : null}
                            </p>
                            <p className="mt-1 text-[10px] text-[#9E9E9E]">{item.time}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end px-4 py-4">
                <SuperadminActionButton onClick={onClose}>Tutup</SuperadminActionButton>
            </div>
        </div>
    );
}
