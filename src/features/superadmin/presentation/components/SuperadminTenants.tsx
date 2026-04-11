'use client';

import { ChevronDown, Download, Search } from 'lucide-react';
import {
    SuperadminShell,
    SuperadminStatCard,
    SuperadminStatusBadge,
} from '@/features/superadmin/presentation/components/SuperadminShell';

import { useSuperadminTenants } from '../../hooks/useSuperadminTenants';

type TenantStatusFilter = 'all' | 'active' | 'suspended' | 'trial';
type TenantPackageTone = 'basic' | 'starter' | 'professional' | 'enterprise';

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
    const { 
        tenants, 
        stats, 
        isLoading, 
        search, 
        setSearch, 
        statusFilter, 
        setStatusFilter 
    } = useSuperadminTenants();
    
    // Fallback UI mapping for Tenant records
    const mappedTenants = tenants.map(t => ({
        id: t.id,
        name: t.name,
        subtitle: 'Notaris & PPAT',
        contactEmail: t.contact_email || 'Belum tersedia',
        contactPhone: t.contact_phone || '-',
        createdAt: new Date(t.created_at || t.joined_date).toLocaleDateString('id-ID'),
        packageLabel: t.package,
        packageTone: t.package.toLowerCase().includes('starter') ? 'starter' : 'basic',
        joinedAt: new Date(t.joined_date).toLocaleDateString('id-ID'),
        activity: `${t.users_count} user aktif`,
        statusLabel: t.status,
        statusTone: t.status === 'active' ? 'success' : t.status === 'trial' ? 'warning' : 'danger',
        usersCount: t.users_count
    }));

    if (isLoading) {
        return (
            <SuperadminShell activePage="tenants" title="Tenants">
                <div className="flex h-64 items-center justify-center text-[#6F6F6F]">
                    Loading...
                </div>
            </SuperadminShell>
        );
    }

    return (
        <SuperadminShell activePage="tenants" title="Tenants">
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SuperadminStatCard
                    label="TOTAL TENANTS"
                    value={stats?.total_tenants.toString() || '0'}
                    footer={
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-[#797F8F]">Semua tenant terdaftar</span>
                        </div>
                    }
                />
                <SuperadminStatCard
                    label="AKTIF"
                    value={stats?.active_tenants.toString() || '0'}
                    valueClassName="text-[#3DBA7E]"
                />
                <SuperadminStatCard
                    label="NON-AKTIF / SUSPEND"
                    value={stats?.suspended_tenants.toString() || '0'}
                    valueClassName="text-[#FF6B71]"
                />
                <SuperadminStatCard
                    label="TRIAL / GRACE PERIOD"
                    value={stats?.trial_tenants.toString() || '0'}
                    valueClassName="text-[#E0A030]"
                />
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
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
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
                            {mappedTenants.map((tenant) => (
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
                            {mappedTenants.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-3 py-8 text-center text-[14px] text-[#6F6F6F] border-b border-[#303030]">
                                        Tidak ada data
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
