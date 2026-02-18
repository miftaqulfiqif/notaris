'use client';

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { DashboardHeader } from '@/layout/DashboardHeader';
import { getInitials } from '@/shared/utils/initials';

const teamMembers = [
    { id: '1', name: 'Johny Marteen', role: 'Akses penuh' },
    { id: '2', name: 'Admin name', role: 'Akses penuh' },
];

const packageFeatures = [
    '15GB storage untuk meyimpan file',
    '2 pengguna',
    'Manajemen Dokumen Terpusat',
    'Riwayat Aktivitas & Audit Trail',
    'Keamanan & Backup',
];

export default function SettingsPage() {
    const [defaultView, setDefaultView] = useState<'grid' | 'list'>('list');
    const [generalView, setGeneralView] = useState<'grid' | 'list'>('grid');
    const [inAppNotificationEnabled, setInAppNotificationEnabled] = useState(true);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="w-full min-h-screen flex flex-col">
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-100/50">
                        <DashboardHeader />
                    </div>

                    <div className="flex-1 px-4 sm:px-8 pb-8">
                        <div className="mt-6 mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Setting</h1>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="h-4 w-36 rounded-full bg-gray-200 overflow-hidden">
                                    <div className="h-full w-[12%] rounded-full bg-[#7A6A53]" />
                                </div>
                                <span className="text-sm text-gray-500">1%</span>
                                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
                                    5 GB dari 15 GB telah digunakan
                                </span>
                                <button className="rounded-xl border border-gray-200 bg-gray-100 px-5 py-2 text-sm text-gray-400">
                                    Beli penyimpanan
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                    <header className="border-b border-gray-200 px-5 py-3.5">
                                        <h2 className="text-2xl font-semibold text-gray-900">Umum</h2>
                                    </header>
                                    <div className="space-y-6 px-5 py-4">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                            <div>
                                                <p className="text-lg font-medium text-gray-900">Default view</p>
                                                <p className="text-sm text-gray-500">Tampilan list folder dan file</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                                    <input
                                                        type="radio"
                                                        name="default-view"
                                                        value="grid"
                                                        checked={defaultView === 'grid'}
                                                        onChange={() => setDefaultView('grid')}
                                                        className="h-4 w-4 accent-[#7A6A53]"
                                                    />
                                                    Grid
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                                    <input
                                                        type="radio"
                                                        name="default-view"
                                                        value="list"
                                                        checked={defaultView === 'list'}
                                                        onChange={() => setDefaultView('list')}
                                                        className="h-4 w-4 accent-[#7A6A53]"
                                                    />
                                                    List
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                            <div>
                                                <p className="text-lg font-medium text-gray-900">Umum</p>
                                                <p className="text-sm text-gray-500">Umum</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                                    <input
                                                        type="radio"
                                                        name="general-view"
                                                        value="grid"
                                                        checked={generalView === 'grid'}
                                                        onChange={() => setGeneralView('grid')}
                                                        className="h-4 w-4 accent-[#7A6A53]"
                                                    />
                                                    Grid
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                                    <input
                                                        type="radio"
                                                        name="general-view"
                                                        value="list"
                                                        checked={generalView === 'list'}
                                                        onChange={() => setGeneralView('list')}
                                                        className="h-4 w-4 accent-[#7A6A53]"
                                                    />
                                                    List
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <p className="text-lg font-medium text-gray-900">Halaman awal</p>
                                            <button className="inline-flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 w-full sm:w-36">
                                                Dashboard
                                                <ChevronDown className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <p className="text-lg font-medium text-gray-900">Ukuran Font</p>
                                            <button className="inline-flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 w-full sm:w-36">
                                                Kecil
                                                <ChevronDown className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                    <header className="border-b border-gray-200 px-5 py-3.5">
                                        <h2 className="text-2xl font-semibold text-gray-900">Member setting</h2>
                                    </header>
                                    <div>
                                        {teamMembers.map((member) => (
                                            <div key={member.id} className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 last:border-b-0">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#89A1B5] to-[#3D4957] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                                                        {getInitials(member.name)}
                                                    </div>
                                                    <p className="truncate text-lg font-medium text-gray-900">{member.name}</p>
                                                </div>
                                                <button className="inline-flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 w-36">
                                                    {member.role}
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-4">
                                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                    <header className="border-b border-gray-200 px-5 py-3.5">
                                        <h2 className="text-2xl font-semibold text-gray-900">Paket saat ini</h2>
                                    </header>
                                    <div className="px-5 py-4 space-y-3">
                                        {packageFeatures.map((feature) => (
                                            <div key={feature} className="flex items-start gap-3 text-gray-800">
                                                <Check className="mt-0.5 h-4 w-4 text-[#6E5F49]" />
                                                <span className="text-lg">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-200 px-5 py-4 flex justify-end">
                                        <button className="rounded-xl bg-[#7A6A53] px-6 py-2.5 text-base font-medium text-white hover:bg-[#685942] transition-colors">
                                            Upgrade paket langganan
                                        </button>
                                    </div>
                                </section>

                                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                    <header className="border-b border-gray-200 px-5 py-3.5">
                                        <h2 className="text-2xl font-semibold text-gray-900">Notifikasi</h2>
                                    </header>
                                    <div className="space-y-5 px-5 py-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-lg font-medium text-gray-900">Notifikasi dalam aplikasi</p>
                                                <p className="mt-1 text-xs text-gray-500 max-w-md">
                                                    Ketika saya unggah file baru, ketika saya membuat folder, ketika saya mengubah status
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setInAppNotificationEnabled((prev) => !prev)}
                                                className={`relative inline-flex h-7 w-12 rounded-full transition-colors ${
                                                    inAppNotificationEnabled ? 'bg-[#7A6A53]' : 'bg-gray-200'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                                        inAppNotificationEnabled ? 'translate-x-6 mt-1' : 'translate-x-1 mt-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-lg font-medium text-gray-900">Notifikasi Email</p>
                                                <p className="mt-1 text-sm text-gray-500">Belum tersedia.</p>
                                            </div>
                                            <button
                                                type="button"
                                                disabled
                                                className="relative inline-flex h-7 w-12 rounded-full bg-gray-200 opacity-70 cursor-not-allowed"
                                            >
                                                <span className="inline-block h-5 w-5 translate-x-1 mt-1 rounded-full bg-white" />
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-3">
                            <button className="rounded-xl border border-gray-200 bg-white px-7 py-2.5 text-base text-gray-600 hover:bg-gray-50 transition-colors">
                                Batal
                            </button>
                            <button className="rounded-xl bg-[#7A6A53] px-7 py-2.5 text-base font-medium text-white hover:bg-[#685942] transition-colors">
                                Simpan perubahan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
