'use client';

const statusMeta: Record<string, { description: string; title: string; tone: string }> = {
    pending: {
        title: 'Menunggu pembayaran',
        description: 'Selesaikan pembayaran Anda sebelum waktu berakhir agar akun dapat langsung diaktifkan.',
        tone: 'border-[#E9D6B7] bg-[#FFF7E8] text-[#7E5C1E]',
    },
    settled: {
        title: 'Pembayaran berhasil',
        description: 'Pembayaran Anda sudah kami terima. Kami sedang mengaktifkan langganan Anda.',
        tone: 'border-[#CCE7D4] bg-[#EFFAF2] text-[#24633B]',
    },
    expired: {
        title: 'Pembayaran kedaluwarsa',
        description: 'Sesi pembayaran ini sudah berakhir. Silakan pilih metode pembayaran baru untuk melanjutkan.',
        tone: 'border-[#F0D2CF] bg-[#FFF2F0] text-[#8A3730]',
    },
    failed: {
        title: 'Pembayaran gagal',
        description: 'Kami belum bisa mengonfirmasi pembayaran. Coba metode pembayaran lain atau periksa kembali statusnya.',
        tone: 'border-[#F0D2CF] bg-[#FFF2F0] text-[#8A3730]',
    },
    cancelled: {
        title: 'Pembayaran dibatalkan',
        description: 'Sesi pembayaran ini tidak lagi aktif. Anda bisa membuat instruksi pembayaran baru dari halaman checkout.',
        tone: 'border-[#F0D2CF] bg-[#FFF2F0] text-[#8A3730]',
    },
};

export function PaymentStatusBanner({ status }: Readonly<{ status?: string | null }>) {
    const meta = statusMeta[status ?? 'pending'] ?? statusMeta.pending;

    return (
        <div className={`rounded-[20px] border px-5 py-4 ${meta.tone}`}>
            <p className="text-sm font-semibold">{meta.title}</p>
            <p className="mt-1 text-sm opacity-90">{meta.description}</p>
        </div>
    );
}
