import { DashboardHeader } from '@/layout/DashboardHeader';
import { FolderGrid } from '@/features/dashboard/presentation/components/FolderGrid';
import { ActivitySection } from '@/features/dashboard/presentation/components/ActivitySection';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="max-w-[1600px] mx-auto min-h-screen flex flex-col">
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-8 pt-8 pb-4 border-b border-gray-100/50">
                <DashboardHeader />
            </div>

            <div className="px-8 pb-8 flex-1">
                {/* Welcome Section */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 mt-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang, Dummy User</h1>
                        <p className="text-gray-500">Selamat datang kembali, ayo mulai aktivitas mu lagi di Notarix</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                        <Plus className="w-5 h-5" />
                        <span>Tambah Baru</span>
                    </button>
                </div>

                <FolderGrid />

                <ActivitySection />
            </div>
        </div>
    );
}
