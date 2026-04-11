'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

/* ─────────────────────────────────────
   Cursor SVG — mimics the real mouse cursor
   ───────────────────────────────────── */
function CursorIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="14"
            height="18"
            viewBox="0 0 14 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M1 1L5.5 16L7.5 9.5L13 7.5L1 1Z"
                fill="#3B332A"
                stroke="white"
                strokeWidth="1.2"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/* ─────────────────────────────────────
   Floating avatar with photo + cursor
   ───────────────────────────────────── */
interface FloatingAvatarProps {
    src: string;
    alt: string;
    className: string;
    cursorClassName: string;
}

function FloatingAvatar({ src, alt, className, cursorClassName }: FloatingAvatarProps) {
    return (
        <div
            aria-hidden="true"
            className={[
                'pointer-events-none absolute',
                'motion-safe:animate-[float_6s_ease-in-out_infinite]',
                className,
            ].join(' ')}
        >
            <div className="relative">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden ring-[2.5px] ring-white/40 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
                    <Image
                        src={src}
                        alt={alt}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                    />
                </div>
                {/* Mouse cursor */}
                <div className={['absolute', cursorClassName].join(' ')}>
                    <CursorIcon />
                </div>
            </div>
        </div>
    );
}

export function LandingHero() {
    return (
        <section className="relative px-6 sm:px-8 pb-14 sm:pb-16 pt-8 sm:pt-10">
            <style jsx global>{`
                @keyframes float {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0);
                    }
                    50% {
                        transform: translate3d(0, -8px, 0);
                    }
                }
            `}</style>

            {/* Concentric solid rings (using stacked low-opacity white fills on the brown background) */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[-210px] sm:bottom-[-240px] flex justify-center">
                <div className="relative h-[520px] w-[520px] sm:h-[640px] sm:w-[640px]">
                    <div className="absolute inset-0 rounded-full bg-white/[0.03]" />
                    <div className="absolute inset-[11%] rounded-full bg-white/[0.03]" />
                    <div className="absolute inset-[24%] rounded-full bg-white/[0.03]" />
                    <div className="absolute inset-[38%] rounded-full bg-white/[0.03]" />
                    <div className="absolute inset-[53%] rounded-full bg-white/[0.03]" />
                </div>
            </div>

            {/* Decorative avatars with real photos */}
            <FloatingAvatar
                src="/images/avatars/avatar-1.png"
                alt="User"
                className="left-6 top-14 sm:left-12 sm:top-12 [animation-delay:-1.2s]"
                cursorClassName="bottom-0 right-[-4px] rotate-180"
            />
            <FloatingAvatar
                src="/images/avatars/avatar-2.png"
                alt="User"
                className="right-8 top-10 sm:right-14 sm:top-8 [animation-delay:-2.4s]"
                cursorClassName="bottom-0 left-[-4px] -rotate-90"
            />
            <FloatingAvatar
                src="/images/avatars/avatar-3.png"
                alt="User"
                className="left-[28%] bottom-10 sm:left-[26%] sm:bottom-8 [animation-delay:-3.4s]"
                cursorClassName="top-0 right-[-6px] rotate-90"
            />
            <FloatingAvatar
                src="/images/avatars/avatar-4.png"
                alt="User"
                className="right-[14%] bottom-6 sm:right-[18%] sm:bottom-4 [animation-delay:-0.6s]"
                cursorClassName="top-0 left-[-4px]"
            />

            <div className="mx-auto max-w-2xl text-center">
                <h1 className="mt-16 sm:mt-20 text-[26px] leading-tight sm:text-4xl sm:leading-tight font-semibold tracking-tight text-white">
                    Satu Platform untuk Mengelola Seluruh
                    <span className="block">Operasional Notaris.</span>
                </h1>

                <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-white/75 leading-relaxed">
                    Notarix membantu Anda mengelola jobfile, layanan, aktivitas, dan instansi
                    secara terstruktur dan efisien.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                    <Link
                        href="#demo"
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-[#463A2D] hover:bg-white/90 transition-colors"
                    >
                        Request Demo
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-[6px] bg-[#463A2D]/10">
                            <ArrowUpRight className="h-4 w-4" />
                        </span>
                    </Link>
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center rounded-md bg-transparent px-5 py-2.5 text-sm font-semibold text-white/75 hover:text-white transition-colors"
                    >
                        Start now
                    </Link>
                </div>
            </div>
        </section>
    );
}
