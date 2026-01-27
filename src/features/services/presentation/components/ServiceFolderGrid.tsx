'use client';

import { Folder, MoreVertical } from 'lucide-react';
import { serviceFolders } from '@/features/services/data/mock';

export function ServiceFolderGrid() {
    return (
        <div className="mb-10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {serviceFolders.map((folder, index) => (
                    <div
                        key={index}
                        className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-[var(--sidebar-primary)] transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-[#FDF8F3] transition-colors">
                                <Folder className="w-5 h-5 text-gray-600 group-hover:text-[var(--sidebar-primary)]" />
                            </div>
                            <span className="font-semibold text-gray-700 truncate group-hover:text-gray-900">{folder.name}</span>
                        </div>
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
