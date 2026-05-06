import { useEffect, useState } from 'react';
import { superadminApi } from '../services/superadmin-api';
import type { PaymentMethodGroup } from '../types';

export function useSuperadminPaymentMethods() {
    const [groups, setGroups] = useState<PaymentMethodGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingCode, setUpdatingCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadPaymentMethods = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await superadminApi.getPaymentMethods();
                if (mounted) {
                    setGroups(response.data ?? []);
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Gagal memuat metode pembayaran');
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadPaymentMethods();

        return () => {
            mounted = false;
        };
    }, []);

    const updatePaymentMethod = async (code: string, isEnabled: boolean) => {
        setUpdatingCode(code);
        setError(null);

        try {
            const response = await superadminApi.updatePaymentMethod(code, { is_enabled: isEnabled });
            setGroups(response.data ?? []);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memperbarui metode pembayaran');
            return false;
        } finally {
            setUpdatingCode(null);
        }
    };

    return {
        error,
        groups,
        isLoading,
        updatePaymentMethod,
        updatingCode,
    };
}
