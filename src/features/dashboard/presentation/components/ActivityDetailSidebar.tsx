'use client';

import { X, Folder } from 'lucide-react';
import { Activity } from '@/features/dashboard/types';

interface ActivityDetailSidebarProps {
    activity: Activity;
    onClose: () => void;
}

export function ActivityDetailSidebar({ activity, onClose }: ActivityDetailSidebarProps) {
    return (
        <>
            <div
                className="fixed inset-0 bg-black/30 z-40 transition-opacity"
                onClick={onClose}
            />

            <div className="fixed top-0 right-0 w-[400px] max-w-full bg-white border-l border-gray-200 h-full flex flex-col z-50 shadow-2xl animate-slide-in-right">
                <div className="p-6 border-b border-gray-100 bg-white">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Folder className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{activity.service} {activity.companyName.replace('PT. ', '')}</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Kemarin • 20 File item • 12 PT
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Detail Folder</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-900 mb-1">Dimodifikasi</p>
                                <p className="text-xs text-gray-500">16 Januari 2026 Oleh Saya</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-900 mb-1">Dibuka</p>
                                <p className="text-xs text-gray-500">15 Januari 2026 Oleh Saya</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-900 mb-1">Dibuat</p>
                                <p className="text-xs text-gray-500">14 Januari 2026 Oleh Saya</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Detail Status</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-gray-900 w-16">6 Items :</span>
                                <div className="flex-1 bg-green-100 text-green-600 text-xs font-semibold py-2 px-3 rounded text-center">
                                    Selesai
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-gray-900 w-16">3 Items :</span>
                                <div className="flex-1 bg-yellow-100 text-yellow-600 text-xs font-semibold py-2 px-3 rounded text-center">
                                    Dalam Proses
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-gray-900 w-16">3 Items :</span>
                                <div className="flex-1 bg-red-100 text-red-600 text-xs font-semibold py-2 px-3 rounded text-center">
                                    Terjeda
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-6">Aktivitas</h3>
                        <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-gray-600 border-2 border-white ring-2 ring-gray-100"></div>
                                <p className="text-xs text-gray-400 mb-1">Kemarin</p>
                                <p className="text-sm text-gray-900">
                                    Kamu Merubah File <span className="font-bold">PT. Pertamina</span>
                                </p>
                                <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100 w-fit">
                                    <Folder className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-semibold text-gray-900">PT. Pertamina</span>
                                </div>
                            </div>

                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-gray-600 border-2 border-white ring-2 ring-gray-100"></div>
                                <p className="text-xs text-gray-400 mb-1">16 Januari 2026</p>
                                <p className="text-sm text-gray-900">
                                    Kamu Merubah File <span className="font-bold">Status</span>
                                </p>
                                <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100 w-fit">
                                    <Folder className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-semibold text-gray-900">PT. Pertamina</span>
                                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded ml-2">Selesai</span>
                                </div>
                            </div>

                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-gray-600 border-2 border-white ring-2 ring-gray-100"></div>
                                <p className="text-xs text-gray-400 mb-1">16 Januari 2026</p>
                                <p className="text-sm text-gray-900">
                                    Admin 2 Menghapus <span className="font-bold">1 Items</span>
                                </p>
                                <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100 w-fit">
                                    <Folder className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-semibold text-gray-900">PT. Abibas Sport</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
