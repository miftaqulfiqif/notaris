'use client';

import { useState } from 'react';
import { ChevronDown, Download, FileText } from 'lucide-react';
import {
    SuperadminShell,
    SuperadminStatusBadge,
} from '@/features/superadmin/presentation/components/SuperadminShell';

type RecentReportRecord = {
    createdAt: string;
    format: string;
    period: string;
    title: string;
};

type ScheduledReport = {
    deliveryLabel: string;
    recipient: string;
    statusLabel: string;
};

const reportTypeOptions = [
    { label: 'Transaksi pembayaran', value: 'transactionPayments' },
    { label: 'Pendapatan bulanan', value: 'monthlyRevenue' },
    { label: 'Pertumbuhan tenant', value: 'tenantGrowth' },
    { label: 'Support & SLA', value: 'supportSla' },
];

const formatOptions = [
    { label: 'PDF', value: 'pdf' },
    { label: 'XLSX', value: 'xlsx' },
    { label: 'CSV', value: 'csv' },
];

const deliveryScheduleOptions = [
    { label: 'Harian', value: 'daily' },
    { label: 'Mingguan', value: 'weekly' },
    { label: 'Bulanan', value: 'monthly' },
];

const recentReports: RecentReportRecord[] = [
    {
        title: 'Transaksi Jan 2026',
        period: 'Jan 2026',
        format: 'PDF',
        createdAt: '1 Feb 2026',
    },
    {
        title: 'Churn Q4 2025',
        period: 'Okt-Des 2025',
        format: 'PDF',
        createdAt: '1 Feb 2026',
    },
    {
        title: 'Revenue 2025',
        period: 'Jan-Des 2025',
        format: 'PDF',
        createdAt: '1 Feb 2026',
    },
    {
        title: 'Tenant Growth Q3',
        period: 'Jul-Sep 2025',
        format: 'PDF',
        createdAt: '1 Feb 2026',
    },
    {
        title: 'Support SLA Jul 2025',
        period: 'Jul 2025',
        format: 'PDF',
        createdAt: '1 Feb 2026',
    },
];

const scheduledReports: ScheduledReport[] = [
    {
        deliveryLabel: 'Setiap hari, 08.00 WITA',
        recipient: 'cto@id',
        statusLabel: 'Aktif',
    },
];

function InputLabel({ children }: Readonly<{ children: string }>) {
    return <span className="text-[12px] font-medium text-[#9EA4B3]">{children}</span>;
}

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
        <div className="relative">
            <select
                aria-label={ariaLabel}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-full appearance-none rounded-[10px] border border-[#25282D] bg-[#0E0F11] px-3 pr-9 text-[14px] text-white outline-none transition-colors hover:border-[#3B414D] focus:border-[#C99D4B]"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6F6F6F]" />
        </div>
    );
}

function TextField({
    ariaLabel,
    onChange,
    placeholder,
    value,
}: Readonly<{
    ariaLabel: string;
    onChange: (value: string) => void;
    placeholder?: string;
    value: string;
}>) {
    return (
        <input
            type="text"
            aria-label={ariaLabel}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="h-10 w-full rounded-[10px] border border-[#25282D] bg-[#0E0F11] px-3 text-[14px] text-white outline-none transition-colors placeholder:text-[#6F6F6F] hover:border-[#3B414D] focus:border-[#C99D4B]"
        />
    );
}

export function SuperadminReports() {
    const [reportType, setReportType] = useState('transactionPayments');
    const [startDate, setStartDate] = useState('01/01/2026');
    const [endDate, setEndDate] = useState('01/02/2026');
    const [formatOutput, setFormatOutput] = useState('pdf');
    const [deliverySchedule, setDeliverySchedule] = useState('weekly');
    const [recipientEmail, setRecipientEmail] = useState('CTO : Johnymartteen@gmail.com');

    return (
        <SuperadminShell
            activePage="reports"
            title="Laporan"
            headerActions={
                <button
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#797F8F] bg-[#16181C] px-4 text-[14px] text-[#C7CBD6] transition-colors hover:border-[#C99D4B] hover:text-[#C99D4B]"
                >
                    <Download className="h-4 w-4" />
                    Ekspor
                </button>
            }
        >
            <section className="grid gap-3 xl:grid-cols-[minmax(320px,406px)_minmax(0,1fr)]">
                <section className="rounded-[12px] border border-[#25282D] bg-[#16181C]">
                    <header className="border-b border-[#25282D] px-4 py-4">
                        <h2 className="text-[18px] font-semibold text-white">Buat Laporan baru</h2>
                        <p className="mt-2 max-w-[32ch] text-[14px] leading-6 text-[#797F8F]">
                            Siapkan laporan operasional dan keuangan tenant dengan format yang siap dibagikan.
                        </p>
                    </header>

                    <div className="space-y-4 px-4 py-4">
                        <label className="block space-y-2">
                            <InputLabel>Jenis Laporan</InputLabel>
                            <SelectField
                                ariaLabel="Pilih jenis laporan"
                                value={reportType}
                                onChange={setReportType}
                                options={reportTypeOptions}
                            />
                        </label>

                        <div className="space-y-2">
                            <InputLabel>Periode</InputLabel>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <TextField
                                    ariaLabel="Tanggal mulai laporan"
                                    value={startDate}
                                    onChange={setStartDate}
                                />
                                <TextField
                                    ariaLabel="Tanggal akhir laporan"
                                    value={endDate}
                                    onChange={setEndDate}
                                />
                            </div>
                        </div>

                        <label className="block space-y-2">
                            <InputLabel>Format Output</InputLabel>
                            <SelectField
                                ariaLabel="Pilih format output laporan"
                                value={formatOutput}
                                onChange={setFormatOutput}
                                options={formatOptions}
                            />
                        </label>

                        <label className="block space-y-2">
                            <InputLabel>Jadwal Pengiriman Email</InputLabel>
                            <SelectField
                                ariaLabel="Pilih jadwal pengiriman email"
                                value={deliverySchedule}
                                onChange={setDeliverySchedule}
                                options={deliveryScheduleOptions}
                            />
                        </label>

                        <label className="block space-y-2">
                            <InputLabel>Kirim Ke Email</InputLabel>
                            <TextField
                                ariaLabel="Masukkan email tujuan laporan"
                                value={recipientEmail}
                                onChange={setRecipientEmail}
                                placeholder="cto@id"
                            />
                        </label>

                        <button
                            type="button"
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#C9AA6F] px-4 text-[14px] font-medium text-[#25282D] transition-colors hover:bg-[#D7B97F]"
                        >
                            <FileText className="h-4 w-4" />
                            Generate Laporan
                        </button>
                    </div>
                </section>

                <div className="grid gap-3">
                    <section className="overflow-hidden rounded-[12px] border border-[#25282D] bg-[#16181C]">
                        <header className="flex flex-col gap-3 border-b border-[#25282D] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-[14px] font-semibold text-white">Riwayat Laporan</h2>
                            <button
                                type="button"
                                className="text-[14px] text-[#C9AA6F] transition-colors hover:text-[#E3C28A]"
                            >
                                Lihat semua
                            </button>
                        </header>

                        <div className="overflow-x-auto px-3 py-3 sm:px-4">
                            <table className="w-full min-w-[620px] border-separate border-spacing-0 text-left" role="table">
                                <thead>
                                    <tr className="text-[12px] uppercase text-[#797F8F]">
                                        <th className="border-b border-[#303030] px-3 py-3 font-normal">Laporan</th>
                                        <th className="border-b border-[#303030] px-3 py-3 font-normal">Periode</th>
                                        <th className="border-b border-[#303030] px-3 py-3 font-normal">Format</th>
                                        <th className="border-b border-[#303030] px-3 py-3 font-normal">Dibuat</th>
                                        <th className="border-b border-[#303030] px-3 py-3 text-center font-normal">Act</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentReports.map((report) => (
                                        <tr key={report.title}>
                                            <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-white">
                                                {report.title}
                                            </td>
                                            <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-[#757C8B]">
                                                {report.period}
                                            </td>
                                            <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-white">
                                                {report.format}
                                            </td>
                                            <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-[#757C8B]">
                                                {report.createdAt}
                                            </td>
                                            <td className="border-b border-[#303030] px-3 py-3 text-center">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1 rounded-[8px] px-3 py-1 text-[14px] text-[#C9AA6F] transition-colors hover:bg-[#1E2127] hover:text-[#E3C28A]"
                                                >
                                                    unduh
                                                    <Download className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-[12px] border border-[#25282D] bg-[#16181C]">
                        <header className="border-b border-[#25282D] px-4 py-4">
                            <h2 className="text-[14px] font-semibold text-white">Laporan Terjadwal</h2>
                        </header>

                        <div className="divide-y divide-[#303030]">
                            {scheduledReports.map((report) => (
                                <div
                                    key={report.recipient}
                                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="space-y-1">
                                        <p className="text-[14px] font-medium text-white">Transaksi harian</p>
                                        <p className="text-[12px] text-[#797F8F]">Dikirim ke {report.recipient}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <SuperadminStatusBadge tone="success" value={report.statusLabel} />
                                        <span className="text-[12px] text-[#6F6F6F]">{report.deliveryLabel}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </section>
        </SuperadminShell>
    );
}
