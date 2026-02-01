'use client';

import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useSidebar } from '@/layout/providers/SidebarContext';

export function DashboardHeader() {
    const { toggle } = useSidebar();

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
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--sidebar-primary) text-black focus:border-transparent transition-all shadow-sm"
                />
            </div>

            <div className="flex items-center gap-4 ml-auto">
                <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors relative shadow-sm">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200 shadow-sm hidden sm:block">
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                        JM
                    </div>
                </div>
            </div>
        </header>
    );
}
