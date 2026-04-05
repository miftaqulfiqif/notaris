import type { Metadata } from 'next';
import { SuperadminTransactions } from '@/features/superadmin/presentation/components/SuperadminTransactions';

export const metadata: Metadata = {
    title: 'Superadmin Transaksi | Notarix',
    description: 'Halaman transaksi superadmin untuk meninjau histori pembayaran tenant.',
};

export default function SuperadminTransactionsPage() {
    return <SuperadminTransactions />;
}
