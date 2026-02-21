'use client';

import { useEffect, useMemo, useState } from 'react';
import { Folder, X } from 'lucide-react';
import { apiGet } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { ServiceTypeDetailData, ServiceTypeDetailResponse } from '@/features/services/types';
import { getInitials } from '@/shared/utils/initials';
import { serviceActivities } from '@/features/services/data/mock';

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
        label: 'Terjeda',
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

    const filteredActivities = useMemo(
        () =>
            serviceActivities.filter(
                (activity) =>
                    activity.service.toLowerCase() === serviceTypeLabel.toLowerCase(),
            ),
        [serviceTypeLabel],
    );

    if (!serviceTypeId) return null;

    return (
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
                        className={`w-1/2 border-b-4 px-4 py-3 text-xl transition-colors ${
                            activeTab === 'detail'
                                ? 'border-[#7A6A53] text-[#7A6A53]'
                                : 'border-transparent text-gray-400'
                        }`}
                    >
                        Detail
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('aktivitas')}
                        className={`w-1/2 border-b-4 px-4 py-3 text-xl transition-colors ${
                            activeTab === 'aktivitas'
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
                                <h3 className="text-2xl font-semibold text-gray-900">Yang memiliki akses</h3>
                                {accessUsers.length === 0 ? (
                                    <p className="text-base text-gray-500">Belum ada user yang memiliki akses.</p>
                                ) : (
                                    <>
                                        <div className="flex -space-x-2">
                                            {accessUsers.slice(0, 4).map((item) => (
                                                <div
                                                    key={item.name}
                                                    className="flex h-14 w-14 items-center justify-center rounded-full border border-white bg-gradient-to-br from-[#89A1B5] to-[#3D4957] font-semibold text-sm text-white"
                                                >
                                                    {getInitials(item.name)}
                                                </div>
                                            ))}
                                        </div>
                                        <ul className="list-disc space-y-1 pl-6 text-lg text-gray-700">
                                            {accessUsers.map((item) => (
                                                <li key={item.name}>{item.name}</li>
                                            ))}
                                        </ul>
                                    </>
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
                                <div>
                                    <p className="text-base text-gray-700">Dibuka</p>
                                    <p className="text-xl font-medium text-gray-900">
                                        {formatDisplayValue(detail?.detail_folder_tipe_layanan.opened_at)}
                                        {detail?.detail_folder_tipe_layanan.opened_by
                                            ? ` oleh ${detail.detail_folder_tipe_layanan.opened_by}`
                                            : ''}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-3 text-xl text-gray-800">
                                        Status Folder di dalam {serviceTypeLabel}
                                    </p>
                                    <div className="space-y-4">
                                        {statusItems(detail).map((status, index) => (
                                            <div key={status.label} className="flex items-center gap-4">
                                                <span className="w-8 text-lg text-gray-700">{index + 1}</span>
                                                <span className="text-lg text-gray-700">:</span>
                                                <span className={`rounded-xl px-6 py-2 text-xl font-medium ${status.className}`}>
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
                            <h3 className="text-2xl font-semibold text-gray-900">Hari ini</h3>
                            {filteredActivities.length === 0 ? (
                                <p className="text-base text-gray-500">Belum ada aktivitas pada tipe layanan ini.</p>
                            ) : (
                                filteredActivities.slice(0, 4).map((item) => (
                                    <div key={item.id} className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#89A1B5] to-[#3D4957] font-semibold text-sm text-white">
                                            {getInitials(item.author)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xl font-medium text-gray-800">
                                                {item.author} memperbarui {item.companyName}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500">{item.modifiedDate}</p>
                                            <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-lg text-gray-700">
                                                <Folder className="h-5 w-5" />
                                                {item.companyName}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
