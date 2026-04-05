import type { Metadata } from 'next';
import { SuperadminReports } from '@/features/superadmin/presentation/components/SuperadminReports';

export const metadata: Metadata = {
    title: 'Superadmin Laporan | Notarix',
    description: 'Halaman laporan superadmin untuk membuat, mengunduh, dan menjadwalkan laporan operasional tenant.',
};

export default function SuperadminReportsPage() {
    return <SuperadminReports />;
}
