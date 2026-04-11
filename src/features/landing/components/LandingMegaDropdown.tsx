import Link from 'next/link';
import { Manrope } from 'next/font/google';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowUpRight,
    Building2,
    LayoutGrid,
    Search,
    ShieldCheck,
    Upload,
    UsersRound,
} from 'lucide-react';

const manrope = Manrope({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
});

interface LandingMegaDropdownProps {
    ctaHref: string;
    onNavigate?: () => void;
}

interface SolutionCard {
    category: string;
    title: string;
    description: string;
    icon: LucideIcon;
}

const solutionCards: SolutionCard[] = [
    {
        category: 'Pengarsipan',
        title: 'Digitalisasi Arsip Fisik',
        description:
            'Pindahkan tumpukan dokumen fisik ke arsip digital yang terstruktur, mudah dicari, dan aman dalam hitungan hari.',
        icon: Upload,
    },
    {
        category: 'Operasional',
        title: 'Kantor Notaris Baru',
        description:
            'Setup sistem pengarsipan yang rapi sejak hari pertama. Tidak perlu membangun infrastruktur dokumen dari nol secara manual.',
        icon: LayoutGrid,
    },
    {
        category: 'Kolaborasi',
        title: 'Kantor dengan Banyak Staf',
        description:
            'Atur peran setiap anggota tim, kendalikan akses dokumen, dan pantau aktivitas seluruh staf dari satu dashboard.',
        icon: UsersRound,
    },
    {
        category: 'Kepatuhan',
        title: 'Audit & Kepatuhan Regulasi',
        description:
            'Pastikan semua dokumen tercatat, tertelusur, dan siap diperiksa kapan saja sesuai standar kepatuhan notaris Indonesia.',
        icon: ShieldCheck,
    },
    {
        category: 'Efisiensi',
        title: 'Pencarian Dokumen Instan',
        description:
            'Tidak perlu bongkar lemari arsip. Temukan akta, perjanjian, atau surat kuasa spesifik dalam hitungan detik.',
        icon: Search,
    },
    {
        category: 'Skalabilitas',
        title: 'Jaringan Multi-Kantor',
        description:
            'Kelola arsip dari beberapa kantor notaris dalam satu platform terpusat tanpa dokumen yang saling bercampur.',
        icon: Building2,
    },
];

function MegaDropdownCard({
    category,
    title,
    description,
    icon: Icon,
    index,
}: Readonly<SolutionCard & { index: number }>) {
    const hasRightBorder = index % 3 !== 2;
    const hasBottomBorder = index < 3;

    return (
        <button
            type="button"
            title="Halaman detail belum tersedia"
            aria-label={`${title}. Halaman detail belum tersedia`}
            className={`group flex h-[141px] cursor-pointer items-start gap-3 overflow-hidden bg-white p-3 text-left transition-colors hover:bg-[#F6EFE6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B49C77] ${
                hasRightBorder ? 'border-r' : ''
            } ${hasBottomBorder ? 'border-b' : ''} border-[#E3E3E3]`}
        >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#EFE7DC] text-[#8D7E6A] transition-colors group-hover:bg-[#978871] group-hover:text-white">
                <Icon className="h-4 w-4 stroke-[1.6]" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#D0B07D]">{category}</p>
                    <p className="mt-0.5 text-[14px] font-medium leading-[1.28] text-[#5E6168]">
                        {title}
                    </p>
                </div>
                <p className="text-[12px] leading-[1.45] text-[#5E6168]">{description}</p>
            </div>
        </button>
    );
}

export function LandingMegaDropdown({
    ctaHref,
    onNavigate,
}: Readonly<LandingMegaDropdownProps>) {
    return (
        <div
            id="landing-solution-mega-menu"
            className={`${manrope.className} h-[404px] overflow-hidden rounded-[8px] border border-[#E3E3E3] bg-white shadow-[0_196px_55px_rgba(0,0,0,0),0_125px_50px_rgba(0,0,0,0.01),0_70px_42px_rgba(0,0,0,0.02),0_31px_31px_rgba(0,0,0,0.03),0_8px_17px_rgba(0,0,0,0.04)]`}
            role="dialog"
            aria-label="Solusi untuk Kantor Notaris"
        >
            <div className="h-[62px] border-b border-[#E3E3E3] px-3 py-3">
                <p className="text-[16px] font-semibold text-[#6B5C48]">Solusi untuk Kantor Notaris</p>
                <p className="text-[12px] text-[#6B5C48]/80">
                    Temukan solusi yang paling sesuai dengan tantangan operasional kantor Anda.
                </p>
            </div>

            <div className="grid h-[282px] grid-cols-3">
                {solutionCards.map((card, index) => (
                    <MegaDropdownCard key={card.title} index={index} {...card} />
                ))}
            </div>

            <div className="flex h-[60px] items-center justify-between gap-4 bg-[#EDE7DC] px-3 py-3">
                <p className="text-[12px] text-[#6B5C48]">
                    Belum yakin solusi mana yang tepat? Konsultasi gratis dengan tim kami.
                </p>

                <Link
                    href={ctaHref}
                    onClick={onNavigate}
                    className="inline-flex shrink-0 items-center gap-2 rounded-[8px] bg-[#6B5C48] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#5B4E3C]"
                >
                    Konsultasi Gratis
                    <ArrowUpRight className="h-4 w-4 stroke-[1.8]" />
                </Link>
            </div>
        </div>
    );
}
