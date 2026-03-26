'use client';

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Settings, UserRound, X } from 'lucide-react';
import Image from 'next/image';
import Cropper, { type Area } from 'react-easy-crop';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { getInitials } from '@/shared/utils/initials';
import { apiGet, apiPost, apiPut } from '@/shared/api/api-client';
import { API_FILE_BASE_URL, ENDPOINTS } from '@/shared/api/endpoints';
import { Toast } from '@/shared/components/Toast';
import { useToast } from '@/shared/hooks/useToast';

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

interface CurrentUserResponse {
    message: string;
    data: {
        role?: string | null;
    };
}

interface CreateMemberPayload {
    name: string;
    email: string;
    username: string;
    password: string;
    confirm_password: string;
}

const MAX_TENANT_ACCOUNTS = 2;
const AVATAR_OUTPUT_SIZE = 512;

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

const createImageElement = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new globalThis.Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Gagal memuat gambar untuk dipotong'));
        image.src = src;
    });

const createCroppedAvatarFile = async (imageSrc: string, cropAreaPixels: Area) => {
    const image = await createImageElement(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = AVATAR_OUTPUT_SIZE;
    canvas.height = AVATAR_OUTPUT_SIZE;

    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Browser tidak mendukung proses crop gambar');
    }

    context.imageSmoothingQuality = 'high';
    context.drawImage(
        image,
        cropAreaPixels.x,
        cropAreaPixels.y,
        cropAreaPixels.width,
        cropAreaPixels.height,
        0,
        0,
        AVATAR_OUTPUT_SIZE,
        AVATAR_OUTPUT_SIZE,
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (result) => {
                if (result) {
                    resolve(result);
                    return;
                }
                reject(new Error('Gagal membuat hasil crop gambar'));
            },
            'image/jpeg',
            0.92,
        );
    });

    return new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
};

export default function InstansiPage() {
    const avatarUploadInputRef = useRef<HTMLInputElement | null>(null);
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
    const [isAvatarCropModalOpen, setIsAvatarCropModalOpen] = useState(false);
    const [avatarCropSourceUrl, setAvatarCropSourceUrl] = useState<string | null>(null);
    const [avatarCropPosition, setAvatarCropPosition] = useState({ x: 0, y: 0 });
    const [avatarZoom, setAvatarZoom] = useState(1);
    const [avatarCropPixels, setAvatarCropPixels] = useState<Area | null>(null);
    const [isApplyingAvatarCrop, setIsApplyingAvatarCrop] = useState(false);
    const [isCreateMemberModalOpen, setIsCreateMemberModalOpen] = useState(false);
    const [isCreatingMember, setIsCreatingMember] = useState(false);
    const [createMemberForm, setCreateMemberForm] = useState<CreateMemberPayload>(initialCreateMemberForm);
    const { toast, showToast, hideToast } = useToast();
    const canEditNotaris = (currentUserRole ?? '').trim().toUpperCase() === 'KEPALA NOTARIS';
    const hasReachedTeamAccountLimit = teamMembers.length >= MAX_TENANT_ACCOUNTS;

    useEffect(() => {
        let mounted = true;

        const fetchInstansiData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [detailResponse, usersResponse, currentUserResponse] = await Promise.all([
                    apiGet<NotarisDetailResponse>(ENDPOINTS.NOTARIS.DETAIL),
                    apiGet<NotarisUsersResponse>(ENDPOINTS.NOTARIS.USERS),
                    apiGet<CurrentUserResponse>(ENDPOINTS.AUTH.CURRENT),
                ]);

                if (!mounted) return;

                const detail = detailResponse.data;
                const resolvedRole = toSafeValue(currentUserResponse.data?.role);
                setNotarisDetail(detail);
                setCurrentUserRole(resolvedRole || null);
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

    useEffect(() => () => {
        if (avatarCropSourceUrl) {
            URL.revokeObjectURL(avatarCropSourceUrl);
        }
    }, [avatarCropSourceUrl]);

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

    const resetAvatarCropState = () => {
        setAvatarCropPosition({ x: 0, y: 0 });
        setAvatarZoom(1);
        setAvatarCropPixels(null);
        setAvatarCropSourceUrl(null);
    };

    const openAvatarCropModal = () => {
        if (!canEditNotaris) {
            showToast({ message: 'Hanya Kepala Notaris yang dapat mengubah avatar', variant: 'error' });
            return;
        }

        setIsAvatarCropModalOpen(true);
    };

    const closeAvatarCropModal = () => {
        if (isApplyingAvatarCrop) return;
        setIsAvatarCropModalOpen(false);
        resetAvatarCropState();
    };

    const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (!canEditNotaris) return;

        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast({ message: 'File harus berupa gambar', variant: 'error' });
            event.target.value = '';
            return;
        }

        const nextSourceUrl = URL.createObjectURL(file);
        setAvatarCropSourceUrl(nextSourceUrl);
        setAvatarCropPosition({ x: 0, y: 0 });
        setAvatarZoom(1);
        setAvatarCropPixels(null);
        event.target.value = '';
    };

    const handleAvatarCropComplete = (_: Area, croppedAreaPixels: Area) => {
        setAvatarCropPixels(croppedAreaPixels);
    };

    const handleApplyAvatarCrop = async () => {
        if (!avatarCropSourceUrl || !avatarCropPixels) {
            showToast({ message: 'Silakan upload gambar terlebih dahulu', variant: 'error' });
            return;
        }

        setIsApplyingAvatarCrop(true);
        try {
            const croppedFile = await createCroppedAvatarFile(avatarCropSourceUrl, avatarCropPixels);
            if (avatarPreviewUrl) {
                URL.revokeObjectURL(avatarPreviewUrl);
            }

            setSelectedAvatarFile(croppedFile);
            setAvatarPreviewUrl(URL.createObjectURL(croppedFile));
            setIsAvatarCropModalOpen(false);
            resetAvatarCropState();
            showToast({ message: 'Avatar siap disimpan. Klik tombol Simpan untuk menerapkan perubahan.', variant: 'success' });
        } catch (err) {
            showToast({
                message: err instanceof Error ? err.message : 'Gagal memproses crop avatar',
                variant: 'error',
            });
        } finally {
            setIsApplyingAvatarCrop(false);
        }
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

        if (hasReachedTeamAccountLimit) {
            showToast({
                message: 'Maksimal 2 akun per tenant (1 Kepala Notaris dan 1 staff)',
                variant: 'error',
            });
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

        if (hasReachedTeamAccountLimit) {
            showToast({
                message: 'Member tidak dapat ditambahkan. Tenant sudah memiliki 2 akun.',
                variant: 'error',
            });
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
                                                <button
                                                    type="button"
                                                    onClick={openAvatarCropModal}
                                                    className="group cursor-pointer"
                                                    title="Klik avatar untuk mengubah"
                                                    aria-label="Ubah avatar instansi"
                                                >
                                                    <div className="h-12 w-12 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden text-sm font-semibold text-gray-500 transition-colors group-hover:border-[#8B7355]">
                                                        {displayedAvatar ? (
                                                            <Image
                                                                src={displayedAvatar}
                                                                alt="Avatar instansi"
                                                                width={48}
                                                                height={48}
                                                                className="h-full w-full object-cover"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            getInitials(notarisDetail?.notaris_name || 'Instansi')
                                                        )}
                                                    </div>
                                                </button>
                                            ) : (
                                                <div className="h-12 w-12 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden text-sm font-semibold text-gray-500">
                                                    {displayedAvatar ? (
                                                        <Image
                                                            src={displayedAvatar}
                                                            alt="Avatar instansi"
                                                            width={48}
                                                            height={48}
                                                            className="h-full w-full object-cover"
                                                            unoptimized
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
                                    {canEditNotaris && (
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={openCreateMemberModal}
                                                className="rounded-xl border border-gray-200 bg-white px-5 sm:px-6 py-2.5 text-sm sm:text-base text-[#6E5F49] hover:border-[#D6CCBC] disabled:cursor-not-allowed disabled:opacity-60"
                                                disabled={isLoading || isCreatingMember}
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
                                    )}
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
            {isAvatarCropModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
                    onClick={closeAvatarCropModal}
                >
                    <div
                        className="w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 py-5">
                            <h3 className="text-3xl font-semibold text-[#6E5F49]">Upload Gambar</h3>
                            <div className="flex items-center gap-3">
                                <input
                                    ref={avatarUploadInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => avatarUploadInputRef.current?.click()}
                                    disabled={isApplyingAvatarCrop}
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-base text-[#6E5F49] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Upload
                                </button>
                                <button
                                    type="button"
                                    onClick={closeAvatarCropModal}
                                    disabled={isApplyingAvatarCrop}
                                    className="rounded-md p-1 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label="Tutup modal upload avatar"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="px-3 pb-4 sm:px-5 sm:pb-5">
                            <div className="relative h-[320px] overflow-hidden rounded-xl bg-gray-200 sm:h-[460px]">
                                {avatarCropSourceUrl ? (
                                    <Cropper
                                        image={avatarCropSourceUrl}
                                        crop={avatarCropPosition}
                                        zoom={avatarZoom}
                                        aspect={1}
                                        showGrid
                                        onCropChange={setAvatarCropPosition}
                                        onCropComplete={handleAvatarCropComplete}
                                        onZoomChange={setAvatarZoom}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center px-4 text-center text-sm text-gray-500 sm:text-base">
                                        Pilih gambar lewat tombol Upload untuk mulai crop avatar
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <label htmlFor="avatar-zoom" className="text-sm font-medium text-gray-600">Zoom</label>
                                    <input
                                        id="avatar-zoom"
                                        type="range"
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        value={avatarZoom}
                                        onChange={(event) => setAvatarZoom(Number(event.target.value))}
                                        disabled={!avatarCropSourceUrl || isApplyingAvatarCrop}
                                        className="w-52 accent-[#7A6A53] disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeAvatarCropModal}
                                        disabled={isApplyingAvatarCrop}
                                        className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-base text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            void handleApplyAvatarCrop();
                                        }}
                                        disabled={!avatarCropSourceUrl || isApplyingAvatarCrop}
                                        className="rounded-xl border border-[#7A6A53] bg-[#7A6A53] px-6 py-2.5 text-base font-medium text-white hover:bg-[#685942] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isApplyingAvatarCrop ? 'Memproses...' : 'Simpan'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isCreateMemberModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/25 px-4">
                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <h3 className="text-2xl font-semibold text-gray-800">Tambah member baru</h3>
                            <button
                                type="button"
                                onClick={closeCreateMemberModal}
                                disabled={isCreatingMember}
                                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Tutup modal tambah member"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            className="px-5 py-6"
                            onSubmit={(event) => {
                                event.preventDefault();
                                void handleCreateMember();
                            }}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                                    <UserRound className="h-8 w-8" />
                                </div>
                                <p className="text-xs text-gray-400">
                                    Maksimal member per tenant: 1 staff (total 2 akun termasuk Kepala Notaris)
                                </p>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label className="flex flex-col gap-1.5 text-sm text-gray-700">
                                    <span>Email <span className="text-red-500">*</span></span>
                                    <input
                                        type="email"
                                        value={createMemberForm.email}
                                        onChange={(event) => handleCreateMemberInputChange('email', event.target.value)}
                                        placeholder="email@example.com"
                                        disabled={isCreatingMember}
                                        className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]"
                                        required
                                    />
                                </label>

                                <label className="flex flex-col gap-1.5 text-sm text-gray-700">
                                    <span>User name <span className="text-red-500">*</span></span>
                                    <input
                                        type="text"
                                        value={createMemberForm.username}
                                        onChange={(event) => handleCreateMemberInputChange('username', event.target.value)}
                                        placeholder="staff_notaris"
                                        disabled={isCreatingMember}
                                        className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]"
                                        required
                                    />
                                </label>

                                <label className="flex flex-col gap-1.5 text-sm text-gray-700 sm:col-span-2">
                                    <span>Nama lengkap <span className="text-red-500">*</span></span>
                                    <input
                                        type="text"
                                        value={createMemberForm.name}
                                        onChange={(event) => handleCreateMemberInputChange('name', event.target.value)}
                                        placeholder="Nama staff"
                                        disabled={isCreatingMember}
                                        className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]"
                                        required
                                    />
                                </label>

                                <label className="flex flex-col gap-1.5 text-sm text-gray-700">
                                    <span>Password <span className="text-red-500">*</span></span>
                                    <input
                                        type="password"
                                        value={createMemberForm.password}
                                        onChange={(event) => handleCreateMemberInputChange('password', event.target.value)}
                                        placeholder="Minimal 8 karakter"
                                        disabled={isCreatingMember}
                                        className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]"
                                        required
                                    />
                                </label>

                                <label className="flex flex-col gap-1.5 text-sm text-gray-700">
                                    <span>Konfirmasi password <span className="text-red-500">*</span></span>
                                    <input
                                        type="password"
                                        value={createMemberForm.confirm_password}
                                        onChange={(event) => handleCreateMemberInputChange('confirm_password', event.target.value)}
                                        placeholder="Ulangi password"
                                        disabled={isCreatingMember}
                                        className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]"
                                        required
                                    />
                                </label>
                            </div>

                            <div className="mt-7 flex items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={closeCreateMemberModal}
                                    disabled={isCreatingMember}
                                    className="rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-base text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingMember || hasReachedTeamAccountLimit}
                                    className="inline-flex items-center gap-2 rounded-xl border border-[#7A6A53] bg-[#7A6A53] px-8 py-2.5 text-base font-medium text-white hover:bg-[#685942] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Plus className="h-4 w-4" />
                                    {isCreatingMember ? 'Menambahkan...' : 'Tambah member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <Toast toast={toast} onClose={hideToast} position="bottom-left" />
        </div>
    );
}
