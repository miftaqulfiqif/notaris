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
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="p-3 bg-white rounded-full mb-3 shadow-sm">
                    <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900">Belum ada file</p>
                <p className="text-sm text-gray-500 mt-1">Upload file baru untuk memulai</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
                <div key={item.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Preview Area - Using a placeholder for now as per design */}
                    <div className="aspect-4/3 bg-gray-50 relative border-b border-gray-100 p-4 flex items-center justify-center">
                        <div className="bg-white w-full h-full shadow-sm border border-gray-200 flex items-center justify-center relative overflow-hidden">
                            {/* Mock Certificate Visual */}
                            <div className="absolute inset-2 border-2 border-double border-gray-200" />
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-gray-300" />
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-6 h-6">
                            <Image src={pdfIcon} alt="PDF" width={24} height={24} className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate" title={item.file_name}>
                                {item.file_name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                                <span className="truncate max-w-[80px]">{item.user}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                <span className="truncate">
                                    {new Date(item.updated_at).toLocaleDateString('id-ID', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all shrink-0">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
