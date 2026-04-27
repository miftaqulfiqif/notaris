'use client';

import { useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
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
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import { useSuperadminPackages } from '../../hooks/useSuperadminPackages';
import { PackagePlan as PackageType, PackageTenantRecord } from '../../types';

type PackageStatusValue = 'published' | 'unpublished' | 'archived';

type PackageMetric = {
    label: string;
    value: string;
    valueClassName?: string;
};

type PackageFormState = {
    annualPrice: string;
    documentsPerMonth: string;
    featuresText: string;
    introMonthlyPrice: string;
    listMonthlyPrice: string;
    maxUsers: string;
    monthlyPrice: string;
    name: string;
    promoBadge: string;
    promoEndsAt: string;
    promoStartsAt: string;
    statusValue: PackageStatusValue;
    storageGb: string;
};

const packageStatusOptions: SuperadminSelectOption[] = [
    { label: 'Published', value: 'published' },
    { label: 'Unpublished', value: 'unpublished' },
    { label: 'Archived', value: 'archived' },
];



const defaultPackageForm: PackageFormState = {
    annualPrice: '1500000',
    name: 'Basic',
    listMonthlyPrice: '750000',
    introMonthlyPrice: '500000',
    monthlyPrice: '500000',
    promoBadge: 'Pembelian pertama',
    promoEndsAt: '2026-12-31',
    promoStartsAt: '2026-01-01',
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

function normalizePlanFeatures(features: PackageType['features']) {
    if (Array.isArray(features)) {
        return features;
    }

    if (typeof features === 'string') {
        try {
            const parsedFeatures = JSON.parse(features);
            return Array.isArray(parsedFeatures) ? parsedFeatures : [];
        } catch {
            return features
                .split('\n')
                .map((feature) => feature.trim())
                .filter(Boolean);
        }
    }

    return [];
}

function buildFormStateFromPlan(plan: PackageType): PackageFormState {
    return {
        name: plan.name,
        annualPrice: String(plan.annual_price ?? plan.monthly_price * 12),
        listMonthlyPrice: String(plan.list_monthly_price ?? plan.monthly_price),
        introMonthlyPrice: String(plan.intro_monthly_price ?? plan.monthly_price),
        monthlyPrice: String(plan.monthly_price),
        promoBadge: plan.promo_badge ?? '',
        promoEndsAt: plan.promo_ends_at ? String(plan.promo_ends_at).slice(0, 10) : '',
        promoStartsAt: plan.promo_starts_at ? String(plan.promo_starts_at).slice(0, 10) : '',
        statusValue: plan.status as PackageStatusValue,
        maxUsers: String(plan.max_users),
        storageGb: String(plan.storage_gb),
        documentsPerMonth: String(plan.documents_per_month),
        featuresText: normalizePlanFeatures(plan.features).join('\n'),
    };
}

function PackagePlanCard({
    isDeleting,
    onDelete,
    onEdit,
    plan,
}: Readonly<{
    isDeleting: boolean;
    onDelete: (plan: PackageType) => void;
    onEdit: (plan: PackageType) => void;
    plan: PackageType;
}>) {
    const statusMeta = packageStatusMeta((plan.status || 'unpublished') as PackageStatusValue);
    const planFeatures = normalizePlanFeatures(plan.features);
    const monthlyPrice = Number(plan.monthly_price ?? 0);
    const activeTenants = Number(plan.active_tenants ?? 0);
    const totalSubscriptions = Number(plan.total_subscriptions ?? 0);
    const canDelete = plan.can_delete ?? totalSubscriptions === 0;

    return (
        <article className="rounded-[12px] border border-[#2A2A2A] bg-[#16181C] p-3">
            <div className="border-b border-[#323232] pb-3">
                <div className="space-y-4 px-3 py-3">
                    <h2 className="text-[24px] font-medium text-white">{plan.name}</h2>
                    <p className="text-[32px] font-light text-[#C9A96E]">{formatRupiah(monthlyPrice)}</p>
                    <ul className="space-y-1.5">
                        {planFeatures.map((feature: string) => (
                            <li key={feature} className="flex items-start gap-2 text-[14px] font-light text-[#797F8F]">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#3CB057]" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="flex items-center gap-3 py-4">
                <div className="flex-1">
                    <p className="text-[12px] font-light text-[#797F8F]">{`${activeTenants} tenant aktif`}</p>
                    {!canDelete ? (
                        <p className="mt-1 text-[11px] text-[#A27E4F]">Sudah memiliki pembeli, paket tidak bisa dihapus.</p>
                    ) : (
                        <p className="mt-1 text-[11px] text-[#5D6574]">Belum ada pembeli, paket bisa dihapus.</p>
                    )}
                </div>
                {canDelete ? (
                    <button
                        type="button"
                        aria-label={`Hapus paket ${plan.name}`}
                        onClick={() => onDelete(plan)}
                        disabled={isDeleting}
                        className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-[#5A2E31] bg-[#221518] px-3 text-[13px] text-[#E17D7D] transition-colors hover:border-[#E05A5A] hover:text-[#F0A0A0] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus
                    </button>
                ) : null}
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
                    <SuperadminTextInput
                        label="Harga Bulanan Normal"
                        value={value.listMonthlyPrice}
                        onChange={(nextValue) => onChange('listMonthlyPrice', nextValue)}
                    />
                    <SuperadminSelectField
                        label="Status"
                        value={value.statusValue}
                        onChange={(nextValue) => onChange('statusValue', nextValue)}
                        options={packageStatusOptions}
                    />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <SuperadminTextInput
                        label="Harga Promo Bulan Pertama"
                        value={value.introMonthlyPrice}
                        onChange={(nextValue) => onChange('introMonthlyPrice', nextValue)}
                    />
                    <SuperadminTextInput
                        label="Harga Perpanjangan Tahunan"
                        value={value.annualPrice}
                        onChange={(nextValue) => onChange('annualPrice', nextValue)}
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

                <div className="grid gap-3 md:grid-cols-3">
                    <SuperadminTextInput
                        label="Label Promo"
                        value={value.promoBadge}
                        onChange={(nextValue) => onChange('promoBadge', nextValue)}
                    />
                    <SuperadminTextInput
                        label="Promo Mulai (YYYY-MM-DD)"
                        value={value.promoStartsAt}
                        onChange={(nextValue) => onChange('promoStartsAt', nextValue)}
                    />
                    <SuperadminTextInput
                        label="Promo Selesai (YYYY-MM-DD)"
                        value={value.promoEndsAt}
                        onChange={(nextValue) => onChange('promoEndsAt', nextValue)}
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
    const { packages, tenants, metrics, isLoading, isDeleting, savePackage, deletePackage } = useSuperadminPackages();
    const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
    const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
    const [packageToDelete, setPackageToDelete] = useState<PackageType | null>(null);
    const [packageForm, setPackageForm] = useState<PackageFormState>(defaultPackageForm);

    const openAddModal = () => {
        setModalMode('add');
        setEditingPackageId(null);
        setPackageForm(defaultPackageForm);
    };

    const openEditModal = (plan: PackageType) => {
        setModalMode('edit');
        setEditingPackageId(plan.id);
        setPackageForm(buildFormStateFromPlan(plan));
    };

    const closeModal = () => {
        setModalMode(null);
        setEditingPackageId(null);
    };

    const openDeleteConfirm = (plan: PackageType) => {
        setPackageToDelete(plan);
    };

    const closeDeleteConfirm = () => {
        if (!isDeleting) {
            setPackageToDelete(null);
        }
    };

    const handleSavePackage = async () => {
        const normalizedFeatures = packageForm.featuresText
            .split('\n')
            .map((feature) => feature.trim())
            .filter(Boolean);

        const dataToSave: Partial<PackageType> = {
            annual_price: Number(packageForm.annualPrice) || 0,
            name: packageForm.name.trim() || 'Paket Baru',
            list_monthly_price: Number(packageForm.listMonthlyPrice) || 0,
            intro_monthly_price: Number(packageForm.introMonthlyPrice) || 0,
            monthly_price: Number(packageForm.monthlyPrice) || 0,
            promo_badge: packageForm.promoBadge.trim() || null,
            promo_ends_at: packageForm.promoEndsAt || null,
            promo_starts_at: packageForm.promoStartsAt || null,
            status: packageForm.statusValue,
            max_users: parseInt(packageForm.maxUsers) || 10,
            storage_gb: parseInt(packageForm.storageGb) || 50,
            documents_per_month: packageForm.documentsPerMonth.trim() || '1000',
            features: JSON.stringify(normalizedFeatures.length ? normalizedFeatures : ['Belum ada fitur']),
        };

        const success = await savePackage(editingPackageId, dataToSave);
        if (success) {
            closeModal();
        }
    };

    const handleDeletePackage = async () => {
        if (!packageToDelete?.id) {
            return;
        }

        const success = await deletePackage(packageToDelete.id);
        if (success) {
            setPackageToDelete(null);
        }
    };
    
    const mappedMetrics: PackageMetric[] = metrics ? [
        { label: 'Total MRR', value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(metrics.total_mrr || 0) },
        { label: 'Active Subscriptions', value: (metrics.active_subscriptions || 0).toString(), valueClassName: 'text-[#44DD5A]' },
        { label: 'Total Packages', value: (packages.length || 0).toString() }
    ] : [];

    if (isLoading) {
        return (
            <SuperadminShell activePage="subscriptionPackages" title="Paket Langganan">
                <div className="flex h-64 items-center justify-center text-[#6F6F6F]">
                    Loading...
                </div>
            </SuperadminShell>
        );
    }

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
                {packages.map((plan) => (
                    <PackagePlanCard
                        key={plan.id}
                        isDeleting={isDeleting && packageToDelete?.id === plan.id}
                        plan={plan}
                        onDelete={openDeleteConfirm}
                        onEdit={openEditModal}
                    />
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
                                {tenants.map((tenant: PackageTenantRecord) => (
                                    <tr key={tenant.id || tenant.tenant_name}>
                                        <td className="border-b border-[#303030] px-3 py-2.5 text-[14px] text-white">
                                            {tenant.tenant_name}
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-2.5 text-[14px] text-[#757C8B]">
                                            {tenant.package_name}
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-2.5 text-[14px] text-[#757C8B]">
                                            {new Date(tenant.start_date).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-2.5 text-[14px] text-[#757C8B]">
                                            {new Date(tenant.end_date).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="border-b border-[#303030] px-3 py-2.5">
                                            <SuperadminStatusBadge
                                                tone={tenant.status === 'active' ? 'success' : tenant.status === 'expired' ? 'danger' : 'warning'}
                                                value={tenant.status}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {tenants.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="border-b border-[#303030] px-3 py-8 text-center text-[14px] text-[#6F6F6F]">
                                            Belum ada tenant yang berlangganan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="overflow-hidden rounded-[12px] border border-[#25282D] bg-[#16181C]">
                    <header className="border-b border-[#25282D] px-4 py-3">
                        <h2 className="text-[14px] text-white">Metrik Paket</h2>
                    </header>

                    <div>
                        {mappedMetrics.map((metric) => (
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

            <ConfirmDialog
                isOpen={!!packageToDelete}
                title="Hapus paket"
                message={
                    packageToDelete
                        ? `Apakah anda yakin ingin menghapus paket ${packageToDelete.name}? Paket yang belum pernah dibeli akan dihapus permanen.`
                        : 'Apakah anda yakin ingin menghapus paket ini?'
                }
                confirmText={isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                cancelText="Batal"
                type="danger"
                onConfirm={() => {
                    void handleDeletePackage();
                }}
                onCancel={closeDeleteConfirm}
            />
        </SuperadminShell>
    );
}
