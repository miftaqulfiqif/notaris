'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, EyeOff, Pencil, LogOut } from 'lucide-react';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { useAuthContext } from '@/features/auth/context/auth.context';
import { getUserRoleName } from '@/features/auth/utils/user';
import type { UserDetailData, UserDetailResponse } from '@/features/auth/types';
import { apiGet, apiPatch, apiPost } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { getInitials } from '@/shared/utils/initials';
import ConfirmDialog from '@/shared/components/ConfirmDialog';

interface InfoRow {
    key: string;
    label: string;
    value: string;
    type?: 'text' | 'select';
    options?: { label: string; value: string }[];
    isMuted?: boolean;
    isMasked?: boolean;
    editable?: boolean;
}

interface InfoCardProps {
    title: string;
    rows: InfoRow[];
    isEditing?: boolean;
    onEdit?: () => void;
    onCancel?: () => void;
    onSave?: (data: Record<string, string>) => void;
    editable?: boolean;
}

interface UpdateUserInfo {
    name?: string;
    gender?: string;
    phone?: string;
}

interface UpdateAccountDetails {
    username?: string;
    email?: string;
    password?: string;
    confirm_password?: string;
}

function InfoCard({ title, rows, isEditing, onEdit, onCancel, onSave, editable }: InfoCardProps) {

    const initialData = useMemo(() => {
        return rows.reduce<Record<string, string>>((acc, row) => {
            acc[row.key] = row.value ?? '';
            return acc;
        }, {});
    }, [rows]);

    const [formData, setFormData] = useState<Record<string, string>>({});

    const handleEdit = () => {
        setFormData(initialData);
        onEdit?.();
    };

    const handleCancel = () => {
        setFormData(initialData);
        onCancel?.();
    };

    return (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h2 className="text-[22px] font-semibold text-gray-800 leading-none">
                    {title}
                </h2>

                {editable !== false && (
                    !isEditing ? (
                        <button
                            onClick={handleEdit}
                            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-500"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                        </button>
                    ) : (
                        <div className="flex gap-4 px-3">
                            <button
                                onClick={handleCancel}
                                className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-500"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => onSave?.(formData)}
                                className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-500"
                            >
                                Save
                            </button>
                        </div>
                    )
                )}
            </header>

            <div>
                {rows.map((row) => (
                    <div
                        key={row.key}
                        className="grid grid-cols-[42%_58%] border-b border-gray-200 last:border-b-0"
                    >
                        <div className="px-4 py-3 text-base sm:text-lg font-semibold text-gray-600 leading-none">
                            {row.label}
                        </div>

                        <div className="flex items-center justify-between gap-2 bg-gray-50/50 px-4 py-3">

                            {isEditing && row.editable ? (

                                row.type === 'select' ? (
                                    <select
                                        className={`w-full text-base sm:text-lg leading-none ${row.isMuted ? 'text-gray-400' : 'font-semibold text-gray-800'}`}
                                        value={formData[row.key] ?? ''}
                                        onChange={(e) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                [row.key]: e.target.value
                                            }))
                                        }
                                    >
                                        <option value="">Pilih {row.label}</option>

                                        {row.options?.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}

                                    </select>
                                ) : (
                                    <input
                                        className={`w-full text-base sm:text-lg leading-none ${row.editable ? 'font-semibold text-gray-900' : ' text-gray-400'}`}
                                        value={formData[row.key] ?? ''}
                                        onChange={(e) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                [row.key]: e.target.value
                                            }))
                                        }
                                    />
                                )
                            ) : (
                                <span className={`w-full text-base sm:text-lg leading-none ${row.editable ? 'font-semibold text-gray-900' : ' text-gray-400'}`}>
                                    {getDisplayLabel(row, row.value)}
                                </span>
                            )}

                            {row.isMasked && (
                                <EyeOff className="h-4 w-4 shrink-0 text-gray-400" />
                            )}

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

function getDisplayValue(value?: string | null, fallback = '-'): string {
    if (!value) return fallback;

    const trimmedValue = value.trim();
    if (!trimmedValue) return fallback;

    return trimmedValue;
}

const getDisplayLabel = (row: InfoRow, value: string) => {
    if (row.type === 'select') {
        return (
            row.options?.find((opt) => opt.value === value)?.label || value
        );
    }

    return value;
};

export default function ProfilePage() {
    const { user, logout } = useAuthContext();
    const [profileDetail, setProfileDetail] = useState<UserDetailData | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [popUpDeleteAccount, setPopUpDeleteAccount] = useState(false);  
    const [popUpLogoutAccount, setPopUpLogoutAccount] = useState(false);
    const [popUpChangePassword, setPopUpChangePassword] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchProfileDetail = async () => {
            setProfileError(null);
            try {
                const response = await apiGet<UserDetailResponse>(ENDPOINTS.USER.DETAIL);
                if (!isMounted) return;
                setProfileDetail(response.data);
            } catch {
                if (!isMounted) return;
                setProfileError('Gagal memuat detail profil');
            }
        };

        void fetchProfileDetail();

        return () => {
            isMounted = false;
        };
    }, []);

    const profileName = getDisplayValue(profileDetail?.informasi_user.name ?? user?.name, 'Pengguna');
    const profileEmail = getDisplayValue(profileDetail?.detail_akun.email ?? user?.email);

    const gender = getDisplayValue(profileDetail?.informasi_user.gender);
    const phone = getDisplayValue(profileDetail?.informasi_user.phone);
    const jabatan = getDisplayValue(profileDetail?.informasi_user.jabatan);
    const instansiEmail = getDisplayValue(profileDetail?.informasi_instansi.email);
    const instansiPhone = getDisplayValue(profileDetail?.informasi_instansi.phone);
    const instansiPaket = getDisplayValue(profileDetail?.informasi_instansi.paket);
    const accountRole = getDisplayValue(profileDetail?.detail_akun.role ?? getUserRoleName(user));
    const lastLogin = formatDate(profileDetail?.detail_akun.last_login);
    const lastUpdatedPassword = formatDate(profileDetail?.detail_akun.last_updated_password);

    const userInfoRows: InfoRow[] = [
        { key: 'name', label: 'Nama lengkap', value: profileName, isMuted: profileName === '-', editable: true },
        { key: 'gender', label: 'Gender', value: gender, type: 'select', editable: true,
            options: [
                { label: 'Laki-laki', value: 'male' },
                { label: 'Perempuan', value: 'female' }
            ]
        },
        { key: 'phone', label: 'Nomor Handphone', value: phone, isMuted: phone === '-', editable: true },
        { key: 'jabatan', label: 'Jabatan', value: jabatan, isMuted: jabatan === '-', editable: false },
    ];

    const institutionInfoRows: InfoRow[] = [
        {
            key: 'name',
            label: 'Nama Instansi',
            value: getDisplayValue(profileDetail?.informasi_instansi.notaris_name ?? user?.notaris_name),
            editable: false
        },
        { key: 'email', label: 'Email', value: instansiEmail, isMuted: instansiEmail === '-', editable: false },
        { key: 'phone', label: 'No.Telp', value: instansiPhone, isMuted: instansiPhone === '-', editable: false },
        { key: 'package', label: 'Paket langganan', value: instansiPaket, isMuted: instansiPaket === '-', editable: false },
    ];

    const accountDetailRows: InfoRow[] = [
        { key: 'username', label: 'Nama pengguna', value: getDisplayValue(profileDetail?.detail_akun.username ?? user?.username ?? user?.name), editable: true },
        { key: 'email', label: 'Email', value: profileEmail, isMuted: profileEmail === '-', editable: true },
        // { key: 'password', label: 'Password', value: '********', isMasked: true, editable: true },
        // { key: 'confirm_password', label: 'Konfirmasi password', value: '********', isMasked: true, editable: true },
        { key: 'role', label: 'Role', value: accountRole, isMuted: accountRole === '-', editable: false,},
        { key: 'created_at', label: 'Akun dibuat', value: formatDate(profileDetail?.detail_akun.created_at ?? user?.created_at), editable: false },
        { key: 'last_login', label: 'Terakhir login', value: lastLogin, isMuted: lastLogin === '-', editable: false },
        { key: 'last_updated_password', label: 'Perubahan kata sandi terakhir', value: lastUpdatedPassword, isMuted: lastUpdatedPassword === '-', editable: false },
    ];

    const handleSaveUserInfo = (data: UpdateUserInfo) => {
        // Implementasi penyimpanan informasi user
        console.log('Menyimpan informasi user :', data);
        apiPatch(ENDPOINTS.USER.EDIT_USER_ACCOUNT, data);
        window.location.reload();
        setEditingSection(null);
    };

    const handleSaveAccountDetails = (data: UpdateAccountDetails) => {
        // Implementasi penyimpanan detail akun
        // data.created_at = undefined;
        // data.last_login = undefined;
        // data.last_updated_password = undefined;
        // data.role = undefined;
        console.log('Menyimpan detail akun :', data);
        apiPatch(ENDPOINTS.USER.EDIT_USER_ACCOUNT, data);
        setEditingSection(null);
        window.location.reload();
    };

    const handleDeleteAccount = () => {
        // Implementasi penghapusan akun
        apiPost(ENDPOINTS.USER.DELETE_ACCOUNT);
        console.log('Menghapus akun');
    }

    const handleChangePassword = () => {
        // Implementasi perubahan password
        apiPost(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email: profileEmail });
        console.log('Mengubah password');
    }

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
                        {profileError && (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {profileError}
                            </div>
                        )}

                        <section className="mt-8 flex flex-col items-center text-center">
                            <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-[#89A1B5] to-[#3D4957] text-white flex items-center justify-center text-3xl font-semibold">
                                {getInitials(profileName)}
                                <span className="absolute bottom-0 right-0 rounded-full border border-gray-200 bg-white p-1 text-gray-500">
                                    <Pencil className="h-3.5 w-3.5" />
                                </span>
                            </div>
                            <h1 className="mt-3 text-2xl font-semibold text-gray-900">{profileName}</h1>
                            <p className="mt-1 text-lg text-gray-500">{profileEmail}</p>
                        </section>

                        <div className="mt-8 grid gap-4 xl:grid-cols-2">
                            <div className="space-y-4">
                                <InfoCard title="Informasi User" rows={userInfoRows} isEditing={editingSection === 'user'} onEdit={() => setEditingSection('user')} onCancel={() => setEditingSection(null)} onSave={handleSaveUserInfo} editable />
                                <InfoCard title="Informasi Instansi" rows={institutionInfoRows} isEditing={editingSection === 'institution'} onEdit={() => setEditingSection('institution')} onCancel={() => setEditingSection(null)} editable={false} />
                            </div>

                            <div className="space-y-4">
                                <InfoCard title="Detail Akun" rows={accountDetailRows} isEditing={editingSection === 'account'} onEdit={() => setEditingSection('account')} onCancel={() => setEditingSection(null)} onSave={handleSaveAccountDetails} editable/>

                                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                                    <div className="flex items-center justify-between gap-4 px-4 py-3">
                                        <h2 className="text-xl font-medium text-gray-500">Danger Zone</h2>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPopUpLogoutAccount(true);
                                                }}
                                                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Keluar
                                            </button>
                                            <button
                                                onClick={() => setPopUpDeleteAccount(true)}
                                                type="button"
                                                className="rounded-lg border border-red-200 bg-red-100 px-5 py-2 text-red-600 hover:bg-red-200 transition-colors"
                                            >
                                                Hapus akun
                                            </button>
                                            <button
                                                onClick={() => setPopUpChangePassword(true)}
                                                type="button"
                                                className="rounded-lg border border-blue-200 bg-blue-100 px-5 py-2 text-blue-600 hover:bg-blue-200 transition-colors"
                                            >
                                                Ubah password
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmDialog
                isOpen={popUpDeleteAccount}
                title="Hapus Akun"
                message="Apakah anda yakin ingin menghapus akun?"
                confirmText="Hapus"
                cancelText="Batal"
                type="danger"
                onConfirm={handleDeleteAccount}
                onCancel={() => setPopUpDeleteAccount(false)}
            />
            <ConfirmDialog
                isOpen={popUpLogoutAccount}
                title="Keluar Akun"
                message="Apakah anda yakin ingin keluar dari akun ini?"
                confirmText="Keluar"
                cancelText="Batal"
                type="danger"
                onConfirm={() => {
                    void logout();
                }}
                onCancel={() => setPopUpLogoutAccount(false)}
            />
            <ConfirmDialog
                isOpen={popUpChangePassword}
                title="Ubah Password"
                message="Apakah anda yakin ingin mengubah password? Anda akan menerima email untuk mengatur ulang password Anda."
                confirmText="Ubah"
                cancelText="Batal"
                type="info"
                onConfirm={handleChangePassword}
                onCancel={() => setPopUpChangePassword(false)}
            />
        </div>
    );

}
