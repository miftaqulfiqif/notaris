'use client';

import { UserRound } from 'lucide-react';

export function LandingTestimonial() {
    return (
        <section className="py-16 sm:py-20 px-4">
            <div className="mx-auto max-w-3xl text-center">
                {/* Decorative quote marks */}
                <div className="flex justify-center mb-8">
                    <span className="text-4xl text-[#98856B] font-serif select-none">&ldquo;&rdquo;</span>
                </div>

                <blockquote className="text-lg sm:text-xl md:text-2xl font-medium italic text-[#2A2318] leading-relaxed">
                    &ldquo;Sejak menggunakan sistem ini, pengelolaan dokumen dan
                    aktivitas tim jadi jauh lebih rapi. Fitur notifikasi dan audit
                    activity membantu saya memastikan setiap perubahan
                    tercatat dengan jelas.&rdquo;
                </blockquote>

                {/* Avatar + name */}
                <div className="mt-8 flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#8A7A62] to-[#D0BDA0] flex items-center justify-center shadow-md ring-2 ring-white">
                        <UserRound className="h-6 w-6 text-white/90" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[#2A2318]">Rina Mahardhika</p>
                        <p className="text-xs text-[#7A7067]">Notaris</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
