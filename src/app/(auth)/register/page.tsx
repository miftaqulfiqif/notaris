'use client';

import { RegisterForm } from "@/features/auth/presentation/components/RegisterForm";
import Link from "next/link";
import { PublicOnlyRoute } from "@/features/auth/presentation/components/PublicOnlyRoute";

export default function RegisterPage() {
    return (
        <PublicOnlyRoute>
            <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
                <header className="w-full px-6 py-4 flex items-center justify-between">
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
                    <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                        <RegisterForm />
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
