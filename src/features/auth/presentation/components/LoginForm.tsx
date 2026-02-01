import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';


export const LoginForm = () => {
    const { login, isLoading, error } = useAuth();
    const [credentials, setCredentials] = useState({
        emailOrUsername: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await login(credentials);
        if (response) {
            window.location.href = '/dashboard';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="w-full">
            {/* Header / Logo */}
            <div className="mb-10 text-center flex flex-col items-center">
                <div className="flex items-center gap-2 mb-6 text-[#2A3F6D]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-10 h-10"
                    >
                        <path d="M2 6h4" />
                        <path d="M2 10h4" />
                        <path d="M2 14h4" />
                        <path d="M2 18h4" />
                        <rect width="16" height="20" x="4" y="2" rx="2" />
                        <path d="M16 2v20" />
                    </svg>
                    <span className="text-2xl font-bold">Notarix</span>
                </div>

                <div className="w-full text-left">
                    <h1 className="text-[28px] font-bold text-gray-900 mb-2">Selamat Datang</h1>
                    <p className="text-gray-500 text-base">Gunakan email atau username yang terdaftar untuk masuk.</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                        Username/Email
                    </label>
                    <input
                        type="text"
                        name="emailOrUsername"
                        value={credentials.emailOrUsername}
                        onChange={handleChange}
                        required
                        placeholder="Username atau Email"
                        className="w-full text-black px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B39B7D] focus:border-[#B39B7D] transition-all placeholder:text-gray-300"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            placeholder="Password"
                            className="w-full text-black px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B39B7D] focus:border-[#B39B7D] transition-all placeholder:text-gray-300"
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

                <div className="pt-1">
                    <a href="#" className="text-sm font-bold text-[#8B7355] hover:text-[#7A6548] transition-colors">
                        Lupa Password?
                    </a>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-[#8B7355] hover:bg-[#7A6548] text-white font-medium rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-2"
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        "Login"
                    )}
                </button>
            </form>
        </div>
    );
};
