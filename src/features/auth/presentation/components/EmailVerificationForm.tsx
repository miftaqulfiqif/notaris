'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthContext } from '@/features/auth/context/auth.context';
import { ENDPOINTS } from '@/shared/api/endpoints';
import {
    getStoredOtpSession,
    removeStoredOtpSession,
    storeOtpSession,
} from '@/features/auth/utils/otp-session';
import type { StoredOtpSession } from '@/features/auth/utils/otp-session';

const RESEND_OTP_COOLDOWN_SECONDS = 60;
const OTP_ACTIVE_SECONDS = 5 * 60;

interface OtpRequestResponse {
    message?: string;
    data?: {
        ttl_ms?: number;
    };
}

export const EmailVerificationForm = () => {
    const { user, checkAuth } = useAuthContext();
    const router = useRouter();
    const [isRequesting, setIsRequesting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [otpTimeLeft, setOtpTimeLeft] = useState(0);
    const [resendTimeLeft, setResendTimeLeft] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const didAutoRequestRef = useRef(false);
    const otpExpiresAtRef = useRef<number | null>(null);
    const resendAvailableAtRef = useRef<number | null>(null);

    const syncTimers = useCallback(() => {
        if (!otpExpiresAtRef.current) {
            setOtpTimeLeft(0);
            setResendTimeLeft(0);
            setOtpSent(false);
            return;
        }

        const remainingOtpSeconds = Math.max(
            0,
            Math.ceil((otpExpiresAtRef.current - Date.now()) / 1000),
        );
        const remainingResendSeconds = resendAvailableAtRef.current
            ? Math.max(0, Math.ceil((resendAvailableAtRef.current - Date.now()) / 1000))
            : 0;

        setOtpTimeLeft(remainingOtpSeconds);
        setResendTimeLeft(remainingResendSeconds);
        setOtpSent(remainingOtpSeconds > 0);

        if (remainingOtpSeconds <= 0 && user?.email) {
            removeStoredOtpSession(user.email);
        }
    }, [user?.email]);

    const applyOtpSession = useCallback((session: StoredOtpSession) => {
        otpExpiresAtRef.current = session.otpExpiresAt;
        resendAvailableAtRef.current = session.resendAvailableAt;
        syncTimers();
    }, [syncTimers]);

    const restoreOtpSession = useCallback(() => {
        if (!user?.email) return false;

        const session = getStoredOtpSession(user.email);
        if (!session || session.otpExpiresAt <= Date.now()) {
            removeStoredOtpSession(user.email);
            return false;
        }

        applyOtpSession(session);
        return true;
    }, [applyOtpSession, user?.email]);

    const createOtpSession = useCallback((ttlMs?: number) => {
        if (!user?.email) return;

        const now = Date.now();
        const session: StoredOtpSession = {
            email: user.email,
            otpExpiresAt: now + (ttlMs ?? OTP_ACTIVE_SECONDS * 1000),
            resendAvailableAt: now + RESEND_OTP_COOLDOWN_SECONDS * 1000,
        };

        storeOtpSession(session);
        applyOtpSession(session);
    }, [applyOtpSession, user?.email]);

    const clearOtpSession = useCallback(() => {
        if (user?.email) {
            removeStoredOtpSession(user.email);
        }

        otpExpiresAtRef.current = null;
        resendAvailableAtRef.current = null;
        setOtpSent(false);
        setOtpTimeLeft(0);
        setResendTimeLeft(0);
    }, [user?.email]);

    const requestOtp = useCallback(async () => {
        if (!user?.email) return;

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

            const data: OtpRequestResponse = await response.json().catch(() => ({}));

            if (response.ok) {
                createOtpSession(data.data?.ttl_ms);
            } else {
                setError(data.message || 'Gagal mengirim kode OTP. Silakan coba lagi.');
                clearOtpSession();
            }
        } catch {
            setError('Terjadi kesalahan. Silakan coba lagi.');
            clearOtpSession();
        } finally {
            setIsRequesting(false);
        }
    }, [clearOtpSession, createOtpSession, user?.email]);

    useEffect(() => {
        if (!user?.email || didAutoRequestRef.current) return;

        didAutoRequestRef.current = true;
        if (restoreOtpSession()) return;

        void requestOtp();
    }, [requestOtp, restoreOtpSession, user?.email]);

    useEffect(() => {
        if (!otpSent) return;

        const timer = window.setInterval(syncTimers, 1000);
        const handleVisibilityChange = () => syncTimers();
        const handleFocus = () => syncTimers();

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.clearInterval(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [otpSent, syncTimers]);

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
        if (isRequesting || isVerifying || resendTimeLeft > 0) return;
        setOtp(['', '', '', '', '', '']);
        void requestOtp();
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
                clearOtpSession();
                await checkAuth();
                router.push('/verification-success');
            } else {
                const data = await response.json();
                setError(data.errors || data.message || 'Kode OTP tidak valid. Silakan coba lagi.');
            }
        } catch {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsVerifying(false);
        }
    };

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
                    <span className="text-gray-400 font-mono text-lg">
                        {otpSent ? formatTime(otpTimeLeft) : (isRequesting ? 'Mengirim...' : '--:--')}
                    </span>
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
                                disabled={isVerifying || !otpSent || otpTimeLeft <= 0}
                                className="w-12 h-14 text-center text-xl font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B39B7D] focus:border-transparent transition-all disabled:opacity-50"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={otp.join('').length !== 6 || isVerifying || !otpSent || otpTimeLeft <= 0}
                        className="w-full py-3.5 px-4 bg-[#8B7355] hover:bg-[#7A6548] text-white font-medium rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isVerifying ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Verifikasi Email'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <span className="text-gray-500 text-sm">Tidak menerima OTP? </span>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={isRequesting || isVerifying || resendTimeLeft > 0}
                        className="text-sm font-semibold text-[#8B7355] hover:text-[#7A6548] transition-colors disabled:opacity-50"
                    >
                        {resendTimeLeft > 0 ? `Kirim ulang (${formatTime(resendTimeLeft)})` : 'Kirim ulang'}
                    </button>
                </div>
            </div>
        </div>
    );
};
