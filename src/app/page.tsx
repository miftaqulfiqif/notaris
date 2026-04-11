import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Cloud,
  FileLock,
  HardDrive,
  Sparkles,
  Timer,
} from "lucide-react";
import { Space_Grotesk, Manrope } from "next/font/google";
import heroIllustration from "@/assets/images/Spot Ilustrations.png";
import { siteConfig } from "@/shared/utils/seo";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  alternates: {
    canonical: "/",
  },
};

const promoStart = "1 Maret 2026";
const promoEnd = "31 Mei 2026";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "id-ID",
  },
];

const features = [
  {
    title: "Jejak Audit Real-Time",
    description:
      "Setiap akses tercatat otomatis, memudahkan pembuktian dan kepatuhan.",
    icon: BadgeCheck,
  },
  {
    title: "Penyimpanan Terenkripsi",
    description:
      "Dokumen tersimpan aman dengan enkripsi dan kontrol akses berlapis.",
    icon: FileLock,
  },
  {
    title: "Kolaborasi Satu Dashboard",
    description:
      "Pantau status berkas, tenggat, dan aktivitas tim dalam satu tampilan.",
    icon: Cloud,
  },
];

const faqs = [
  {
    question: "Apakah promo hanya untuk pembelian pertama?",
    answer:
      "Ya, promo berlaku khusus untuk pembelian awal selama periode 3 bulan yang ditentukan.",
  },
  {
    question: "Bagaimana cara request demo 7 hari?",
    answer:
      "Klik tombol Request Demo, lalu tim kami menyiapkan akses 7 hari dengan 15GB penyimpanan.",
  },
  {
    question: "Bisakah upgrade ke tahunan kapan saja?",
    answer:
      "Bisa. Anda dapat beralih ke paket tahunan untuk harga lebih hemat kapan pun dibutuhkan.",
  },
];

export default function LandingPage() {
  return (
    <div className={bodyFont.className}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="relative overflow-hidden bg-[#0C1116] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,#3E2E1A_0%,rgba(12,17,22,0)_65%)] opacity-80 blur-3xl" />
          <div className="absolute -left-28 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,#D9A37C_0%,rgba(12,17,22,0)_70%)] opacity-40 blur-3xl" />
          <div className="absolute right-0 top-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,#2D6F66_0%,rgba(12,17,22,0)_70%)] opacity-40 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_45%,rgba(255,255,255,0.06)_100%)]" />
        </div>

        <header className="relative z-10">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D9A37C] via-[#9B7A52] to-[#2D6F66] text-sm font-semibold">
                Nx
              </div>
              <div>
                <p className={`${displayFont.className} text-lg font-semibold leading-none`}>
                  Notarix
                </p>
                <p className="text-xs text-white/60">Arsip Notaris</p>
              </div>
            </div>
            <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
              <a className="transition hover:text-white" href="#fitur">
                Fitur
              </a>
              <a className="transition hover:text-white" href="#demo">
                Demo
              </a>
              <a className="transition hover:text-white" href="#pricing">
                Harga
              </a>
              <a className="transition hover:text-white" href="#faq">
                FAQ
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <a
                href="/login"
                className="hidden rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/60 hover:text-white md:inline-flex"
              >
                Masuk
              </a>
              <a
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-[#D9A37C] px-4 py-2 text-sm font-semibold text-[#1A1210] transition hover:bg-[#E6B68E]"
              >
                Mulai Sekarang
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </header>

        <section className="relative z-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-12 lg:flex-row lg:items-center lg:pt-16">
            <div className="flex-1">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white/80">
                <Sparkles className="h-4 w-4 text-[#E6B68E]" />
                Promo pembelian awal berlaku {promoStart} - {promoEnd} (3 bulan)
              </div>
              <h1
                className={`${displayFont.className} text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl`}
              >
                Arsip notaris yang aman, rapi, dan siap audit tanpa drama.
              </h1>
              <p className="mt-6 text-base text-white/70 md:text-lg">
                Notarix adalah Arsip notaris modern untuk menata dokumen penting,
                mempercepat pelacakan, dan menjaga kepatuhan. Minta demo 7 hari dengan
                penyimpanan 15GB sebelum memutuskan.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#demo"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1A1210] transition hover:bg-[#F5E9DD]"
                >
                  Request Demo 7 Hari
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60"
                >
                  Lihat Harga
                </a>
              </div>
              <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-[#E6B68E]" />
                  Demo 7 hari
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-[#E6B68E]" />
                  15GB penyimpanan
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-[#E6B68E]" />
                  1 paket layanan
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="relative mx-auto w-full max-w-lg">
                <div
                  className="absolute -left-6 top-10 hidden w-40 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.4)] lg:block"
                  style={{ animation: "float 8s ease-in-out infinite" }}
                >
                  <p className="text-sm font-semibold text-white">Status Berkas</p>
                  <p className="mt-2 text-white/60">12 transaksi berjalan</p>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#D9A37C] to-[#2D6F66]" />
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                        Dashboard Ringkas
                      </p>
                      <p className={`${displayFont.className} mt-2 text-2xl font-semibold`}>
                        Aktivitas Harian
                      </p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                      Live
                    </span>
                  </div>
                  <div className="mt-6 space-y-4">
                    {["Akta jual beli", "Perjanjian sewa", "Kuasa khusus"].map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{item}</p>
                          <p className="text-xs text-white/50">Terverifikasi - 2 menit lalu</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-[#D9A37C]/20 p-2 text-[#E6B68E]">
                          <FileLock className="h-full w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-white/50">Audit log</p>
                      <p className="mt-2 text-xl font-semibold text-white">1.284</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-white/50">Storage terpakai</p>
                      <p className="mt-2 text-xl font-semibold text-white">9,6GB</p>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute -right-6 bottom-6 hidden w-44 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.4)] lg:block"
                  style={{ animation: "float 7s ease-in-out infinite", animationDelay: "1s" }}
                >
                  <p className="text-sm font-semibold text-white">Penyimpanan</p>
                  <p className="mt-2 text-white/60">15GB siap digunakan</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#2D6F66]" />
                    <span>Enkripsi aktif</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <Image
                  src={heroIllustration}
                  alt="Ilustrasi Notarix"
                  className="h-auto w-full max-w-md opacity-80"
                  priority
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="fitur" className="bg-[#F8F4EF] text-[#1B1814]">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9B7A52]">
                Fokus Keamanan
              </p>
              <h2 className={`${displayFont.className} mt-4 text-3xl font-semibold md:text-4xl`}>
                Satu dashboard untuk menyimpan, melacak, dan membuktikan.
              </h2>
            </div>
            <p className="max-w-xl text-base text-[#4A4033]">
              Dirancang khusus untuk kebutuhan notaris: pengendalian akses, histori perubahan,
              dan pencarian cepat agar dokumen selalu siap saat dibutuhkan.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-[#E6DDD2] bg-white p-6 shadow-[0_20px_60px_rgba(28,20,12,0.08)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1B1814] text-[#F8F4EF]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className={`${displayFont.className} mt-5 text-xl font-semibold`}>
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm text-[#4A4033]">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="demo" className="bg-[#10161D] text-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E6B68E]">
                Demo Eksklusif
              </p>
              <h2 className={`${displayFont.className} mt-4 text-3xl font-semibold md:text-4xl`}>
                Coba 7 hari, simpan 15GB, lihat alurnya langsung.
              </h2>
              <p className="mt-4 text-base text-white/70">
                Dapatkan akses demo khusus selama satu minggu. Tim kami akan membantu
                menyiapkan struktur arsip awal agar Anda langsung merasakan manfaatnya.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-[#E6B68E] px-6 py-3 text-sm font-semibold text-[#1A1210] transition hover:bg-[#F0C59C]"
                >
                  Request Demo
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50"
                >
                  Lihat Paket
                </a>
              </div>
            </div>
            <div className="space-y-4">
              {[
                "Onboarding cepat untuk tim notaris",
                "Template klasifikasi dokumen siap pakai",
                "Pendampingan migrasi data dasar",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2D6F66] text-white">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-white/80">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[#F8F4EF] text-[#1B1814]">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9B7A52]">
                Harga Sederhana
              </p>
              <h2 className={`${displayFont.className} mt-4 text-3xl font-semibold md:text-4xl`}>
                Satu paket layanan, transparan tanpa kejutan.
              </h2>
            </div>
            <p className="max-w-xl text-base text-[#4A4033]">
              Mulai dari paket inti dengan penyimpanan 15GB. Harga promo hanya berlaku
              untuk pembelian awal selama periode 3 bulan.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[32px] border border-[#E6DDD2] bg-white p-8 shadow-[0_30px_80px_rgba(28,20,12,0.12)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#9B7A52]">Paket Inti</p>
                  <h3 className={`${displayFont.className} mt-3 text-2xl font-semibold`}>
                    Notarix Starter
                  </h3>
                </div>
                <span className="rounded-full bg-[#1B1814] px-4 py-1 text-xs font-semibold text-[#F8F4EF]">
                  Best Value
                </span>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-[#E6DDD2] bg-[#F8F4EF] p-4">
                  <p className="text-xs text-[#6B5C48]">Harga normal</p>
                  <p className={`${displayFont.className} mt-2 text-3xl font-semibold`}>
                    Rp 750rb
                  </p>
                  <p className="text-xs text-[#6B5C48]">/bulan</p>
                </div>
                <div className="rounded-2xl border border-[#D8C7B5] bg-[#1B1814] p-4 text-[#F8F4EF]">
                  <p className="text-xs text-[#E6B68E]">Harga promo</p>
                  <p className={`${displayFont.className} mt-2 text-3xl font-semibold`}>
                    Rp 500rb
                  </p>
                  <p className="text-xs text-[#E6B68E]">/bulan (3 bulan)</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-[#E6DDD2] bg-[#F8F4EF] p-4">
                <p className="text-xs text-[#6B5C48]">Opsi tahunan</p>
                <p className={`${displayFont.className} mt-2 text-2xl font-semibold`}>
                  Rp 1,5jt / tahun
                </p>
              </div>
              <div className="mt-6 space-y-3 text-sm text-[#4A4033]">
                {[
                  "Penyimpanan 15GB",
                  "Audit trail otomatis",
                  "Role akses untuk tim notaris",
                  "Laporan aktivitas bulanan",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2D6F66]" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1B1814] px-6 py-3 text-sm font-semibold text-[#F8F4EF] transition hover:bg-[#2C2520]"
                >
                  Mulai Berlangganan
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#demo"
                  className="inline-flex items-center gap-2 rounded-full border border-[#1B1814]/20 px-6 py-3 text-sm font-semibold text-[#1B1814] transition hover:border-[#1B1814]/50"
                >
                  Coba Demo Dulu
                </a>
              </div>
              <p className="mt-6 text-xs text-[#6B5C48]">
                Promo pembelian awal hanya berlaku {promoStart} - {promoEnd} dan khusus
                pembelian pertama.
              </p>
            </div>

            <div className="rounded-[32px] border border-[#E6DDD2] bg-white p-8 shadow-[0_30px_80px_rgba(28,20,12,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9B7A52]">
                Ringkasan Paket
              </p>
              <h3 className={`${displayFont.className} mt-4 text-2xl font-semibold`}>
                Semua kebutuhan notaris dalam satu paket.
              </h3>
              <p className="mt-4 text-sm text-[#4A4033]">
                Tidak ada biaya tambahan tersembunyi. Semua fitur utama sudah termasuk
                agar tim fokus pada pelayanan klien, bukan mengurus sistem.
              </p>
              <div className="mt-6 space-y-4">
                {[
                  {
                    title: "Request Demo 7 hari",
                    desc: "Coba langsung dengan data simulasi dan bantuan setup.",
                  },
                  {
                    title: "15GB penyimpanan awal",
                    desc: "Cukup untuk ribuan dokumen notaris inti.",
                  },
                  {
                    title: "Satu paket layanan",
                    desc: "Harga konsisten untuk tim kecil sampai menengah.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-[#E6DDD2] bg-[#F8F4EF] p-4">
                    <p className="text-sm font-semibold text-[#1B1814]">{item.title}</p>
                    <p className="mt-2 text-xs text-[#6B5C48]">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl border border-[#D8C7B5] bg-[#1B1814] p-5 text-[#F8F4EF]">
                <p className="text-xs uppercase tracking-[0.3em] text-[#E6B68E]">Catatan</p>
                <p className="mt-3 text-sm text-[#F8F4EF]/80">
                  Promo berlangsung selama 3 bulan. Jika Anda perlu menyesuaikan
                  tanggal promo hingga akhir Juni 2026, beri tahu kami.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[#10161D] text-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E6B68E]">
                FAQ
              </p>
              <h2 className={`${displayFont.className} mt-4 text-3xl font-semibold md:text-4xl`}>
                Pertanyaan yang sering muncul.
              </h2>
              <p className="mt-4 text-base text-white/70">
                Butuh detail lebih lanjut? Tim kami siap membantu menjelaskan skema
                harga, demo, dan implementasi awal.
              </p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5"
                >
                  <p className="text-sm font-semibold text-white">{faq.question}</p>
                  <p className="mt-3 text-sm text-white/70">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0C1116] text-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="flex flex-col items-center gap-6 rounded-[32px] border border-white/10 bg-[linear-gradient(120deg,rgba(217,163,124,0.18)_0%,rgba(45,111,102,0.12)_60%,rgba(12,17,22,0.7)_100%)] px-8 py-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E6B68E]">
              Siap Mulai?
            </p>
            <h2 className={`${displayFont.className} text-3xl font-semibold md:text-4xl`}>
              Bangun arsip notaris yang lebih aman dan profesional.
            </h2>
            <p className="max-w-2xl text-base text-white/70">
              Jadwalkan demo 7 hari atau langsung berlangganan paket inti. Kami bantu
              Anda melangkah dari proses manual ke sistem yang siap audit.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1A1210] transition hover:bg-[#F5E9DD]"
              >
                Request Demo
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50"
              >
                Masuk Dashboard
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0C1116] text-white/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`${displayFont.className} text-lg font-semibold text-white`}>
              Notarix
            </p>
            <p className="text-sm">Arsip notaris modern.</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <span>(c) 2026 Notarix</span>
            <span>Jakarta, Indonesia</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
