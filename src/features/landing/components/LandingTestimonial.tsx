'use client';

import Image from 'next/image';
import { MessageCircle } from 'lucide-react';

export function LandingTestimonial() {
    return (
        <section className="px-4 py-12 sm:py-16">
            <div className="mx-auto max-w-[1000px] text-center">
                <div className="mb-8 flex justify-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#EBEBEB] bg-white px-4 py-2 text-sm font-semibold text-[#6B5C48]">
                        <MessageCircle className="h-4 w-4 stroke-[1.8]" />
                        Testimonial
                    </span>
                </div>

                <p className="text-4xl font-bold leading-none text-[#6B5C48]">&ldquo;</p>
                <blockquote className="mx-auto mt-2 max-w-[920px] text-[24px] font-bold leading-[1.4] tracking-[-0.04em] text-[#6B5C48] sm:text-[30px] lg:text-[36px]">
                    &ldquo;Sejak menggunakan sistem ini, pengelolaan dokumen dan
                    aktivitas tim jadi jauh lebih rapi. Fitur notifikasi dan audit
                    activity membantu saya memastikan setiap perubahan
                    tercatat dengan jelas.&rdquo;
                </blockquote>

                <div className="mt-8 flex flex-col items-center gap-2.5">
                    <Image
                        src="/landing/testimonial-1.png"
                        alt="Rina Mahardika"
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-full object-cover"
                    />
                    <div>
                        <p className="text-base font-semibold tracking-[-0.04em] text-[#6B5C48]">Rina Mahardika</p>
                        <p className="text-sm font-medium tracking-[-0.04em] text-[#6B5C48]">Notaris</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
