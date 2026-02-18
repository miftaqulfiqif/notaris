'use client';

import Link from 'next/link';
import { ChevronRight, EyeOff, Pencil, LogOut } from 'lucide-react';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { useAuthContext } from '@/features/auth/context/auth.context';
import { getInitials } from '@/shared/utils/initials';

interface InfoRow {
    label: string;
    value: string;
    isMuted?: boolean;
    isMasked?: boolean;
}

interface InfoCardProps {
    title: string;
    rows: InfoRow[];
}

function InfoCard({ title, rows }: InfoCardProps) {
    return (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h2 className="text-[22px] font-semibold text-gray-800 leading-none">{title}</h2>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-500"
                >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                </button>
            </header>

            <div>
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="grid grid-cols-[42%_58%] border-b border-gray-200 last:border-b-0"
                    >
                        <div className="px-4 py-3 text-base sm:text-lg font-semibold text-gray-600 leading-none">
                            {row.label}
                        </div>
                        <div className="flex items-center justify-between gap-2 bg-gray-50/50 px-4 py-3">
                            <span
                                className={`text-base sm:text-lg leading-none ${
                                    row.isMuted ? 'text-gray-400' : 'font-semibold text-gray-800'
                                }`}
                            >
                                {row.value}
                            </span>
                            {row.isMasked && <EyeOff className="h-4 w-4 shrink-0 text-gray-400" />}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function formatDate(date?: string | null) {
    if (!date) return '-';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;
    return parsedDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default function ProfilePage() {
    const { user, logout } = useAuthContext();

    const userInfoRows: InfoRow[] = [
        { label: 'Nama lengkap', value: user?.name || 'Muhammad Dummy' },
        { label: 'Gender', value: 'Laki-laki' },
        { label: 'Nomor Handphone', value: '+62 821 5089 5374' },
        { label: 'Jabatan', value: user?.role?.role_name || 'Staff', isMuted: !user?.role?.role_name },
    ];

    const institutionInfoRows: InfoRow[] = [
        { label: 'Nama Instansi', value: user?.notaris_name || 'PPAT Dummy' },
        { label: 'Email', value: user?.email || 'Dummy@Example.com' },
        { label: 'No.Telp', value: '+62 821 5089 5374' },
        { label: 'Paket langganan', value: 'Basic (Expired : 12 Juni 2026)' },
    ];

    const accountDetailRows: InfoRow[] = [
        { label: 'Nama pengguna', value: user?.username || user?.name || 'Dummy name' },
        { label: 'Email', value: user?.email || 'Dummy@Example.com' },
        { label: 'Password', value: '********', isMasked: true },
        { label: 'Konfirmasi password', value: '********', isMasked: true },
        { label: 'Role', value: user?.role?.role_name || 'Admin', isMuted: !user?.role?.role_name },
        { label: 'Akun dibuat', value: formatDate(user?.created_at) },
        { label: 'Terakhir login', value: '30 Maret 2026', isMuted: true },
        { label: 'Perubahan kata sandi terakhir', value: '30 Maret 2026', isMuted: true },
    ];

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="w-full min-h-screen flex flex-col">
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-100/50">
                        <DashboardHeader />
                    </div>

                    <div className="flex-1 px-4 sm:px-8 pb-8">
                        <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                            <Link href="/dashboard" className="hover:text-[#8B7355] transition-colors">
                                Dashboard
                            </Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="font-semibold text-gray-800">Profile</span>
                        </div>

                        <section className="mt-8 flex flex-col items-center text-center">
                            <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-[#89A1B5] to-[#3D4957] text-white flex items-center justify-center text-3xl font-semibold">
                                {getInitials(user?.name || 'Dummy Name')}
                                <span className="absolute bottom-0 right-0 rounded-full border border-gray-200 bg-white p-1 text-gray-500">
                                    <Pencil className="h-3.5 w-3.5" />
                                </span>
                            </div>
                            <h1 className="mt-3 text-2xl font-semibold text-gray-900">{user?.name || 'Dummy Name'}</h1>
                            <p className="mt-1 text-lg text-gray-500">{user?.email || 'Dummy@Example.com'}</p>
                        </section>

                        <div className="mt-8 grid gap-4 xl:grid-cols-2">
                            <div className="space-y-4">
                                <InfoCard title="Informasi User" rows={userInfoRows} />
                                <InfoCard title="Informasi Instansi" rows={institutionInfoRows} />
                            </div>

                            <div className="space-y-4">
                                <InfoCard title="Detail Akun" rows={accountDetailRows} />

                                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                                    <div className="flex items-center justify-between gap-4 px-4 py-3">
                                        <h2 className="text-xl font-medium text-gray-500">Danger Zone</h2>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    void logout();
                                                }}
                                                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Keluar
                                            </button>
                                            <button
                                                type="button"
                                                disabled
                                                className="rounded-lg border border-gray-200 bg-gray-100 px-5 py-2 text-gray-400 cursor-not-allowed"
                                            >
                                                Hapus akun
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
