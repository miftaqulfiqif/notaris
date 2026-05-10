'use client';

import { ChevronDown, Search, Download } from 'lucide-react';
import {
    SuperadminShell,
    SuperadminStatCard,
    SuperadminStatusBadge,
} from '@/features/superadmin/presentation/components/SuperadminShell';

import { useToast } from '@/shared/hooks/useToast';
import { useSuperadminBilling } from '../../hooks/useSuperadminBilling';
import { InvoiceRecord as InvoiceType, RevenueData } from '../../types';
import { downloadInvoicePdf } from '../../utils/export';

type InvoiceStatusFilter = 'all' | 'paid' | 'overdue' | 'pending' | 'expired';
type RevenueBarTone = 'dim' | 'soft' | 'accent';

const statusOptions: { label: string; value: InvoiceStatusFilter }[] = [
    { label: 'Semua status', value: 'all' },
    { label: 'Lunas', value: 'paid' },
    { label: 'Jatuh Tempo', value: 'overdue' },
    { label: 'Tertunda', value: 'pending' },
    { label: 'Expired', value: 'expired' },
];

function SelectField({
    ariaLabel,
    onChange,
    options,
    value,
}: Readonly<{
    ariaLabel: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    value: string;
    }>) {
    return (
        <div className="relative w-full sm:min-w-[160px]">
            <select
                aria-label={ariaLabel}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-8 w-full appearance-none rounded-[8px] border border-[#212121] bg-[#0E0F11] px-3 pr-8 text-[12px] text-[#6F6F6F] outline-none transition-colors hover:border-[#3B414D] focus:border-[#C99D4B]"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6F6F6F]" />
        </div>
    );
}

function InvoiceActionButton({
    status,
    onDownload
}: Readonly<{
    status: string;
    onDownload: () => void;
}>) {
    if (status !== 'paid' && status !== 'success') {
        return null;
    }

    return (
        <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-1 rounded-[8px] px-3 py-1 text-[14px] text-[#C9AA6F] transition-colors hover:bg-[#1E2127] hover:text-[#E3C28A]"
        >
            unduh
            <Download className="h-4 w-4" />
        </button>
    );
}

const BAR_MAX_HEIGHT = 100;

function RevenueBarItem({
    heightPercent,
    label,
    tone,
}: Readonly<{
    heightPercent: number;
    label: string;
    tone: RevenueBarTone;
}>) {
    const colorClassName =
        tone === 'accent'
            ? 'bg-[#C9A96E]'
            : tone === 'soft'
              ? 'bg-[rgba(201,169,110,0.6)]'
              : 'bg-[rgba(201,169,110,0.27)]';

    const barHeight = Math.max(8, Math.round((heightPercent / 100) * BAR_MAX_HEIGHT));

    return (
        <div className="flex flex-1 flex-col items-center justify-end gap-2">
            <div className={`w-full rounded-[4px] ${colorClassName}`} style={{ height: `${barHeight}px` }} />
            <p className="text-[12px] text-white">{label}</p>
        </div>
    );
}

export function SuperadminBillingInvoices() {
    const {
        invoices,
        stats,
        revenueTrend,
        aging,
        isLoading,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        markAsPaid,
        isMarkingPaid
    } = useSuperadminBilling();
    const { showToast } = useToast();

    const maxRevenue = revenueTrend.length > 0 ? Math.max(...revenueTrend.map((trendPoint) => trendPoint.revenue), 1) : 1;
    const mappedRevenueBars = revenueTrend.map((trendPoint: RevenueData, index: number) => {
        const heightPercent = maxRevenue > 0 ? (trendPoint.revenue / maxRevenue) * 100 : 0;
        return {
            heightPercent,
            label: trendPoint.month,
            tone: index === revenueTrend.length - 1 ? 'accent' : index === revenueTrend.length - 2 ? 'soft' : 'dim' as RevenueBarTone,
        };
    });

    const mappedAging = [
        { label: '0-30 hari', amount: aging?.[0]?.value || 0 },
        { label: '31-60 hari', amount: aging?.[1]?.value || 0, valueClassName: 'text-[#E0A030]' },
        { label: '61-90 hari', amount: aging?.[2]?.value || 0, valueClassName: 'text-[#E05A5A]' },
        { label: '>90 hari', amount: aging?.[3]?.value || 0, valueClassName: 'text-[#FF6B71]' },
    ];

    if (isLoading) {
        return (
            <SuperadminShell activePage="billingInvoices" title="Billing & Invoice">
                <div className="flex h-64 items-center justify-center text-[#6F6F6F]">
                    Loading...
                </div>
            </SuperadminShell>
        );
    }

    return (
        <SuperadminShell activePage="billingInvoices" title="Billing & Invoice">
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SuperadminStatCard
                    label="TOTAL INVOICE"
                    value={stats?.total_invoices?.toString() || '0'}
                />
                <SuperadminStatCard
                    label="TERTUNDA"
                    value={stats?.pending_invoices?.toString() || '0'}
                    valueClassName="text-[#E0A030]"
                />
                <SuperadminStatCard
                    label="JATUH TEMPO"
                    value={stats?.overdue_invoices?.toString() || '0'}
                    valueClassName="text-[#FF6B71]"
                    footer={<p className="text-[10px] text-[#797F8F]">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats?.overdue_value || 0)}</p>}
                />
                <SuperadminStatCard
                    label="SUDAH DIBAYAR"
                    value={stats?.paid_invoices?.toString() || '0'}
                    valueClassName="text-[#4ADE80]"
                />
            </section>

            <section className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_370px]">
                <div className="min-w-0 overflow-hidden rounded-[12px] border border-[#25282D] bg-[#16181C] xl:min-h-[404px]">
                    <div className="flex flex-col gap-3 border-b border-[#25282D] p-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                            <label className="relative block w-full sm:max-w-[220px]">
                                <span className="sr-only">Cari invoice atau tenant</span>
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6F6F6F]" />
                                <input
                                    type="search"
                                    aria-label="Cari invoice atau tenant"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Cari Tenant, ID Transaksi"
                                    className="h-8 w-full min-w-0 rounded-[8px] border border-[#212121] bg-[#0E0F11] pl-9 pr-3 text-[12px] text-[#D4D4D4] outline-none transition-colors placeholder:text-[#6F6F6F] hover:border-[#3B414D] focus:border-[#C99D4B] sm:min-w-[220px] xl:min-w-[160px]"
                                />
                            </label>

                            <SelectField
                                ariaLabel="Filter status invoice"
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value as InvoiceStatusFilter)}
                                options={statusOptions}
                            />
                        </div>

                    </div>

                    <div className="overflow-x-auto px-3 py-3 sm:px-4">
                        <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left" role="table">
                            <thead>
                                <tr className="text-[12px] uppercase text-[#797F8F]">
                                    <th className="border-b border-[#303030] px-3 py-3 font-normal">Invoice</th>
                                    <th className="border-b border-[#303030] px-3 py-3 font-normal">Tenant</th>
                                    <th className="border-b border-[#303030] px-3 py-3 font-normal">Periode</th>
                                    <th className="border-b border-[#303030] px-3 py-3 font-normal">Jumlah</th>
                                    <th className="border-b border-[#303030] px-3 py-3 font-normal">Status</th>
                                    <th className="border-b border-[#303030] px-3 py-3 text-center font-normal">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice: InvoiceType) => (
                                    <tr key={invoice.id} className="align-top">
                                        <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-[#757C8B]">
                                            {invoice.id}
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-white">
                                            {invoice.tenant_name}
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-[#757C8B]">
                                            {invoice.period}
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-white">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(invoice.amount)}
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-3">
                                            <SuperadminStatusBadge
                                                tone={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'danger' : 'warning'}
                                                value={invoice.status}
                                            />
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-3 text-center">
                                            <InvoiceActionButton 
                                                status={invoice.status} 
                                                onDownload={() => downloadInvoicePdf(invoice)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {invoices.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-3 py-8 text-center text-[14px] text-[#6F6F6F] border-b border-[#303030]">
                                            Tidak ada data
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex min-w-0 flex-col gap-3">
                    <section className="overflow-hidden rounded-[12px] border border-[#25282D] bg-[#16181C] xl:min-h-[196px]">
                        <header className="border-b border-[#303030] px-4 py-4">
                            <h2 className="text-[14px] font-semibold text-white">Pendapatan Bulanan</h2>
                        </header>
                        <div className="flex flex-col items-center gap-6 px-3 py-4">
                            {revenueTrend.length > 0 ? (
                                <div className="flex h-[120px] w-full items-end justify-center gap-3">
                                    {mappedRevenueBars.map((bar) => (
                                        <RevenueBarItem
                                            heightPercent={bar.heightPercent}
                                            key={bar.label}
                                            label={bar.label}
                                            tone={bar.tone}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-[120px] w-full items-center justify-center text-[12px] text-[#6F6F6F]">
                                    Belum ada data pendapatan
                                </div>
                            )}
                            <div className="space-y-1 text-center">
                                <p className="text-[24px] font-semibold text-white">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats?.total_revenue || 0)}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-[12px] border border-[#25282D] bg-[#16181C] xl:min-h-[196px]">
                        <header className="border-b border-[#303030] px-4 py-4">
                            <h2 className="text-[14px] font-semibold text-white">Aging Receivables</h2>
                        </header>
                        <div>
                            {mappedAging.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center justify-between border-b border-[#303030] px-4 py-4 last:border-b-0"
                                >
                                    <p className="text-[12px] font-light text-[#6F6F6F]">{item.label}</p>
                                    <p className={`text-[12px] font-semibold text-white ${item.valueClassName ?? ''}`}>
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(item.amount) || 0)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </section>
        </SuperadminShell>
    );
}
