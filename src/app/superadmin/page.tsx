import type { Metadata } from 'next';
import { SuperadminDashboard } from '@/features/superadmin/presentation/components/SuperadminDashboard';

export const metadata: Metadata = {
    title: 'Superadmin Dashboard | Notarix',
    description: 'Dashboard superadmin untuk memantau tenants, transaksi, dan operasional platform.',
};

export default function SuperadminPage() {
    return <SuperadminDashboard />;
}
