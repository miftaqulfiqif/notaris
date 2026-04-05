import { Manrope } from 'next/font/google';
import type { LucideIcon } from 'lucide-react';
import {
    FileText,
    Folder,
    History,
    LayoutGrid,
    Search,
    ShieldCheck,
    Upload,
    UsersRound,
} from 'lucide-react';

const manrope = Manrope({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    display: 'swap',
});

type FeatureCategoryId = 'documents' | 'services' | 'team' | 'security';

interface FeatureCard {
    title: string;
    description: string;
    icon: LucideIcon;
}

interface FeatureCategory {
    id: FeatureCategoryId;
    label: string;
    title: string;
    description: string;
    icon: LucideIcon;
    cards: FeatureCard[];
}

interface LandingFeatureMegaDropdownProps {
    activeCategory: FeatureCategoryId;
    onCategoryChange: (category: FeatureCategoryId) => void;
}

const featureCategories: FeatureCategory[] = [
    {
        id: 'documents',
        label: 'Dokumen',
        title: 'Manajemen Dokumen',
        description: 'Upload, susun, dan temukan dokumen arsip dengan cepat dan terstruktur.',
        icon: Upload,
        cards: [
            {
                title: 'Quick Upload',
                description: 'Upload dokumen sesuai jenis & tipe layanan dalam hitungan detik.',
                icon: Upload,
            },
            {
                title: 'Pencarian Cepat',
                description: 'Temukan dokumen dari ribuan arsip berdasarkan nama, tanggal, atau layanan.',
                icon: Search,
            },
            {
                title: 'Auto Klasifikasi',
                description: 'Dokumen otomatis tersortir ke folder kategori yang tepat saat diunggah.',
                icon: LayoutGrid,
            },
            {
                title: 'Versi Dokumen',
                description: 'Simpan riwayat revisi dan bandingkan versi dokumen dengan mudah.',
                icon: History,
            },
        ],
    },
    {
        id: 'services',
        label: 'Layanan',
        title: 'Konfigurasi Layanan',
        description: 'Sesuaikan layanan dan tipe layanan sesuai struktur unik kantor notaris Anda.',
        icon: LayoutGrid,
        cards: [
            {
                title: 'Kelola Jenis Layanan',
                description: 'Tambah atau ubah jenis layanan: AJB, PPJB, Surat Kuasa, dll.',
                icon: LayoutGrid,
            },
            {
                title: 'Template Tipe Layanan',
                description: 'Buat template pengarsipan per tipe untuk konsistensi di seluruh staf.',
                icon: FileText,
            },
            {
                title: 'Riwayat Aktivitas',
                description: 'Lacak seluruh aktivitas layanan beserta dokumen terkaitnya per periode.',
                icon: History,
            },
            {
                title: 'Arsip per Periode',
                description: 'Filter dan ekspor dokumen arsip berdasarkan rentang tanggal layanan.',
                icon: Folder,
            },
        ],
    },
    {
        id: 'team',
        label: 'Tim Akses',
        title: 'Tim & Manajemen Akses',
        description: 'Undang staf, atur peran, dan kendalikan siapa bisa mengakses apa.',
        icon: UsersRound,
        cards: [
            {
                title: 'Undang Staf',
                description: 'Tambahkan anggota tim via email dan tetapkan hak akses sesuai peran.',
                icon: UsersRound,
            },
            {
                title: 'Role-Based Access',
                description: 'Admin, Notaris, dan Staf punya tampilan dan izin berbeda secara otomatis.',
                icon: ShieldCheck,
            },
            {
                title: 'Log Aktivitas',
                description: 'Pantau setiap aksi upload, edit, atau hapus dari seluruh anggota tim.',
                icon: History,
            },
            {
                title: 'Multi-Workspace',
                description: 'Kelola beberapa kantor notaris dalam satu akun tanpa bercampur.',
                icon: Folder,
            },
        ],
    },
    {
        id: 'security',
        label: 'Keamanan',
        title: 'Keamanan Data',
        description: 'Dokumen notaris adalah aset sensitif - kami lindungi dengan standar enterprise.',
        icon: ShieldCheck,
        cards: [
            {
                title: 'Enkripsi AES-256',
                description: 'Semua dokumen terenkripsi end-to-end - tidak terbaca siapapun selain Anda.',
                icon: ShieldCheck,
            },
            {
                title: 'Two-Factor Auth',
                description: 'Login dengan lapisan verifikasi kedua via OTP agar akun tidak bisa dibajak.',
                icon: ShieldCheck,
            },
            {
                title: 'Backup Otomatis',
                description: 'Data di-backup setiap hari ke server cadangan - tidak ada risiko kehilangan dokumen.',
                icon: History,
            },
            {
                title: 'Audit Trail',
                description: 'Rekam jejak lengkap setiap perubahan dokumen dengan timestamp akurat.',
                icon: History,
            },
        ],
    },
];

function FeatureSidebarButton({
    label,
    icon: Icon,
    isActive,
    onActivate,
}: Readonly<{
    label: string;
    icon: LucideIcon;
    isActive: boolean;
    onActivate: () => void;
}>) {
    return (
        <button
            type="button"
            aria-pressed={isActive}
            onClick={onActivate}
            onMouseEnter={onActivate}
            onFocus={onActivate}
            className={`flex h-10 w-full items-center gap-2 border-l px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B49C77] ${
                isActive ? 'border-[#6B5C48] bg-[#E6DBC9]' : 'border-[#EDE5D8] bg-[#EDE5D8] hover:bg-[#E6DBC9]/75'
            }`}
        >
            <span
                className={`flex h-[24px] w-[24px] items-center justify-center rounded-[5.333px] ${
                    isActive ? 'bg-[#897D6D] text-white' : 'bg-[#E4D9C8] text-[#897D6D]'
                }`}
            >
                <Icon className="h-[10.667px] w-[10.667px] stroke-[1.85]" />
            </span>
            <span className="text-[12px] font-medium text-[#6B5C48]">{label}</span>
        </button>
    );
}

function FeatureCard({
    title,
    description,
    icon: Icon,
}: Readonly<FeatureCard>) {
    return (
        <button
            type="button"
            title="Halaman detail belum tersedia"
            aria-label={`${title}. Halaman detail belum tersedia`}
            className="flex h-[141px] cursor-pointer items-start gap-3 border border-[#E3E3E3] bg-white p-3 text-left transition-colors hover:border-[#D9CCB6] hover:bg-[#FCFAF7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B49C77]"
        >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#EDE5D8] text-[#8C7E69]">
                <Icon className="h-4 w-4 stroke-[1.6]" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-[14px] font-medium leading-[1.35] text-[#4F5158]">{title}</p>
                <p className="text-[12px] leading-[1.42] text-[#5A5E66]">{description}</p>
            </div>
        </button>
    );
}

export function LandingFeatureMegaDropdown({
    activeCategory,
    onCategoryChange,
}: Readonly<LandingFeatureMegaDropdownProps>) {
    const currentCategory =
        featureCategories.find((category) => category.id === activeCategory) ?? featureCategories[0];

    return (
        <div
            id="landing-feature-mega-menu"
            className={`${manrope.className} flex h-[357px] overflow-hidden rounded-[8px] border border-[#E3E3E3] bg-white shadow-[0_196px_55px_rgba(0,0,0,0),0_125px_50px_rgba(0,0,0,0.01),0_70px_42px_rgba(0,0,0,0.02),0_31px_31px_rgba(0,0,0,0.03),0_8px_17px_rgba(0,0,0,0.04)]`}
            role="dialog"
            aria-label="Fitur Notarix"
        >
            <div className="flex w-[160px] shrink-0 flex-col border-r border-[#E4E3E3] bg-[#EDE5D8] py-2">
                <div className="flex items-center px-3 py-1">
                    <p className="text-[12px] font-medium text-[#6B5C48]">KATEGORI</p>
                </div>

                <div className="flex flex-1 flex-col">
                    {featureCategories.map((category) => (
                        <FeatureSidebarButton
                            key={category.id}
                            label={category.label}
                            icon={category.icon}
                            isActive={category.id === currentCategory.id}
                            onActivate={() => onCategoryChange(category.id)}
                        />
                    ))}
                </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="px-3 py-2 text-[#6B5C48]">
                    <p className="text-[14px] font-semibold">{currentCategory.title}</p>
                    <p className="text-[10px]">{currentCategory.description}</p>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-[10px] px-[14px] py-2">
                    {currentCategory.cards.map((card) => (
                        <FeatureCard key={card.title} {...card} />
                    ))}
                </div>
            </div>
        </div>
    );
}
