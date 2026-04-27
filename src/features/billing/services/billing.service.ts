import { ENDPOINTS } from '@/shared/api/endpoints';
import type { BillingPackage, CheckoutContext, CheckoutResponse, PackagesResponse } from '../types/billing.types';

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
    const response = await fetch(input, {
        ...init,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });

    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload?.errors || payload?.message || 'Request failed');
    }

    return payload as T;
}

export const billingService = {
    async getPackages(): Promise<BillingPackage[]> {
        const response = await fetchJson<PackagesResponse>(ENDPOINTS.PUBLIC.PACKAGES, {
            cache: 'no-store',
            method: 'GET',
        });

        return response.data;
    },

    async getCheckout(): Promise<CheckoutContext> {
        const response = await fetchJson<CheckoutResponse>(ENDPOINTS.BILLING.CHECKOUT, {
            cache: 'no-store',
            method: 'GET',
        });

        return response.data;
    },

    async createCharge(payload: { payment_group: string; payment_channel: string }): Promise<CheckoutContext> {
        const response = await fetchJson<CheckoutResponse>(ENDPOINTS.BILLING.CHARGE, {
            body: JSON.stringify(payload),
            method: 'POST',
        });

        return response.data;
    },

    async getCheckoutStatus(): Promise<CheckoutContext> {
        const response = await fetchJson<CheckoutResponse>(ENDPOINTS.BILLING.STATUS, {
            cache: 'no-store',
            method: 'GET',
        });

        return response.data;
    },
};
