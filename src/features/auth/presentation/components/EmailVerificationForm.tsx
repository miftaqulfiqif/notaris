'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthContext } from '@/features/auth/context/auth.context';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const EmailVerificationForm = () => {
    const { user } = useAuthContext();
    const router = useRouter();
    const [isRequesting, setIsRequesting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(300);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const requestOtp = useCallback(async () => {
        setIsRequesting(true);
        setError(null);
        try {
            const response = await fetch(ENDPOINTS.USER.OTP_REQUEST, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                setOtpSent(true);
                setTimeLeft(300);
            } else {
                const data = await response.json();
                setError(data.message || 'Gagal mengirim kode OTP. Silakan coba lagi.');
                setOtpSent(false);
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
            setOtpSent(false);
        } finally {
            setIsRequesting(false);
        }
    }, []);

    useEffect(() => {
        if (timeLeft <= 0 || !otpSent) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, otpSent]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, index) => {
            if (index < 6) newOtp[index] = char;
        });
        setOtp(newOtp);

        const lastIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastIndex]?.focus();
    };

    const handleResend = () => {
        setOtp(['', '', '', '', '', '']);
        requestOtp();
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length !== 6) return;

        setIsVerifying(true);
        setError(null);

        try {
            const response = await fetch(ENDPOINTS.USER.OTP_VERIFY, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ otp: otpCode }),
            });

            if (response.ok) {
                router.push('/verification-success');
            } else {
                const data = await response.json();
                setError(data.message || 'Kode OTP tidak valid. Silakan coba lagi.');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsVerifying(false);
        }
    };

    if (!otpSent) {
        return (
            <div className="w-full">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Verifikasi Email</h1>

                    <p className="text-gray-500 text-center mb-6">
                        Klik tombol di bawah untuk mengirimkan kode OTP ke email Anda
                    </p>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-8">
                        <div className="w-10 h-10 flex items-center justify-center text-gray-400">
                            <Mail className="w-5 h-5" />
                        </div>
                        <span className="flex-1 text-gray-700">{user?.email || 'example@gmail.com'}</span>
                    </div>

                    <button
                        type="button"
                        onClick={requestOtp}
                        disabled={isRequesting}
                        className="w-full py-3.5 px-4 bg-[#8B7355] hover:bg-[#7A6548] text-white font-medium rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isRequesting ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Kirim Kode OTP'
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Verifikasi Email</h1>
                    <span className="text-gray-400 font-mono text-lg">{formatTime(timeLeft)}</span>
                </div>

                <p className="text-gray-500 text-center mb-6">
                    Kami sudah mengirimkan 6-digit kode OTP ke
                </p>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-8">
                    <div className="w-10 h-10 flex items-center justify-center text-gray-400">
                        <Mail className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-gray-700">{user?.email || 'example@gmail.com'}</span>
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center gap-3">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                disabled={isVerifying}
                                className="w-12 h-14 text-center text-xl font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B39B7D] focus:border-transparent transition-all disabled:opacity-50"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={otp.join('').length !== 6 || isVerifying}
                        className="w-full py-3.5 px-4 bg-[#8B7355] hover:bg-[#7A6548] text-white font-medium rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isVerifying ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Buat Akun'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <span className="text-gray-500 text-sm">Tidak menerima OTP? </span>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={isRequesting || isVerifying}
                        className="text-sm font-semibold text-[#8B7355] hover:text-[#7A6548] transition-colors disabled:opacity-50"
                    >
                        Kirim ulang
                    </button>
                </div>
            </div>
        </div>
    );
};
