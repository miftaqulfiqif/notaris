import { Folder } from 'lucide-react';
import { folders } from '@/features/dashboard/data';

export function FolderGrid() {
    return (
        <div className="mb-10 max-w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Folder yang disarankan</h3>
            <div className="grid grid-rows-2 grid-flow-col gap-4 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide auto-cols-[16rem]">
                {folders.map((folder, index) => (
                    <div
                        key={index}
                        className="group flex items-center justify-between py-1 px-2 bg-[#FAFAFA] rounded-xl hover:bg-[#f1f1f1] transition-all cursor-pointer h-full"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <Folder className="w-10 h-10 text-yellow-400 fill-yellow-400" />
                            <span className="font-semibold text-gray-700 truncate group-hover:text-gray-900">{folder.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
