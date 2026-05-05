'use client';

import Image from 'next/image';
import { ArrowUpRight, File } from 'lucide-react';

export function LandingCTA() {
    return (
        <section id="demo" className="px-4 py-4 sm:py-6">
            <div className="mx-auto max-w-[1160px] overflow-hidden rounded-[12px] bg-[#6B5C48] shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
                <div className="relative grid gap-0 lg:grid-cols-[0.86fr_1.14fr]">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-[-240px] right-[8%] hidden h-[700px] w-[700px] rounded-full bg-[repeating-radial-gradient(circle,rgba(255,255,255,0.045)_0_82px,rgba(255,255,255,0.018)_82px_164px)] lg:block"
                    />

                    <div className="relative z-10 p-6 sm:p-8 lg:px-7 lg:py-8">
                        <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
                            Siap untuk Memulai Bersama Notarix?
                        </h2>

                        <form className="mt-7 space-y-4" onSubmit={(e) => e.preventDefault()}>
                            {[
                                { type: 'text', placeholder: 'Nama Instansi' },
                                { type: 'text', placeholder: 'Alamat kantor', multiline: true },
                                { type: 'text', placeholder: 'Nama PIC' },
                                { type: 'email', placeholder: 'Email instansi' },
                                { type: 'text', placeholder: 'Deskripsikan kebutuhan mu', multiline: true },
                            ].map((field) => (
                                <div key={field.placeholder}>
                                    {'multiline' in field && field.multiline ? (
                                        <textarea
                                            placeholder={field.placeholder}
                                            rows={field.placeholder === 'Alamat kantor' ? 2 : 3}
                                            className="min-h-[65px] w-full resize-none rounded-[6px] border border-[#6B5C48] bg-[#5E4E39] px-3 py-2.5 text-sm text-white placeholder-[#9B896E] transition-colors focus:outline-none focus:ring-2 focus:ring-white/25"
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            className="h-8 w-full rounded-[6px] border border-[#6B5C48] bg-[#5E4E39] px-3 text-sm text-white placeholder-[#9B896E] transition-colors focus:outline-none focus:ring-2 focus:ring-white/25"
                                        />
                                    )}
                                </div>
                            ))}

                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-[8px] bg-[#6B5C48] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5E4E39] focus:outline-none focus:ring-2 focus:ring-white/30"
                            >
                                Ajukan Demo
                                <ArrowUpRight className="h-4 w-4" />
                            </button>
                        </form>
                    </div>

                    <div className="relative z-10 hidden items-start justify-end p-8 lg:flex">
                        <div className="absolute right-10 top-8 flex items-center gap-2 text-white">
                            <File className="h-8 w-8" />
                            <span className="text-[30px] font-extrabold tracking-tight">
                                Notarix<sup className="ml-0.5 text-[9px]">®</sup>
                            </span>
                        </div>

                        <div className="mt-20 w-full max-w-[522px]">
                            <Image
                                src="/landing/macbook-air.png"
                                alt="Preview dashboard Notarix di laptop"
                                width={522}
                                height={392}
                                className="h-auto w-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
