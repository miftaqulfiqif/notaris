'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Folder, X } from 'lucide-react';
import Image from 'next/image';
import { apiGet } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { ServiceTypeDetailData, ServiceTypeDetailResponse } from '@/features/services/types';
import { getInitials } from '@/shared/utils/initials';

interface ServiceTypeActivity {
    id: string;
    description: string;
    folder_name: string;
    object: string;
    object_status: string | null;
    created_at: string;
}

interface ServiceTypeActivitiesResponse {
    message: string;
    data: ServiceTypeActivity[] | {
        current_page: number;
        total_items: number;
        total_pages: number;
        data: ServiceTypeActivity[];
    };
}

type DetailTab = 'detail' | 'aktivitas';

interface ServiceTypeDetailOffcanvasProps {
    serviceTypeId: string | null;
    serviceTypeName?: string;
    onClose: () => void;
}

const formatDisplayValue = (value?: string | null, fallback = '-'): string => {
    if (!value) return fallback;
    const trimmedValue = value.trim();
    return trimmedValue || fallback;
};

const statusItems = (detail: ServiceTypeDetailData | null) => [
    {
        count: detail?.status_folder.selesai ?? 0,
        label: 'Selesai',
        className: 'bg-green-100 text-green-700',
    },
    {
        count: detail?.status_folder.terjeda ?? 0,
        label: 'Tertunda',
        className: 'bg-red-100 text-red-700',
    },
    {
        count: detail?.status_folder.dalam_proses ?? 0,
        label: 'Proses',
        className: 'bg-yellow-100 text-yellow-700',
    },
];

export function ServiceTypeDetailOffcanvas({
    serviceTypeId,
    serviceTypeName,
    onClose,
}: ServiceTypeDetailOffcanvasProps) {
    const [activeTab, setActiveTab] = useState<DetailTab>('detail');
    const [detail, setDetail] = useState<ServiceTypeDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!serviceTypeId) return;

        let isMounted = true;
        setIsLoading(true);
        setError(null);

        const fetchDetail = async () => {
            try {
                const url = ENDPOINTS.USER.DETAIL_SERVICE_TYPE.replace(':tipe_layanan_id', serviceTypeId);
                const response = await apiGet<ServiceTypeDetailResponse>(url);
                if (!isMounted) return;
                setDetail(response.data);
            } catch {
                if (!isMounted) return;
                setError('Gagal memuat detail tipe layanan');
                setDetail(null);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchDetail();

        return () => {
            isMounted = false;
        };
    }, [serviceTypeId]);

    useEffect(() => {
        setActiveTab('detail');
    }, [serviceTypeId]);

    const serviceTypeLabel =
        detail?.detail_folder_tipe_layanan.tipe_layanan || serviceTypeName || 'Detail Folder';

    const accessUsers = detail?.have_access ?? [];

    const [typeActivities, setTypeActivities] = useState<ServiceTypeActivity[]>([]);
    const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);

    const fetchActivities = useCallback(async (typeId: string) => {
        setIsActivitiesLoading(true);
        try {
            const url = `${ENDPOINTS.DASHBOARD.ACTIVITIES}?tipe_layanan_id=${typeId}&limit=10`;
            const response = await apiGet<ServiceTypeActivitiesResponse>(url);
            const data = response.data;
            const items = Array.isArray(data) ? data : (data?.data ?? []);
            setTypeActivities(items);
        } catch {
            setTypeActivities([]);
        } finally {
            setIsActivitiesLoading(false);
        }
    }, []);

    useEffect(() => {
        if (serviceTypeId && activeTab === 'aktivitas') {
            void fetchActivities(serviceTypeId);
        }
    }, [activeTab, fetchActivities, serviceTypeId]);

    if (!serviceTypeId || !mounted) return null;

    return createPortal(
        <>
            <div
                className="fixed inset-0 z-40 bg-black/30 transition-opacity"
                onClick={onClose}
            />

            <div className="fixed top-0 right-0 z-50 flex h-full w-[420px] max-w-full flex-col border-l border-gray-200 bg-white shadow-2xl animate-slide-in-right">
                <div className="border-b border-gray-200 px-5 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Folder className="h-8 w-8 text-gray-700" />
                            <h2 className="max-w-[260px] truncate text-2xl font-semibold text-gray-900">
                                {serviceTypeLabel}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="flex border-b border-gray-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab('detail')}
                        className={`w-1/2 border-b-4 px-4 py-3 text-xl transition-colors ${activeTab === 'detail'
                                ? 'border-[#7A6A53] text-[#7A6A53]'
                                : 'border-transparent text-gray-400'
                            }`}
                    >
                        Detail
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('aktivitas')}
                        className={`w-1/2 border-b-4 px-4 py-3 text-xl transition-colors ${activeTab === 'aktivitas'
                                ? 'border-[#7A6A53] text-[#7A6A53]'
                                : 'border-transparent text-gray-400'
                            }`}
                    >
                        Aktivitas
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-6">
                    {isLoading ? (
                        <div className="text-gray-500 text-sm">Memuat detail...</div>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    ) : activeTab === 'detail' ? (
                        <div className="space-y-8">
                            <section className="space-y-4 border-b border-gray-200 pb-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-semibold text-gray-900">Yang memiliki akses</h3>
                                    <button
                                        type="button"
                                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                                    >
                                        Kelola Akses
                                    </button>
                                </div>
                                {accessUsers.length === 0 ? (
                                    <p className="text-base text-gray-500">Belum ada user yang memiliki akses.</p>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex -space-x-2">
                                            {accessUsers.slice(0, 4).map((item, index) => (
                                                <div
                                                    key={`${item.name}-${index}`}
                                                    className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-[#89A1B5] to-[#3D4957] font-semibold text-sm text-white"
                                                    title={item.name}
                                                >
                                                    {item.profile_picture ? (
                                                        <Image src={item.profile_picture} alt={item.name} width={48} height={48} className="h-full w-full object-cover" unoptimized />
                                                    ) : (
                                                        getInitials(item.name)
                                                    )}
                                                </div>
                                            ))}
                                            {accessUsers.length > 4 && (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gray-100 font-semibold text-sm text-gray-600">
                                                    +{accessUsers.length - 4}
                                                </div>
                                            )}
                                        </div>
                                        <ul className="space-y-3 pt-2">
                                            {accessUsers.map((item, index) => (
                                                <li key={`${item.name}-${index}`} className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#89A1B5] to-[#3D4957] font-semibold text-xs text-white">
                                                        {item.profile_picture ? (
                                                            <Image src={item.profile_picture} alt={item.name} width={40} height={40} className="h-full w-full object-cover" unoptimized />
                                                        ) : (
                                                            getInitials(item.name)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.name}</p>
                                                        {item.role && <p className="text-sm text-gray-500">{item.role}</p>}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </section>

                            <section className="space-y-5 border-b border-gray-200 pb-8">
                                <h3 className="text-2xl font-semibold text-gray-900">Detail Folder Layanan</h3>
                                <div>
                                    <p className="text-base text-gray-700">Tipe Layanan</p>
                                    <p className="text-3xl font-medium text-gray-900">
                                        {formatDisplayValue(detail?.detail_folder_tipe_layanan.tipe_layanan)}
                                    </p>
                                </div>

                                <div className="space-y-4 border-b border-gray-100 pb-6">
                                    <div>
                                        <p className="text-base text-gray-700">Dibuat</p>
                                        <p className="text-xl font-medium text-gray-900">
                                            {formatDisplayValue(detail?.detail_folder_tipe_layanan.created_at)}
                                            {detail?.detail_folder_tipe_layanan.created_by
                                                ? ` oleh ${detail.detail_folder_tipe_layanan.created_by}`
                                                : ''}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-base text-gray-700">Dimodifikasi</p>
                                        <p className="text-xl font-medium text-gray-900">
                                            {formatDisplayValue(detail?.detail_folder_tipe_layanan.modified_at)}
                                            {detail?.detail_folder_tipe_layanan.modified_by
                                                ? ` oleh ${detail.detail_folder_tipe_layanan.modified_by}`
                                                : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <p className="mb-3 text-xl text-gray-800">
                                        Status Folder di dalam {serviceTypeLabel}
                                    </p>
                                    <div className="space-y-4">
                                        {statusItems(detail).map((status, index) => (
                                            <div key={status.label} className="flex items-center gap-4">
                                                <span className="w-8 text-lg text-gray-700">{index + 1}</span>
                                                <span className="text-lg text-gray-700">:</span>
                                                <span className={`inline-flex min-w-[140px] items-center justify-center rounded-xl px-4 py-2 text-lg font-medium ${status.className}`}>
                                                    {status.label} ({status.count})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-semibold text-gray-900">Aktivitas</h3>
                            {isActivitiesLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                                    ))}
                                </div>
                            ) : typeActivities.length === 0 ? (
                                <p className="text-base text-gray-500">Belum ada aktivitas pada tipe layanan ini.</p>
                            ) : (
                                typeActivities.map((item) => (
                                    <div key={item.id} className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#89A1B5] to-[#3D4957] font-semibold text-sm text-white">
                                            {getInitials(item.description.split(' ')[0] || 'U')}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xl font-medium text-gray-800">
                                                {item.description}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500">{item.created_at}</p>
                                            <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-lg text-gray-700">
                                                <Folder className="h-5 w-5" />
                                                {item.folder_name}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>,
        document.body
    );
}
