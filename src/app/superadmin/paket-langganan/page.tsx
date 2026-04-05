import type { Metadata } from 'next';
import { SuperadminSubscriptionPackages } from '@/features/superadmin/presentation/components/SuperadminSubscriptionPackages';

export const metadata: Metadata = {
    title: 'Superadmin Paket Langganan | Notarix',
    description: 'Halaman paket langganan superadmin untuk mengelola plan, tenant per paket, dan metrik paket.',
};

export default function SuperadminSubscriptionPackagesPage() {
    return <SuperadminSubscriptionPackages />;
}
