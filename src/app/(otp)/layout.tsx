export default function OtpLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen w-full bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#2A3F6D]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-8 h-8"
                        >
                            <path d="M2 6h4" />
                            <path d="M2 10h4" />
                            <path d="M2 14h4" />
                            <path d="M2 18h4" />
                            <rect width="16" height="20" x="4" y="2" rx="2" />
                            <path d="M16 2v20" />
                        </svg>
                        <span className="text-xl font-bold">Notarix</span>
                    </div>
                    <a
                        href="#"
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Butuh bantuan?
                    </a>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                {children}
            </div>

            {/* Footer */}
            <footer className="pb-8 px-4">
                <p className="text-sm text-gray-400 text-center max-w-md mx-auto leading-relaxed">
                    Kelola arsip dokumen notaris secara terstruktur dan terpercaya,
                    dengan sistem yang dirancang untuk keamanan dan ketertiban hukum.
                </p>
            </footer>
        </main>
    );
}
