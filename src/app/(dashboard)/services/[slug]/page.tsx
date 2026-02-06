'use client';

import { useState, use, useMemo, useEffect } from 'react';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { Plus, ChevronRight } from 'lucide-react';
import { useUploadModal } from '@/features/dashboard/context/UploadModalContext';
import { useDragDropContext } from '@/features/dashboard/context/DragDropContext';
import { ServiceFolderGrid } from '@/features/services/presentation/components/ServiceFolderGrid';
import { ActivitySection } from '@/features/dashboard/presentation/components/ActivitySection';
import { serviceActivities } from '@/features/services/data/mock';
import { Activity } from '@/features/dashboard/types';
import { ActivityDetailSidebar } from '@/features/dashboard/presentation/components/ActivityDetailSidebar';
import Link from 'next/link';
import { useSidebar } from '@/layout/providers/SidebarContext';

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

    useEffect(() => {
        if (currentService) {
            setPreSelection({
                layananId: currentService.id,
                layananName: currentService.name,
            });
        }

        return () => {
            setPreSelection(null);
        };
    }, [currentService, setPreSelection]);

    return (
        <>
            <div className="flex flex-col w-full min-h-full overflow-x-hidden">
                <div className="top-0 z-10 sticky bg-white/80 backdrop-blur-md px-4 sm:px-8 pt-6 sm:pt-8 pb-4 border-gray-100/50 border-b">
                    <DashboardHeader />
                </div>

                <div className="flex-1 px-4 sm:px-8 pb-8 overflow-x-hidden">
                    <div className="flex sm:flex-row flex-col justify-between sm:items-end gap-4 mt-4 mb-8">
                        <div className="flex flex-wrap items-center gap-2 text-gray-500 text-sm">
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
                            className="flex justify-center items-center gap-2 bg-white hover:bg-gray-50 shadow-sm px-6 py-3 border border-gray-200 hover:border-gray-300 rounded-xl w-full sm:w-auto font-semibold text-gray-900 transition-all cursor-pointer shrink-0"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Tambah Baru</span>
                        </button>
                    </div>

                    <ServiceFolderGrid />
                    <ActivitySection
                        activities={serviceActivities}
                        clientHeaderLabel="Nama Penghadap"
                        onSelectActivity={setSelectedActivity}
                    />
                </div>
            </div>

            {selectedActivity && (
                <ActivityDetailSidebar
                    activity={selectedActivity}
                    onClose={() => setSelectedActivity(null)}
                />
            )}
        </>
    );
}
