'use client';

import { useEffect, useMemo, useState } from 'react';
import { Settings } from 'lucide-react';
import { currentUser } from '@/layout/data/sidebar.data';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { getInitials } from '@/shared/utils/initials';
import { apiGet } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { Toast } from '@/shared/components/Toast';
import { useToast } from '@/shared/hooks/useToast';

interface NotarisDetailResponse {
    message: string;
    data: {
        avatar: string | null;
        notaris_name: string;
        email: string;
        alamat: string;
        paket: string | null;
    };
}

interface NotarisUserItem {
    id: string;
    role: string;
    name: string;
    profile_picture: string | null;
    created_at: string;
}

interface NotarisUsersResponse {
    message: string;
    data: NotarisUserItem[];
}

const resolveRoleClass = (role: string) =>
    role.toLowerCase().includes('kepala')
        ? 'bg-sky-100 text-sky-700'
        : 'bg-lime-100 text-lime-700';

export default function InstansiPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notarisDetail, setNotarisDetail] = useState<NotarisDetailResponse['data'] | null>(null);
    const [teamMembers, setTeamMembers] = useState<NotarisUserItem[]>([]);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        let mounted = true;

        const fetchInstansiData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [detailResponse, usersResponse] = await Promise.all([
                    apiGet<NotarisDetailResponse>(ENDPOINTS.NOTARIS.DETAIL),
                    apiGet<NotarisUsersResponse>(ENDPOINTS.NOTARIS.USERS),
                ]);

                if (!mounted) return;

                setNotarisDetail(detailResponse.data);
                setTeamMembers(usersResponse.data || []);
            } catch (err) {
                if (!mounted) return;
                setError(err instanceof Error ? err.message : 'Gagal memuat data instansi');
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchInstansiData();

        return () => {
            mounted = false;
        };
    }, []);

    const packageLabel = useMemo(() => {
        if (!notarisDetail?.paket) return 'Basic';
        return notarisDetail.paket
            .split('_')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }, [notarisDetail?.paket]);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="w-full min-h-screen flex flex-col">
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-100/50">
                        <DashboardHeader />
                    </div>

                    <div className="flex-1 px-4 sm:px-8 pb-8">
                        <div className="mx-auto w-full max-w-[1240px] pt-6">
                            {error && (
                                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{currentUser.name} Teams</h1>

                            <section className="mt-8">
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Umum</h2>
                                <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                    <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-5 py-3.5">
                                        <p className="text-base sm:text-lg font-semibold text-gray-800">Avatar</p>
                                        <div className="h-12 w-12 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500">
                                            {getInitials(currentUser.name)}
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-200 px-4 sm:px-5 py-3.5">
                                        <p className="text-base sm:text-lg font-semibold text-gray-800">Nama</p>
                                        <div className="w-full sm:max-w-md rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm sm:text-base text-gray-800">
                                            {notarisDetail?.notaris_name || currentUser.name}
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-200 px-4 sm:px-5 py-3.5">
                                        <p className="text-base sm:text-lg font-semibold text-gray-800">Email</p>
                                        <div className="w-full sm:max-w-md rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm sm:text-base text-gray-800">
                                            {notarisDetail?.email || currentUser.email}
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-200 px-4 sm:px-5 py-3.5">
                                        <p className="text-base sm:text-lg font-semibold text-gray-800">Alamat</p>
                                        <div className="w-full sm:max-w-md rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm sm:text-base text-gray-800">
                                            {notarisDetail?.alamat || '-'}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-4 sm:px-5 py-3.5">
                                        <p className="text-base sm:text-lg font-semibold text-gray-800">Paket</p>
                                        <span className="rounded-lg bg-sky-100 px-3 py-1 text-sm text-sky-700">{packageLabel}</span>
                                    </div>
                                </div>
                            </section>

                            <section className="mt-9">
                                <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Member Team</h2>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => showToast({ message: 'Form tambah member belum tersedia', variant: 'info' })}
                                            className="rounded-xl border border-gray-200 bg-white px-5 sm:px-6 py-2.5 text-sm sm:text-base text-gray-400"
                                        >
                                            Tambah member baru
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => showToast({ message: 'Pengaturan member belum tersedia', variant: 'info' })}
                                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 sm:px-6 py-2.5 text-sm sm:text-base text-[#6E5F49]"
                                        >
                                            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                                            setting
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
                                    <div className="min-w-[680px]">
                                        <div className="grid grid-cols-[190px_1fr_220px] border-b border-gray-200 px-4 py-3.5 text-base sm:text-lg text-gray-800">
                                            <p>Role</p>
                                            <p>Nama</p>
                                            <p>Akun dibuat</p>
                                        </div>
                                        {isLoading ? (
                                            <div className="px-4 py-4 text-sm text-gray-500">Memuat member...</div>
                                        ) : teamMembers.length === 0 ? (
                                            <div className="px-4 py-4 text-sm text-gray-500">Belum ada member.</div>
                                        ) : (
                                            teamMembers.map((member) => (
                                                <div key={member.id} className="grid grid-cols-[190px_1fr_220px] items-center border-b border-gray-200 px-4 py-4 last:border-b-0">
                                                    <div>
                                                        <span className={`rounded-2xl px-4 py-1.5 text-sm sm:text-base font-medium ${resolveRoleClass(member.role)}`}>
                                                            {member.role}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#89A1B5] to-[#3D4957] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                                                            {getInitials(member.name)}
                                                        </div>
                                                        <p className="text-base sm:text-xl font-medium text-gray-900">{member.name}</p>
                                                    </div>
                                                    <p className="text-sm sm:text-base text-gray-500">{member.created_at}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="mt-6 mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4">
                                    <div>
                                        <p className="text-base sm:text-lg font-semibold text-gray-800">Keluar</p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Keluar dari instansi sama saja menghapus akun anda dari Notarix
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => showToast({ message: 'Aksi keluar instansi belum tersedia', variant: 'info' })}
                                        className="self-start sm:self-auto text-base sm:text-lg font-medium text-red-600 hover:text-red-700 transition-colors"
                                    >
                                        Keluar
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
            <Toast toast={toast} onClose={hideToast} position="bottom-left" />
        </div>
    );
}
