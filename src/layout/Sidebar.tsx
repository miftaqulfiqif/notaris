'use client';

import {
    ChevronRight,
    ChevronDown,
    Folder
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontSizeSlider } from '@/shared/components/FontSizeSlider';
import { useState } from 'react';
import { useSidebar } from '@/layout/providers/SidebarContext';
import { currentUser } from '@/layout/data/sidebar.data';
import { navigationItems } from '@/layout/data/navigation.data';
import { getInitials } from '@/shared/utils/initials';

export function Sidebar() {
    const pathname = usePathname();
    const { isOpen, close, services } = useSidebar();

    const isActive = (path: string) => pathname === path;
    const isServiceActive = pathname.startsWith('/services/');

    const [isServicesOpen, setIsServicesOpen] = useState(isServiceActive);

    const getNavItemClasses = (path: string, hasSubmenu?: boolean) => {
        const active = hasSubmenu ? (isServicesOpen || isServiceActive) : isActive(path);
        return `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${active
                ? 'text-white bg-(--sidebar-primary)'
                : 'text-gray-500 hover:bg-(--sidebar-hover) hover:text-gray-900'
            }`;
    };

    return (
        <>
            {isOpen && (
                <div
                    className="lg:hidden z-30 fixed inset-0 bg-black/50"
                    onClick={close}
                />
            )}

            <aside className={`w-64 h-screen bg-(--sidebar-bg) border-r border-gray-100 flex flex-col fixed left-0 top-0 overflow-y-auto z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:visible ${isOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
                }`}>
                <div className="flex items-center px-6 border-gray-100 border-b h-16">
                    <div className="flex items-center gap-2">
                        <div className="text-(--sidebar-primary)">
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
                        <span className="font-bold text-[#2A3F6D] text-xl">Notarix</span>
                    </div>
                </div>

                <div className="p-4 border-gray-100 border-b">
                    <Link
                        href="/instansi"
                        className="group flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
                    >
                        <div className="relative bg-gray-200 rounded-full w-10 h-10 overflow-hidden">
                            <div className="flex justify-center items-center bg-gray-100 w-full h-full font-bold text-gray-500">
                                {getInitials(currentUser.name)}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">{currentUser.name}</p>
                            <p className="text-gray-500 text-xs truncate">{currentUser.email}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    </Link>
                </div>

                <nav className="flex-1 space-y-1 px-4 py-6">
                    {navigationItems.map((item) => {
                        if (item.hasSubmenu) {
                            return (
                                <div key={item.id} className="space-y-1 cursor-pointer">
                                    <button
                                        onClick={() => setIsServicesOpen(!isServicesOpen)}
                                        className={`w-full flex items-center justify-between ${getNavItemClasses(item.path, true)}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <div
                                        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isServicesOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                            }`}
                                    >
                                        <div className="overflow-hidden">
                                            <div className="space-y-1 pt-1 pl-4">
                                                {services.map((service) => {
                                                    const servicePath = `/services/${service.name.toLowerCase()}`;
                                                    const isCurrentService = pathname.startsWith(servicePath);

                                                    return (
                                                        <Link
                                                            key={service.name}
                                                            href={servicePath}
                                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isCurrentService
                                                                ? 'bg-[#B39B7D] text-white'
                                                                : 'text-gray-600 hover:bg-(--sidebar-hover) hover:text-gray-900'
                                                                }`}
                                                        >
                                                            <Folder className="fill-yellow-400 w-5 h-5 text-yellow-400" />
                                                            <span className="font-medium">{service.name}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.id}
                                href={item.path}
                                onClick={() => setIsServicesOpen(false)}
                                className={getNavItemClasses(item.path)}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <FontSizeSlider />
            </aside>
        </>
    );
}
