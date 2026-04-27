'use client';

import { apiPost } from "@/shared";
import { useState } from "react";
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useSearchParams, useRouter } from "next/navigation";


interface ResetPasswordFormProps {
    token: string;
    new_password: string;
    confirm_password: string;
}

export const ResetPasswordForm = () => {

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleSubmit = async () => {
        if (password.length < 6 || confirmPassword.length < 6 || password !== confirmPassword) return;

        setIsVerifying(true);

        const payload: ResetPasswordFormProps = {
            token,
            new_password: password,
            confirm_password: confirmPassword
        };

        try {
            await apiPost(ENDPOINTS.AUTH.RESET_PASSWORD, payload);
            router.push('/login');
        } catch (error) {
            console.error(error);
            alert('Failed to reset password');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 text-black">
            <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }} className="space-y-6">
                <div className="flex flex-col gap-2">
                    <p>Password</p>
                    <div className="flex justify-center gap-3">
                        <input
                            key="password"
                            type="text"
                            inputMode="text"
                            maxLength={16}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-14 text-xl font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B39B7D] focus:border-transparent transition-all disabled:opacity-50 px-4"
                        />
                        <ellipse/>
                    </div>      
                </div>  

                <div className="flex flex-col gap-2">
                    <p>Confirm Password</p>
                    <div className="flex justify-center gap-3">
                        <input
                            key="confirmPassword"
                            type="text"
                            inputMode="text"
                            maxLength={16}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full h-14 text-xl font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B39B7D] focus:border-transparent transition-all disabled:opacity-50 px-4"
                        />
                    </div>
                </div>  

                <button
                    type="submit"
                    disabled={password.length < 6 || confirmPassword.length < 6 || password !== confirmPassword || isVerifying}
                    className="w-full py-3.5 px-4 bg-[#8B7355] hover:bg-[#7A6548] text-white font-medium rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isVerifying ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        'Reset Password'
                    )}
                </button>
            </form>
        </div>
    )
};
