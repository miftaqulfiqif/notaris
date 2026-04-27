import { RegisterForm } from "@/features/auth/presentation/components/RegisterForm";
import Link from "next/link";
import { PublicOnlyRoute } from "@/features/auth/presentation/components/PublicOnlyRoute";
import { BrandLogo } from '@/shared/components';
import { Suspense } from "react";

export default function RegisterPage() {
    return (
        <PublicOnlyRoute>
            <div className="min-h-screen bg-[#F7F5F2]">
                <header className="w-full px-6 py-4 flex items-center justify-between">
                    <BrandLogo width={122} height={45} priority />
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Sudah punya akun ?</span>
                        <Link
                            href="/login"
                            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Login
                        </Link>
                    </div>
                </header>

                <main className="flex flex-col items-center justify-center px-4 py-8">
                    <div className="w-full max-w-xl bg-white border border-[#E8DED3] rounded-[28px] p-8 shadow-[0_24px_64px_rgba(79,58,28,0.08)]">
                        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-[#F5EFE8]" />}>
                            <RegisterForm />
                        </Suspense>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                            Kelola arsip dokumen notaris secara terstruktur dan terpercaya,
                            dengan sistem yang dirancang untuk keamanan dan ketertiban hukum.
                        </p>
                    </div>
                </main>
            </div>
        </PublicOnlyRoute>
    );
}
