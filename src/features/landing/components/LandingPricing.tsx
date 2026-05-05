'use client';

import Link from 'next/link';
import { ArrowUpRight, Check, MessageCircle, Plus } from 'lucide-react';

const pricingFeatures = [
    '15GB storage untuk meyimpan file',
    '2 pengguna',
    'Manajemen Dokumen Terpusat',
    'Riwayat Aktivitas & Audit Trail',
    'Keamanan & Backup',
];

const faqs = [
    {
        question: 'Apakah data dan dokumen saya aman disimpan di Notarix?',
        answer:
            'Ya, keamanan dokumen adalah prioritas utama kami. Dokumen disimpan dengan proteksi berlapis dan akses hanya diberikan kepada akun yang berwenang di kantor notaris Anda.',
    },
    {
        question: 'Bagaimana cara upload dokumen di Notarix?',
        answer:
            'Pilih jenis layanan, lengkapi data dokumen, lalu upload file. Notarix membantu menyimpan dokumen sesuai kategori supaya pencarian dan audit lebih mudah.',
    },
    {
        question: 'Berapa banyak dokumen yang bisa saya simpan, dan apakah ada batas kuota?',
        answer:
            'Paket ini menyediakan 15GB storage. Jika kebutuhan kantor bertambah, tim kami dapat membantu menyesuaikan kapasitas layanan.',
    },
    {
        question: 'Apakah ada masa uji coba gratis sebelum saya memutuskan berlangganan?',
        answer:
            'Anda dapat mengajukan demo terlebih dahulu untuk mencoba alur utama Notarix sebelum berlangganan.',
    },
    {
        question: 'Bisakah lebih dari satu staf di kantor menggunakan Notarix secara bersamaan?',
        answer:
            'Bisa. Paket ini mendukung 2 pengguna untuk membantu notaris dan staf bekerja di workspace yang sama.',
    },
    {
        question: 'Apakah Notarix bisa diakses dari smartphone atau tablet saat di luar kantor?',
        answer:
            'Bisa. Notarix dibuat responsif sehingga tetap nyaman diakses dari browser perangkat mobile.',
    },
];

function PricingCard() {
    return (
        <article className="w-full max-w-[301px] rounded-[16px] border border-[#E4E4E4] bg-white p-[14px] shadow-[26px_39px_24px_rgba(0,0,0,0.07),7px_10px_13px_rgba(0,0,0,0.08)]">
            <div className="border-b border-[#E1E1E1] py-[18px]">
                <span className="inline-flex rounded-[8px] border border-[#ECECEC] px-2 py-2 text-sm text-[#292D32]">
                    Pembelian pertama
                </span>

                <div className="mt-[18px] space-y-1">
                    <div className="flex flex-wrap items-center gap-3 text-[#919191]">
                        <span className="text-sm line-through">Rp 750.000</span>
                        <span className="text-xs">berlaku sampai bulan juni</span>
                    </div>
                    <div className="flex items-end gap-1 text-[#292D32]">
                        <span className="pb-1 text-sm">Rp</span>
                        <span className="text-[28px] leading-none">500.000</span>
                        <span className="pb-1 text-sm">/ Bulan</span>
                    </div>
                </div>
            </div>

            <p className="mt-[14px] text-xs font-light leading-normal text-[#464646]">
                Pembayaran selanjutnya sebesar Rp 1.500.000 (atau setara Rp 125.000/bulan)
            </p>

            <ul className="mt-[14px] space-y-2 border-b border-[#E1E1E1] pb-[18px]">
                {pricingFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-[#292D32]">
                        <Check className="h-5 w-5 shrink-0 stroke-[1.7]" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-[14px] flex justify-end">
                <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-[8px] bg-[#6B5C48] px-6 py-2 text-sm text-white transition-colors hover:bg-[#5E4E39] focus:outline-none focus:ring-2 focus:ring-[#6B5C48]/30"
                >
                    Lanjutkan
                </Link>
            </div>
        </article>
    );
}

export function LandingPricing() {
    return (
        <section id="harga" className="w-full">
            <div className="mx-auto max-w-[1240px]">
                <div className="relative flex min-h-[440px] items-center justify-center overflow-hidden rounded-bl-[26px] rounded-br-[26px] rounded-tr-[26px] bg-[#6B5C48] p-10 shadow-[0px_105px_42px_rgba(0,0,0,0.03),0px_59px_36px_rgba(0,0,0,0.09),0px_26px_26px_rgba(0,0,0,0.15),0px_7px_14px_rgba(0,0,0,0.18)] sm:min-h-[619px]">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-[-340px] left-1/2 h-[795px] w-[795px] -translate-x-1/2 rounded-full bg-[repeating-radial-gradient(circle,rgba(255,255,255,0.045)_0_132px,rgba(255,255,255,0.018)_132px_264px)]"
                    />
                    <div className="relative z-10">
                        <PricingCard />
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center overflow-hidden text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#EBEBEB] bg-white px-4 py-2 text-sm font-semibold text-[#6B5C48]">
                        <MessageCircle className="h-4 w-4 stroke-[1.8]" />
                        FAQ
                    </span>

                    <div className="mt-6 max-w-[806px]">
                        <h2 className="text-2xl font-extrabold text-[#6B5C48]">Pertanyaan yang Sering Muncul</h2>
                        <p className="mt-3 text-sm leading-normal text-[#6B5C48]">
                            Jadi makin paham soal Notarix sebelum mulai berlangganan, kami jawab yang paling sering
                            ditanyakan.
                        </p>
                    </div>

                    <div className="mt-6 w-full max-w-[682px] space-y-2 text-left">
                        {faqs.map((faq) => (
                            <details
                                key={faq.question}
                                className="group overflow-hidden rounded-[8px] border border-[#E6E6E6] bg-white px-3"
                            >
                                <summary className="flex min-h-[46px] cursor-pointer list-none items-center gap-3 border-[#E6E6E6] text-[#6B5C48] marker:hidden group-open:border-b">
                                    <span className="flex-1 text-base font-bold">{faq.question}</span>
                                    <Plus className="h-4 w-4 shrink-0 stroke-[1.8] transition-transform group-open:rotate-45" />
                                </summary>
                                <p className="py-3 text-sm leading-relaxed text-[#292D32]">{faq.answer}</p>
                            </details>
                        ))}
                    </div>

                    <div className="mt-7 flex flex-col items-center gap-3">
                        <p className="text-center text-sm font-semibold text-[#6B5C48]">
                            Masih ada pertanyaan lain? Tim kami siap membantu Anda.
                        </p>
                        <Link
                            href="/#kontak"
                            className="inline-flex items-center gap-2 rounded-[8px] bg-[#6B5C48] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5E4E39]"
                        >
                            Hubungi kami
                            <ArrowUpRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
