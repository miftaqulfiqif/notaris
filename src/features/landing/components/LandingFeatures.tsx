'use client';

import { ArrowUpRight, ChevronDown, Search, Upload, UserRound } from 'lucide-react';

/* ──────────────────────────────────────────
   Feature 1: Terorganisir Cepat (full-width)
   ────────────────────────────────────────── */
function FeatureOrganized() {
    return (
        <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
                {/* Left — copy */}
                <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <h3 className="text-xl font-semibold text-[#2A2318] leading-snug">
                        Terorganisir Cepat
                    </h3>
                    <p className="mt-3 text-sm text-[#5A5046] leading-relaxed max-w-md">
                        Kelola seluruh jobfile, klien, dan jadwal layanan Notaris Anda
                        dengan cepat. Pantau timeline, aktivitas, penanggung jawab dan personil persidangan
                        dalam satu tempat.
                    </p>
                    <div className="mt-6">
                        <a
                            href="#demo"
                            className="inline-flex items-center gap-2 rounded-lg bg-[#3B332A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#2F2922] transition-colors"
                        >
                            Request Demo
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </div>

                {/* Right — mock UI */}
                <div className="bg-[#F9F7F5] p-6 lg:p-8">
                    <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-4">
                        {/* Mock header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-[#98856B]" />
                                <span className="text-xs font-medium text-[#3B332A]">
                                    Daftar Akta / Jenis Data / Klien / Mahkota
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-20 rounded bg-[#F3F0EC]" />
                                <div className="h-6 w-6 rounded bg-[#F3F0EC]" />
                            </div>
                        </div>
                        {/* Mock rows */}
                        {[
                            { color: '#E8DFD3', label: 'Klien Pertama / Jasa Kenotariatan', tag: 'Pending', tagColor: '#EAB308' },
                            { color: '#D4C5B0', label: 'PT. Kautaman Jaya', tag: 'Review', tagColor: '#6366F1' },
                            { color: '#C8B89A', label: 'Sari Lestari / Menolak', tag: 'Expired', tagColor: '#EF4444' },
                        ].map((row, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1.5 last:mb-0 hover:bg-[#FAF8F6] transition-colors"
                            >
                                <div
                                    className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                                    style={{ background: row.color }}
                                >
                                    <UserRound className="h-4 w-4 text-[#6B5C48]" />
                                </div>
                                <span className="flex-1 text-xs text-[#3B332A] truncate">{row.label}</span>
                                <span
                                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                    style={{ background: `${row.tagColor}18`, color: row.tagColor }}
                                >
                                    {row.tag}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────
   Feature 2: Smart Docs Upload (half)
   ────────────────────────────────────── */
function FeatureSmartDocs() {
    return (
        <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
            <div className="p-6 lg:p-8">
                <h3 className="text-lg font-semibold text-[#2A2318]">Smart Docs Upload</h3>
                <p className="mt-2 text-sm text-[#5A5046] leading-relaxed">
                    Cukup unggah satu kali, isi keterangan, set keterangan, dan
                    dokumen Anda akan terklasifikasi dengan rapi, tertempel dan langsung
                    terhubung ke masing-masing klien terkait.
                </p>
            </div>

            {/* Mock form */}
            <div className="px-6 lg:px-8 pb-6 lg:pb-8 flex-1">
                <div className="rounded-xl bg-[#FAFAF9] ring-1 ring-black/5 p-4 space-y-3">
                    <p className="text-xs font-medium text-[#3B332A] mb-3">Upload Jasa Baru</p>
                    {/* Field mocks */}
                    {[
                        { label: 'Judul jasa', placeholder: '' },
                        { label: 'Tipe laporan', placeholder: '', hasDropdown: true },
                        { label: 'Instansi', placeholder: '', hasDropdown: true },
                    ].map((field, i) => (
                        <div key={i}>
                            <label className="text-[10px] font-medium text-[#7A7067] mb-1 block">
                                {field.label}
                            </label>
                            <div className="flex items-center h-8 rounded-md bg-white ring-1 ring-black/8 px-2.5">
                                <span className="flex-1 text-[10px] text-[#BDB5AB]">{field.placeholder}</span>
                                {field.hasDropdown && (
                                    <ChevronDown className="h-3 w-3 text-[#BDB5AB]" />
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Upload area */}
                    <div className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#D4CEC6] py-4">
                        <Upload className="h-4 w-4 text-[#98856B]" />
                        <span className="text-[10px] text-[#7A7067]">Drag & drop file atau klik untuk upload</span>
                    </div>

                    <button className="mt-2 w-full rounded-lg bg-[#6B5C48] py-2 text-xs font-semibold text-white hover:bg-[#5A4D3C] transition-colors">
                        Ajukan Demo
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   Feature 3: Audit Activity (half)
   ───────────────────────────────────── */
function FeatureAuditActivity() {
    const activities = [
        {
            avatar: '#D4C5B0',
            name: 'Anda Mengedit Data di',
            detail: 'PT. Kautaman Jaya',
            time: '',
        },
        {
            avatar: '#B39B7B',
            name: 'Anda Mengedit Bidang di',
            detail: '',
            time: '',
            badge: 'Edited',
            badgeColor: '#6366F1',
        },
        {
            avatar: '#A08968',
            name: 'Budi Lestari Menolak Notaris di',
            detail: '',
            time: '',
        },
        {
            avatar: '#C8B89A',
            name: 'Perubahan',
            detail: 'PT Madura Spart',
            time: '',
        },
    ];

    return (
        <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
            <div className="p-6 lg:p-8">
                <h3 className="text-lg font-semibold text-[#2A2318]">Audit Activity</h3>
                <p className="mt-2 text-sm text-[#5A5046] leading-relaxed">
                    Aktivitas di seluruh tim terjaga dan terpantau dalam satu tempat dan satu panduan.
                    Fitur memastikan kunci catatan Anda berjalan dengan cepat.
                </p>
            </div>

            {/* Activity list */}
            <div className="px-6 lg:px-8 pb-6 lg:pb-8 flex-1">
                <div className="rounded-xl bg-[#FAFAF9] ring-1 ring-black/5 p-4">
                    <p className="text-xs font-medium text-[#3B332A] mb-4">Activity</p>
                    <div className="space-y-4">
                        {activities.map((a, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div
                                    className="mt-0.5 h-8 w-8 shrink-0 rounded-full flex items-center justify-center"
                                    style={{ background: a.avatar }}
                                >
                                    <UserRound className="h-4 w-4 text-white/90" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-[#3B332A] leading-relaxed">
                                        {a.name}
                                    </p>
                                    {a.detail && (
                                        <p className="text-[10px] text-[#98856B] flex items-center gap-1 mt-0.5">
                                            <Search className="h-2.5 w-2.5" />
                                            {a.detail}
                                        </p>
                                    )}
                                    {a.badge && (
                                        <span
                                            className="inline-block mt-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                                            style={{ background: `${a.badgeColor}18`, color: a.badgeColor }}
                                        >
                                            {a.badge}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────
   Main Features Section
   ────────────────────── */
export function LandingFeatures() {
    return (
        <section className="py-16 sm:py-20 px-4">
            <div className="mx-auto max-w-5xl">
                {/* Badge */}
                <div className="flex justify-center mb-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F0EC] px-3.5 py-1 text-xs font-medium text-[#6B5C48] ring-1 ring-[#E8DFD3]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#98856B]" />
                        Features
                    </span>
                </div>

                {/* Heading */}
                <h2 className="text-center text-2xl sm:text-3xl font-semibold text-[#2A2318] leading-snug max-w-xl mx-auto">
                    Kelola Layanan Notaris Lebih Cepat, Rapi, dan Terpusat.
                </h2>
                <p className="mt-4 text-center text-sm text-[#7A7067] max-w-lg mx-auto leading-relaxed">
                    Semua jobfile, aktivitas, kontrak, dan hasil kerja tidak perlu ada sistem yang
                    memudahkan kerja tim Anda.
                </p>

                {/* Feature Cards */}
                <div className="mt-12 space-y-6">
                    {/* Full-width card */}
                    <FeatureOrganized />

                    {/* Two-column cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <FeatureSmartDocs />
                        <FeatureAuditActivity />
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="mt-10 flex justify-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F0EC] px-3.5 py-1 text-xs font-medium text-[#6B5C48] ring-1 ring-[#E8DFD3]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#98856B]" />
                        Scroll more
                    </span>
                </div>
            </div>
        </section>
    );
}
