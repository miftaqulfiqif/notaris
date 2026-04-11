import Image from 'next/image';
import { Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import { ArrowUpRight, Bolt } from 'lucide-react';

const manrope = Manrope({
    subsets: ['latin'],
    weight: ['500', '600', '700', '800'],
    display: 'swap',
});

const sectionTitle = 'Kelola Layanan Notaris Lebih Cepat, Rapi, dan Terpusat.';
const sectionDescription =
    'Semua jobfile, aktivitas, tenant, dan notifikasi dalam satu sistem yang memudahkan kerja tim Anda.';

function SectionBadge() {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-[#DDD4C7] bg-white px-4 py-2 text-sm font-semibold text-[#7D684D] shadow-[0_10px_24px_rgba(88,67,43,0.06)]">
            <Bolt className="h-4 w-4 stroke-[1.9]" />
            Features
        </span>
    );
}

function FeatureCardShell({
    children,
    className = '',
}: Readonly<{
    children: ReactNode;
    className?: string;
}>) {
    return (
        <article
            className={`overflow-hidden rounded-[14px] border border-white/70 bg-[#D8CDC0] shadow-[0_20px_50px_rgba(90,70,44,0.08)] ${className}`}
        >
            {children}
        </article>
    );
}

function FeatureOrganized() {
    return (
        <FeatureCardShell>
            <div className="grid lg:grid-cols-[0.84fr_1.16fr]">
                <div className="flex flex-col justify-between gap-10 px-7 py-8 sm:px-10 sm:py-10 lg:px-7 lg:py-9 xl:px-10 xl:py-12">
                    <div className="max-w-[360px]">
                        <h3 className="text-[2rem] font-extrabold tracking-[-0.04em] text-[#6E5C46] sm:text-[2.25rem]">
                            Terorganisir Cepat
                        </h3>
                        <p className="mt-4 text-base leading-[1.55] text-[#786750] sm:text-[1.06rem]">
                            Semua aktivitas, file, dan status layanan dalam satu tampilan yang membantu tim mengambil
                            keputusan lebih cepat. Hemat waktu monitoring, percepat penyelesaian tugas.
                        </p>
                    </div>

                    <div>
                        <a
                            href="#demo"
                            className="inline-flex items-center gap-2 rounded-[10px] bg-[#7A6548] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#66543D]"
                        >
                            Request Demo
                            <ArrowUpRight className="h-4 w-4" />
                        </a>
                    </div>
                </div>

                <div className="border-t border-white/60 bg-[#F7F4EF] lg:border-l lg:border-t-0">
                    <div className="relative aspect-[640/330] w-full">
                        <Image
                            src="/images/landing/Dashboard OnActivities.png"
                            alt="Preview dashboard Notarix untuk pengelolaan jobfile dan aktivitas"
                            fill
                            priority
                            sizes="(min-width: 1280px) 640px, (min-width: 1024px) 56vw, 100vw"
                            className="object-cover object-left-top"
                        />
                    </div>
                </div>
            </div>
        </FeatureCardShell>
    );
}

interface FeaturePreviewCardProps {
    title: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
}

function FeaturePreviewCard({
    title,
    description,
    imageSrc,
    imageAlt,
}: Readonly<FeaturePreviewCardProps>) {
    return (
        <FeatureCardShell className="h-full">
            <div className="px-6 pb-6 pt-7 text-center sm:px-8 sm:pb-8 sm:pt-8">
                <h3 className="text-[1.95rem] font-extrabold tracking-[-0.04em] text-[#6E5C46] sm:text-[2.15rem]">
                    {title}
                </h3>
                <p className="mx-auto mt-4 max-w-[420px] text-[1rem] leading-[1.55] text-[#786750]">
                    {description}
                </p>
            </div>

            <div className="border-t border-white/60 bg-[#F7F4EF]">
                <div className="relative aspect-[542/392] w-full">
                    <Image
                        src={imageSrc}
                        alt={imageAlt}
                        fill
                        sizes="(min-width: 1024px) 540px, (min-width: 768px) 50vw, 100vw"
                        className="object-cover object-top"
                    />
                </div>
            </div>
        </FeatureCardShell>
    );
}

export function LandingFeatures() {
    return (
        <section id="fitur" className={`${manrope.className} px-4 py-[4.5rem] sm:px-6 sm:py-24`}>
            <div className="mx-auto max-w-[1160px]">
                <div className="flex justify-center">
                    <SectionBadge />
                </div>

                <div className="mx-auto mt-8 max-w-[820px] text-center">
                    <h2 className="text-[2.3rem] font-extrabold leading-[1.18] tracking-[-0.05em] text-[#6E5C46] sm:text-[3rem] lg:text-[3.55rem]">
                        {sectionTitle}
                    </h2>
                    <p className="mx-auto mt-5 max-w-[650px] text-base leading-[1.55] text-[#7D684D] sm:text-[1.08rem]">
                        {sectionDescription}
                    </p>
                </div>

                <div className="mt-12 space-y-4 sm:space-y-5">
                    <FeatureOrganized />

                    <div className="grid gap-4 md:grid-cols-2 sm:gap-5">
                        <FeaturePreviewCard
                            title="Smart Docs Upload"
                            description="Form upload terpadu: pilih layanan, isi metadata, dan simpan file. Seluruh proses dalam satu langkah."
                            imageSrc="/images/landing/Image (1).png"
                            imageAlt="Preview form upload dokumen layanan notaris"
                        />
                        <FeaturePreviewCard
                            title="Audit Activity"
                            description="Rekam jejak lengkap setiap aksi supaya tim dan auditor bisa menelusuri perubahan dengan cepat."
                            imageSrc="/images/landing/Image.png"
                            imageAlt="Preview riwayat aktivitas untuk audit layanan notaris"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
