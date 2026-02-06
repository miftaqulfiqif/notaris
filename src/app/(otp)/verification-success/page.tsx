'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import successIllustration from "@/assets/images/success_illustration.png";

export default function VerificationSuccessPage() {
    const router = useRouter();

    const handleLogin = () => {
        router.push('/login');
    };

    return (
        <div className="w-full max-w-md">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex justify-center mb-6">
                    <Image
                        src={successIllustration}
                        alt="Success Illustration"
                        width={280}
                        height={200}
                        priority
                        className="object-contain"
                    />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
                    Akun Anda telah berhasil dibuat
                </h1>

                <button
                    onClick={handleLogin}
                    className="w-full py-3.5 px-4 bg-[#8B7355] hover:bg-[#7A6548] text-white font-medium rounded-lg transition-all flex items-center justify-center"
                >
                    Login
                </button>
            </div>
        </div>
    );
}
