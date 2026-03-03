'use client';

import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Plus, Settings, UserRound, X } from 'lucide-react';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { getInitials } from '@/shared/utils/initials';
import { apiGet, apiPost, apiPut } from '@/shared/api/api-client';
import { API_FILE_BASE_URL, ENDPOINTS } from '@/shared/api/endpoints';
import { Toast } from '@/shared/components/Toast';
import { useToast } from '@/shared/hooks/useToast';
import type { UserDetailResponse } from '@/features/auth/types';

interface NotarisDetailData {
    avatar: string | null;
    notaris_name: string;
    email: string;
    alamat: string;
    paket: string | null;
}

interface NotarisDetailResponse {
    message: string;
    data: NotarisDetailData;
}

interface NotarisUpdateResponse {
    message: string;
    data: NotarisDetailData;
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

interface CreateMemberPayload {
    name: string;
    email: string;
    username: string;
    password: string;
    confirm_password: string;
}

const initialCreateMemberForm: CreateMemberPayload = {
    name: '',
    email: '',
    username: '',
    password: '',
    confirm_password: '',
};

const resolveRoleClass = (role: string) =>
    role.toLowerCase().includes('kepala')
        ? 'bg-sky-100 text-sky-700'
        : 'bg-lime-100 text-lime-700';

const toSafeValue = (value?: string | null) => value?.trim() ?? '';

const resolveAvatarUrl = (avatar?: string | null) => {
    if (!avatar) return null;

    if (/^https?:\/\//i.test(avatar)) {
        return avatar;
    }

    const cleanedPath = avatar.replace(/^\/+/, '');
    if (!API_FILE_BASE_URL) {
        return `/${cleanedPath}`;
    }

    return `${API_FILE_BASE_URL}/${cleanedPath}`;
};

export default function InstansiPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notarisDetail, setNotarisDetail] = useState<NotarisDetailData | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [teamMembers, setTeamMembers] = useState<NotarisUserItem[]>([]);
    const [isSavingGeneral, setIsSavingGeneral] = useState(false);
    const [editedNotarisName, setEditedNotarisName] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedAlamat, setEditedAlamat] = useState('');
    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
    const [isCreateMemberModalOpen, setIsCreateMemberModalOpen] = useState(false);
    const [isCreatingMember, setIsCreatingMember] = useState(false);
    const [createMemberForm, setCreateMemberForm] = useState<CreateMemberPayload>(initialCreateMemberForm);
    const { toast, showToast, hideToast } = useToast();
    const canEditNotaris = (currentUserRole ?? '').trim().toUpperCase() === 'KEPALA NOTARIS';

    useEffect(() => {
        let mounted = true;

        const fetchInstansiData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [detailResponse, usersResponse, detailUserResponse] = await Promise.all([
                    apiGet<NotarisDetailResponse>(ENDPOINTS.NOTARIS.DETAIL),
                    apiGet<NotarisUsersResponse>(ENDPOINTS.NOTARIS.USERS),
                    apiGet<UserDetailResponse>(ENDPOINTS.USER.DETAIL),
                ]);

                if (!mounted) return;

                const detail = detailResponse.data;
                setNotarisDetail(detail);
                setCurrentUserRole(detailUserResponse.data.detail_akun.role);
                setEditedNotarisName(detail.notaris_name ?? '');
                setEditedEmail(detail.email ?? '');
                setEditedAlamat(detail.alamat ?? '');
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

    useEffect(() => () => {
        if (avatarPreviewUrl) {
            URL.revokeObjectURL(avatarPreviewUrl);
        }
    }, [avatarPreviewUrl]);

    const packageLabel = useMemo(() => {
        if (!notarisDetail?.paket) return 'Basic';
        return notarisDetail.paket
            .split('_')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }, [notarisDetail?.paket]);

    const displayedAvatar = useMemo(
        () => avatarPreviewUrl || resolveAvatarUrl(notarisDetail?.avatar),
        [avatarPreviewUrl, notarisDetail?.avatar],
    );

    const hasGeneralChanges = useMemo(() => {
        const originalName = toSafeValue(notarisDetail?.notaris_name);
        const originalEmail = toSafeValue(notarisDetail?.email);
        const originalAlamat = toSafeValue(notarisDetail?.alamat);

        const currentName = toSafeValue(editedNotarisName);
        const currentEmail = toSafeValue(editedEmail);
        const currentAlamat = toSafeValue(editedAlamat);

        return (
            originalName !== currentName
            || originalEmail !== currentEmail
            || originalAlamat !== currentAlamat
            || Boolean(selectedAvatarFile)
        );
    }, [editedAlamat, editedEmail, editedNotarisName, notarisDetail?.alamat, notarisDetail?.email, notarisDetail?.notaris_name, selectedAvatarFile]);

    const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (!canEditNotaris) return;

        const file = event.target.files?.[0];
        if (!file) return;

        if (avatarPreviewUrl) {
            URL.revokeObjectURL(avatarPreviewUrl);
        }

        setSelectedAvatarFile(file);
        setAvatarPreviewUrl(URL.createObjectURL(file));
        event.target.value = '';
    };

    const handleCancelGeneralEdit = () => {
        setEditedNotarisName(notarisDetail?.notaris_name ?? '');
        setEditedEmail(notarisDetail?.email ?? '');
        setEditedAlamat(notarisDetail?.alamat ?? '');
        if (avatarPreviewUrl) {
            URL.revokeObjectURL(avatarPreviewUrl);
        }
        setAvatarPreviewUrl(null);
        setSelectedAvatarFile(null);
    };

    const handleSaveGeneral = async () => {
        if (!canEditNotaris) {
            showToast({ message: 'Hanya Kepala Notaris yang dapat mengubah data instansi', variant: 'error' });
            return;
        }

        if (!notarisDetail || isSavingGeneral) return;

        if (!hasGeneralChanges) {
            showToast({ message: 'Belum ada perubahan', variant: 'info' });
            return;
        }

        const normalizedName = toSafeValue(editedNotarisName);
        const normalizedEmail = toSafeValue(editedEmail);
        const normalizedAlamat = toSafeValue(editedAlamat);

        if (!normalizedName) {
            showToast({ message: 'Nama instansi tidak boleh kosong', variant: 'error' });
            return;
        }

        if (!normalizedEmail) {
            showToast({ message: 'Email instansi tidak boleh kosong', variant: 'error' });
            return;
        }

        setIsSavingGeneral(true);
        try {
            const formData = new FormData();
            formData.append('notaris_name', normalizedName);
            formData.append('email', normalizedEmail);
            formData.append('alamat', normalizedAlamat);
            if (selectedAvatarFile) {
                formData.append('avatar', selectedAvatarFile);
            }

            const response = await apiPut<NotarisUpdateResponse>(ENDPOINTS.NOTARIS.UPDATE, formData);
            const updatedDetail = response.data;

            setNotarisDetail(updatedDetail);
            setEditedNotarisName(updatedDetail.notaris_name ?? '');
            setEditedEmail(updatedDetail.email ?? '');
            setEditedAlamat(updatedDetail.alamat ?? '');
            if (avatarPreviewUrl) {
                URL.revokeObjectURL(avatarPreviewUrl);
            }
            setAvatarPreviewUrl(null);
            setSelectedAvatarFile(null);
            showToast({ message: 'Informasi instansi berhasil diperbarui', variant: 'success' });
        } catch (err) {
            showToast({
                message: err instanceof Error ? err.message : 'Gagal memperbarui informasi instansi',
                variant: 'error',
            });
        } finally {
            setIsSavingGeneral(false);
        }
    };

    const openCreateMemberModal = () => {
        if (!canEditNotaris) {
            showToast({ message: 'Hanya Kepala Notaris yang dapat menambah member', variant: 'error' });
            return;
        }

        setCreateMemberForm(initialCreateMemberForm);
        setIsCreateMemberModalOpen(true);
    };

    const closeCreateMemberModal = () => {
        if (isCreatingMember) return;
        setIsCreateMemberModalOpen(false);
        setCreateMemberForm(initialCreateMemberForm);
    };

    const handleCreateMemberInputChange = (field: keyof CreateMemberPayload, value: string) => {
        setCreateMemberForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCreateMember = async () => {
        if (!canEditNotaris) {
            showToast({ message: 'Hanya Kepala Notaris yang dapat menambah member', variant: 'error' });
            return;
        }

        if (isCreatingMember) return;

        const payload: CreateMemberPayload = {
            name: createMemberForm.name.trim(),
            email: createMemberForm.email.trim(),
            username: createMemberForm.username.trim(),
            password: createMemberForm.password,
            confirm_password: createMemberForm.confirm_password,
        };

        if (!payload.name || !payload.email || !payload.username || !payload.password || !payload.confirm_password) {
            showToast({ message: 'Semua field wajib diisi', variant: 'error' });
            return;
        }

        if (payload.password !== payload.confirm_password) {
            showToast({ message: 'Password dan konfirmasi password tidak sama', variant: 'error' });
            return;
        }

        setIsCreatingMember(true);
        try {
            await apiPost(ENDPOINTS.USER.CREATE, payload);
            const usersResponse = await apiGet<NotarisUsersResponse>(ENDPOINTS.NOTARIS.USERS);
            setTeamMembers(usersResponse.data || []);
            setIsCreateMemberModalOpen(false);
            setCreateMemberForm(initialCreateMemberForm);
            showToast({ message: 'Member baru berhasil ditambahkan', variant: 'success' });
        } catch (err) {
            showToast({
                message: err instanceof Error ? err.message : 'Gagal menambahkan member',
                variant: 'error',
            });
        } finally {
            setIsCreatingMember(false);
        }
    };

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
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{notarisDetail?.notaris_name || 'Instansi'} Teams</h1>

                            <section className="mt-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Umum</h2>
                                </div>
                                <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                    <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-5 py-3.5">
                                        <p className="text-base sm:text-lg font-semibold text-gray-800">Avatar</p>
                                        <div className="flex items-center">
                                            {canEditNotaris ? (
                                                <label className="group cursor-pointer" title="Klik avatar untuk mengubah">
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                                        className="hidden"
                                                        onChange={handleAvatarChange}
                                                    />
                                                    <div className="h-12 w-12 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden text-sm font-semibold text-gray-500 transition-colors group-hover:border-[#8B7355]">
                                                        {displayedAvatar ? (
                                                            <img
                                                                src={displayedAvatar}
                                                                alt="Avatar instansi"
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            getInitials(notarisDetail?.notaris_name || 'Instansi')
                                                        )}
                                                    </div>
                                                </label>
                                            ) : (
                                                <div className="h-12 w-12 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden text-sm font-semibold text-gray-500">
                                                    {displayedAvatar ? (
                                                        <img
                                                            src={displayedAvatar}
                                                            alt="Avatar instansi"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        getInitials(notarisDetail?.notaris_name || 'Instansi')
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-200 px-4 sm:px-5 py-3.5">
                                        <p className="text-base sm:text-lg font-semibold text-gray-800">Nama</p>
                                        {canEditNotaris ? (
                                            <input
                                                value={editedNotarisName}
                                                onChange={(event) => setEditedNotarisName(event.target.value)}
                                                disabled={isSavingGeneral}
                                                className="w-full sm:max-w-md rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm sm:text-base text-gray-800 outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]"
                                            />
                                        ) : (
                                            <div className="w-full sm:max-w-md rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm sm:text-base text-gray-800">
                                                {notarisDetail?.notaris_name || '-'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-200 px-4 sm:px-5 py-3.5">
                                        <p className="text-base sm:text-lg font-semibold text-gray-800">Email</p>
                                        {canEditNotaris ? (
                                            <input
                                                type="email"
                                                value={editedEmail}
                                                onChange={(event) => setEditedEmail(event.target.value)}
                                                disabled={isSavingGeneral}
                                                className="w-full sm:max-w-md rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm sm:text-base text-gray-800 outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]"
                                            />
                                        ) : (
                                            <div className="w-full sm:max-w-md rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm sm:text-base text-gray-800">
                                                {notarisDetail?.email || '-'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-200 px-4 sm:px-5 py-3.5">
                                        <p className="text-base sm:text-lg font-semibold text-gray-800">Alamat</p>
                                        {canEditNotaris ? (
                                            <textarea
                                                rows={2}
                                                value={editedAlamat}
                                                onChange={(event) => setEditedAlamat(event.target.value)}
                                                disabled={isSavingGeneral}
                                                className="w-full sm:max-w-md rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm sm:text-base text-gray-800 outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]"
                                            />
                                        ) : (
                                            <div className="w-full sm:max-w-md rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm sm:text-base text-gray-800">
                                                {notarisDetail?.alamat || '-'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between px-4 sm:px-5 py-3.5">
                                        <p className="text-base sm:text-lg font-semibold text-gray-800">Paket</p>
                                        <span className="rounded-lg bg-sky-100 px-3 py-1 text-sm text-sky-700">{packageLabel}</span>
                                    </div>
                                    {canEditNotaris && (
                                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-4 sm:px-5 py-3.5">
                                            <button
                                                type="button"
                                                onClick={handleCancelGeneralEdit}
                                                disabled={isSavingGeneral}
                                                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    void handleSaveGeneral();
                                                }}
                                                disabled={!hasGeneralChanges || isSavingGeneral}
                                                className="rounded-xl border border-[#7A6A53] bg-[#7A6A53] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isSavingGeneral ? 'Menyimpan...' : 'Simpan'}
                                            </button>
                                        </div>
                                    )}
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
