'use client';

import { LoginForm } from "@/features/auth/presentation/components/LoginForm";
import Image from "next/image";
import authBanner from "@/assets/images/auth_banner.png";

export default function LoginPage() {
    return (
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-white z-10">
                <div className="w-full max-w-md mx-auto">
                    <LoginForm />
                    <div className="mt-16 text-center">
                        <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                            Kelola arsip dokumen notaris secara terstruktur dan terpercaya,
                            dengan sistem yang dirancang untuk keamanan dan ketertiban hukum.
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative hidden w-full h-full lg:block bg-gray-50">
                <Image
                    src={authBanner}
                    alt="Notarix Auth Banner"
                    fill
                    priority
                    className="object-cover"
                    sizes="40vw"
                    quality={100}
                />
            </div>
        </div>
    );
}
