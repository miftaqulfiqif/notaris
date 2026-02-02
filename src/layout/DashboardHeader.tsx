'use client';

import React from 'react';
import { Search, Bell, Menu, LogOut } from 'lucide-react';
import { useSidebar } from '@/layout/providers/SidebarContext';
import { useAuthContext } from '@/features/auth/context/auth.context';

export function DashboardHeader() {
    const { toggle } = useSidebar();
    const { user, logout } = useAuthContext();
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Get initials from user name
    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <header className="flex items-center gap-4">
            <button
                onClick={toggle}
                className="p-2 lg:hidden text-gray-600 hover:bg-gray-100 rounded-lg"
            >
                <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 max-w-2xl relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    placeholder="Cari file, folder, nomor akta, nama klien"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B39B7D] text-black focus:border-transparent transition-all shadow-sm"
                />
            </div>

            <div className="flex items-center gap-4 ml-auto">
                <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors relative shadow-sm">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200 shadow-sm hidden sm:block focus:outline-none focus:ring-2 focus:ring-[#B39B7D] focus:ring-offset-2 transition-all"
                    >
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                            {getInitials(user?.name)}
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email || 'email@example.com'}</p>
                            </div>
                            <button
                                onClick={() => {
                                    logout();
                                    setIsDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Keluar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
