'use client';

import { ArrowUpRight, File } from 'lucide-react';

export function LandingCTA() {
    return (
        <section className="px-4 py-4 sm:py-6">
            <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-[#6B5C48] to-[#4A3F33] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
                <div className="grid lg:grid-cols-2 gap-0">
                    {/* Left — form */}
                    <div className="p-8 lg:p-12">
                        <h2 className="text-xl sm:text-2xl font-semibold text-white leading-snug">
                            Siap untuk Memulai Bersama Notarix?
                        </h2>

                        <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
                            {[
                                { label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan nama lengkap' },
                                { label: 'Email', type: 'email', placeholder: 'Masukkan email' },
                                { label: 'Nomor HP', type: 'tel', placeholder: 'Masukkan nomor HP' },
                                { label: 'Pesan', type: 'text', placeholder: 'Tulis pesan Anda', multiline: true },
                            ].map((field, i) => (
                                <div key={i}>
                                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                                        {field.label}
                                    </label>
                                    {'multiline' in field && field.multiline ? (
                                        <textarea
                                            placeholder={field.placeholder}
                                            rows={3}
                                            className="w-full rounded-lg bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder-white/40 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors resize-none"
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            className="w-full rounded-lg bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder-white/40 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
                                        />
                                    )}
                                </div>
                            ))}

                            <button
                                type="submit"
                                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#3B332A] hover:bg-white/90 transition-colors"
                            >
                                Ajukan Demo
                                <ArrowUpRight className="h-4 w-4" />
                            </button>
                        </form>
                    </div>

                    {/* Right — laptop mockup */}
                    <div className="hidden lg:flex items-end justify-center p-8 lg:p-12 relative">
                        {/* Notarix branding */}
                        <div className="absolute top-8 right-12 flex items-center gap-2 text-white/80">
                            <File className="h-5 w-5" />
                            <span className="text-base font-semibold tracking-wide">Notarix<sup className="text-[8px] ml-0.5">®</sup></span>
                        </div>

                        {/* Stylised laptop */}
                        <div className="w-full max-w-sm">
                            <div className="rounded-t-xl bg-[#2A2318] p-1">
                                <div className="rounded-t-lg bg-[#F9F7F5] p-3 h-48 flex items-center justify-center relative overflow-hidden">
                                    {/* Mock dashboard look */}
                                    <div className="absolute inset-0 p-3">
                                        <div className="h-full rounded-lg bg-white/60 ring-1 ring-black/5 p-3">
                                            <div className="flex gap-1 mb-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
                                                <div className="h-1.5 w-1.5 rounded-full bg-[#EAB308]" />
                                                <div className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-2 w-3/4 rounded bg-[#E8DFD3]" />
                                                <div className="h-2 w-1/2 rounded bg-[#E8DFD3]" />
                                                <div className="h-2 w-2/3 rounded bg-[#E8DFD3]" />
                                                <div className="grid grid-cols-3 gap-1 mt-3">
                                                    <div className="h-8 rounded bg-[#F3F0EC]" />
                                                    <div className="h-8 rounded bg-[#F3F0EC]" />
                                                    <div className="h-8 rounded bg-[#F3F0EC]" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-1">
                                                    <div className="h-6 rounded bg-[#F3F0EC]" />
                                                    <div className="h-6 rounded bg-[#F3F0EC]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Laptop base */}
                            <div className="mx-auto h-3 w-[105%] -ml-[2.5%] rounded-b-lg bg-[#1F1A14] shadow-lg" />
                            <div className="mx-auto h-1 w-[85%] rounded-b-md bg-[#171310]" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
