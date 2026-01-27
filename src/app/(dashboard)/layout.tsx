import { Sidebar } from '@/layout/Sidebar';
import { SidebarProvider } from '@/layout/providers/SidebarContext';
import { UploadModalProvider } from '@/features/dashboard/context/UploadModalContext';
import { GlobalUploadModal } from '@/features/dashboard/presentation/components/GlobalUploadModal';
import { GlobalDragDropListener } from '@/features/dashboard/presentation/components/GlobalDragDropListener';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <UploadModalProvider>
                <GlobalDragDropListener />
                <GlobalUploadModal />
                <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex">
                    <Sidebar />

                    <main className="flex-1 ml-0 lg:ml-64 min-h-screen bg-white transition-all duration-200 flex flex-col min-w-0">
                        <div className="flex-1">
                            {children}
                        </div>

                        <div className="px-8 py-6 text-[15px] bg-secondary sticky bottom-0 text-white border-t border-gray-100 flex items-center gap-5 mt-auto">
                            <span>© {new Date().getFullYear()}</span>
                            <a href="#" className="hover:text-white/90 flex items-center gap-1">
                                GANDARA NETWORK
                                <span className="">↗</span>
                            </a>
                        </div>
                    </main>
                </div>
            </UploadModalProvider>
        </SidebarProvider>
    );
}
