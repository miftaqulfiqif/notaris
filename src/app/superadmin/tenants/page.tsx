import type { Metadata } from 'next';
import { SuperadminTenants } from '@/features/superadmin/presentation/components/SuperadminTenants';

export const metadata: Metadata = {
    title: 'Superadmin Tenants | Notarix',
    description: 'Halaman tenant superadmin untuk memantau status, paket, dan aktivitas tenant.',
};

export default function SuperadminTenantsPage() {
    return <SuperadminTenants />;
}
