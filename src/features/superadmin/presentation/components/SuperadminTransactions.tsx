'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, Download, Search } from 'lucide-react';
import {
    SuperadminActionButton,
    SuperadminModal,
} from '@/features/superadmin/presentation/components/SuperadminOverlay';
import {
    SuperadminShell,
    SuperadminStatCard,
    SuperadminStatusBadge,
} from '@/features/superadmin/presentation/components/SuperadminShell';
import { useToast } from '@/shared/hooks/useToast';
import { downloadCsv } from '../../utils/export';
import { useSuperadminTransactions } from '../../hooks/useSuperadminTransactions';
import { TransactionRecord as TransactionRecordType } from '../../types';

type TransactionStatusFilter = 'all' | 'success' | 'failed' | 'pending' | 'dispute' | 'refund';
type TransactionMethodFilter = 'all' | 'transfer_bank' | 'qris';
type TransactionPeriodFilter = '30days' | 'today' | '7days' | 'month';

const periodOptions: { label: string; value: TransactionPeriodFilter }[] = [
    { label: '30 hari terakhir', value: '30days' },
    { label: 'Hari ini', value: 'today' },
    { label: '7 hari', value: '7days' },
    { label: 'Bulan ini', value: 'month' },
];

const statusOptions: { label: string; value: TransactionStatusFilter }[] = [
    { label: 'Semua status', value: 'all' },
    { label: 'Sukses', value: 'success' },
    { label: 'Gagal', value: 'failed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Dispute', value: 'dispute' },
    { label: 'Refund', value: 'refund' },
];

const methodOptions: { label: string; value: TransactionMethodFilter }[] = [
    { label: 'Semua metode', value: 'all' },
    { label: 'Transfer Bank', value: 'transfer_bank' },
    { label: 'QRIS', value: 'qris' },
];

const formatTransactionMethod = (method: string) => {
    if (method === 'transfer_bank') {
        return 'Transfer Bank';
    }

    if (!method) return '-';
    return method.toUpperCase();
};

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
        <div className="relative w-full sm:min-w-[138px]">
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

function TransactionDetailItem({
    label,
    value,
    valueClassName = 'text-white',
}: Readonly<{
    label: string;
    value: ReactNode;
    valueClassName?: string;
}>) {
    return (
        <div className="space-y-1">
            <p className="text-[12px] uppercase text-[#6F6F6F]">{label}</p>
            <div className={`text-[14px] ${valueClassName}`}>{value}</div>
        </div>
    );
}

function TransactionDetailModal({
    onClose,
    onRefund,
    transaction,
}: Readonly<{
    onClose: () => void;
    onRefund: () => void;
    transaction: TransactionRecordType;
}>) {
    const statusMeta = transaction.status === 'success' ? 'success' : transaction.status === 'failed' ? 'danger' : transaction.status === 'pending' ? 'warning' : 'muted';

    return (
        <SuperadminModal maxWidthClassName="max-w-[532px]" onClose={onClose} title="Detail">
            <div className="space-y-5 px-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-10">
                    <div className="space-y-4">
                        <TransactionDetailItem label="ID Transaksi" value={transaction.id} />
                        <TransactionDetailItem label="Tenant" value={transaction.tenant_name} />
                        <TransactionDetailItem label="Metode" value={formatTransactionMethod(transaction.method)} />
                        <TransactionDetailItem
                            label="Error Code"
                            value={transaction.error_code ?? '-'}
                            valueClassName={transaction.error_code ? 'text-[#EB3223]' : 'text-[#6F6F6F]'}
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-[12px] uppercase text-[#6F6F6F]">Status</p>
                            <SuperadminStatusBadge tone={statusMeta} value={transaction.status} />
                        </div>
                        <TransactionDetailItem label="Jumlah" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(transaction.amount)} />
                        <TransactionDetailItem label="Tanggal" value={new Date(transaction.date).toLocaleDateString('id-ID')} />
                        <TransactionDetailItem label="Provider Ref" value={transaction.provider_ref ?? '-'} />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pb-1">
                    {transaction.status === 'success' ? (
                        <SuperadminActionButton variant="primary" onClick={onRefund}>
                            Trigger Refund
                        </SuperadminActionButton>
                    ) : null}
                    <SuperadminActionButton onClick={onClose}>Tutup</SuperadminActionButton>
                </div>
            </div>
        </SuperadminModal>
    );
}

export function SuperadminTransactions() {
    const { 
        transactions, 
        stats, 
        isLoading, 
        search, 
        setSearch, 
        statusFilter, 
        setStatusFilter,
        methodFilter,
        setMethodFilter,
        periodFilter,
        setPeriodFilter,
        refundTransaction 
    } = useSuperadminTransactions();
    const { showToast } = useToast();

    const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

    const selectedTransaction =
        selectedTransactionId === null
            ? null
            : transactions.find((transaction) => transaction.id === selectedTransactionId) ?? null;

    const handleRefund = async () => {
        if (!selectedTransaction) {
            return;
        }

        const success = await refundTransaction(selectedTransaction.id);
        if (success) {
            setSelectedTransactionId(null);
        }
    };

    if (isLoading) {
        return (
            <SuperadminShell activePage="transactions" title="Transaksi">
                <div className="flex h-64 items-center justify-center text-[#6F6F6F]">
                    Loading...
                </div>
            </SuperadminShell>
        );
    }

    return (
        <SuperadminShell activePage="transactions" title="Transaksi">
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SuperadminStatCard
                    label="TOTAL TRANSAKSI"
                    value={stats?.success_count?.toString() || '0'}
                />
                <SuperadminStatCard
                    label="VOLUME (BULAN INI)"
                    value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats?.total_value || 0)}
                />
                <SuperadminStatCard
                    label="PENDING"
                    value={stats?.pending_count?.toString() || '0'}
                    valueClassName="text-[#E0A030]"
                />
                <SuperadminStatCard
                    label="REFUND"
                    value={stats?.refund_count?.toString() || '0'}
                    valueClassName="text-[#FF6B71]"
                />
            </section>

            <section className="rounded-[12px] border border-[#25282D] bg-[#16181C]">
                    <div className="flex flex-col gap-3 border-b border-[#25282D] p-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                            <label className="relative block w-full sm:max-w-[275px]">
                            <span className="sr-only">Cari tenant atau ID transaksi</span>
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6F6F6F]" />
                            <input
                                type="search"
                                aria-label="Cari tenant atau ID transaksi"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari Tenant, ID Transaksi"
                                className="h-8 w-full min-w-0 rounded-[8px] border border-[#212121] bg-[#0E0F11] pl-9 pr-3 text-[12px] text-[#D4D4D4] outline-none transition-colors placeholder:text-[#6F6F6F] hover:border-[#3B414D] focus:border-[#C99D4B] sm:min-w-[275px]"
                            />
                        </label>

                        <div className="grid w-full gap-2 sm:grid-cols-3 lg:w-auto">
                            <SelectField
                                ariaLabel="Filter status transaksi"
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value as TransactionStatusFilter)}
                                options={statusOptions}
                            />
                            <SelectField
                                ariaLabel="Filter metode transaksi"
                                value={methodFilter}
                                onChange={(value) => setMethodFilter(value as TransactionMethodFilter)}
                                options={methodOptions}
                            />
                            <SelectField
                                ariaLabel="Filter periode transaksi"
                                value={periodFilter}
                                onChange={(value) => setPeriodFilter(value as TransactionPeriodFilter)}
                                options={periodOptions}
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            if (transactions.length > 0) {
                                downloadCsv(transactions as unknown as Record<string, unknown>[], 'data_transaksi');
                                showToast({ variant: 'success', message: 'Data transaksi berhasil diekspor' });
                            } else {
                                showToast({ variant: 'error', message: 'Belum ada data transaksi untuk diekspor' });
                            }
                        }}
                        className="inline-flex h-8 w-full items-center justify-center gap-2 self-start rounded-[8px] border border-[#797F8F] bg-[#16181C] px-3 text-[14px] text-[#797F8F] transition-colors hover:border-[#C99D4B] hover:text-[#C99D4B] sm:w-auto sm:justify-start"
                    >
                        <Download className="h-4 w-4" />
                        <span>Ekspor</span>
                    </button>
                </div>

                <div className="overflow-x-auto px-3 py-3">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="border-b border-[#303030] text-left text-[12px] uppercase text-[#797F8F]">
                                <th className="px-3 py-3 font-normal">ID Transaksi</th>
                                <th className="px-3 py-3 font-normal">Tenant</th>
                                <th className="px-3 py-3 font-normal">Tanggal</th>
                                <th className="px-3 py-3 font-normal">Jumlah</th>
                                <th className="px-3 py-3 font-normal">Metode</th>
                                <th className="px-3 py-3 font-normal">Status</th>
                                <th className="px-3 py-3 font-normal">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length ? (
                                transactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="border-b border-[#303030] last:border-b-0"
                                    >
                                        <td className="px-3 py-4 text-[14px] text-[#757C8B]">{transaction.id}</td>
                                        <td className="px-3 py-4 text-[14px] text-white">{transaction.tenant_name}</td>
                                        <td className="px-3 py-4 text-[14px] text-[#757C8B]">{new Date(transaction.date).toLocaleDateString('id-ID')}</td>
                                        <td className="px-3 py-4 text-[14px] text-[#757C8B]">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(transaction.amount))}</td>
                                        <td className="px-3 py-4 text-[14px] text-[#757C8B]">
                                            {formatTransactionMethod(transaction.method)}
                                        </td>
                                        <td className="px-3 py-4">
                                            <SuperadminStatusBadge
                                                tone={transaction.status === 'success' ? 'success' : transaction.status === 'failed' ? 'danger' : transaction.status === 'pending' ? 'warning' : 'muted'}
                                                value={transaction.status}
                                            />
                                        </td>
                                        <td className="px-3 py-4">
                                            <button
                                                type="button"
                                                aria-label={`Detail transaksi ${transaction.id}`}
                                                onClick={() => setSelectedTransactionId(transaction.id)}
                                                className="text-[14px] text-[#C9AA6F] transition-colors hover:text-[#DFC28E]"
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-3 py-12 text-center text-[14px] text-[#6F6F6F]">
                                        Tidak ada transaksi yang cocok dengan filter saat ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {selectedTransaction ? (
                <TransactionDetailModal
                    transaction={selectedTransaction}
                    onClose={() => setSelectedTransactionId(null)}
                    onRefund={handleRefund}
                />
            ) : null}
        </SuperadminShell>
    );
}
