'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, File, Menu, X } from 'lucide-react';
import { LandingFeatureMegaDropdown } from '@/features/landing/components/LandingFeatureMegaDropdown';
import { LandingMegaDropdown as LandingSolutionMegaDropdown } from '@/features/landing/components/LandingMegaDropdown';
import { useClickOutside } from '@/shared/hooks/useClickOutside';

type LandingDesktopMenu = 'feature' | 'solution' | null;

interface NavItem {
    label: string;
    href: string;
}

interface LandingNavbarProps {
    items?: NavItem[];
    loginHref?: string;
    ctaHref?: string;
}

export function LandingNavbar({
    items,
    loginHref = '/login',
    ctaHref = '#demo',
}: LandingNavbarProps) {
    const navItems = useMemo<NavItem[]>(
        () =>
            items ?? [
                { label: 'Fitur', href: '/#fitur' },
                { label: 'Solusi', href: '/#solusi' },
                { label: 'Harga', href: '/harga' },
                { label: 'Hubungi sales', href: '/#kontak' },
            ],
        [items],
    );

    const [isOpen, setIsOpen] = useState(false);
    const [openDesktopMenu, setOpenDesktopMenu] = useState<LandingDesktopMenu>(null);
    const [activeFeatureCategory, setActiveFeatureCategory] = useState<'documents' | 'services' | 'team' | 'security'>(
        'documents',
    );
    const navbarRef = useRef<HTMLElement>(null);

    const closeDesktopMenu = () => {
        setOpenDesktopMenu(null);
    };

    useClickOutside(navbarRef, closeDesktopMenu, Boolean(openDesktopMenu));

    useEffect(() => {
        if (!openDesktopMenu && !isOpen) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key !== 'Escape') return;

            setOpenDesktopMenu(null);
            setIsOpen(false);
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [openDesktopMenu, isOpen]);

    return (
        <header ref={navbarRef} className="relative z-10 flex h-14 w-full items-center sm:h-16">
            {/* ─── Brown brand tab (folder tab shape) ─── */}
            <div className="absolute bottom-0 left-0 top-0 w-[240px] sm:w-[280px]">
                <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 280 65"
                    fill="none"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* The path draws the tab including border-radius, S-curve to meet horizontal, and a 1px overlap at bottom */}
                    <path
                        d="M22 0H200C220 0 230 4 240 16C255 36 250 50 265 58C272 61.8 280 64 280 65H0V22C0 9.85 9.85 0 22 0Z"
                        fill="#6B5C48"
                    />
                </svg>
                {/* Brand content */}
                <div className="relative z-10 flex h-full items-center gap-2.5 pl-6 pr-8 text-white">
                    <File className="h-5 w-5 opacity-95" />
                    <span className="text-sm font-semibold tracking-wide">
                        Notarix<sup className="text-[7px] ml-0.5 font-normal">®</sup>
                    </span>
                </div>
            </div>

            {/* ─── Navigation bar (Transparent on right) ─── */}
            <nav className="relative z-10 flex flex-1 items-center justify-end pl-[240px] sm:pl-[280px]">
                {/* Nav links */}
                <div className="hidden flex-1 items-center justify-center gap-7 lg:flex">
                    {navItems.map((item) => {
                        const normalizedLabel = item.label.trim().toLowerCase();
                        const desktopMenu =
                            normalizedLabel === 'fitur'
                                ? 'feature'
                                : normalizedLabel === 'solusi'
                                  ? 'solution'
                                  : null;

                        if (desktopMenu) {
                            return (
                                <button
                                    key={item.href}
                                    type="button"
                                    aria-expanded={openDesktopMenu === desktopMenu}
                                    aria-controls={
                                        desktopMenu === 'feature'
                                            ? 'landing-feature-mega-menu'
                                            : 'landing-solution-mega-menu'
                                    }
                                    onClick={() => {
                                        if (desktopMenu === 'feature' && openDesktopMenu !== 'feature') {
                                            setActiveFeatureCategory('documents');
                                        }
                                        setOpenDesktopMenu((prev) => (prev === desktopMenu ? null : desktopMenu));
                                        setIsOpen(false);
                                    }}
                                    className={`text-sm font-medium transition-colors ${
                                        openDesktopMenu === desktopMenu
                                            ? 'text-[#6B5C48]'
                                            : 'text-[#6B5C48]/80 hover:text-[#6B5C48]'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            );
                        }

                        return (
                            <a
                                key={item.href}
                                href={item.href}
                                onClick={closeDesktopMenu}
                                className="text-sm font-medium text-[#6B5C48]/80 transition-colors hover:text-[#6B5C48]"
                            >
                                {item.label}
                            </a>
                        );
                    })}
                </div>

                {/* Buttons */}
                <div className="hidden items-center gap-3 lg:flex pl-4">
                    <Link
                        href={loginHref}
                        onClick={closeDesktopMenu}
                        className="inline-flex items-center justify-center rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#6B5C48] ring-1 ring-[#6B5C48]/20 hover:bg-[#6B5C48]/5 transition-colors"
                    >
                        Log in
                    </Link>
                    <Link
                        href={ctaHref}
                        onClick={closeDesktopMenu}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6B5C48] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#524637] transition-colors"
                    >
                        Ajukan Demo
                        <ArrowUpRight className="h-4 w-4 opacity-80" />
                    </Link>
                </div>

                {/* Mobile hamburger */}
                <div className="flex items-center justify-end lg:hidden w-full pl-4">
                    <button
                        type="button"
                        onClick={() => {
                            setIsOpen((prev) => !prev);
                            setOpenDesktopMenu(null);
                        }}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-[#6B5C48]/20 text-[#6B5C48] hover:bg-gray-50 transition-colors"
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {openDesktopMenu === 'feature' && (
                <div className="absolute left-1/2 top-full z-40 mt-4 hidden w-[min(756px,calc(100vw-3rem))] -translate-x-1/2 lg:block">
                    <LandingFeatureMegaDropdown
                        activeCategory={activeFeatureCategory}
                        onCategoryChange={setActiveFeatureCategory}
                    />
                </div>
            )}

            {openDesktopMenu === 'solution' && (
                <div className="absolute left-1/2 top-full z-40 mt-4 hidden w-[min(756px,calc(100vw-3rem))] -translate-x-1/2 lg:block">
                    <LandingSolutionMegaDropdown ctaHref={ctaHref} onNavigate={closeDesktopMenu} />
                </div>
            )}

            {/* Mobile menu */}
            {isOpen && (
                <div className="absolute top-16 right-0 left-0 z-50 lg:hidden mt-2 rounded-2xl bg-white ring-1 ring-black/5 shadow-xl px-4 py-4">
                    <div className="flex flex-col gap-3">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="text-sm font-medium text-[#6B5C48]/85 hover:text-[#6B5C48] transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                        <Link
                            href={loginHref}
                            onClick={() => setIsOpen(false)}
                            className="flex-1 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#6B5C48] ring-1 ring-[#6B5C48]/20 hover:bg-[#6B5C48]/5 transition-colors"
                        >
                            Log in
                        </Link>
                        <Link
                            href={ctaHref}
                            onClick={() => setIsOpen(false)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#6B5C48] px-4 py-2 text-sm font-semibold text-white hover:bg-[#524637] transition-colors"
                        >
                            Ajukan Demo
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
