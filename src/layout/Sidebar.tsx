'use client';

import {
    LayoutDashboard,
    Star,
    BookOpen,
    Building2,
    Trash2,
    Settings,
    ChevronRight,
    ChevronDown,
    Folder
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontSizeSlider } from '@/shared/components/FontSizeSlider';
import { useState } from 'react';
import { useSidebar } from '@/layout/providers/SidebarContext';
import { currentUser, services } from '@/layout/data/sidebar.data';

export function Sidebar() {
    const pathname = usePathname();
    const [isServicesOpen, setIsServicesOpen] = useState(false);
    const [activeService, setActiveService] = useState('PT');
    const { isOpen, close } = useSidebar();

    const isActive = (path: string) => pathname === path;
    const isServiceActive = pathname.startsWith('/services/');

    if (isServiceActive && !isServicesOpen) {
        setIsServicesOpen(true);
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={close}
                />
            )}

            <aside className={`w-64 h-screen bg-(--sidebar-bg) border-r border-gray-100 flex flex-col fixed left-0 top-0 overflow-y-auto z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:visible ${isOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
                }`}>
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="text-[var(--sidebar-primary)]">
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
                        </div>
                        <span className="text-xl font-bold text-[#2A3F6D]">Notarix</span>
                    </div>
                </div>

                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 font-bold">
                                JM
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p>
                            <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    <Link
                        href="/dashboard"
                        onClick={() => setIsServicesOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${isActive('/dashboard')
                            ? 'text-white bg-(--sidebar-primary)'
                            : 'text-gray-500 hover:bg-(--sidebar-hover) hover:text-gray-900'
                            }`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                    </Link>

                    <Link
                        href="/starred"
                        onClick={() => setIsServicesOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${isActive('/starred')
                            ? 'text-white bg-(--sidebar-primary)'
                            : 'text-gray-500 hover:bg-(--sidebar-hover) hover:text-gray-900'
                            }`}
                    >
                        <Star className="w-5 h-5" />
                        <span className="font-medium">Berbintang</span>
                    </Link>
                    <div className="space-y-1 cursor-pointer">
                        <button
                            onClick={() => setIsServicesOpen(!isServicesOpen)}
                            className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${isServicesOpen || isServiceActive
                                ? 'bg-(--sidebar-primary) text-white'
                                : 'text-gray-500 hover:bg-(--sidebar-hover) hover:text-gray-900'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5" />
                                <span className="font-medium">Layanan</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <div
                            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isServicesOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                }`}
                        >
                            <div className="overflow-hidden">
                                <div className="pl-4 space-y-1 pt-1">
                                    {services.map((service) => {
                                        const servicePath = `/services/${service.name.toLowerCase()}`;
                                        const isCurrentService = pathname === servicePath;

                                        return (
                                            <Link
                                                key={service.name}
                                                href={servicePath}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isCurrentService
                                                    ? 'bg-[#B39B7D] text-white' // Making it visually distinct but within theme
                                                    : 'text-gray-600 hover:bg-(--sidebar-hover) hover:text-gray-900'
                                                    }`}
                                            >
                                                <Folder className={`w-5 h-5 ${isCurrentService ? 'fill-yellow-400 text-yellow-400' : 'fill-yellow-400 text-yellow-400'
                                                    }`} />
                                                <span className="font-medium">{service.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="#"
                        onClick={() => setIsServicesOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-gray-500 hover:bg-(--sidebar-hover) hover:text-gray-900 rounded-lg transition-colors"
                    >
                        <Building2 className="w-5 h-5" />
                        <span className="font-medium">Perusahaan</span>
                    </Link>

                    <Link
                        href="#"
                        onClick={() => setIsServicesOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-gray-500 hover:bg-(--sidebar-hover) hover:text-gray-900 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                        <span className="font-medium">Sampah</span>
                    </Link>

                    <Link
                        href="#"
                        onClick={() => setIsServicesOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-gray-500 hover:bg-(--sidebar-hover) hover:text-gray-900 rounded-lg transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Setting</span>
                    </Link>
                </nav>

                <FontSizeSlider />
            </aside>
        </>
    );
}
