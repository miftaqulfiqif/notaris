'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Bell, Menu, LogOut, Settings, X, ChevronRight, FileText, Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/layout/providers/SidebarContext';
import { useAuthContext } from '@/features/auth/context/auth.context';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { getInitials } from '@/shared/utils/initials';

type SearchFilter = 'ALL' | 'DOCUMENT' | 'FOLDER';

interface GlobalSearchItem {
    id: string;
    title: string;
    service: string;
    lastUpdate: string;
    type: Exclude<SearchFilter, 'ALL'>;
}

const globalSearchItems: GlobalSearchItem[] = [
    {
        id: 'search-1',
        title: 'PT. Dummy 4',
        service: 'Pendirian',
        lastUpdate: 'Last Update',
        type: 'FOLDER',
    },
    {
        id: 'search-2',
        title: 'PT. Dummy 1',
        service: 'Pendirian',
        lastUpdate: '1 jam yang lalu',
        type: 'FOLDER',
    },
    {
        id: 'search-3',
        title: 'PT. Dummy 2',
        service: 'RUPS',
        lastUpdate: '12 jam yang lalu',
        type: 'FOLDER',
    },
    {
        id: 'search-4',
        title: 'PT. Dummy 3',
        service: 'Pendirian',
        lastUpdate: '1 hari yang lalu',
        type: 'FOLDER',
    },
    {
        id: 'search-5',
        title: 'Akta Pendirian PT. Dummy',
        service: 'Dokumen',
        lastUpdate: '2 hari yang lalu',
        type: 'DOCUMENT',
    },
];

export function DashboardHeader() {
    const router = useRouter();
    const { toggle } = useSidebar();
    const { user, logout } = useAuthContext();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearchFilter, setActiveSearchFilter] = useState<SearchFilter>('ALL');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const {
        notifications,
        isLoading: isNotificationLoading,
        error: notificationError,
        totalNotRead,
        fetchNotifications,
        markAllAsReadLocal,
    } = useNotifications({
        page: 1,
        limit: 10,
        search: '',
        fallbackActorName: user?.name,
        autoFetch: false,
    });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const unreadCount = totalNotRead;
    const trimmedSearchQuery = searchQuery.trim();
    const isSearchOverlayVisible = isSearchFocused && trimmedSearchQuery.length > 0;

    const filteredSearchItems = useMemo(() => {
        const normalizedQuery = trimmedSearchQuery.toLowerCase();

        return globalSearchItems.filter((item) => {
            const matchesQuery = `${item.title} ${item.service} ${item.lastUpdate}`
                .toLowerCase()
                .includes(normalizedQuery);
            const matchesType = activeSearchFilter === 'ALL' || item.type === activeSearchFilter;
            return matchesQuery && matchesType;
        });
    }, [activeSearchFilter, trimmedSearchQuery]);

    useClickOutside(dropdownRef, () => setIsDropdownOpen(false), isDropdownOpen);
    useClickOutside(notificationRef, () => setIsNotificationOpen(false), isNotificationOpen);
    useClickOutside(searchRef, () => setIsSearchFocused(false), isSearchOverlayVisible);
    const handleMarkAllRead = markAllAsReadLocal;

    useEffect(() => {
        if (!isSearchOverlayVisible) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsSearchFocused(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isSearchOverlayVisible]);

    const handleSearchClear = () => {
        setSearchQuery('');
        setIsSearchFocused(false);
        setActiveSearchFilter('ALL');
    };

    return (
        <header className="relative flex items-center gap-4">
            <button
                onClick={toggle}
                className="p-2 lg:hidden text-gray-600 hover:bg-gray-100 rounded-lg"
            >
                <Menu className="w-6 h-6" />
            </button>

            <div className="relative flex-1 min-w-0 max-w-2xl" ref={searchRef}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                    <Search className="w-6 h-6" />
                </div>
                <input
                    type="text"
                    placeholder="Cari file, folder, nomor akta, nama klien"
                    value={searchQuery}
                    onFocus={() => {
                        setIsSearchFocused(true);
                        setIsDropdownOpen(false);
                        setIsNotificationOpen(false);
                    }}
                    onChange={(event) => {
                        const nextQuery = event.target.value;
                        setSearchQuery(nextQuery);
                        if (!nextQuery.trim()) {
                            setActiveSearchFilter('ALL');
                        }
                        setIsSearchFocused(true);
                        setIsDropdownOpen(false);
                        setIsNotificationOpen(false);
                    }}
                    className={`w-full py-3 bg-white border placeholder:text-gray-400 rounded-2xl focus:outline-none focus:ring-2 text-black transition-all shadow-sm ${trimmedSearchQuery ? 'pl-14 pr-12 border-[#B39B7D] focus:ring-[#B39B7D]/40' : 'pl-12 pr-4 border-gray-200 focus:ring-[#B39B7D]'
                        }`}
                />
                {trimmedSearchQuery && (
                    <button
                        type="button"
                        onClick={handleSearchClear}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900 transition-colors"
                        aria-label="Hapus pencarian"
                    >
                        <X className="w-7 h-7" />
                    </button>
                )}

                {isSearchOverlayVisible && (
                    <div className="absolute left-0 top-[calc(100%+14px)] z-40 w-full">
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#F7F7F7] shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setActiveSearchFilter('ALL')}
                                        className={`inline-flex items-center rounded-2xl border px-5 py-2.5 text-sm font-medium transition-colors ${activeSearchFilter === 'ALL'
                                                ? 'border-[#7A6A53] bg-[#7A6A53] text-white'
                                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Semua
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveSearchFilter('DOCUMENT')}
                                        className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-medium transition-colors ${activeSearchFilter === 'DOCUMENT'
                                                ? 'border-[#7A6A53] bg-[#7A6A53] text-white'
                                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <FileText className="h-4 w-4" />
                                        Dokumen
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveSearchFilter('FOLDER')}
                                        className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-medium transition-colors ${activeSearchFilter === 'FOLDER'
                                                ? 'border-[#7A6A53] bg-[#7A6A53] text-white'
                                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Folder className="h-4 w-4" />
                                        Folder
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[58vh] overflow-y-auto p-4">
                                {filteredSearchItems.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm text-gray-500">
                                        Tidak ada hasil untuk <span className="font-semibold text-gray-700">{trimmedSearchQuery}</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredSearchItems.map((item, index) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setIsSearchFocused(false)}
                                                className={`w-full rounded-2xl px-4 py-3 text-left transition-colors ${index === 0 ? 'bg-[#ECECEC]' : 'hover:bg-[#ECECEC]'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${index === 0 ? 'bg-transparent' : 'bg-[#ECECEC]'
                                                        }`}>
                                                        {item.type === 'DOCUMENT' ? (
                                                            <FileText className="h-7 w-7 text-gray-700" />
                                                        ) : (
                                                            <Folder className="h-7 w-7 text-gray-700" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-semibold text-[#181C23]">{item.title}</p>
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {item.service} <span className="mx-2">•</span> {item.lastUpdate}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4 ml-auto">
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => {
                            setIsNotificationOpen((prev) => {
                                const next = !prev;
                                if (next) {
                                    void fetchNotifications();
                                }
                                return next;
                            });
                            setIsDropdownOpen(false);
                        }}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors relative shadow-sm"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        )}
                    </button>

                    {isNotificationOpen && (
                        <div className="absolute right-0 top-[calc(100%+14px)] z-50 w-[min(92vw,620px)]">
                            <div className="absolute -top-3 right-8 sm:right-12 w-6 h-6 rotate-45 border-l border-t border-gray-200 bg-[#F7F7F7]"></div>
                            <div className="relative overflow-hidden border border-gray-200 rounded-2xl bg-[#F7F7F7] shadow-[0_18px_36px_rgba(0,0,0,0.15)]">
                                <div className="flex items-start justify-between border-b border-gray-200 px-6 pt-5 pb-4">
                                    <div>
                                        <h3 className="text-2xl leading-none font-semibold text-gray-800">Notifikasi</h3>
                                        <button
                                            onClick={handleMarkAllRead}
                                            disabled={unreadCount === 0 || isNotificationLoading}
                                            className="mt-5 inline-flex items-center gap-2.5 text-base text-[#6E5F49] hover:text-[#5b4d39] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            Tandai semua dibaca
                                            <span className="min-w-8 h-7 px-2 rounded-md bg-[#7A6A53] text-white text-sm leading-7 text-center">
                                                {unreadCount}
                                            </span>
                                        </button>
                                    </div>
                                    <div className="flex flex-col items-center gap-6 pt-1">
                                        <button
                                            onClick={() => setIsNotificationOpen(false)}
                                            className="text-gray-700 hover:text-gray-900 transition-colors"
                                            aria-label="Tutup notifikasi"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                        <button
                                            className="text-gray-700 hover:text-gray-900 transition-colors"
                                            aria-label="Pengaturan notifikasi"
                                        >
                                            <Settings className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                <div className="max-h-[55vh] overflow-y-auto">
                                    {isNotificationLoading ? (
                                        <div className="px-8 py-10 text-center text-lg text-gray-500">
                                            Memuat notifikasi...
                                        </div>
                                    ) : notificationError ? (
                                        <div className="px-8 py-10 text-center">
                                            <p className="text-lg text-red-500">{notificationError}</p>
                                            <button
                                                onClick={() => void fetchNotifications()}
                                                className="mt-4 inline-flex rounded-lg bg-[#8A7A62] px-4 py-2 text-sm font-medium text-white hover:bg-[#75674F] transition-colors"
                                            >
                                                Coba lagi
                                            </button>
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="px-8 py-10 text-center text-lg text-gray-500">
                                            Belum ada notifikasi
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`flex items-center gap-4 border-b border-gray-200 px-6 py-4 ${notification.unread ? 'bg-[#F4F2EF]' : 'bg-[#F7F7F7]'
                                                    }`}
                                            >
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#89A1B5] to-[#3D4957] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                                                    {getInitials(notification.actor)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-lg font-semibold text-[#2F343B]">
                                                        {notification.title}
                                                    </p>
                                                    <p className="mt-2 text-base leading-none text-gray-500">
                                                        {notification.time} <span className="mx-2">•</span> {notification.action}
                                                    </p>
                                                    {notification.attachment && (
                                                        <div className="mt-3 inline-flex items-center gap-2 text-base leading-none text-[#2F343B]">
                                                            <FileText className="w-5 h-5 text-red-500" />
                                                            <span>{notification.attachment}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {notification.unread && (
                                                    <span className="w-3.5 h-3.5 rounded-full bg-red-400 shrink-0" />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        setIsNotificationOpen(false);
                                        router.push('/notifications');
                                    }}
                                    className="w-full flex items-center justify-end gap-2 px-6 py-3.5 text-[#6E5F49] text-lg leading-none hover:bg-[#EEEAE5] transition-colors"
                                >
                                    Lihat semua notifikasi
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => {
                            setIsDropdownOpen((prev) => !prev);
                            setIsNotificationOpen(false);
                        }}
                        className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200 shadow-sm hidden sm:block focus:outline-none focus:ring-2 focus:ring-[#B39B7D] focus:ring-offset-2 transition-all"
                    >
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                            {getInitials(user?.name)}
                        </div>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDropdownOpen(false);
                                    router.push('/profile');
                                }}
                                className="w-full px-4 py-3 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors"
                            >
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email || 'email@example.com'}</p>
                            </button>
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
