import { useState, useEffect, useCallback } from 'react';
import { superadminApi } from '../services/superadmin-api';
import type { PackagePlan, PackageTenantRecord, PackageMetrics } from '../types';
import { useToast } from '@/shared/hooks/useToast';

export function useSuperadminPackages() {
    const [packages, setPackages] = useState<PackagePlan[]>([]);
    const [tenants, setTenants] = useState<PackageTenantRecord[]>([]);
    const [metrics, setMetrics] = useState<PackageMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [packagesRes, tenantsRes, metricsRes] = await Promise.all([
                superadminApi.getPackages(),
                superadminApi.getPackageTenants(),
                superadminApi.getPackageMetrics()
            ]);

            setPackages(packagesRes.data);
            setTenants(tenantsRes.data);
            setMetrics(metricsRes.data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch packages data';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const savePackage = async (id: string | null, data: Partial<PackagePlan>) => {
        setIsSaving(true);
        try {
            if (id) {
                await superadminApi.updatePackage(id, data);
                showToast({ variant: 'success', message: 'Paket berhasil diperbarui' });
            } else {
                await superadminApi.createPackage(data);
                showToast({ variant: 'success', message: 'Paket baru berhasil dibuat' });
            }
            await fetchData();
            return true;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gagal menyimpan paket';
            showToast({ variant: 'error', message });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const deletePackage = async (id: string) => {
        setIsDeleting(true);
        try {
            await superadminApi.deletePackage(id);
            showToast({ variant: 'success', message: 'Paket berhasil dihapus' });
            await fetchData();
            return true;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gagal menghapus paket';
            showToast({ variant: 'error', message });
            return false;
        } finally {
            setIsDeleting(false);
        }
    };

    return { 
        packages, 
        tenants, 
        metrics, 
        isLoading, 
        isSaving,
        isDeleting,
        error, 
        savePackage,
        deletePackage,
        refetch: fetchData 
    };
}
