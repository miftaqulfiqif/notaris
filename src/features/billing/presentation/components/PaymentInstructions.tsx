'use client';

import type { BillingTransaction } from '../../types/billing.types';

export function PaymentInstructions({ transaction }: Readonly<{ transaction: BillingTransaction | null }>) {
    const instructions = transaction?.instruction_payload;

    if (!transaction || !instructions) {
        return (
            <div className="rounded-[24px] border border-dashed border-[#D8CFC4] bg-white p-8 text-center text-sm text-[#6E6359]">
                Instruksi pembayaran akan muncul setelah metode pembayaran dipilih.
            </div>
        );
    }

    return (
        <div className="rounded-[24px] border border-[#E9E1D8] bg-white p-6 shadow-[0_24px_64px_rgba(79,58,28,0.1)]">
            {instructions.qr_url ? (
                <div className="flex flex-col items-center">
                    {instructions.qr_url.startsWith('http') ? (
                        <img
                            src={instructions.qr_url}
                            alt="QR pembayaran"
                            className="h-[220px] w-[220px] rounded-2xl border border-[#ECE4DB] bg-white object-contain p-3"
                        />
                    ) : (
                        <pre className="w-full overflow-auto rounded-2xl border border-[#ECE4DB] bg-[#FFFCF8] p-4 text-xs text-[#2D2925]">
                            {instructions.qr_url}
                        </pre>
                    )}
                </div>
            ) : null}

            {instructions.va_numbers?.length ? (
                <div className="space-y-3">
                    {instructions.va_numbers.map((item, index) => (
                        <div key={`${item.bank}-${item.va_number}-${index}`} className="rounded-2xl border border-[#ECE4DB] bg-[#FFFCF8] p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-[#8A7D6E]">{item.bank ?? 'Virtual Account'}</p>
                            <p className="mt-2 text-xl font-semibold text-[#2D2925]">{item.va_number}</p>
                        </div>
                    ))}
                </div>
            ) : null}

            {instructions.permata_va_number ? (
                <div className="rounded-2xl border border-[#ECE4DB] bg-[#FFFCF8] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#8A7D6E]">Permata VA</p>
                    <p className="mt-2 text-xl font-semibold text-[#2D2925]">{instructions.permata_va_number}</p>
                </div>
            ) : null}

            {(instructions.bill_key || instructions.payment_code) ? (
                <div className="mt-4 space-y-3 rounded-2xl border border-[#ECE4DB] bg-[#FFFCF8] p-4">
                    {instructions.bill_key ? <p className="text-sm text-[#2D2925]">Bill Key: <strong>{instructions.bill_key}</strong></p> : null}
                    {instructions.biller_code ? <p className="text-sm text-[#2D2925]">Biller Code: <strong>{instructions.biller_code}</strong></p> : null}
                    {instructions.payment_code ? <p className="text-sm text-[#2D2925]">Kode Pembayaran: <strong>{instructions.payment_code}</strong></p> : null}
                </div>
            ) : null}

            {instructions.redirect_url ? (
                <a
                    href={instructions.redirect_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#7D674E] px-5 text-sm font-medium text-white transition-colors hover:bg-[#6E5943]"
                >
                    Buka Halaman Pembayaran
                </a>
            ) : null}
        </div>
    );
}
