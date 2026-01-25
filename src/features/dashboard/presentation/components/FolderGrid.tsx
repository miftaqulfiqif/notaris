import { Folder, MoreVertical } from 'lucide-react';

const folders = [
    { name: "Pendirian" },
    { name: "RUPS Umum" },
    { name: "RUPS Tahunan" },
    { name: "Pendaftaran Fidusia" },
    { name: "Pembukaan Cabang" },
    { name: "Rapat Anggota" },
    { name: "Pelaporan bulanan" },
    { name: "Pelaporan Tahunan" },
    { name: "Pendirian" },
    { name: "RUPS Umum" },
    { name: "RUPS Tahunan" },
    { name: "Pendaftaran Fidusia" },
    { name: "Pembukaan Cabang" },
    { name: "Rapat Anggota" },
    { name: "Pelaporan bulanan" },
    { name: "Pelaporan Tahunan" },
];

export function FolderGrid() {
    return (
        <div className="mb-10 max-w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Folder yang disarankan</h3>
            <div className="grid grid-rows-2 grid-flow-col gap-4 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide auto-cols-[16rem]">
                {folders.map((folder, index) => (
                    <div
                        key={index}
                        className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-[var(--sidebar-primary)] transition-all cursor-pointer h-full"
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
