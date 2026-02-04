'use client';

import { useState, use, useMemo, useEffect } from 'react';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { Plus, LayoutGrid, Rows, ChevronRight } from 'lucide-react';
import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';
import { useDragDropContext } from '@/features/dashboard/context/DragDropContext';
import { ServiceFolderGrid } from '@/features/services/presentation/components/ServiceFolderGrid';
import { ServiceActivityTable } from '@/features/services/presentation/components/ServiceActivityTable';
import { Activity } from '@/features/dashboard/types';
import { ActivityDetailSidebar } from '@/features/dashboard/presentation/components/ActivityDetailSidebar';
import Link from 'next/link';
import { useSidebar } from '@/layout/providers/SidebarContext';
import { ServiceTypesProvider } from '@/features/services/context/ServiceTypesContext';

export default function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { openModal } = useUploadModal();
    const { setPreSelection } = useDragDropContext();
    const { services } = useSidebar();
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    const currentService = useMemo(() => {
        if (!services.length) return null;
        return services.find(s =>
            s.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase() ||
            s.name.toLowerCase() === slug.toLowerCase()
        );
    }, [services, slug]);

    const serviceName = currentService?.name || slug.toUpperCase();

    // Set drag-drop pre-selection when on service page
    useEffect(() => {
        if (currentService) {
            setPreSelection({
                layananId: currentService.id,
                layananName: currentService.name,
            });
        }

        // Cleanup: reset pre-selection when leaving the page
        return () => {
            setPreSelection(null);
        };
    }, [currentService, setPreSelection]);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Main Content */}
            <div className={`flex-1 overflow-y-auto transition-all duration-300 ${selectedActivity ? 'mr-0' : ''}`} style={{ scrollbarWidth: 'none' }}>
                <div className="max-w-[1600px] mx-auto min-h-screen w-full flex flex-col">
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-8 pt-8 pb-4 border-b border-gray-100/50">
                        <DashboardHeader />
                    </div>

                    <div className="px-8 pb-8 flex-1 overflow-y-auto">
                        <div className="flex items-end justify-between mb-8 mt-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Link href="/dashboard" className="hover:text-(--sidebar-primary) transition-colors">
                                    Dashboard
                                </Link>
                                <ChevronRight className="w-4 h-4" />
                                <p>Layanan</p>
                                <ChevronRight className="w-4 h-4" />
                                <span className="font-semibold text-gray-500">{serviceName}</span>
                            </div>

                            <button
                                onClick={() => openModal({
                                    layananId: currentService?.id,
                                    layananName: currentService?.name,
                                })}
                                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Tambah Baru</span>
                            </button>
                        </div>

                        <ServiceFolderGrid />
                        <ServiceActivityTable onSelectActivity={setSelectedActivity} />
                    </div>
                </div>
            </div>

            {/* Detail Sidebar */}
            {selectedActivity && (
                <ActivityDetailSidebar
                    activity={selectedActivity}
                    onClose={() => setSelectedActivity(null)}
                />
            )}
        </div>
    );
}
