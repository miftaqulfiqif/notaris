'use client';

import { MoreVertical, Search, Filter } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import folderIcon from '@/assets/icons/folder.png';
import { FolderItem } from '@/features/services/types';
import { StatusBadge } from '@/shared/components';

interface FolderTableProps {
    items: FolderItem[];
}

export function FolderTable({ items }: FolderTableProps) {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { slug, typeSlug } = params as { slug: string; typeSlug: string };
    const typeId = searchParams.get('id');

    const handleRowClick = (folderId: string) => {
        router.push(`/services/${slug}/${typeSlug}/${folderId}?id=${typeId}`);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="w-12 px-6 py-4">
                                <input type="checkbox" className="rounded border-gray-300 text-[#8B7355] focus:ring-[#8B7355]" />
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Penghadap</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dimodifikasi</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="p-3 bg-gray-50 rounded-full mb-3">
                                            <Search className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="font-medium text-gray-900">Belum ada data</p>
                                        <p className="text-sm text-gray-500 mt-1">Buat folder baru untuk memulai</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="group hover:bg-gray-50/80 transition-colors cursor-pointer"
                                    onClick={() => handleRowClick(item.id)}
                                >
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <input type="checkbox" className="rounded border-gray-300 text-[#8B7355] focus:ring-[#8B7355]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="">
                                                <Image src={folderIcon} alt="Folder" width={20} height={20} className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-gray-900 group-hover:text-[#8B7355] transition-colors">
                                                {item.folder_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.nama_penghadap}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.user}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 text-nowrap">
                                        {new Date(item.updated_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
