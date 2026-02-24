'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Clock3, Folder, LayoutGrid, List, Plus, Star } from 'lucide-react';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { apiGet } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { Toast } from '@/shared/components/Toast';
import { useToast } from '@/shared/hooks/useToast';

interface CompanyItem {
    id: string;
    name: string;
    principalName: string;
    service: string;
    serviceType: string;
    author: string;
    modifiedAt: string;
    status: string;
    isFavorite: boolean;
}

interface CompanyApiItem {
    id: string;
    folder_name: string;
    layanan: string;
    tipe_layanan: string;
    author: string;
    updated_at: string;
    status: string;
}

interface CompanyApiResponse {
    message: string;
    data:
        | CompanyApiItem[]
        | {
              current_page?: number;
              total_items?: number;
              total_pages?: number;
              data: CompanyApiItem[];
          };
}

interface FavoriteLookupResponse {
    message: string;
    data: {
        current_page: number;
        total_items: number;
        total_pages: number;
        data: Array<{
            item_id: string;
            item_type: string;
        }>;
    };
}

const normalizeCompanyItems = (response: CompanyApiResponse, favoriteFolderIds: Set<string>): CompanyItem[] => {
    const payload = Array.isArray(response.data) ? response.data : response.data?.data || [];

    return payload.map((item) => ({
        id: item.id,
        name: item.folder_name,
        principalName: '-',
        service: item.layanan,
        serviceType: item.tipe_layanan,
        author: item.author,
        modifiedAt: item.updated_at,
        status: item.status,
        isFavorite: favoriteFolderIds.has(item.id),
    }));
};

export default function CompanyPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [activeTab, setActiveTab] = useState<'baru' | 'favorite'>('baru');
    const [items, setItems] = useState<CompanyItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        let isMounted = true;

        const fetchCompanyItems = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const url = `${ENDPOINTS.USER.FOLDERS_NOTARIS}?page=1&limit=100&search=`;
                const response = await apiGet<CompanyApiResponse>(url);

                let favoriteFolderIds = new Set<string>();
                try {
                    const favorites = await apiGet<FavoriteLookupResponse>(
                        `${ENDPOINTS.USER.ITEM_FAVORITE}?page=1&limit=500&search=`,
                    );
                    favoriteFolderIds = new Set(
                        (favorites.data.data || [])
                            .filter((item) => item.item_type === 'FOLDER')
                            .map((item) => item.item_id),
                    );
                } catch {
                    favoriteFolderIds = new Set();
                }

                if (!isMounted) return;
                setItems(normalizeCompanyItems(response, favoriteFolderIds));
            } catch (err) {
                if (!isMounted) return;
                setItems([]);
                setError(err instanceof Error ? err.message : 'Gagal memuat data perusahaan');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchCompanyItems();

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredItems = useMemo(() => {
        if (activeTab === 'favorite') {
            return items.filter((item) => item.isFavorite);
        }

        return items;
    }, [activeTab, items]);

    useEffect(() => {
        setSelectedIds((prev) => prev.filter((id) => filteredItems.some((item) => item.id === id)));
    }, [filteredItems]);

    const isAllSelected = useMemo(
        () => filteredItems.length > 0 && selectedIds.length === filteredItems.length,
        [filteredItems, selectedIds.length],
    );

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
            return;
        }

        setSelectedIds(filteredItems.map((item) => item.id));
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((selectedId) => selectedId !== id);
            }

            return [...prev, id];
        });
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 lg:bg-white">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="w-full min-h-screen flex flex-col">
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-100/50">
                        <DashboardHeader />
                    </div>

                    <div className="flex-1 px-4 sm:px-8 pb-8">
                        {error && (
                            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}
                        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">Perusahaan</h1>
                            <button
                                type="button"
                                onClick={() =>
                                    showToast({
                                        message: 'Aksi tambah perusahaan belum tersedia',
                                        variant: 'info',
                                    })
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-base font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
                            >
                                <Plus className="h-5 w-5" />
                                Tambah Baru
                            </button>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('baru');
                                        setSelectedIds([]);
                                    }}
                                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-base transition-colors ${
                                        activeTab === 'baru'
                                            ? 'border-gray-300 bg-white font-medium text-gray-900 shadow-sm'
                                            : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                                    }`}
                                >
                                    <Clock3 className="h-5 w-5" />
                                    Baru di tambahkan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('favorite');
                                        setSelectedIds([]);
                                    }}
                                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-base transition-colors ${
                                        activeTab === 'favorite'
                                            ? 'border-gray-300 bg-white font-medium text-gray-900 shadow-sm'
                                            : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                                    }`}
                                >
                                    <Star className="h-5 w-5" />
                                    Favorite
                                </button>
                            </div>

                            <div className="flex items-center rounded-lg bg-gray-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid')}
                                    className={`rounded-md p-1.5 transition-colors ${
                                        viewMode === 'grid'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                    aria-label="Grid view"
                                >
                                    <LayoutGrid className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className={`rounded-md p-1.5 transition-colors ${
                                        viewMode === 'list'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                    aria-label="List view"
                                >
                                    <List className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white">
                            <div className="overflow-x-auto">
                                <table className="min-w-[1080px] w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50/60">
                                            <th className="w-12 px-3 py-3.5 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllSelected}
                                                    onChange={toggleSelectAll}
                                                    className="h-5 w-5 rounded border-gray-300 text-[#8A7A62] focus:ring-[#8A7A62]"
                                                />
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">
                                                <button type="button" className="inline-flex items-center gap-2">
                                                    Nama
                                                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                                                </button>
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">
                                                <button type="button" className="inline-flex items-center gap-2">
                                                    Nama penghadap
                                                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                                                </button>
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">
                                                <button type="button" className="inline-flex items-center gap-2">
                                                    Layanan
                                                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                                                </button>
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">
                                                <button type="button" className="inline-flex items-center gap-2">
                                                    Tipe layanan
                                                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                                                </button>
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">
                                                <button type="button" className="inline-flex items-center gap-2">
                                                    Author
                                                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                                                </button>
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-base font-semibold text-gray-800">Dimodifikasi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                    Memuat data perusahaan...
                                                </td>
                                            </tr>
                                        ) : filteredItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                    {activeTab === 'favorite'
                                                        ? 'Belum ada data perusahaan berbintang'
                                                        : 'Belum ada data perusahaan'}
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredItems.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="border-b border-gray-200 text-base text-gray-800 transition-colors last:border-b-0 hover:bg-gray-50"
                                                >
                                                    <td className="px-3 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(item.id)}
                                                            onChange={() => toggleSelectOne(item.id)}
                                                            className="h-5 w-5 rounded border-gray-300 text-[#8A7A62] focus:ring-[#8A7A62]"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="inline-flex items-center gap-2.5">
                                                            <Folder className="h-6 w-6 text-gray-700" />
                                                            <span>{item.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">{item.principalName}</td>
                                                    <td className="px-3 py-3">{item.service}</td>
                                                    <td className="px-3 py-3">{item.serviceType}</td>
                                                    <td className="px-3 py-3">{item.author}</td>
                                                    <td className="px-3 py-3 text-nowrap">{item.modifiedAt}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toast toast={toast} onClose={hideToast} position="bottom-left" />
        </div>
    );
}
