'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, ChevronRight, CircleAlert, X } from 'lucide-react';
import {
    SuperadminShell,
    SuperadminStatCard,
    SuperadminStatusBadge,
} from '@/features/superadmin/presentation/components/SuperadminShell';

type NotificationTone = 'danger' | 'warning' | 'success';
type NotificationItem = {
    actionLabel: string;
    company: string;
    timeLabel: string;
    title: string;
    tone: NotificationTone;
};
type TransactionItem = {
    amount: string;
    method: string;
    status: string;
    statusTone: 'danger' | 'success' | 'warning';
    tenant: string;
};

const chartValues = [24, 35, 28, 14, 19, 34, 37, 41, 36, 33, 35, 17, 31, 47, 40];
const xAxisLabels = ['1 Jan', '5 Jan', '10 Jan', '15 Jan', '20 Jan', '25 Jan', '30 Jan'];

const chartSummary = [
    { label: 'Total 30 hari', value: '1.247' },
    { label: 'Avg/hari', value: '41.6' },
    { label: 'Eror Rate', value: '5.2%', tone: 'text-[#FF5757]' },
    { label: 'Revenue', value: '1.247' },
];

const notificationItems: NotificationItem[] = [
    {
        title: 'Pembayaran gagal -',
        company: 'PT Graha Notaris',
        timeLabel: '5 menit yang lalu',
        actionLabel: 'Lihat transaksi',
        tone: 'danger',
    },
    {
        title: 'Tiket support baru dari',
        company: 'KN Budi S.',
        timeLabel: '23 menit lalu',
        actionLabel: 'Buka Ticket',
        tone: 'warning',
    },
    {
        title: 'Job queue error: invoice generator gagal',
        company: '',
        timeLabel: '1 jam yang lalu',
        actionLabel: 'Lihat Log',
        tone: 'danger',
    },
    {
        title: 'Tenant baru -',
        company: 'CV Arsip Prima',
        timeLabel: '2 jam yang lalu',
        actionLabel: 'Detail',
        tone: 'success',
    },
];

const transactionItems: TransactionItem[] = [
    {
        tenant: 'PT Graha Notaris',
        amount: 'Rp 500.000',
        method: 'Transfer',
        status: 'Gagal',
        statusTone: 'danger',
    },
    {
        tenant: 'KN Surya Hukum',
        amount: 'Rp 500.000',
        method: 'Qris',
        status: 'Sukses',
        statusTone: 'success',
    },
    {
        tenant: 'CV Legaltama',
        amount: 'Rp 500.000',
        method: 'VA BCA',
        status: 'Sukses',
        statusTone: 'success',
    },
    {
        tenant: 'Notaris Dewi A.',
        amount: 'Rp 500.000',
        method: 'Transfer',
        status: 'Pending',
        statusTone: 'warning',
    },
];

function NotificationDot({ tone }: Readonly<{ tone: NotificationTone }>) {
    const toneClassName =
        tone === 'danger' ? 'bg-[#FF5C64]' : tone === 'warning' ? 'bg-[#E0A030]' : 'bg-[#3DBA7E]';

    return <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${toneClassName}`} aria-hidden="true" />;
}

function NotificationRow({
    actionLabel,
    company,
    timeLabel,
    title,
    tone,
}: Readonly<NotificationItem>) {
    return (
        <div className="flex gap-3 border-b border-[#303030] py-4 last:border-b-0">
            <NotificationDot tone={tone} />
            <div className="min-w-0 flex-1">
                <p className="text-[12px] text-white">
                    {title}{' '}
                    {company ? <span className="font-semibold">{company}</span> : null}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[#6F6F6F]">
                    <span>{timeLabel}</span>
                    <span className="hidden text-[12px] sm:inline">•</span>
                    <button type="button" className="inline-flex items-center gap-1 text-[12px] text-[#C9AA6F] hover:text-[#DFC28E]">
                        {actionLabel}
                        <ChevronRight className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function buildChartPath(values: number[]) {
    const width = 520;
    const height = 148;
    const maxValue = 60;

    const points = values.map((value, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = height - (value / maxValue) * height;

        return { x, y };
    });

    const linePath = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
        .join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${height} L 0 ${height} Z`;

    return { areaPath, linePath };
}

function HeaderAction({ label }: Readonly<{ label: string }>) {
    return (
        <button
            type="button"
            className="inline-flex items-center gap-1 rounded-[8px] px-3 py-1 text-[12px] text-[#C9AA6F] transition-colors hover:bg-[#1B1E23] hover:text-[#DFC28E] sm:text-[14px]"
        >
            <span>{label}</span>
        </button>
    );
}

export function SuperadminDashboard() {
    const [isAlertVisible, setIsAlertVisible] = useState(true);
    const { areaPath, linePath } = useMemo(() => buildChartPath(chartValues), []);

    return (
            <SuperadminShell activePage="dashboard" title="Dashboard">
            {isAlertVisible ? (
                <div className="flex flex-wrap items-start gap-3 rounded-[8px] border border-[#5C292B] bg-[#241618] px-3 py-3">
                    <CircleAlert className="h-5 w-5 shrink-0 text-[#EB3223]" />
                    <div className="min-w-0 flex-1 text-sm">
                        <span className="font-medium text-[#EB3223]">Alert :</span>{' '}
                        <span className="text-white">
                            Error rate payment gateway 5.2% melampaui threshold. 3 transaksi pending perlu ditinjau.
                        </span>
                    </div>
                    <button
                        type="button"
                        aria-label="Tutup alert"
                        onClick={() => setIsAlertVisible(false)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded text-[#7C6263] transition-colors hover:text-white sm:self-auto"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : null}

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SuperadminStatCard
                    label="TENANT AKTIF"
                    value="284"
                    footer={
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="flex items-center gap-1 font-medium text-[#3DBA7E]">
                                <ArrowUpRight className="h-3 w-3" />
                                4.1%
                            </span>
                            <span className="text-[#797F8F]">vs bulan lalu</span>
                        </div>
                    }
                />
                <SuperadminStatCard
                    label="TRANSAKSI HARI INI"
                    value="47"
                    footer={
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="flex items-center gap-1 font-medium text-[#3DBA7E]">
                                <ArrowUpRight className="h-3 w-3" />
                                12%
                            </span>
                            <span className="text-[#797F8F]">vs kemarin</span>
                        </div>
                    }
                />
                <SuperadminStatCard
                    label="PENDAPATAN BULAN INI"
                    value="Rp 218 jt"
                    footer={
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="flex items-center gap-1 font-medium text-[#3DBA7E]">
                                <ArrowUpRight className="h-3 w-3" />
                                8.7%
                            </span>
                            <span className="text-[#797F8F]">Bulan lalu</span>
                        </div>
                    }
                />
                <SuperadminStatCard
                    label="TIKET SUPPORT TERBUKA"
                    value="7"
                    valueClassName="text-[#E0A030]"
                    footer={
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="font-medium text-[#E0A030]">+3</span>
                            <span className="text-[#797F8F]">Baru hari ini</span>
                        </div>
                    }
                />
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,0.95fr)]">
                <article className="rounded-[12px] border border-[#25282D] bg-[#16181C]">
                    <div className="flex flex-col gap-3 border-b border-[#303030] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-[16px] font-semibold text-white">Tren transaksi - 30 hari terakhir</h2>
                        <HeaderAction label="Ekspor CSV" />
                    </div>

                    <div className="p-4">
                        <div className="relative h-[220px] overflow-hidden rounded-[10px] bg-[#16181C]">
                            <div className="absolute left-0 top-4 flex h-[148px] w-8 flex-col justify-between text-[11px] text-[rgba(56,60,71,0.87)]">
                                <span>60</span>
                                <span>40</span>
                                <span>20</span>
                                <span>0</span>
                            </div>

                            <div className="ml-8 h-[148px]">
                                <svg viewBox="0 0 520 148" className="h-full w-full" preserveAspectRatio="none" aria-label="Grafik tren transaksi 30 hari terakhir">
                                    <defs>
                                        <linearGradient id="superadmin-trend-fill" x1="260" x2="260" y1="0" y2="148" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#C9AA6F" stopOpacity="0.35" />
                                            <stop offset="1" stopColor="#C9AA6F" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    {[0, 49, 98, 147].map((y) => (
                                        <line
                                            key={y}
                                            x1="0"
                                            x2="520"
                                            y1={y}
                                            y2={y}
                                            stroke="#2A2E36"
                                            strokeWidth="1"
                                        />
                                    ))}
                                    <path d={areaPath} fill="url(#superadmin-trend-fill)" />
                                    <path
                                        d={linePath}
                                        fill="none"
                                        stroke="#C9AA6F"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </div>

                            <div className="ml-8 mt-3 flex justify-between text-[11px] text-[rgba(56,60,71,0.87)]">
                                {xAxisLabels.map((label) => (
                                    <span key={label}>{label}</span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4 border-t border-[#25282D] pt-4 sm:grid-cols-2 xl:grid-cols-4">
                            {chartSummary.map((item) => (
                                <div key={item.label} className="space-y-1">
                                    <p className="text-[12px] text-[#6F6F6F]">{item.label}</p>
                                    <p className={`text-[16px] ${item.tone ?? 'text-white'}`}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </article>

                <article className="rounded-[12px] border border-[#25282D] bg-[#16181C]">
                    <div className="flex flex-col gap-3 border-b border-[#303030] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-[16px] font-semibold text-white">Notifikasi</h2>
                        <HeaderAction label="Lihat semua" />
                    </div>
                    <div className="px-4">
                        {notificationItems.map((item) => (
                            <NotificationRow key={`${item.title}-${item.company}`} {...item} />
                        ))}
                    </div>
                </article>
            </section>

            <section className="rounded-[12px] border border-[#25282D] bg-[#16181C]">
                <div className="flex flex-col gap-3 border-b border-[#303030] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-[16px] font-semibold text-white">Transaksi terbaru</h2>
                    <HeaderAction label="Lihat semua" />
                </div>

                <div className="overflow-x-auto p-4">
                    <table className="w-full min-w-[560px] border-collapse">
                        <thead>
                            <tr className="border-b border-[#303030] text-left text-[12px] uppercase text-[#797F8F]">
                                <th className="px-3 py-3 font-normal">Tenant</th>
                                <th className="px-3 py-3 font-normal">Jumlah</th>
                                <th className="px-3 py-3 font-normal">Metode</th>
                                <th className="px-3 py-3 font-normal">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactionItems.map((transaction) => (
                                <tr key={transaction.tenant} className="border-b border-[#303030] last:border-b-0">
                                    <td className="px-3 py-4 text-[14px] text-white">{transaction.tenant}</td>
                                    <td className="px-3 py-4 text-[14px] text-[#757C8B]">{transaction.amount}</td>
                                    <td className="px-3 py-4 text-[14px] text-[#757C8B]">{transaction.method}</td>
                                    <td className="px-3 py-4">
                                        <SuperadminStatusBadge tone={transaction.statusTone} value={transaction.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </SuperadminShell>
    );
}
