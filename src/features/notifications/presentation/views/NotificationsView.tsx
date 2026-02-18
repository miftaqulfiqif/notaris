'use client';

import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';
import { getInitials } from '@/shared/utils/initials';
import type { NotificationItem } from '@/features/notifications/types/notification.types';

interface NotificationsViewProps {
    notifications: NotificationItem[];
    isLoading: boolean;
    error: string | null;
    totalNotRead: number;
    onMarkAllRead: () => void;
    onRetry: () => void;
}

export function NotificationsView({
    notifications,
    isLoading,
    error,
    totalNotRead,
    onMarkAllRead,
    onRetry,
}: NotificationsViewProps) {
    return (
        <div className="flex-1 px-8 pb-8">
            <div className="flex items-center gap-2 mt-4 mb-6 text-sm text-gray-500">
                <Link href="/dashboard" className="hover:text-[#8B7355] transition-colors">
                    Dashboard
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="font-semibold text-gray-800">Notifikasi</span>
            </div>

            <div className="mb-5 flex items-end justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifikasi</h1>
                <button
                    onClick={onMarkAllRead}
                    disabled={totalNotRead === 0}
                    className="inline-flex items-center gap-2.5 text-base sm:text-lg text-[#6E5F49] hover:text-[#5b4d39] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    Tandai semua dibaca
                    <span className="min-w-8 h-7 px-2 rounded-md bg-[#7A6A53] text-white text-sm leading-7 text-center">
                        {totalNotRead}
                    </span>
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-600">
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-3 inline-flex rounded-lg bg-[#8A7A62] px-4 py-2 text-sm font-medium text-white hover:bg-[#75674F] transition-colors"
                    >
                        Coba lagi
                    </button>
                </div>
            ) : notifications.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-500">
                    Belum ada notifikasi
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`rounded-xl border border-gray-200 px-5 py-4 ${
                                notification.unread ? 'bg-[#F4F2EF]' : 'bg-white'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <span
                                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                        notification.unread ? 'bg-red-400' : 'bg-transparent'
                                    }`}
                                />
                                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#89A1B5] to-[#3D4957] text-white flex items-center justify-center text-base font-semibold shrink-0">
                                    {getInitials(notification.actor)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-base sm:text-lg font-semibold text-[#2F343B]">
                                        {notification.title}
                                    </p>
                                    <p className="mt-1 text-sm sm:text-base text-gray-500">
                                        {notification.action}
                                    </p>
                                    {notification.attachment && (
                                        <div className="mt-2 inline-flex items-center gap-2 text-sm sm:text-base text-[#2F343B]">
                                            <FileText className="h-5 w-5 text-red-500" />
                                            <span>{notification.attachment}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex shrink-0 items-center gap-4">
                                    {notification.statusLabel && (
                                        <span className="rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
                                            {notification.statusLabel}
                                        </span>
                                    )}
                                    <span className="text-sm sm:text-base text-gray-500 whitespace-nowrap">
                                        {notification.time}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
