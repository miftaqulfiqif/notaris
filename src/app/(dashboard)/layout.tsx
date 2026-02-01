import { Sidebar } from '@/layout/Sidebar';
import { SidebarProvider } from '@/layout/providers/SidebarContext';
import { UploadModalProvider } from '@/features/dashboard/context/UploadModalContext';
import { GlobalUploadModal } from '@/features/dashboard/presentation/components/GlobalUploadModal';
import { GlobalDragDropListener } from '@/features/dashboard/presentation/components/GlobalDragDropListener';
import { Footer } from '@/layout/Footer';

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

                        <Footer />
                    </main>
                </div>
            </UploadModalProvider>
        </SidebarProvider>
    );
}
