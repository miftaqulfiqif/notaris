'use client';

import { MoreVertical, Search, FileText, Star } from 'lucide-react';
import { FileItem } from '@/features/services/types';

interface FileTableProps {
    items: FileItem[];
}

export function FileTable({ items }: FileTableProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="w-12 px-6 py-4">
                                <input type="checkbox" className="rounded border-gray-300 text-[#8B7355] focus:ring-[#8B7355]" />
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 group-hover:text-gray-900 uppercase tracking-wider">Nama File</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 group-hover:text-gray-900 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 group-hover:text-gray-900 uppercase tracking-wider">Dimodifikasi</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 group-hover:text-gray-900 uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="p-3 bg-gray-50 rounded-full mb-3">
                                            <Search className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="font-medium text-gray-900">Belum ada file</p>
                                        <p className="text-sm text-gray-500 mt-1">Upload file baru untuk memulai</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="rounded border-gray-300 text-[#8B7355] focus:ring-[#8B7355]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 border border-transparent group-hover:border-red-200 transition-all">
                                                <FileText className="w-5 h-5 text-red-500" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 transition-colors">
                                                    {item.file_name}
                                                </span>
                                                <Star className="w-4 h-4 fill-gray-900 text-gray-900" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.user}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 text-nowrap">
                                        {new Date(item.updated_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
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
