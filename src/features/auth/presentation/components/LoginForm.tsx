import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { BrandLogo } from '@/shared/components';
import { getAuthenticatedHomePath } from '@/features/auth/utils/user';


export const LoginForm = () => {
    const { login, isLoading, error } = useAuth();
    const [credentials, setCredentials] = useState({
        emailOrUsername: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const authenticatedUser = await login(credentials);
        if (authenticatedUser) {
            window.location.href = getAuthenticatedHomePath(authenticatedUser);
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
            <div className="flex flex-col items-center mb-10 text-center">
                <BrandLogo className="mb-6" width={162} height={60} priority />

                <div className="w-full text-left">
                    <h1 className="mb-2 font-bold text-[28px] text-gray-900">Selamat Datang</h1>
                    <p className="text-gray-500 text-base">Gunakan email atau username yang terdaftar untuk masuk.</p>
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-3 bg-red-50 mb-6 p-4 border border-red-100 rounded-xl text-red-600">
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="font-semibold text-gray-900 text-sm">
                        Username/Email
                    </label>
                    <input
                        type="text"
                        name="emailOrUsername"
                        value={credentials.emailOrUsername}
                        onChange={handleChange}
                        required
                        placeholder="Username atau Email"
                        className="bg-white px-4 py-3 border border-gray-200 focus:border-[#B39B7D] rounded-lg focus:outline-none focus:ring-[#B39B7D] focus:ring-1 w-full text-black placeholder:text-gray-300 transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-semibold text-gray-900 text-sm">
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
                            className="bg-white px-4 py-3 border border-gray-200 focus:border-[#B39B7D] rounded-lg focus:outline-none focus:ring-[#B39B7D] focus:ring-1 w-full text-black placeholder:text-gray-300 transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="top-1/2 right-4 absolute text-gray-400 hover:text-gray-600 transition-colors -translate-y-1/2"
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
                    <a href="#" className="font-bold text-[#8B7355] hover:text-[#7A6548] text-sm transition-colors">
                        Lupa Password?
                    </a>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex justify-center items-center bg-[#8B7355] hover:bg-[#7A6548] disabled:opacity-70 mt-2 px-4 py-3.5 rounded-lg w-full font-medium text-white transition-all disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="border-2 border-white/30 border-t-white rounded-full w-6 h-6 animate-spin" />
                    ) : (
                        "Login"
                    )}
                </button>
            </form>
        </div>
    );
};
