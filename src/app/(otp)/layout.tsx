import { BrandLogo } from '@/shared/components';

export default function OtpLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen w-full bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <BrandLogo width={122} height={45} priority />
                    <a
                        href="#"
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Butuh bantuan?
                    </a>
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                {children}
            </div>

            <footer className="pb-8 px-4">
                <p className="text-sm text-gray-400 text-center max-w-md mx-auto leading-relaxed">
                    Kelola arsip dokumen notaris secara terstruktur dan terpercaya,
                    dengan sistem yang dirancang untuk keamanan dan ketertiban hukum.
                </p>
            </footer>
        </main>
    );
}
