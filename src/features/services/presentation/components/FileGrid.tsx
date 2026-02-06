'use client';

import { MoreVertical, FileText } from 'lucide-react';
import { FileItem } from '@/features/services/types';
import Image from 'next/image';
import pdfIcon from '@/assets/icons/PDF.svg';

interface FileGridProps {
    items: FileItem[];
}

export function FileGrid({ items }: FileGridProps) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center bg-gray-50 p-12 border-2 border-gray-200 border-dashed rounded-xl">
                <div className="bg-white shadow-sm mb-3 p-3 rounded-full">
                    <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900">Belum ada file</p>
                <p className="mt-1 text-gray-500 text-sm">Upload file baru untuk memulai</p>
            </div>
        );
    }

    return (
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
                <div key={item.id} className="group bg-white hover:shadow-md border border-gray-200 rounded-xl overflow-hidden transition-shadow">
                    <div className="relative flex justify-center items-center bg-gray-50 p-4 border-gray-100 border-b aspect-4/3">
                        <div className="relative flex justify-center items-center bg-white shadow-sm border border-gray-200 w-full h-full overflow-hidden">
                            <div className="absolute inset-2 border-2 border-gray-200 border-double" />
                            <div className="flex justify-center items-center bg-gray-100 rounded-full w-12 h-12">
                                <FileText className="w-6 h-6 text-gray-300" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4">
                        <div className="w-6 h-6">
                            <Image src={pdfIcon} alt="PDF" width={24} height={24} className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate" title={item.file_name}>
                                {item.file_name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-xs">
                                <span className="max-w-20 truncate">{item.user}</span>
                                <span className="bg-gray-300 rounded-full w-1 h-1 shrink-0" />
                                <span className="truncate">
                                    {new Date(item.updated_at).toLocaleDateString('id-ID', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                        <button className="hover:bg-gray-100 p-1 rounded-full text-gray-400 hover:text-gray-600 transition-all shrink-0">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
