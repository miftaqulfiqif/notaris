import type { Metadata } from 'next';
import { SuperadminSupport } from '@/features/superadmin/presentation/components/SuperadminSupport';

export const metadata: Metadata = {
    title: 'Superadmin Support | Notarix',
    description: 'Halaman support superadmin untuk memantau tiket, SLA, dan respons tim operasional.',
};

export default function SuperadminSupportPage() {
    return <SuperadminSupport />;
}
