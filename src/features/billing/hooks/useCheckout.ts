'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { billingService } from '../services/billing.service';
import type { CheckoutContext } from '../types/billing.types';

const emptyCheckout: CheckoutContext = {
    invoice: null,
    package: null,
    payment_methods: [],
    quote: {
        charge_amount: 0,
        discount: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
    },
    subscription: null,
    transaction: null,
};

export function useCheckout() {
    const [checkout, setCheckout] = useState<CheckoutContext>(emptyCheckout);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

    const loadCheckout = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const context = await billingService.getCheckout();
            setCheckout(context);

            const defaultGroup = context.payment_methods[0]?.group ?? null;
            const defaultChannel = context.payment_methods[0]?.channels[0]?.code ?? null;
            setSelectedGroup((current) => current ?? defaultGroup);
            setSelectedChannel((current) => current ?? defaultChannel);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat checkout');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCheckout();
    }, [loadCheckout]);

    const selectedPayment = useMemo(() => ({
        payment_channel: selectedChannel,
        payment_group: selectedGroup,
    }), [selectedChannel, selectedGroup]);

    const submitCharge = useCallback(async () => {
        if (!selectedGroup || !selectedChannel) {
            throw new Error('Pilih metode pembayaran terlebih dahulu');
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await billingService.createCharge({
                payment_channel: selectedChannel,
                payment_group: selectedGroup,
            });
            setCheckout(result);
            return result;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal membuat instruksi pembayaran';
            setError(message);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedChannel, selectedGroup]);

    return {
        checkout,
        error,
        isLoading,
        isSubmitting,
        loadCheckout,
        selectedChannel,
        selectedGroup,
        selectedPayment,
        setSelectedChannel,
        setSelectedGroup,
        submitCharge,
    };
}
