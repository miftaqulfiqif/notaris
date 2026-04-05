import type { Metadata } from 'next';
import { SuperadminBillingInvoices } from '@/features/superadmin/presentation/components/SuperadminBillingInvoices';

export const metadata: Metadata = {
    title: 'Superadmin Billing & Invoice | Notarix',
    description: 'Halaman billing superadmin untuk memantau invoice, pendapatan, dan aging receivables tenant.',
};

export default function SuperadminBillingInvoicesPage() {
    return <SuperadminBillingInvoices />;
}
