'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, FileText, Search } from 'lucide-react';
import {
    SuperadminShell,
    SuperadminStatCard,
    SuperadminStatusBadge,
    type SuperadminStatusTone,
} from '@/features/superadmin/presentation/components/SuperadminShell';

type InvoiceStatusFilter = 'all' | 'paid' | 'overdue' | 'pending' | 'success';
type InvoiceActionType = 'pdf' | 'markPaid';
type RevenueBar = {
    label: string;
    tone: 'dim' | 'soft' | 'accent';
    value: string;
};
type AgingReceivableItem = {
    amount: string;
    label: string;
    valueClassName?: string;
};
type InvoiceRecord = {
    actionType: InvoiceActionType;
    amount: string;
    id: string;
    period: string;
    statusLabel: string;
    statusTone: SuperadminStatusTone;
    statusValue: Exclude<InvoiceStatusFilter, 'all'>;
    tenant: string;
};

const billingSummaryCards = [
    {
        label: 'TOTAL INVOICE BULAN INI',
        value: '284',
    },
    {
        label: 'SUDAH DIBAYAR',
        value: '246',
        valueClassName: 'text-[#3DBA7E]',
        footer: <p className="text-[10px] text-[#797F8F]">Rp 189 jt</p>,
    },
    {
        label: 'BELUM DIBAYAR',
        value: '13',
        valueClassName: 'text-[#E0A030]',
        footer: <p className="text-[10px] text-[#797F8F]">Rp 24,8 jt</p>,
    },
    {
        label: 'OVERDUE (>30 HARI)',
        value: '8',
        valueClassName: 'text-[#FF6B71]',
        footer: <p className="text-[10px] text-[#797F8F]">Rp 14,3 jt</p>,
    },
];

const invoiceRecords: InvoiceRecord[] = [
    {
        id: '#INV-2602-001',
        tenant: 'PT Graha Notaris',
        period: 'Feb 2026',
        amount: 'Rp 500.000',
        statusLabel: 'Paid',
        statusTone: 'success',
        statusValue: 'paid',
        actionType: 'pdf',
    },
    {
        id: '#INV-2602-002',
        tenant: 'KN Surya Hukum',
        period: 'Feb 2026',
        amount: 'Rp 500.000',
        statusLabel: 'Overdue',
        statusTone: 'danger',
        statusValue: 'overdue',
        actionType: 'markPaid',
    },
    {
        id: '#INV-2602-003',
        tenant: 'CV Legaltama',
        period: 'Feb 2026',
        amount: 'Rp 500.000',
        statusLabel: 'Overdue',
        statusTone: 'danger',
        statusValue: 'overdue',
        actionType: 'markPaid',
    },
    {
        id: '#INV-2602-004',
        tenant: 'Notaris Dewi A.',
        period: 'Feb 2026',
        amount: 'Rp 500.000',
        statusLabel: 'Sukses',
        statusTone: 'success',
        statusValue: 'success',
        actionType: 'pdf',
    },
    {
        id: '#INV-2602-005',
        tenant: 'KN Mitra Akta',
        period: 'Feb 2026',
        amount: 'Rp 500.000',
        statusLabel: 'Pending',
        statusTone: 'warning',
        statusValue: 'pending',
        actionType: 'markPaid',
    },
    {
        id: '#INV-2602-006',
        tenant: 'PT Akta Sentosa',
        period: 'Feb 2026',
        amount: 'Rp 500.000',
        statusLabel: 'Paid',
        statusTone: 'success',
        statusValue: 'paid',
        actionType: 'pdf',
    },
    {
        id: '#INV-2602-007',
        tenant: 'Firma Hukum',
        period: 'Feb 2026',
        amount: 'Rp 500.000',
        statusLabel: 'Paid',
        statusTone: 'success',
        statusValue: 'paid',
        actionType: 'pdf',
    },
];

const revenueBars: RevenueBar[] = [
    { label: 'Jan', tone: 'dim', value: 'h-[22px]' },
    { label: 'Feb', tone: 'soft', value: 'h-[52px]' },
    { label: 'Mar', tone: 'accent', value: 'h-[64px]' },
    { label: 'April', tone: 'accent', value: 'h-[48px]' },
];

const agingReceivables: AgingReceivableItem[] = [
    { label: '1-15 hari', amount: 'Rp 10,5 jt' },
    { label: '16-30 hari', amount: 'Rp 14,3 jt', valueClassName: 'text-[#E0A030]' },
    { label: '>30 hari', amount: 'Rp 14,3 jt', valueClassName: 'text-[#E05A5A]' },
    { label: 'Total outstanding', amount: 'Rp 39,1 jt' },
];

const statusOptions: { label: string; value: InvoiceStatusFilter }[] = [
    { label: 'Semua status', value: 'all' },
    { label: 'Paid', value: 'paid' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Pending', value: 'pending' },
    { label: 'Sukses', value: 'success' },
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
    actionType,
}: Readonly<{
    actionType: InvoiceActionType;
}>) {
    if (actionType === 'markPaid') {
        return (
            <button
                type="button"
                className="inline-flex items-center rounded-[8px] px-3 py-1 text-[14px] text-[#C9AA6F] transition-colors hover:bg-[#1E2127] hover:text-[#E3C28A]"
            >
                Mark Paid
            </button>
        );
    }

    return (
        <button
            type="button"
            className="inline-flex items-center gap-1 rounded-[8px] px-3 py-1 text-[14px] text-[#C9AA6F] transition-colors hover:bg-[#1E2127] hover:text-[#E3C28A]"
        >
            pdf
            <ChevronDown className="h-4 w-4" />
        </button>
    );
}

function RevenueBarItem({
    label,
    tone,
    value,
}: Readonly<RevenueBar>) {
    const colorClassName =
        tone === 'accent'
            ? 'bg-[#C9A96E]'
            : tone === 'soft'
              ? 'bg-[rgba(201,169,110,0.6)]'
              : 'bg-[rgba(201,169,110,0.27)]';

    return (
        <div className="flex flex-1 flex-col items-center justify-end gap-3">
            <div className={`w-full rounded-[4px] ${colorClassName} ${value}`} />
            <p className="text-[12px] text-white">{label}</p>
        </div>
    );
}

export function SuperadminBillingInvoices() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>('all');

    const filteredInvoices = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return invoiceRecords.filter((invoice) => {
            const matchesQuery =
                normalizedQuery.length === 0 ||
                invoice.id.toLowerCase().includes(normalizedQuery) ||
                invoice.tenant.toLowerCase().includes(normalizedQuery);
            const matchesStatus = statusFilter === 'all' || invoice.statusValue === statusFilter;

            return matchesQuery && matchesStatus;
        });
    }, [searchQuery, statusFilter]);

    return (
        <SuperadminShell activePage="billingInvoices" title="Billing & Invoice">
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {billingSummaryCards.map((card) => (
                    <SuperadminStatCard
                        key={card.label}
                        footer={card.footer}
                        label={card.label}
                        value={card.value}
                        valueClassName={card.valueClassName}
                    />
                ))}
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
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
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

                        <button
                            type="button"
                            className="inline-flex h-8 w-full items-center justify-center gap-2 self-start rounded-[8px] border border-[#797F8F] bg-[#16181C] px-3 text-[14px] text-[#797F8F] transition-colors hover:border-[#C99D4B] hover:text-[#C99D4B] sm:w-auto sm:justify-start"
                        >
                            <FileText className="h-4 w-4" />
                            Kirim invoice manual
                        </button>
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
                                    <th className="border-b border-[#303030] px-3 py-3 text-center font-normal">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="align-top">
                                        <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-[#757C8B]">
                                            {invoice.id}
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-white">
                                            {invoice.tenant}
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-[#757C8B]">
                                            {invoice.period}
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-white">
                                            {invoice.amount}
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-3">
                                            <SuperadminStatusBadge
                                                tone={invoice.statusTone}
                                                value={invoice.statusLabel}
                                            />
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-3 text-center">
                                            <InvoiceActionButton actionType={invoice.actionType} />
                                        </td>
                                    </tr>
                                ))}
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
                            <div className="flex h-[120px] w-full items-end justify-center gap-4">
                                {revenueBars.map((bar) => (
                                    <RevenueBarItem
                                        key={bar.label}
                                        label={bar.label}
                                        tone={bar.tone}
                                        value={bar.value}
                                    />
                                ))}
                            </div>
                            <div className="space-y-1 text-center">
                                <p className="text-[24px] font-semibold text-white">Rp 218 jt</p>
                                <p className="text-[12px] font-semibold text-[#4FB05E]">8.7% vs bulan lalu</p>
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-[12px] border border-[#25282D] bg-[#16181C] xl:min-h-[196px]">
                        <header className="border-b border-[#303030] px-4 py-4">
                            <h2 className="text-[14px] font-semibold text-white">Aging Receivables</h2>
                        </header>
                        <div>
                            {agingReceivables.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center justify-between border-b border-[#303030] px-4 py-4 last:border-b-0"
                                >
                                    <p className="text-[12px] font-light text-[#6F6F6F]">{item.label}</p>
                                    <p className={`text-[12px] font-semibold text-white ${item.valueClassName ?? ''}`}>
                                        {item.amount}
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
