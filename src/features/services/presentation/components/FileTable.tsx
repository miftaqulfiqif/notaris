'use client';

import { MoreVertical, Search, FileText, Star } from 'lucide-react';
import { FileItem } from '@/features/services/types';

interface FileTableProps {
    items: FileItem[];
}

export function FileTable({ items }: FileTableProps) {
    return (
        <div className="bg-white shadow-sm hover:shadow-md border border-gray-200 rounded-xl overflow-hidden transition-shadow">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-gray-100 border-b">
                            <th className="px-6 py-4 w-12">
                                <input type="checkbox" className="border-gray-300 rounded focus:ring-[#8B7355] text-[#8B7355]" />
                            </th>
                            <th className="px-6 py-4 font-semibold text-gray-900 group-hover:text-gray-900 text-xs text-left uppercase tracking-wider">Nama File</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 group-hover:text-gray-900 text-xs text-left uppercase tracking-wider">Author</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 group-hover:text-gray-900 text-xs text-left uppercase tracking-wider">Dimodifikasi</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 group-hover:text-gray-900 text-xs text-right uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col justify-center items-center">
                                        <div className="bg-gray-50 mb-3 p-3 rounded-full">
                                            <Search className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="font-medium text-gray-900">Belum ada file</p>
                                        <p className="mt-1 text-gray-500 text-sm">Upload file baru untuk memulai</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="border-gray-300 rounded focus:ring-[#8B7355] text-[#8B7355]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-red-50 group-hover:bg-red-100 p-2 border border-transparent group-hover:border-red-200 rounded-lg transition-all">
                                                <FileText className="w-5 h-5 text-red-500" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 transition-colors">
                                                    {item.file_name}
                                                </span>
                                                <Star className="fill-gray-900 w-4 h-4 text-gray-900" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">{item.user}</td>
                                    <td className="px-6 py-4 text-gray-600 text-sm text-nowrap">
                                        {new Date(item.updated_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="hover:bg-gray-100 p-1 rounded-full text-gray-400 hover:text-gray-600 transition-all">
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
