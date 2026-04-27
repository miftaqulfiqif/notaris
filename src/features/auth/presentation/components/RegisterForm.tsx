'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthContext } from '@/features/auth/context/auth.context';
import { usePackages } from '@/features/billing/hooks/usePackages';

interface RegisterFormData {
    instanceName: string;
    fullName: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
}

export const RegisterForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { checkAuth } = useAuthContext();
    const { packages } = usePackages();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<RegisterFormData>({
        instanceName: '',
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const selectedPackageId = searchParams.get('package');
    const selectedPackage = packages.find((item) => item.id === selectedPackageId);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!selectedPackageId) {
            setError('Pilih paket langganan terlebih dahulu.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Password dan konfirmasi password tidak cocok.');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password minimal 8 karakter.');
            return;
        }

        if (!formData.agreeToTerms) {
            setError('Anda harus menyetujui syarat layanan dan kebijakan privasi.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(ENDPOINTS.AUTH.CREATE_NOTARIS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    notaris_name: formData.instanceName,
                    user_name: formData.fullName,
                    username: formData.username,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    confirm_password: formData.confirmPassword,
                    package_id: selectedPackageId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.errors || data.message || 'Registrasi gagal');
            }

            await checkAuth();
            router.push('/verify-email');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registrasi gagal');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    return (
        <div className="w-full">
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-[28px] font-bold text-gray-900 mb-2">Buat akun</h1>
                <p className="text-gray-500 text-base">
                    Kelola arsip dokumen notaris secara terstruktur dan terpercaya,
                </p>
            </div>

            <div className="mb-6 rounded-2xl border border-[#E8DED3] bg-[#FFFCF8] p-4">
                {selectedPackage ? (
                    <>
                        <p className="text-xs uppercase tracking-[0.24em] text-[#8B7355]">Paket dipilih</p>
                        <div className="mt-2 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-lg font-semibold text-[#2D2925]">{selectedPackage.name}</p>
                                <p className="mt-1 text-sm text-[#6E6359]">
                                    Promo bulan pertama Rp {new Intl.NumberFormat('id-ID').format(selectedPackage.current_monthly_price)}
                                </p>
                            </div>
                            <Link href="/pricing" className="text-sm font-medium text-[#8B7355] hover:text-[#6E5943]">
                                Ganti paket
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-[#2D2925]">Belum ada paket dipilih</p>
                            <p className="mt-1 text-sm text-[#6E6359]">Pilih paket lebih dulu agar akun bisa dibuat dengan status pembayaran yang benar.</p>
                        </div>
                        <Link href="/pricing" className="inline-flex rounded-lg bg-[#7D674E] px-4 py-2 text-sm font-medium text-white">
                            Pilih paket
                        </Link>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                        Nama Instansi
                    </label>
                    <input
                        type="text"
                        name="instanceName"
                        value={formData.instanceName}
                        onChange={handleChange}
                        required
                        placeholder="Cth : PPAT Agus Trisaka, S.H. (Kota Palembang)"
                        className="w-full text-black px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B39B7D] focus:border-[#B39B7D] transition-all placeholder:text-gray-300"
                    />
                    <p className="text-xs text-gray-400">
                        Ini akan menjadi tampilan resmi ruang kerja arsip Anda.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            placeholder="Cth : Johny Marteen"
                            className="w-full text-black px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B39B7D] focus:border-[#B39B7D] transition-all placeholder:text-gray-300"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">
                            User name
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="Johny"
                            className="w-full text-black px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B39B7D] focus:border-[#B39B7D] transition-all placeholder:text-gray-300"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Example@gmail.com"
                        className="w-full text-black px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B39B7D] focus:border-[#B39B7D] transition-all placeholder:text-gray-300"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                        No Telp
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+62"
                        className="w-full text-black px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B39B7D] focus:border-[#B39B7D] transition-all placeholder:text-gray-300"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">
                            Buat Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="w-full text-black px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B39B7D] focus:border-[#B39B7D] transition-all placeholder:text-gray-300 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">
                            Konfirmasi Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="w-full text-black px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B39B7D] focus:border-[#B39B7D] transition-all placeholder:text-gray-300 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            name="agreeToTerms"
                            id="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                            className="peer sr-only"
                        />
                        <label
                            htmlFor="agreeToTerms"
                            className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer flex items-center justify-center peer-checked:bg-[#8B7355] peer-checked:border-[#8B7355] transition-all"
                        >
                            {formData.agreeToTerms && (
                                <Check className="w-3.5 h-3.5 text-white" />
                            )}
                        </label>
                    </div>
                    <label htmlFor="agreeToTerms" className="text-sm text-gray-600 cursor-pointer">
                        Saya setuju dengan{' '}
                        <Link href="/terms" className="text-[#8B7355] hover:text-[#7A6548] font-medium">
                            Syarat layanan
                        </Link>{' '}
                        dan{' '}
                        <Link href="/privacy" className="text-[#8B7355] hover:text-[#7A6548] font-medium">
                            Kebijakan privasi
                        </Link>
                        .
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !selectedPackageId}
                    className="w-full py-3.5 px-4 bg-[#8B7355] hover:bg-[#7A6548] text-white font-medium rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-2"
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        "Buat Akun"
                    )}
                </button>
            </form>
        </div>
    );
};
