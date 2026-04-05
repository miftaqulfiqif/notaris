'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ArrowUpRight, ChevronDown, Download, Search } from 'lucide-react';
import {
    SuperadminActionButton,
    SuperadminModal,
} from '@/features/superadmin/presentation/components/SuperadminOverlay';
import {
    SuperadminShell,
    SuperadminStatCard,
    SuperadminStatusBadge,
    type SuperadminStatusTone,
} from '@/features/superadmin/presentation/components/SuperadminShell';

type TransactionStatusFilter = 'all' | 'success' | 'failed' | 'pending' | 'dispute' | 'refund';
type TransactionMethodFilter = 'all' | 'transfer' | 'qris';
type TransactionPeriodFilter = '30days' | 'today' | '7days' | 'month';
type TransactionLogEntry = {
    tone?: 'danger' | 'muted';
    value: string;
};

type TransactionRecord = {
    amount: string;
    date: string;
    dateValue: string;
    errorCode?: string;
    historyLogs: TransactionLogEntry[];
    id: string;
    method: 'Transfer Bank' | 'QRIS';
    providerRef: string;
    refundEligible: boolean;
    status: string;
    statusFilter: Exclude<TransactionStatusFilter, 'all'>;
    statusTone: SuperadminStatusTone;
    tenant: string;
};

const transactionSummaryCards = [
    {
        label: 'TOTAL TRANSAKSI',
        value: '1.247',
        footer: (
            <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 font-medium text-[#3DBA7E]">
                    <ArrowUpRight className="h-3 w-3" />
                    4.1%
                </span>
                <span className="text-[#797F8F]">vs bulan lalu</span>
            </div>
        ),
    },
    {
        label: 'BERHASIL',
        value: '1.182',
        valueClassName: 'text-[#3DBA7E]',
        footer: (
            <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 font-medium text-[#3DBA7E]">
                    <ArrowUpRight className="h-3 w-3" />
                    94.8%
                </span>
                <span className="text-[#797F8F]">succes rate</span>
            </div>
        ),
    },
    {
        label: 'GAGAL / DISPUTE',
        value: 'Rp 218 jt',
        valueClassName: 'text-[#FF6B71]',
        footer: (
            <div className="flex items-center gap-2 text-[10px]">
                <span className="font-medium text-[#E05A5A]">3 dispute</span>
                <span className="text-[#797F8F]">Pending</span>
            </div>
        ),
    },
    {
        label: 'VOLUME (BULAN INI)',
        value: 'Rp 218 jt',
        footer: (
            <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 font-medium text-[#3DBA7E]">
                    <ArrowUpRight className="h-3 w-3" />
                    8.7%
                </span>
            </div>
        ),
    },
];

const initialTransactions: TransactionRecord[] = [
    {
        id: '#TXN-2402-0891',
        tenant: 'PT Graha Notaris',
        date: '19 Feb 2026, 09:22',
        dateValue: '2026-02-19T09:22:00+08:00',
        amount: 'Rp 1.500.000',
        method: 'Transfer Bank',
        status: 'Gagal',
        statusTone: 'danger',
        statusFilter: 'failed',
        errorCode: 'ERR_TIMEOUT',
        providerRef: 'MDT-88291-X',
        refundEligible: true,
        historyLogs: [
            { value: '19 Feb 09:22 - Transaksi diinisiasi oleh tenant', tone: 'muted' },
            { value: '19 Feb 09:23 - Gateway response: ERR_TIMEOUT', tone: 'muted' },
            { value: '19 Feb 09:23 - Status: FAILED', tone: 'danger' },
        ],
    },
    {
        id: '#TXN-2402-0892',
        tenant: 'KN Surya Hukum',
        date: '19 Feb 2026, 08:54',
        dateValue: '2026-02-19T08:54:00+08:00',
        amount: 'Rp 750.000',
        method: 'QRIS',
        status: 'Sukses',
        statusTone: 'success',
        statusFilter: 'success',
        providerRef: 'QRS-44812-H',
        refundEligible: false,
        historyLogs: [
            { value: '19 Feb 08:54 - QRIS dibuat dan dibayar tenant', tone: 'muted' },
            { value: '19 Feb 08:55 - Callback gateway diterima', tone: 'muted' },
            { value: '19 Feb 08:55 - Status: SUCCESS', tone: 'muted' },
        ],
    },
    {
        id: '#TXN-2402-0893',
        tenant: 'CV Legaltama',
        date: '18 Feb 2026, 15:40',
        dateValue: '2026-02-18T15:40:00+08:00',
        amount: 'Rp 750.000',
        method: 'Transfer Bank',
        status: 'Sukses',
        statusTone: 'success',
        statusFilter: 'success',
        providerRef: 'TRF-55218-L',
        refundEligible: false,
        historyLogs: [
            { value: '18 Feb 15:40 - Tagihan dibuat otomatis', tone: 'muted' },
            { value: '18 Feb 15:43 - Transfer tervalidasi', tone: 'muted' },
            { value: '18 Feb 15:43 - Status: SUCCESS', tone: 'muted' },
        ],
    },
    {
        id: '#TXN-2402-0894',
        tenant: 'Notaris Dewi A.',
        date: '17 Feb 2026, 13:10',
        dateValue: '2026-02-17T13:10:00+08:00',
        amount: 'Rp 750.000',
        method: 'QRIS',
        status: 'Sukses',
        statusTone: 'success',
        statusFilter: 'success',
        providerRef: 'QRS-66213-P',
        refundEligible: false,
        historyLogs: [
            { value: '17 Feb 13:10 - Checkout dimulai', tone: 'muted' },
            { value: '17 Feb 13:11 - Status: SUCCESS', tone: 'muted' },
        ],
    },
    {
        id: '#TXN-2402-0895',
        tenant: 'KN Mitra Akta',
        date: '12 Feb 2026, 17:28',
        dateValue: '2026-02-12T17:28:00+08:00',
        amount: 'Rp 750.000',
        method: 'Transfer Bank',
        status: 'Pending',
        statusTone: 'warning',
        statusFilter: 'pending',
        providerRef: 'TRF-11231-M',
        refundEligible: false,
        historyLogs: [
            { value: '12 Feb 17:28 - Invoice dikirim', tone: 'muted' },
            { value: '12 Feb 17:29 - Menunggu konfirmasi bank', tone: 'muted' },
        ],
    },
    {
        id: '#TXN-2402-0896',
        tenant: 'PT Akta Sentosa',
        date: '05 Feb 2026, 10:02',
        dateValue: '2026-02-05T10:02:00+08:00',
        amount: 'Rp 1.500.000',
        method: 'QRIS',
        status: 'Dispute',
        statusTone: 'muted',
        statusFilter: 'dispute',
        errorCode: 'DISPUTE_ISSUED',
        providerRef: 'QRS-91231-D',
        refundEligible: true,
        historyLogs: [
            { value: '05 Feb 10:02 - Pembayaran diterima', tone: 'muted' },
            { value: '05 Feb 10:21 - Dispute dibuka tenant', tone: 'muted' },
            { value: '05 Feb 10:22 - Status: DISPUTE', tone: 'danger' },
        ],
    },
    {
        id: '#TXN-2402-0897',
        tenant: 'Firma Hukum',
        date: '28 Jan 2026, 16:47',
        dateValue: '2026-01-28T16:47:00+08:00',
        amount: 'Rp 750.000',
        method: 'Transfer Bank',
        status: 'Refund',
        statusTone: 'info',
        statusFilter: 'refund',
        providerRef: 'TRF-00472-R',
        refundEligible: false,
        historyLogs: [
            { value: '28 Jan 16:47 - Pembayaran sukses', tone: 'muted' },
            { value: '29 Jan 09:12 - Refund diproses oleh superadmin', tone: 'muted' },
            { value: '29 Jan 09:14 - Status: REFUND', tone: 'muted' },
        ],
    },
];

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
    { label: 'Transfer', value: 'transfer' },
    { label: 'QRIS', value: 'qris' },
];

const referenceDate = new Date('2026-02-19T23:59:59+08:00');

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

function isWithinSelectedPeriod(dateValue: string, period: TransactionPeriodFilter) {
    const transactionDate = new Date(dateValue);

    if (period === 'today') {
        return transactionDate.toDateString() === referenceDate.toDateString();
    }

    if (period === '7days') {
        const sevenDaysAgo = new Date(referenceDate);
        sevenDaysAgo.setDate(referenceDate.getDate() - 6);
        return transactionDate >= sevenDaysAgo && transactionDate <= referenceDate;
    }

    if (period === 'month') {
        return (
            transactionDate.getFullYear() === referenceDate.getFullYear() &&
            transactionDate.getMonth() === referenceDate.getMonth()
        );
    }

    const thirtyDaysAgo = new Date(referenceDate);
    thirtyDaysAgo.setDate(referenceDate.getDate() - 29);

    return transactionDate >= thirtyDaysAgo && transactionDate <= referenceDate;
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
    transaction: TransactionRecord;
}>) {
    return (
        <SuperadminModal maxWidthClassName="max-w-[532px]" onClose={onClose} title="Detail">
            <div className="space-y-5 px-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-10">
                    <div className="space-y-4">
                        <TransactionDetailItem label="ID Transaksi" value={transaction.id} />
                        <TransactionDetailItem label="Tenant" value={transaction.tenant} />
                        <TransactionDetailItem label="Metode" value={transaction.method} />
                        <TransactionDetailItem
                            label="Error Code"
                            value={transaction.errorCode ?? '-'}
                            valueClassName={transaction.errorCode ? 'text-[#EB3223]' : 'text-[#6F6F6F]'}
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-[12px] uppercase text-[#6F6F6F]">Status</p>
                            <SuperadminStatusBadge tone={transaction.statusTone} value={transaction.status} />
                        </div>
                        <TransactionDetailItem label="Jumlah" value={transaction.amount} />
                        <TransactionDetailItem label="Tanggal" value={transaction.date} />
                        <TransactionDetailItem label="Provider Ref" value={transaction.providerRef} />
                    </div>
                </div>

                <section className="rounded-[8px] border border-[#2D2D2D] bg-[#0F1012] px-3 py-3">
                    <h3 className="text-[12px] uppercase text-[#6F6F6F]">History Log</h3>
                    <div className="mt-3 space-y-1 text-[12px] uppercase leading-5">
                        {transaction.historyLogs.map((log) => (
                            <p
                                key={log.value}
                                className={log.tone === 'danger' ? 'text-[#EB3223]' : 'text-[#6F6F6F]'}
                            >
                                {log.value}
                            </p>
                        ))}
                    </div>
                </section>

                <div className="flex justify-end gap-3 pb-1">
                    {transaction.refundEligible ? (
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
    const [transactionRecords, setTransactionRecords] = useState(initialTransactions);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TransactionStatusFilter>('all');
    const [methodFilter, setMethodFilter] = useState<TransactionMethodFilter>('all');
    const [periodFilter, setPeriodFilter] = useState<TransactionPeriodFilter>('30days');
    const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

    const filteredTransactions = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return transactionRecords.filter((transaction) => {
            const matchesQuery =
                normalizedQuery.length === 0 ||
                transaction.id.toLowerCase().includes(normalizedQuery) ||
                transaction.tenant.toLowerCase().includes(normalizedQuery);
            const matchesStatus =
                statusFilter === 'all' || transaction.statusFilter === statusFilter;
            const matchesMethod =
                methodFilter === 'all' ||
                (methodFilter === 'transfer'
                    ? transaction.method === 'Transfer Bank'
                    : transaction.method === 'QRIS');
            const matchesPeriod = isWithinSelectedPeriod(transaction.dateValue, periodFilter);

            return matchesQuery && matchesStatus && matchesMethod && matchesPeriod;
        });
    }, [methodFilter, periodFilter, searchQuery, statusFilter, transactionRecords]);

    const selectedTransaction =
        selectedTransactionId === null
            ? null
            : transactionRecords.find((transaction) => transaction.id === selectedTransactionId) ?? null;

    const handleRefund = () => {
        if (!selectedTransaction) {
            return;
        }

        setTransactionRecords((currentTransactions) =>
            currentTransactions.map((transaction) =>
                transaction.id === selectedTransaction.id
                    ? {
                          ...transaction,
                          errorCode: undefined,
                          refundEligible: false,
                          status: 'Refund',
                          statusFilter: 'refund',
                          statusTone: 'info',
                          historyLogs: [
                              ...transaction.historyLogs,
                              {
                                  value: '19 Feb 09:25 - Refund dipicu oleh superadmin',
                                  tone: 'muted',
                              },
                          ],
                      }
                    : transaction,
            ),
        );
    };

    return (
        <SuperadminShell activePage="transactions" title="Transaksi">
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {transactionSummaryCards.map((card) => (
                    <SuperadminStatCard
                        key={card.label}
                        footer={card.footer}
                        label={card.label}
                        value={card.value}
                        valueClassName={card.valueClassName}
                    />
                ))}
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
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
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
                            {filteredTransactions.length ? (
                                filteredTransactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="border-b border-[#303030] last:border-b-0"
                                    >
                                        <td className="px-3 py-4 text-[14px] text-[#757C8B]">{transaction.id}</td>
                                        <td className="px-3 py-4 text-[14px] text-white">{transaction.tenant}</td>
                                        <td className="px-3 py-4 text-[14px] text-[#757C8B]">{transaction.date}</td>
                                        <td className="px-3 py-4 text-[14px] text-[#757C8B]">{transaction.amount}</td>
                                        <td className="px-3 py-4 text-[14px] text-[#757C8B]">
                                            {transaction.method}
                                        </td>
                                        <td className="px-3 py-4">
                                            <SuperadminStatusBadge
                                                tone={transaction.statusTone}
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
