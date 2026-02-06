import { Sidebar } from '@/layout/Sidebar';
import { SidebarProvider } from '@/layout/providers/SidebarContext';
import { UploadModalProvider } from '@/features/dashboard/context/UploadModalContext';
import { DragDropProvider } from '@/features/dashboard/context/DragDropContext';
import { GlobalUploadModal } from '@/features/dashboard/presentation/components/GlobalUploadModal';
import { GlobalDragDropListener } from '@/features/dashboard/presentation/components/GlobalDragDropListener';
import { Footer } from '@/layout/Footer';
import { ProtectedPath } from '@/features/auth/presentation/components/ProtectedPath';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedPath>
            <SidebarProvider>
                <UploadModalProvider>
                    <DragDropProvider>
                        <GlobalDragDropListener />
                        <GlobalUploadModal />
                        <div className="min-h-screen bg-(--background) text-(--foreground) flex overflow-hidden max-w-full">
                            <Sidebar />

                            <main className="flex-1 ml-0 lg:ml-64 min-h-screen bg-white transition-all duration-200 flex flex-col min-w-0 max-w-full overflow-hidden">
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    {children}
                                </div>

                                <Footer />
                            </main>
                        </div>
                    </DragDropProvider>
                </UploadModalProvider>
            </SidebarProvider>
        </ProtectedPath>
    );
}
