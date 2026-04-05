'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, ChevronDown, Download, Search } from 'lucide-react';
import {
    SuperadminShell,
    SuperadminStatCard,
    SuperadminStatusBadge,
    type SuperadminStatusTone,
} from '@/features/superadmin/presentation/components/SuperadminShell';

type TenantStatusFilter = 'all' | 'active' | 'suspended' | 'trial';
type TenantPackageTone = 'basic' | 'starter';
type TenantRecord = {
    activity: string;
    contactEmail: string;
    contactPhone: string;
    createdAt: string;
    id: string;
    joinedAt: string;
    name: string;
    packageLabel: string;
    packageTone: TenantPackageTone;
    statusLabel: string;
    statusTone: SuperadminStatusTone;
    statusValue: Exclude<TenantStatusFilter, 'all'>;
    subtitle: string;
};

const tenantSummaryCards = [
    {
        label: 'TOTAL TENANTS',
        value: '284',
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
        label: 'AKTIF',
        value: '1.182',
        valueClassName: 'text-[#3DBA7E]',
    },
    {
        label: 'NON-AKTIF / SUSPEND',
        value: '13',
        valueClassName: 'text-[#FF6B71]',
        footer: (
            <div className="flex items-center gap-2 text-[10px]">
                <span className="font-medium text-[#E05A5A]">3 dispute</span>
                <span className="text-[#797F8F]">Pending</span>
            </div>
        ),
    },
    {
        label: 'TRIAL / GRACE PERIOD',
        value: '8',
        valueClassName: 'text-[#E0A030]',
    },
];

const tenants: TenantRecord[] = [
    {
        id: 'tenant-graha-notaris',
        name: 'PT Graha Notaris',
        subtitle: 'Jakarta',
        contactEmail: 'graha@notarix.id',
        contactPhone: '+62 812-0001',
        createdAt: '19 Feb 2026, 09:22',
        packageLabel: 'Basic',
        packageTone: 'basic',
        joinedAt: '12 Jan 2024',
        activity: 'Baru saja',
        statusLabel: 'Aktif',
        statusTone: 'success',
        statusValue: 'active',
    },
    {
        id: 'tenant-kn-surya-hukum',
        name: 'KN Surya Hukum',
        subtitle: 'Samarinda',
        contactEmail: 'surya@kn-sh.id',
        contactPhone: '+62 812-0001',
        createdAt: '19 Feb 2026, 09:22',
        packageLabel: 'Starter',
        packageTone: 'starter',
        joinedAt: '12 Jan 2024',
        activity: '30 mnt lalu',
        statusLabel: 'Suspend',
        statusTone: 'danger',
        statusValue: 'suspended',
    },
    {
        id: 'tenant-cv-legaltama',
        name: 'CV Legaltama',
        subtitle: 'Samarinda',
        contactEmail: 'legal@legaltama.id',
        contactPhone: '+62 812-0001',
        createdAt: '19 Feb 2026, 09:22',
        packageLabel: 'Starter',
        packageTone: 'starter',
        joinedAt: '12 Jan 2024',
        activity: '2 jam lalu',
        statusLabel: 'Aktif',
        statusTone: 'success',
        statusValue: 'active',
    },
    {
        id: 'tenant-notaris-dewi',
        name: 'Notaris Dewi A.',
        subtitle: 'Jakarta',
        contactEmail: 'dewi@notarisdewi.id',
        contactPhone: '+62 812-0001',
        createdAt: '19 Feb 2026, 09:22',
        packageLabel: 'Starter',
        packageTone: 'starter',
        joinedAt: '12 Jan 2024',
        activity: '3 jam lalu',
        statusLabel: 'Aktif',
        statusTone: 'success',
        statusValue: 'active',
    },
    {
        id: 'tenant-kn-mitra-akta',
        name: 'KN Mitra Akta',
        subtitle: 'Jakarta',
        contactEmail: 'info@mitraakta.id',
        contactPhone: '+62 812-0001',
        createdAt: '19 Feb 2026, 09:22',
        packageLabel: 'Starter',
        packageTone: 'starter',
        joinedAt: '12 Jan 2024',
        activity: '1 hari lalu',
        statusLabel: 'Trial',
        statusTone: 'warning',
        statusValue: 'trial',
    },
    {
        id: 'tenant-pt-akta-sentosa',
        name: 'PT Akta Sentosa',
        subtitle: 'Samarinda',
        contactEmail: 'akta@sentosa.id',
        contactPhone: '+62 812-0001',
        createdAt: '19 Feb 2026, 09:22',
        packageLabel: 'Basic',
        packageTone: 'basic',
        joinedAt: '12 Jan 2024',
        activity: '5 hari lalu',
        statusLabel: 'Aktif',
        statusTone: 'success',
        statusValue: 'active',
    },
    {
        id: 'tenant-firma-hukum',
        name: 'Firma Hukum',
        subtitle: 'Jakarta',
        contactEmail: 'prima@arsipprima.id',
        contactPhone: '+62 812-0001',
        createdAt: '19 Feb 2026, 09:22',
        packageLabel: 'Basic',
        packageTone: 'basic',
        joinedAt: '12 Jan 2024',
        activity: '10 hari lalu',
        statusLabel: 'Trial',
        statusTone: 'warning',
        statusValue: 'trial',
    },
];

const statusOptions: { label: string; value: TenantStatusFilter }[] = [
    { label: 'Semua status', value: 'all' },
    { label: 'Aktif', value: 'active' },
    { label: 'Suspend', value: 'suspended' },
    { label: 'Trial', value: 'trial' },
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

function TenantPackageBadge({
    label,
    tone,
}: Readonly<{
    label: string;
    tone: TenantPackageTone;
}>) {
    const className =
        tone === 'basic'
            ? 'border-[#E0A030] bg-[#2B261E] text-[#E0A030]'
            : 'border-[#6F6F6F] bg-[#202328] text-[#6F6F6F]';

    return (
        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${className}`}>
            {label}
        </span>
    );
}

export function SuperadminTenants() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TenantStatusFilter>('all');

    const filteredTenants = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return tenants.filter((tenant) => {
            const matchesQuery =
                normalizedQuery.length === 0 ||
                tenant.name.toLowerCase().includes(normalizedQuery) ||
                tenant.contactEmail.toLowerCase().includes(normalizedQuery) ||
                tenant.id.toLowerCase().includes(normalizedQuery);
            const matchesStatus = statusFilter === 'all' || tenant.statusValue === statusFilter;

            return matchesQuery && matchesStatus;
        });
    }, [searchQuery, statusFilter]);

    return (
        <SuperadminShell activePage="tenants" title="Tenants">
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {tenantSummaryCards.map((card) => (
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
                            <span className="sr-only">Cari tenant atau kontak</span>
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6F6F6F]" />
                            <input
                                type="search"
                                aria-label="Cari tenant atau kontak"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Cari Tenant, ID Transaksi"
                                className="h-8 w-full min-w-0 rounded-[8px] border border-[#212121] bg-[#0E0F11] pl-9 pr-3 text-[12px] text-[#D4D4D4] outline-none transition-colors placeholder:text-[#6F6F6F] hover:border-[#3B414D] focus:border-[#C99D4B] sm:min-w-[275px]"
                            />
                        </label>

                        <SelectField
                            ariaLabel="Filter status tenant"
                            value={statusFilter}
                            onChange={(value) => setStatusFilter(value as TenantStatusFilter)}
                            options={statusOptions}
                        />
                    </div>

                    <button
                        type="button"
                        className="inline-flex h-8 w-full items-center justify-center gap-2 self-start rounded-[8px] border border-[#797F8F] bg-[#16181C] px-3 text-[14px] text-[#797F8F] transition-colors hover:border-[#C99D4B] hover:text-[#C99D4B] sm:w-auto sm:justify-start"
                    >
                        <Download className="h-4 w-4" />
                        Ekspor
                    </button>
                </div>

                <div className="overflow-x-auto px-3 py-3 sm:px-4">
                    <table className="min-w-[940px] w-full border-separate border-spacing-0 text-left" role="table">
                        <thead>
                            <tr className="text-[12px] uppercase text-[#797F8F]">
                                <th className="border-b border-[#303030] px-3 py-3 font-normal">Tenant</th>
                                <th className="border-b border-[#303030] px-3 py-3 font-normal">Kontak</th>
                                <th className="border-b border-[#303030] px-3 py-3 font-normal">Tanggal</th>
                                <th className="border-b border-[#303030] px-3 py-3 font-normal">Paket</th>
                                <th className="border-b border-[#303030] px-3 py-3 font-normal">Join Date</th>
                                <th className="border-b border-[#303030] px-3 py-3 font-normal">Aktivitas</th>
                                <th className="border-b border-[#303030] px-3 py-3 font-normal">Status</th>
                                <th className="border-b border-[#303030] px-3 py-3 text-center font-normal">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTenants.map((tenant) => (
                                <tr key={tenant.id} className="align-top">
                                    <td className="border-b border-[#303030] px-3 py-3">
                                        <p className="text-[14px] text-white">{tenant.name}</p>
                                        <p className="mt-1 text-[12px] text-[#757C8B]">{tenant.subtitle}</p>
                                    </td>
                                    <td className="border-b border-[#303030] px-3 py-3">
                                        <p className="text-[14px] text-white">{tenant.contactEmail}</p>
                                        <p className="mt-1 text-[12px] text-[#757C8B]">{tenant.contactPhone}</p>
                                    </td>
                                    <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-[#757C8B]">
                                        {tenant.createdAt}
                                    </td>
                                    <td className="border-b border-[#303030] px-3 py-3">
                                        <TenantPackageBadge
                                            label={tenant.packageLabel}
                                            tone={tenant.packageTone}
                                        />
                                    </td>
                                    <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-[#757C8B]">
                                        {tenant.joinedAt}
                                    </td>
                                    <td className="border-b border-[#303030] px-3 py-3 text-[14px] text-[#757C8B]">
                                        {tenant.activity}
                                    </td>
                                    <td className="border-b border-[#303030] px-3 py-3">
                                        <SuperadminStatusBadge
                                            tone={tenant.statusTone}
                                            value={tenant.statusLabel}
                                        />
                                    </td>
                                    <td className="border-b border-[#303030] px-3 py-3 text-center">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-[8px] px-3 py-1 text-[14px] text-[#C9AA6F] transition-colors hover:bg-[#1E2127] hover:text-[#E3C28A]"
                                        >
                                            Detail
                                        </button>
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
