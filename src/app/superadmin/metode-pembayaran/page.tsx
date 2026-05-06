import type { Metadata } from 'next';
import { SuperadminPaymentMethods } from '@/features/superadmin/presentation/components/SuperadminPaymentMethods';

export const metadata: Metadata = {
    title: 'Superadmin Metode Pembayaran | Notarix',
    description: 'Halaman superadmin untuk mengatur metode pembayaran pendaftaran dan perpanjangan paket.',
};

export default function SuperadminPaymentMethodsPage() {
    return <SuperadminPaymentMethods />;
}
