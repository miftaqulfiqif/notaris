'use client';

import { useState } from 'react';
import { ChevronDown, Download, FileText } from 'lucide-react';
import {
    SuperadminShell,
    SuperadminStatusBadge,
} from '@/features/superadmin/presentation/components/SuperadminShell';
import { useToast } from '@/shared/hooks/useToast';
import { downloadCsv, downloadReportByFormat } from '../../utils/export';
import { useSuperadminReports } from '../../hooks/useSuperadminReports';
import { Pagination } from '@/shared/components/Pagination';

const reportTypeOptions = [
    { label: 'Transaksi pembayaran', value: 'transaction_payments' },
    { label: 'Pendapatan bulanan', value: 'monthly_revenue' },
    { label: 'Pertumbuhan tenant', value: 'tenant_growth' },
    { label: 'Support & SLA', value: 'support_sla' },
];

const formatOptions = [
    { label: 'PDF', value: 'pdf' },
    { label: 'Excel', value: 'excel' },
    { label: 'CSV', value: 'csv' },
];

const formatReportTypeLabel = (reportType: string) =>
    reportType
        .split('_')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');



function InputLabel({ children }: Readonly<{ children: React.ReactNode }>) {
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
    type = 'text',
}: Readonly<{
    ariaLabel: string;
    onChange: (value: string) => void;
    placeholder?: string;
    value: string;
    type?: string;
}>) {
    return (
        <input
            type={type}
            aria-label={ariaLabel}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="h-10 w-full rounded-[10px] border border-[#25282D] bg-[#0E0F11] px-3 text-[14px] text-white outline-none transition-colors placeholder:text-[#6F6F6F] hover:border-[#3B414D] focus:border-[#C99D4B]"
        />
    );
}

export function SuperadminReports() {
    const { recentReports, isLoading, isGenerating, generateReport, downloadReport, page, setPage, paginationMeta } = useSuperadminReports();
    const [reportType, setReportType] = useState('transaction_payments');
    const [formatOutput, setFormatOutput] = useState('pdf');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const { showToast } = useToast();

    const handleGenerateReport = async () => {
        const res = await generateReport({
            report_type: reportType,
            period_start: startDate,
            period_end: endDate,
            format: formatOutput,
        });

        if (res.success && res.data) {
            const dataArray = res.data as Record<string, unknown>[];
            if (Array.isArray(dataArray) && dataArray.length > 0) {
                downloadReportByFormat(dataArray, `report_${reportType}_${startDate}_${endDate}`, formatOutput);
            } else {
                showToast({ variant: 'error', message: 'Data kosong' });
            }
        }
    };

    const handleDownloadHistory = async (report: import('../../types').ReportRecord) => {
        const reportFormat = report.format || 'csv';
        const pStart = new Date(report.period_start).toISOString().split('T')[0];
        const pEnd = new Date(report.period_end).toISOString().split('T')[0];
        
        const res = await downloadReport(report.id);

        if (res.success && res.data) {
            const dataArray = res.data as Record<string, unknown>[];
            if (Array.isArray(dataArray) && dataArray.length > 0) {
                downloadReportByFormat(dataArray, `report_${report.report_type}_${pStart}_${pEnd}`, reportFormat);
            } else {
                showToast({ variant: 'error', message: 'Data kosong' });
            }
        }
    };



    if (isLoading) {
        return (
            <SuperadminShell activePage="reports" title="Laporan">
                <div className="flex h-64 items-center justify-center text-[#6F6F6F]">
                    Loading...
                </div>
            </SuperadminShell>
        );
    }

    return (
        <SuperadminShell
            activePage="reports"
            title="Laporan"
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

                        <label className="block space-y-2">
                            <InputLabel>Format Output</InputLabel>
                            <SelectField
                                ariaLabel="Pilih format output"
                                value={formatOutput}
                                onChange={setFormatOutput}
                                options={formatOptions}
                            />
                        </label>

                        <div className="space-y-2">
                            <InputLabel>Periode</InputLabel>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <TextField
                                    type="date"
                                    ariaLabel="Tanggal mulai laporan"
                                    value={startDate}
                                    onChange={setStartDate}
                                />
                                <TextField
                                    type="date"
                                    ariaLabel="Tanggal akhir laporan"
                                    value={endDate}
                                    onChange={setEndDate}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={handleGenerateReport}
                                disabled={isGenerating}
                                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#C9AA6F] px-4 text-[14px] font-medium text-[#25282D] transition-colors hover:bg-[#D7B97F] disabled:opacity-50"
                            >
                                <FileText className="h-4 w-4" />
                                {isGenerating ? 'Generating...' : 'Generate Laporan'}
                            </button>
                        </div>
                    </div>
                </section>

                <div className="grid gap-3">
                    <section className="overflow-hidden rounded-[12px] border border-[#25282D] bg-[#16181C]">
                        <header className="flex flex-col gap-3 border-b border-[#25282D] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-[14px] font-semibold text-white">Riwayat Laporan</h2>
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
                                        <tr key={report.id}>
                                            <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-white">
                                                {report.title || formatReportTypeLabel(report.report_type)}
                                            </td>
                                            <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-[#757C8B]">
                                                {new Date(report.period_start).toLocaleDateString('id-ID')} - {new Date(report.period_end).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-white">
                                                {(report.format || 'csv').toUpperCase()}
                                            </td>
                                            <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-[#757C8B]">
                                                {new Date(report.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="border-b border-[#303030] px-3 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownloadHistory(report)}
                                                    className="inline-flex items-center gap-1 rounded-[8px] px-3 py-1 text-[14px] text-[#C9AA6F] transition-colors hover:bg-[#1E2127] hover:text-[#E3C28A]"
                                                >
                                                    unduh
                                                    <Download className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {recentReports.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="border-b border-[#303030] px-3 py-8 text-center text-[14px] text-[#6F6F6F]">
                                                Belum ada laporan yang digenerate
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {paginationMeta.totalPages > 1 && (
                            <div className="border-t border-[#25282D] bg-[#16181C]">
                                <Pagination
                                    currentPage={page}
                                    totalPages={paginationMeta.totalPages}
                                    onPageChange={setPage}
                                    startIndex={(page - 1) * 10}
                                    endIndex={Math.min(page * 10, paginationMeta.totalItems)}
                                    totalItems={paginationMeta.totalItems}
                                />
                            </div>
                        )}
                    </section>
                </div>
            </section>
        </SuperadminShell>
    );
}
