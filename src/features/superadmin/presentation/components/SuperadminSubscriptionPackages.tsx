'use client';

import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import {
    SuperadminActionButton,
    SuperadminModal,
    SuperadminSelectField,
    SuperadminTextarea,
    SuperadminTextInput,
    type SuperadminSelectOption,
} from '@/features/superadmin/presentation/components/SuperadminOverlay';
import {
    SuperadminShell,
    SuperadminStatusBadge,
    type SuperadminStatusTone,
} from '@/features/superadmin/presentation/components/SuperadminShell';

type PackageStatusValue = 'published' | 'unpublished' | 'archived';

type PackagePlan = {
    documentsPerMonth: string;
    features: string[];
    id: string;
    maxUsers: string;
    monthlyPrice: number;
    name: string;
    statusValue: PackageStatusValue;
    storageGb: string;
    tenantSummary: string;
};

type PackageMetric = {
    label: string;
    value: string;
    valueClassName?: string;
};

type PackageTenantRecord = {
    name: string;
    packageName: string;
    renewalDate: string;
    startDate: string;
    statusLabel: string;
    statusTone: SuperadminStatusTone;
};

type PackageFormState = {
    documentsPerMonth: string;
    featuresText: string;
    maxUsers: string;
    monthlyPrice: string;
    name: string;
    statusValue: PackageStatusValue;
    storageGb: string;
};

const packageStatusOptions: SuperadminSelectOption[] = [
    { label: 'Published', value: 'published' },
    { label: 'Unpublished', value: 'unpublished' },
    { label: 'Archived', value: 'archived' },
];

const initialPackagePlans: PackagePlan[] = [
    {
        id: 'basic-starter',
        name: 'Basic (Starter)',
        monthlyPrice: 750000,
        features: [
            'Hingga 3 user',
            '500 dokumen/bulan',
            '15 GB penyimpanan',
            'Manajemen Dokumen Terpusat',
        ],
        tenantSummary: '71 tenants aktif',
        statusValue: 'published',
        maxUsers: '3',
        storageGb: '15',
        documentsPerMonth: '500',
    },
    {
        id: 'yearly',
        name: 'Yearly',
        monthlyPrice: 1500000,
        features: [
            'Hingga 3 user',
            '500 dokumen/bulan',
            '15 GB penyimpanan',
            'Manajemen Dokumen Terpusat',
        ],
        tenantSummary: '71 tenants aktif',
        statusValue: 'published',
        maxUsers: '3',
        storageGb: '15',
        documentsPerMonth: '500',
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        monthlyPrice: 5000000,
        features: [
            'Hingga 10 user',
            'Unlimited dokumen',
            '50 GB penyimpanan',
            'Priority support',
            'Integrasi e-sign',
        ],
        tenantSummary: '0 tenants aktif',
        statusValue: 'unpublished',
        maxUsers: '10',
        storageGb: '50',
        documentsPerMonth: 'Unlimited',
    },
];

const packageTenants: PackageTenantRecord[] = [
    {
        name: 'PT Graha Notaris',
        packageName: 'Starter',
        startDate: 'Maret 2026',
        renewalDate: 'Juni 2026',
        statusLabel: 'Sukses',
        statusTone: 'success',
    },
    {
        name: 'KN Surya Hukum',
        packageName: 'Starter',
        startDate: 'Maret 2026',
        renewalDate: 'Juni 2026',
        statusLabel: 'Gagal',
        statusTone: 'danger',
    },
    {
        name: 'CV Legaltama',
        packageName: 'Starter',
        startDate: 'Maret 2026',
        renewalDate: 'Juni 2026',
        statusLabel: 'Sukses',
        statusTone: 'success',
    },
    {
        name: 'Notaris Dewi A.',
        packageName: 'Starter',
        startDate: 'Maret 2026',
        renewalDate: 'Juni 2026',
        statusLabel: 'Sukses',
        statusTone: 'success',
    },
    {
        name: 'KN Mitra Akta',
        packageName: 'Starter',
        startDate: 'Maret 2026',
        renewalDate: 'Juni 2026',
        statusLabel: 'Pending',
        statusTone: 'warning',
    },
    {
        name: 'PT Akta Sentosa',
        packageName: 'Starter',
        startDate: 'Maret 2026',
        renewalDate: 'Juni 2026',
        statusLabel: 'Dispute',
        statusTone: 'muted',
    },
    {
        name: 'Firma Hukum',
        packageName: 'Starter',
        startDate: 'Maret 2026',
        renewalDate: 'Juni 2026',
        statusLabel: 'Refund',
        statusTone: 'info',
    },
];

const packageMetrics: PackageMetric[] = [
    { label: 'ARPU Starter', value: 'Rp 750.000' },
    { label: 'ARPU Yearly', value: 'Rp 1.500.000' },
    { label: 'ARPU Enterprise', value: 'Rp 5.000.000' },
    { label: 'Churn Pro → turun', value: '3.2%', valueClassName: 'text-[#FFD766]' },
    { label: 'Upgrade rate Starter→Pro', value: '8.4%', valueClassName: 'text-[#44DD5A]' },
];

const defaultPackageForm: PackageFormState = {
    name: 'Basic',
    monthlyPrice: '500000',
    statusValue: 'published',
    maxUsers: '10',
    storageGb: '50',
    documentsPerMonth: 'Unlimited',
    featuresText: ['Hingga 10 user', 'Unlimited dokumen', '50 GB penyimpanan', 'Priority support', 'Integrasi e-sign'].join(
        '\n',
    ),
};

function formatRupiah(value: number) {
    return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
}

function packageStatusMeta(statusValue: PackageStatusValue): {
    label: string;
    tone: SuperadminStatusTone;
} {
    if (statusValue === 'published') {
        return { label: 'Aktif', tone: 'success' };
    }

    if (statusValue === 'archived') {
        return { label: 'Archived', tone: 'danger' };
    }

    return { label: 'Unpublished', tone: 'muted' };
}

function buildFormStateFromPlan(plan: PackagePlan): PackageFormState {
    return {
        name: plan.name,
        monthlyPrice: String(plan.monthlyPrice),
        statusValue: plan.statusValue,
        maxUsers: plan.maxUsers,
        storageGb: plan.storageGb,
        documentsPerMonth: plan.documentsPerMonth,
        featuresText: plan.features.join('\n'),
    };
}

function PackagePlanCard({
    onEdit,
    plan,
}: Readonly<{
    onEdit: (plan: PackagePlan) => void;
    plan: PackagePlan;
}>) {
    const statusMeta = packageStatusMeta(plan.statusValue);

    return (
        <article className="rounded-[12px] border border-[#2A2A2A] bg-[#16181C] p-3">
            <div className="border-b border-[#323232] pb-3">
                <div className="space-y-4 px-3 py-3">
                    <h2 className="text-[24px] font-medium text-white">{plan.name}</h2>
                    <p className="text-[32px] font-light text-[#C9A96E]">{formatRupiah(plan.monthlyPrice)}</p>
                    <ul className="space-y-1.5">
                        {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-[14px] font-light text-[#797F8F]">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#3CB057]" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="flex items-center gap-3 py-4">
                <p className="flex-1 text-[12px] font-light text-[#797F8F]">{plan.tenantSummary}</p>
                <button
                    type="button"
                    aria-label={`Edit paket ${plan.name}`}
                    onClick={() => onEdit(plan)}
                    className="inline-flex h-8 items-center rounded-[8px] border border-[#797F8F] bg-[#16181C] px-4 text-[14px] text-[#797F8F] transition-colors hover:border-[#C99D4B] hover:text-[#C99D4B]"
                >
                    Edit
                </button>
                <SuperadminStatusBadge tone={statusMeta.tone} value={statusMeta.label} />
            </div>
        </article>
    );
}

function PackageFormModal({
    mode,
    onClose,
    onSave,
    value,
    onChange,
}: Readonly<{
    mode: 'add' | 'edit';
    onChange: (field: keyof PackageFormState, nextValue: string) => void;
    onClose: () => void;
    onSave: () => void;
    value: PackageFormState;
}>) {
    return (
        <SuperadminModal
            maxWidthClassName="max-w-[563px]"
            onClose={onClose}
            title={mode === 'add' ? 'Tambah Paket Langganan' : 'Edit Paket Langganan'}
        >
            <div className="space-y-6 px-5 py-5">
                <SuperadminTextInput
                    label="Nama Paket"
                    value={value.name}
                    onChange={(nextValue) => onChange('name', nextValue)}
                />

                <div className="grid gap-3 md:grid-cols-2">
                    <SuperadminTextInput
                        label="Harga (Rp/bulan)"
                        value={value.monthlyPrice}
                        onChange={(nextValue) => onChange('monthlyPrice', nextValue)}
                    />
                    <SuperadminSelectField
                        label="Status"
                        value={value.statusValue}
                        onChange={(nextValue) => onChange('statusValue', nextValue)}
                        options={packageStatusOptions}
                    />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <SuperadminTextInput
                        label="Max User"
                        value={value.maxUsers}
                        onChange={(nextValue) => onChange('maxUsers', nextValue)}
                    />
                    <SuperadminTextInput
                        label="Storage (GB)"
                        value={value.storageGb}
                        onChange={(nextValue) => onChange('storageGb', nextValue)}
                    />
                    <SuperadminTextInput
                        label="Dokumen/bulan"
                        value={value.documentsPerMonth}
                        onChange={(nextValue) => onChange('documentsPerMonth', nextValue)}
                    />
                </div>

                <SuperadminTextarea
                    label="Fitur (satu per baris)"
                    value={value.featuresText}
                    onChange={(nextValue) => onChange('featuresText', nextValue)}
                    rows={5}
                />

                <div className="flex justify-end gap-3 border-t border-[#4B4B4B] pt-6">
                    <SuperadminActionButton onClick={onClose}>Batal</SuperadminActionButton>
                    <SuperadminActionButton variant="primary" onClick={onSave}>
                        Simpan Paket
                    </SuperadminActionButton>
                </div>
            </div>
        </SuperadminModal>
    );
}

export function SuperadminSubscriptionPackages() {
    const [packagePlans, setPackagePlans] = useState(initialPackagePlans);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
    const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
    const [packageForm, setPackageForm] = useState<PackageFormState>(defaultPackageForm);

    const openAddModal = () => {
        setModalMode('add');
        setEditingPackageId(null);
        setPackageForm(defaultPackageForm);
    };

    const openEditModal = (plan: PackagePlan) => {
        setModalMode('edit');
        setEditingPackageId(plan.id);
        setPackageForm(buildFormStateFromPlan(plan));
    };

    const closeModal = () => {
        setModalMode(null);
        setEditingPackageId(null);
    };

    const handleSavePackage = () => {
        const normalizedFeatures = packageForm.featuresText
            .split('\n')
            .map((feature) => feature.trim())
            .filter(Boolean);
        const nextPlan: PackagePlan = {
            id: editingPackageId ?? `package-${Date.now()}`,
            name: packageForm.name.trim() || 'Paket Baru',
            monthlyPrice: Number(packageForm.monthlyPrice) || 0,
            statusValue: packageForm.statusValue,
            maxUsers: packageForm.maxUsers.trim() || '-',
            storageGb: packageForm.storageGb.trim() || '-',
            documentsPerMonth: packageForm.documentsPerMonth.trim() || '-',
            features: normalizedFeatures.length ? normalizedFeatures : ['Belum ada fitur'],
            tenantSummary:
                editingPackageId === null
                    ? '0 tenants aktif'
                    : packagePlans.find((plan) => plan.id === editingPackageId)?.tenantSummary ?? '0 tenants aktif',
        };

        setPackagePlans((currentPlans) => {
            if (editingPackageId === null) {
                return [...currentPlans, nextPlan];
            }

            return currentPlans.map((plan) => (plan.id === editingPackageId ? nextPlan : plan));
        });

        closeModal();
    };

    return (
        <SuperadminShell
            activePage="subscriptionPackages"
            title="Paket Langganan"
            headerActions={
                <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C9AA6F] px-4 text-[14px] text-[#25282D] transition-colors hover:bg-[#D7B97F]"
                >
                    <Plus className="h-4 w-4" />
                    Buat paket
                </button>
            }
        >
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {packagePlans.map((plan) => (
                    <PackagePlanCard key={plan.id} plan={plan} onEdit={openEditModal} />
                ))}
            </section>

            <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_323px]">
                <section className="overflow-hidden rounded-[12px] border border-[#25282D] bg-[#16181C]">
                    <header className="flex items-center justify-between border-b border-[#25282D] px-4 py-3">
                        <h2 className="text-[14px] text-white">Tenant per Paket</h2>
                        <button
                            type="button"
                            className="text-[14px] text-[#C9AA6F] transition-colors hover:text-[#E3C28A]"
                        >
                            Ekspor
                        </button>
                    </header>

                    <div className="overflow-x-auto px-3 py-3">
                        <table className="w-full min-w-[620px] border-separate border-spacing-0 text-left" role="table">
                            <thead>
                                <tr className="text-[12px] uppercase text-[#797F8F]">
                                    <th className="border-b border-[#303030] px-3 py-2 font-normal">Tenant</th>
                                    <th className="border-b border-[#303030] px-3 py-2 font-normal">Paket</th>
                                    <th className="border-b border-[#303030] px-3 py-2 font-normal">Mulai</th>
                                    <th className="border-b border-[#303030] px-3 py-2 font-normal">Perpanjangan</th>
                                    <th className="border-b border-[#303030] px-3 py-2 font-normal">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {packageTenants.map((tenant) => (
                                    <tr key={tenant.name}>
                                        <td className="border-b border-[#303030] px-3 py-2.5 text-[14px] text-white">
                                            {tenant.name}
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-2.5 text-[14px] text-[#757C8B]">
                                            {tenant.packageName}
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-2.5 text-[14px] text-[#757C8B]">
                                            {tenant.startDate}
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-2.5 text-[14px] text-[#757C8B]">
                                            {tenant.renewalDate}
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-2.5">
                                            <SuperadminStatusBadge
                                                tone={tenant.statusTone}
                                                value={tenant.statusLabel}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="overflow-hidden rounded-[12px] border border-[#25282D] bg-[#16181C]">
                    <header className="border-b border-[#25282D] px-4 py-3">
                        <h2 className="text-[14px] text-white">Metrik Paket</h2>
                    </header>

                    <div>
                        {packageMetrics.map((metric) => (
                            <div
                                key={metric.label}
                                className="flex items-center justify-between border-b border-[#303030] px-4 py-3 last:border-b-0"
                            >
                                <p className="text-[12px] font-light text-[#6F6F6F]">{metric.label}</p>
                                <p className={`text-[12px] font-semibold text-white ${metric.valueClassName ?? ''}`}>
                                    {metric.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </section>

            {modalMode ? (
                <PackageFormModal
                    mode={modalMode}
                    onClose={closeModal}
                    onSave={handleSavePackage}
                    value={packageForm}
                    onChange={(field, nextValue) =>
                        setPackageForm((currentValue) => ({
                            ...currentValue,
                            [field]: nextValue,
                        }))
                    }
                />
            ) : null}
        </SuperadminShell>
    );
}
