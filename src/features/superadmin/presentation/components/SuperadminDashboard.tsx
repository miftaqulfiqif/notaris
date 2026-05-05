'use client';

import { useState } from 'react';
import { CircleAlert, X } from 'lucide-react';
import {
    SuperadminShell,
    SuperadminStatCard,
    SuperadminStatusBadge,
} from '@/features/superadmin/presentation/components/SuperadminShell';

import { useSuperadminDashboard } from '../../hooks/useSuperadminDashboard';
import { TrendDataPoint, RecentTransaction } from '../../types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/shared/hooks/useToast';
import { downloadCsv } from '../../utils/export';

function buildChartPath(values: number[]) {
    const width = 520;
    const height = 148;
    const maxValue = Math.max(...values, 1);

    const points = values.map((value, index) => {
        const x = values.length > 1 ? (index / (values.length - 1)) * width : width / 2;
        const y = height - (value / maxValue) * height;

        return { x, y };
    });

    const linePath = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
        .join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${height} L 0 ${height} Z`;

    return { areaPath, linePath };
}

function HeaderAction({ label, onClick }: Readonly<{ label: string; onClick?: () => void }>) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1 rounded-[8px] px-3 py-1 text-[12px] text-[#C9AA6F] transition-colors hover:bg-[#1B1E23] hover:text-[#DFC28E] sm:text-[14px]"
        >
            <span>{label}</span>
        </button>
    );
}

export function SuperadminDashboard() {
    const [isAlertVisible, setIsAlertVisible] = useState(true);
    const { stats, trend, recentTransactions, isLoading, error } = useSuperadminDashboard();
    const { showToast } = useToast();
    const router = useRouter();
    
    const chartValuesData = trend && trend.length ? trend.map((t: TrendDataPoint) => t.revenue) : [0];
    const xAxisLabelsData = trend && trend.length ? trend.map((t: TrendDataPoint) => t.date) : ['Belum ada data'];
    const totalTrendRevenue = chartValuesData.reduce((sum, value) => sum + value, 0);
    const averageTrendRevenue = chartValuesData.length ? totalTrendRevenue / chartValuesData.length : 0;
    const highestTrendRevenue = Math.max(...chartValuesData, 0);

    const chartSummaryData = [
        {
            label: 'Total 30 hari',
            value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalTrendRevenue),
        },
        {
            label: 'Rata-rata/hari',
            value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(averageTrendRevenue),
        },
        {
            label: 'Puncak harian',
            value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(highestTrendRevenue),
        },
        {
            label: 'Revenue bulan ini',
            value: stats?.monthly_revenue
                ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.monthly_revenue)
                : 'Rp 0',
        },
    ];
    
    const { areaPath, linePath } = buildChartPath(chartValuesData);

    if (isLoading) {
        return (
            <SuperadminShell activePage="dashboard" title="Dashboard">
                <div className="flex h-64 items-center justify-center">
                    <div className="text-[#6F6F6F]">Loading...</div>
                </div>
            </SuperadminShell>
        );
    }

    if (error) {
        return (
            <SuperadminShell activePage="dashboard" title="Dashboard">
                <div className="flex h-64 items-center justify-center">
                    <div className="text-[#FF5757]">{error}</div>
                </div>
            </SuperadminShell>
        );
    }

    return (
            <SuperadminShell activePage="dashboard" title="Dashboard">
            {isAlertVisible ? (
                <div className="flex flex-wrap items-start gap-3 rounded-[8px] border border-[#5C292B] bg-[#241618] px-3 py-3">
                    <CircleAlert className="h-5 w-5 shrink-0 text-[#EB3223]" />
                    <div className="min-w-0 flex-1 text-sm">
                        <span className="font-medium text-[#EB3223]">Alert :</span>{' '}
                        <span className="text-white">
                            Sistem berjalan normal.
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
                    value={stats?.active_tenants?.toString() || '0'}
                    footer={
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="flex items-center gap-1 text-[#797F8F]">
                                Dari total {stats?.total_tenants} tenant
                            </span>
                        </div>
                    }
                />
                <SuperadminStatCard
                    label="TRANSAKSI HARI INI"
                    value={stats?.transactions_today?.toString() || '0'}
                    footer={
                        <div className="flex items-center gap-2 text-[10px]">
                        </div>
                    }
                />
                <SuperadminStatCard
                    label="PENDAPATAN BULAN INI"
                    value={stats?.monthly_revenue ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.monthly_revenue) : 'Rp 0'}
                    footer={
                        <div className="flex items-center gap-2 text-[10px]">
                        </div>
                    }
                />
                <SuperadminStatCard
                    label="TIKET SUPPORT TERBUKA"
                    value={stats?.open_tickets?.toString() || '0'}
                    valueClassName={stats?.open_tickets && stats.open_tickets > 0 ? "text-[#E0A030]" : "text-white"}
                    footer={
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-[#797F8F]">Perlu ditindaklanjuti</span>
                        </div>
                    }
                />
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,0.95fr)]">
                <article className="rounded-[12px] border border-[#25282D] bg-[#16181C]">
                    <div className="flex flex-col gap-3 border-b border-[#303030] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-[16px] font-semibold text-white">Tren transaksi - 30 hari terakhir</h2>
                        <HeaderAction 
                            label="Ekspor CSV" 
                            onClick={() => {
                                if (trend && trend.length) {
                                    downloadCsv(trend as unknown as Record<string, unknown>[], 'tren_transaksi_30_hari');
                                    showToast({ variant: 'success', message: 'Data berhasil diekspor' });
                                } else {
                                    showToast({ variant: 'error', message: 'Belum ada data untuk diekspor' });
                                }
                            }} 
                        />
                    </div>

                    <div className="p-4">
                        <div className="relative h-[220px] overflow-hidden rounded-[10px] bg-[#16181C]">
                            <div className="absolute left-0 top-4 flex h-[148px] w-8 flex-col justify-between text-[11px] text-[rgba(56,60,71,0.87)]">
                                <span>{Math.max(...chartValuesData, 1)}</span>
                                <span>{Math.round(Math.max(...chartValuesData, 1) * 0.66)}</span>
                                <span>{Math.round(Math.max(...chartValuesData, 1) * 0.33)}</span>
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
                                {xAxisLabelsData.map((label: string, index: number) => (
                                    <span key={`${label}-${index}`}>{label}</span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4 border-t border-[#25282D] pt-4 sm:grid-cols-2 xl:grid-cols-4">
                            {chartSummaryData.map((item) => (
                                <div key={item.label} className="space-y-1">
                                    <p className="text-[12px] text-[#6F6F6F]">{item.label}</p>
                                    <p className="text-[16px] text-white">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </article>

                <article className="rounded-[12px] border border-[#25282D] bg-[#16181C]">
                    <div className="flex flex-col gap-3 border-b border-[#303030] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-[16px] font-semibold text-white">Notifikasi</h2>
                        <HeaderAction 
                            label="Lihat semua" 
                            onClick={() => {
                                showToast({ variant: 'info', message: 'Fitur halaman notifikasi lengkap segera hadir' });
                            }}
                        />
                    </div>
                    <div className="px-4 py-4 text-center text-[#6F6F6F] text-sm">
                        Belum ada notifikasi baru
                    </div>
                </article>
            </section>

            <section className="rounded-[12px] border border-[#25282D] bg-[#16181C]">
                <div className="flex flex-col gap-3 border-b border-[#303030] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-[16px] font-semibold text-white">Transaksi terbaru</h2>
                    <HeaderAction 
                        label="Lihat semua" 
                        onClick={() => router.push('/superadmin/transaksi')}
                    />
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
                            {recentTransactions.map((transaction: RecentTransaction) => (
                                <tr key={transaction.id} className="border-b border-[#303030] last:border-b-0">
                                    <td className="px-3 py-4 text-[14px] text-white">{transaction.tenant_name}</td>
                                    <td className="px-3 py-4 text-[14px] text-[#757C8B]">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(transaction.amount)}
                                    </td>
                                    <td className="px-3 py-4 text-[14px] text-[#757C8B]">{transaction.method}</td>
                                    <td className="px-3 py-4">
                                        <SuperadminStatusBadge 
                                            tone={transaction.status === 'success' ? 'success' : transaction.status === 'failed' || transaction.status === 'refund' ? 'danger' : 'warning'} 
                                            value={transaction.status} 
                                        />
                                    </td>
                                </tr>
                            ))}
                            {recentTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-3 py-8 text-center text-[14px] text-[#6F6F6F]">
                                        Belum ada transaksi
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </SuperadminShell>
    );
}
