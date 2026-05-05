'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, LogOut, Menu, X } from 'lucide-react';
import { useOptionalAuthContext } from '@/features/auth/context/auth.context';
import { superadminApi } from '@/features/superadmin/services/superadmin-api';
import { getUserRoleName } from '@/features/auth/utils/user';
import { SuperadminNotificationPopover } from '@/features/superadmin/presentation/components/SuperadminNotificationPopover';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import { useToast } from '@/shared/hooks/useToast';

export type SuperadminPageId =
    | 'dashboard'
    | 'transactions'
    | 'tenants'
    | 'billingInvoices'
    | 'subscriptionPackages'
    | 'reports'
    | 'support';
export type SuperadminStatusTone = 'danger' | 'success' | 'warning' | 'muted' | 'info';

type SuperadminShellProps = {
    activePage: SuperadminPageId;
    children: ReactNode;
    headerActions?: ReactNode;
    title: string;
};

type SidebarItem = {
    badge?: string;
    href?: string;
    id?: SuperadminPageId;
    label: string;
};

type SidebarSection = {
    items: SidebarItem[];
    label: string;
};

type SidebarBadgeCounts = {
    subscriptionPackages: number;
    support: number;
};

type SuperadminStatCardProps = {
    footer?: ReactNode;
    label: string;
    value: string;
    valueClassName?: string;
};

const WITA_TIME_ZONE = 'Asia/Makassar';

const emptySidebarBadgeCounts: SidebarBadgeCounts = {
    subscriptionPackages: 0,
    support: 0,
};

const toSidebarBadge = (count: number) => (count > 0 ? String(count) : undefined);

const buildSidebarSections = (badgeCounts: SidebarBadgeCounts): SidebarSection[] => [
    {
        label: 'UTAMA',
        items: [
            { href: '/superadmin', id: 'dashboard', label: 'Dashboard' },
            { href: '/superadmin/transaksi', id: 'transactions', label: 'Transaksi' },
        ],
    },
    {
        label: 'PLATFORM',
        items: [
            { href: '/superadmin/tenants', id: 'tenants', label: 'Tenants' },
            { href: '/superadmin/billing-invoices', id: 'billingInvoices', label: 'Billing Invoices' },
            {
                badge: toSidebarBadge(badgeCounts.subscriptionPackages),
                href: '/superadmin/paket-langganan',
                id: 'subscriptionPackages',
                label: 'Paket Langganan',
            },
        ],
    },
    {
        label: 'OPERASIONAL',
        items: [
            { href: '/superadmin/laporan', id: 'reports', label: 'Laporan' },
            {
                badge: toSidebarBadge(badgeCounts.support),
                href: '/superadmin/support',
                id: 'support',
                label: 'Support',
            },
            { label: 'Integrasi & API' },
        ],
    },
];

function formatDateTime(now: Date | null) {
    if (!now) {
        return {
            dateLabel: 'Memuat waktu...',
            timeLabel: '-- : -- WITA',
        };
    }

    const dateLabel = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: WITA_TIME_ZONE,
    }).format(now);
    const timeParts = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: WITA_TIME_ZONE,
    }).formatToParts(now);
    const hour = timeParts.find((part) => part.type === 'hour')?.value ?? '--';
    const minute = timeParts.find((part) => part.type === 'minute')?.value ?? '--';

    return {
        dateLabel: dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1),
        timeLabel: `${hour} : ${minute} WITA`,
    };
}

function DashboardLogo() {
    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#111317] ring-1 ring-[#25282D]">
            <Image
                src="/Logo.png"
                alt="Notarix logo"
                width={40}
                height={40}
                className="h-full w-full object-contain"
                priority
            />
        </div>
    );
}

function SidebarSectionTitle({ children }: Readonly<{ children: string }>) {
    return <p className="text-[12px] tracking-[0.04em] text-[#383C47]">{children}</p>;
}

function SidebarAction({
    activePage,
    item,
    onNavigate,
}: Readonly<{
    activePage: SuperadminPageId;
    item: SidebarItem;
    onNavigate?: () => void;
}>) {
    const { showToast } = useToast();
    const isActive = item.id === activePage;
    const sharedClassName = `flex w-full items-center gap-3 rounded-[8px] px-3 py-3 text-left text-[14px] transition-colors ${
        isActive
            ? 'bg-[#2B2A26] text-[#C99D4B]'
            : 'text-[#797F8F] hover:bg-[#1B1E23] hover:text-[#D4D4D4]'
    }`;

    const content = (
        <>
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF5757] px-1 text-[10px] font-bold text-white">
                    {item.badge}
                </span>
            ) : null}
        </>
    );

    if (item.href) {
        return (
            <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={sharedClassName}
                onClick={onNavigate}
            >
                {content}
            </Link>
        );
    }

    return (
        <button 
            type="button" 
            className={sharedClassName}
            onClick={() => {
                if (!item.href) {
                    showToast({ variant: 'info', message: `Fitur ${item.label} segera hadir` });
                }
                onNavigate?.();
            }}
        >
            {content}
        </button>
    );
}

function SidebarContent({
    activePage,
    onNavigate,
    sections,
}: Readonly<{
    activePage: SuperadminPageId;
    onNavigate?: () => void;
    sections: SidebarSection[];
}>) {
    return (
        <>
            <div className="border-b border-[#25282D] px-1 py-4">
                <div className="flex items-center gap-2">
                    <DashboardLogo />
                    <p className="text-[14px] text-[#D4D4D4]">Master Admin Panel</p>
                </div>
            </div>

            <div className="space-y-6 py-5">
                {sections.map((section) => (
                    <div key={section.label} className="space-y-2">
                        <SidebarSectionTitle>{section.label}</SidebarSectionTitle>
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <SidebarAction
                                    key={`${section.label}-${item.label}`}
                                    activePage={activePage}
                                    item={item}
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-auto border-t border-[#25282D] pt-4">
                <UserCard />
            </div>
        </>
    );
}

function getUserInitials(name?: string | null) {
    if (!name) {
        return 'SA';
    }

    const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    if (!parts.length) {
        return 'SA';
    }

    return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

function UserCard() {
    const authContext = useOptionalAuthContext();
    const user = authContext?.user;
    const userRole = getUserRoleName(user) ?? 'SUPERADMIN';
    const userSubtitle = user?.email ?? user?.username ?? 'superadmin@example.com';
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (!authContext?.logout) {
            setIsConfirmOpen(false);
            return;
        }

        setIsLoggingOut(true);

        try {
            await authContext.logout();
        } finally {
            setIsLoggingOut(false);
            setIsConfirmOpen(false);
        }
    };

    return (
        <>
            <div className="rounded-[8px] bg-[#0F1012] p-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-linear-to-br from-[#C99D4B] via-[#8D6A38] to-[#3E2E18] text-sm font-semibold text-white">
                        {getUserInitials(user?.name)}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-[14px] text-white">{user?.name ?? 'Super Admin'}</p>
                        <p className="truncate text-[10px] uppercase tracking-[0.04em] text-[#858585]">{userRole}</p>
                        <p className="truncate text-[10px] text-[#6F6F6F]">{userSubtitle}</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsConfirmOpen(true)}
                    disabled={isLoggingOut}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#3B3F48] bg-[#15171B] px-3 py-2 text-[12px] font-medium text-[#D7D9DE] transition-colors hover:border-[#C99D4B] hover:text-[#C99D4B] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    {isLoggingOut ? 'Memproses...' : 'Keluar'}
                </button>
            </div>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                title="Keluar dari akun"
                message="Apakah anda yakin ingin keluar dari panel superadmin?"
                confirmText={isLoggingOut ? 'Memproses...' : 'Ya, Keluar'}
                cancelText="Batal"
                type="danger"
                onConfirm={() => {
                    void handleLogout();
                }}
                onCancel={() => {
                    if (!isLoggingOut) {
                        setIsConfirmOpen(false);
                    }
                }}
            />
        </>
    );
}

export function SuperadminStatCard({
    footer,
    label,
    value,
    valueClassName = 'text-white',
}: Readonly<SuperadminStatCardProps>) {
    return (
        <article className="rounded-[12px] border border-[#25282D] bg-[#16181C] px-4 py-5">
            <p className="text-[14px] uppercase tracking-[0.02em] text-[#383C47]">{label}</p>
            <p className={`mt-4 text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-none ${valueClassName}`}>
                {value}
            </p>
            {footer ? <div className="mt-5">{footer}</div> : null}
        </article>
    );
}

export function SuperadminStatusBadge({
    tone,
    value,
}: Readonly<{
    tone: SuperadminStatusTone;
    value: string;
}>) {
    const toneClassName =
        tone === 'danger'
            ? 'border-[#E05A5A] bg-[#2B1F22] text-[#E05A5A]'
            : tone === 'warning'
              ? 'border-[#E0A030] bg-[#2B261E] text-[#E0A030]'
              : tone === 'info'
                ? 'border-[#317FE0] bg-[#1D2630] text-[#317FE0]'
                : tone === 'muted'
                  ? 'border-[#6F6F6F] bg-[#202328] text-[#6F6F6F]'
                  : 'border-[#3CB057] bg-[#1A2926] text-[#3CB057]';

    return (
        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${toneClassName}`}>
            {value}
        </span>
    );
}

export function SuperadminShell({
    activePage,
    children,
    headerActions,
    title,
}: Readonly<SuperadminShellProps>) {
    const [now, setNow] = useState<Date | null>(null);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sidebarBadgeCounts, setSidebarBadgeCounts] = useState<SidebarBadgeCounts>(emptySidebarBadgeCounts);
    const notificationRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const updateTime = () => {
            setNow(new Date());
        };

        updateTime();
        const timer = window.setInterval(updateTime, 60_000);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        if (!isNotificationOpen) {
            return undefined;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target as Node)
            ) {
                setIsNotificationOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isNotificationOpen]);

    useEffect(() => {
        let mounted = true;

        const fetchSidebarBadgeCounts = async () => {
            try {
                const [packagesResponse, ticketStatsResponse] = await Promise.all([
                    superadminApi.getPackages(),
                    superadminApi.getTicketStats(),
                ]);

                if (!mounted) {
                    return;
                }

                setSidebarBadgeCounts({
                    subscriptionPackages: packagesResponse.data?.length ?? 0,
                    support: ticketStatsResponse.data?.open_tickets ?? 0,
                });
            } catch {
                if (!mounted) {
                    return;
                }

                setSidebarBadgeCounts(emptySidebarBadgeCounts);
            }
        };

        void fetchSidebarBadgeCounts();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!isSidebarOpen) {
            return undefined;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsSidebarOpen(false);
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSidebarOpen]);

    const { dateLabel, timeLabel } = useMemo(() => formatDateTime(now), [now]);
    const sidebarSections = useMemo(() => buildSidebarSections(sidebarBadgeCounts), [sidebarBadgeCounts]);

    return (
        <div className="min-h-screen bg-[#0F1012] text-white">
            <div className="flex min-h-screen flex-col lg:flex-row">
                <aside className="hidden shrink-0 border-r border-[#25282D] bg-[#16181C] px-3 py-3 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[240px] lg:flex-col">
                    <SidebarContent activePage={activePage} sections={sidebarSections} />
                </aside>

                <main className="min-w-0 flex-1">
                    <header className="sticky top-0 z-20 border-b border-[#25282D] bg-[#0F1012]/95 px-4 py-4 backdrop-blur-md sm:px-6">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <button
                                    type="button"
                                    aria-label="Buka navigasi superadmin"
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#797F8F] bg-[#16181C] text-[#C7CBD6] transition-colors hover:border-[#C99D4B] hover:text-[#C99D4B] lg:hidden"
                                >
                                    <Menu className="h-4 w-4" />
                                </button>
                                <h1 className="truncate text-[28px] font-semibold leading-none text-white sm:text-[32px]">{title}</h1>
                            </div>
                            <div className="flex w-full flex-wrap items-center gap-3 self-start sm:gap-4 lg:w-auto lg:justify-end lg:self-auto">
                                <div className="hidden items-center gap-3 text-[12px] text-[#797F8F] xl:flex">
                                    <span suppressHydrationWarning>{dateLabel}</span>
                                    <span className="text-[24px] leading-none">•</span>
                                    <span suppressHydrationWarning>{timeLabel}</span>
                                </div>
                                {headerActions}
                                <div ref={notificationRef} className="relative">
                                    <button
                                        type="button"
                                        aria-label="Buka notifikasi"
                                        aria-expanded={isNotificationOpen}
                                        aria-haspopup="dialog"
                                        onClick={() => setIsNotificationOpen((value) => !value)}
                                        className={`inline-flex h-10 w-10 items-center justify-center rounded-[10px] border bg-[#16181C] text-[#C7CBD6] transition-colors ${
                                            isNotificationOpen
                                                ? 'border-[#C99D4B] text-[#C99D4B]'
                                                : 'border-[#797F8F] hover:border-[#C99D4B] hover:text-[#C99D4B]'
                                        }`}
                                    >
                                        <Bell className="h-4 w-4" />
                                    </button>
                                    {isNotificationOpen ? (
                                        <SuperadminNotificationPopover onClose={() => setIsNotificationOpen(false)} />
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="space-y-4 px-4 py-4 sm:px-6">
                        {children}
                    </div>
                </main>
            </div>

            {isSidebarOpen ? (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <aside
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigasi superadmin"
                        className="flex h-full w-[280px] max-w-[85vw] flex-col bg-[#16181C] px-3 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
                        onClick={(event: ReactMouseEvent<HTMLElement>) => event.stopPropagation()}
                    >
                        <div className="mb-2 flex justify-end">
                            <button
                                type="button"
                                aria-label="Tutup navigasi superadmin"
                                onClick={() => setIsSidebarOpen(false)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#797F8F] bg-[#16181C] text-[#C7CBD6] transition-colors hover:border-[#C99D4B] hover:text-[#C99D4B]"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <SidebarContent activePage={activePage} onNavigate={() => setIsSidebarOpen(false)} sections={sidebarSections} />
                    </aside>
                </div>
            ) : null}
        </div>
    );
}
