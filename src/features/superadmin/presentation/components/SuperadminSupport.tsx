'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Plus, Search } from 'lucide-react';
import {
    SuperadminActionButton,
    SuperadminModal,
    SuperadminSelectField,
    SuperadminTextarea,
    type SuperadminSelectOption,
} from '@/features/superadmin/presentation/components/SuperadminOverlay';
import {
    SuperadminShell,
    SuperadminStatCard,
    SuperadminStatusBadge,
    type SuperadminStatusTone,
} from '@/features/superadmin/presentation/components/SuperadminShell';

type TicketPriorityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';
type TicketStatusFilter = 'all' | 'open' | 'inProgress' | 'resolved' | 'closed' | 'slaBreach';
type TicketWorkflowStatus = Exclude<TicketStatusFilter, 'all' | 'slaBreach'>;

type SupportTicket = {
    accountName: string;
    accentClassName: string;
    assignee: string;
    createdAt: string;
    description: string;
    email: string;
    internalNote: string;
    lastUpdated: string;
    priorityLabel: string;
    priorityTone: SuperadminStatusTone;
    priorityValue: Exclude<TicketPriorityFilter, 'all'>;
    slaBreached: boolean;
    statusValue: TicketWorkflowStatus;
    ticketId: string;
    title: string;
};

type TicketDraftState = {
    assignee: string;
    internalNote: string;
    statusValue: TicketWorkflowStatus;
};

const assignOptions: SuperadminSelectOption[] = [
    { label: 'Unassigned', value: 'Unassigned' },
    { label: 'Maspek', value: 'Maspek' },
    { label: 'Rosam', value: 'Rosam' },
    { label: 'Nizam', value: 'Nizam' },
];

const statusControlOptions: SuperadminSelectOption[] = [
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'inProgress' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Closed', value: 'closed' },
];

const supportSummaryCards = [
    {
        label: 'TIKET TERBUKA',
        value: '7',
    },
    {
        label: 'DISELESAIKAN HARI INI',
        value: '3',
    },
    {
        label: 'AVG RESPONSE TIME',
        value: '2.4 jam',
    },
    {
        label: 'BREACH SLA',
        value: '2',
        valueClassName: 'text-[#FF6B71]',
        footer: <p className="text-[10px] text-[#FF6B71]">Perlu perhatian</p>,
    },
];

const initialSupportTickets: SupportTicket[] = [
    {
        title: 'Tidak bisa login - akun terkunci setelah reset password',
        accountName: 'PT Graha Notaris',
        ticketId: '#TKT-2402-041',
        lastUpdated: '2 jam yang lalu',
        createdAt: '19 Feb 2026, 07:30',
        email: 'budi@graha.id',
        description:
            'Setelah melakukan reset password melalui link email, saya tidak bisa masuk ke sistem. Muncul pesan "Account Locked". Tolong segera dibantu karena ada dokumen urgent yang harus diproses hari ini.',
        assignee: 'Unassigned',
        internalNote: 'Akun akan kami bantu reset manual setelah verifikasi tenant selesai.',
        priorityLabel: 'Critical',
        priorityTone: 'danger',
        priorityValue: 'critical',
        statusValue: 'open',
        slaBreached: true,
        accentClassName: 'bg-[#E05A5A]',
    },
    {
        title: 'Dokumen tidak bisa diunduh - error 500',
        accountName: 'KN Surya Hukum',
        ticketId: '#TKT-2402-042',
        lastUpdated: '4 jam yang lalu',
        createdAt: '19 Feb 2026, 06:10',
        email: 'ops@suryahukum.id',
        description:
            'Setiap kali menekan tombol unduh dokumen, sistem menampilkan error 500. Mohon bantu cek service download dan storage gateway.',
        assignee: 'Maspek',
        internalNote: 'Perlu log error dari service dokumen dan validasi storage tenant.',
        priorityLabel: 'High',
        priorityTone: 'warning',
        priorityValue: 'high',
        statusValue: 'inProgress',
        slaBreached: false,
        accentClassName: 'bg-[#E0A030]',
    },
    {
        title: 'Permintaan penambahan fitur tanda tangan digital',
        accountName: 'PT Graha Notaris',
        ticketId: '#TKT-2402-043',
        lastUpdated: '1 hari yang lalu',
        createdAt: '18 Feb 2026, 16:12',
        email: 'admin@graha.id',
        description:
            'Kami ingin mengetahui opsi aktivasi fitur tanda tangan digital untuk workflow dokumen internal kantor.',
        assignee: 'Rosam',
        internalNote: 'Masuk backlog produk, tunggu estimasi scope dari tim dev.',
        priorityLabel: 'Medium',
        priorityTone: 'warning',
        priorityValue: 'medium',
        statusValue: 'open',
        slaBreached: false,
        accentClassName: 'bg-[#C9AA6F]',
    },
    {
        title: 'Invoice tidak terkirim ke email klien',
        accountName: 'PT Graha Notaris',
        ticketId: '#TKT-2402-044',
        lastUpdated: '1 hari yang lalu',
        createdAt: '18 Feb 2026, 11:48',
        email: 'finance@graha.id',
        description:
            'Invoice bulan ini sudah terbentuk tetapi email tidak pernah diterima klien. Mohon cek proses delivery email dan queue.',
        assignee: 'Nizam',
        internalNote: 'Queue email sempat gagal. Perlu retry manual setelah validasi SMTP.',
        priorityLabel: 'Critical',
        priorityTone: 'danger',
        priorityValue: 'critical',
        statusValue: 'open',
        slaBreached: true,
        accentClassName: 'bg-[#E05A5A]',
    },
    {
        title: 'Pertanyaan upgrade paket Pro ke Enterprise',
        accountName: 'PT Graha Notaris',
        ticketId: '#TKT-2402-045',
        lastUpdated: '2 hari yang lalu',
        createdAt: '17 Feb 2026, 09:00',
        email: 'owner@graha.id',
        description:
            'Mohon informasi perbedaan benefit antara paket Pro dan Enterprise, termasuk proses migrasi tenant dan tambahan storage.',
        assignee: 'Unassigned',
        internalNote: 'Siapkan ringkasan benefit dan estimasi migrasi tenant.',
        priorityLabel: 'Low',
        priorityTone: 'muted',
        priorityValue: 'low',
        statusValue: 'open',
        slaBreached: false,
        accentClassName: 'bg-[#6F6F6F]',
    },
];

const statusOptions: { label: string; value: TicketStatusFilter }[] = [
    { label: 'Semua status', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'inProgress' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Closed', value: 'closed' },
    { label: 'SLA Breach', value: 'slaBreach' },
];

const priorityOptions: { label: string; value: TicketPriorityFilter }[] = [
    { label: 'Semua Prioritas', value: 'all' },
    { label: 'Critical', value: 'critical' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
];

function supportStatusMeta(statusValue: TicketWorkflowStatus): {
    label: string;
    tone: SuperadminStatusTone;
} {
    if (statusValue === 'inProgress') {
        return { label: 'In Progress', tone: 'info' };
    }

    if (statusValue === 'resolved') {
        return { label: 'Resolved', tone: 'success' };
    }

    if (statusValue === 'closed') {
        return { label: 'Closed', tone: 'muted' };
    }

    return { label: 'Open', tone: 'warning' };
}

function SupportFilterSelect({
    ariaLabel,
    onChange,
    options,
    value,
}: Readonly<{
    ariaLabel: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    value: string;
    }>) {
    return (
        <div className="relative w-full sm:min-w-[160px]">
            <select
                aria-label={ariaLabel}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-8 w-full appearance-none rounded-[8px] border border-[#212121] bg-[#0E0F11] px-3 pr-8 text-[12px] text-[#6F6F6F] outline-none transition-colors hover:border-[#3B414D] focus:border-[#C99D4B]"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6F6F6F]" />
        </div>
    );
}

function SupportTicketRow({
    onOpen,
    ticket,
}: Readonly<{
    onOpen: () => void;
    ticket: SupportTicket;
}>) {
    const statusMeta = supportStatusMeta(ticket.statusValue);

    return (
        <button
            type="button"
            onClick={onOpen}
            aria-label={`Buka detail tiket ${ticket.ticketId}`}
            className="flex w-full gap-4 border-b border-[#303030] px-4 py-4 text-left transition-colors hover:bg-[#191C20] last:border-b-0"
        >
            <div className={`mt-1 h-12 w-1 rounded-full ${ticket.accentClassName}`} aria-hidden="true" />

            <div className="min-w-0 flex-1">
                <h2 className="text-[16px] font-medium leading-6 text-white">{ticket.title}</h2>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[#797F8F]">
                    <span>{ticket.accountName}</span>
                    <span>{ticket.ticketId}</span>
                    <span>{ticket.lastUpdated}</span>
                </div>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                <SuperadminStatusBadge tone={ticket.priorityTone} value={ticket.priorityLabel} />
                <SuperadminStatusBadge
                    tone={ticket.slaBreached ? 'danger' : statusMeta.tone}
                    value={ticket.slaBreached ? 'SLA Breach' : statusMeta.label}
                />
            </div>
        </button>
    );
}

function SupportTicketDetailModal({
    draft,
    onClose,
    onDraftChange,
    onSave,
    ticket,
}: Readonly<{
    draft: TicketDraftState;
    onClose: () => void;
    onDraftChange: (field: keyof TicketDraftState, nextValue: string) => void;
    onSave: () => void;
    ticket: SupportTicket;
}>) {
    const statusMeta = supportStatusMeta(draft.statusValue);

    return (
        <SuperadminModal
            maxWidthClassName="max-w-[560px]"
            onClose={onClose}
            title={`Detail Tiket ${ticket.ticketId}`}
        >
            <div className="space-y-6 px-5 py-5">
                <div className="flex flex-wrap items-center gap-2">
                    <SuperadminStatusBadge tone={ticket.priorityTone} value={ticket.priorityLabel} />
                    <SuperadminStatusBadge tone={statusMeta.tone} value={statusMeta.label} />
                    {ticket.slaBreached ? <SuperadminStatusBadge tone="danger" value="SLA Breach" /> : null}
                    <span className="ml-auto text-[10px] text-white">Dibuat: {ticket.createdAt}</span>
                </div>

                <div className="space-y-2">
                    <h3 className="text-[16px] text-white">{ticket.title}</h3>
                    <p className="text-[12px] text-[#6F6F6F]">
                        {ticket.accountName} · {ticket.email}
                    </p>
                </div>

                <div className="rounded-[8px] border border-[#212121] bg-[#0F1012] px-3 py-3 text-[14px] leading-5 text-white">
                    {ticket.description}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <SuperadminSelectField
                        label="Assign ke"
                        value={draft.assignee}
                        onChange={(nextValue) => onDraftChange('assignee', nextValue)}
                        options={assignOptions}
                    />
                    <SuperadminSelectField
                        label="Status"
                        value={draft.statusValue}
                        onChange={(nextValue) => onDraftChange('statusValue', nextValue)}
                        options={statusControlOptions}
                    />
                </div>

                <SuperadminTextarea
                    label="Internal Note / Balasan"
                    value={draft.internalNote}
                    onChange={(nextValue) => onDraftChange('internalNote', nextValue)}
                    rows={2}
                />

                <div className="flex justify-end gap-3 border-t border-[#4B4B4B] pt-6">
                    <SuperadminActionButton onClick={onClose}>Batal</SuperadminActionButton>
                    <SuperadminActionButton variant="primary" onClick={onSave}>
                        Simpan & balas
                    </SuperadminActionButton>
                </div>
            </div>
        </SuperadminModal>
    );
}

export function SuperadminSupport() {
    const [tickets, setTickets] = useState(initialSupportTickets);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TicketStatusFilter>('all');
    const [priorityFilter, setPriorityFilter] = useState<TicketPriorityFilter>('all');
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [ticketDraft, setTicketDraft] = useState<TicketDraftState>({
        assignee: 'Unassigned',
        statusValue: 'open',
        internalNote: '',
    });

    const filteredTickets = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return tickets.filter((ticket) => {
            const matchesQuery =
                normalizedQuery.length === 0 ||
                ticket.title.toLowerCase().includes(normalizedQuery) ||
                ticket.accountName.toLowerCase().includes(normalizedQuery) ||
                ticket.ticketId.toLowerCase().includes(normalizedQuery);
            const matchesStatus =
                statusFilter === 'all'
                    ? true
                    : statusFilter === 'slaBreach'
                      ? ticket.slaBreached
                      : ticket.statusValue === statusFilter;
            const matchesPriority = priorityFilter === 'all' || ticket.priorityValue === priorityFilter;

            return matchesQuery && matchesStatus && matchesPriority;
        });
    }, [priorityFilter, searchQuery, statusFilter, tickets]);

    const selectedTicket =
        selectedTicketId === null ? null : tickets.find((ticket) => ticket.ticketId === selectedTicketId) ?? null;

    const openTicketDetail = (ticket: SupportTicket) => {
        setSelectedTicketId(ticket.ticketId);
        setTicketDraft({
            assignee: ticket.assignee,
            statusValue: ticket.statusValue,
            internalNote: ticket.internalNote,
        });
    };

    const closeTicketDetail = () => {
        setSelectedTicketId(null);
    };

    const handleSaveTicket = () => {
        if (!selectedTicketId) {
            return;
        }

        setTickets((currentTickets) =>
            currentTickets.map((ticket) =>
                ticket.ticketId === selectedTicketId
                    ? {
                          ...ticket,
                          assignee: ticketDraft.assignee,
                          internalNote: ticketDraft.internalNote,
                          statusValue: ticketDraft.statusValue,
                          slaBreached: ticketDraft.statusValue === 'open' ? ticket.slaBreached : false,
                      }
                    : ticket,
            ),
        );

        closeTicketDetail();
    };

    return (
        <SuperadminShell
            activePage="support"
            title="Support"
            headerActions={
                <button
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C9AA6F] px-4 text-[14px] text-[#25282D] transition-colors hover:bg-[#D7B97F]"
                >
                    <Plus className="h-4 w-4" />
                    Buat Tiket
                </button>
            }
        >
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {supportSummaryCards.map((card) => (
                    <SuperadminStatCard
                        key={card.label}
                        footer={card.footer}
                        label={card.label}
                        value={card.value}
                        valueClassName={card.valueClassName}
                    />
                ))}
            </section>

            <section className="overflow-hidden rounded-[12px] border border-[#25282D] bg-[#16181C]">
                <header className="flex flex-col gap-3 border-b border-[#25282D] p-4 xl:flex-row xl:items-center xl:justify-between">
                    <label className="relative block w-full xl:max-w-[280px]">
                        <span className="sr-only">Cari tiket</span>
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6F6F6F]" />
                        <input
                            type="search"
                            aria-label="Cari tiket"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Cari Tiket"
                            className="h-8 w-full min-w-0 rounded-[8px] border border-[#212121] bg-[#0E0F11] pl-9 pr-3 text-[12px] text-[#D4D4D4] outline-none transition-colors placeholder:text-[#6F6F6F] hover:border-[#3B414D] focus:border-[#C99D4B] sm:min-w-[240px] xl:min-w-[280px]"
                        />
                    </label>

                    <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto">
                        <SupportFilterSelect
                            ariaLabel="Filter status tiket"
                            value={statusFilter}
                            onChange={(value) => setStatusFilter(value as TicketStatusFilter)}
                            options={statusOptions}
                        />
                        <SupportFilterSelect
                            ariaLabel="Filter prioritas tiket"
                            value={priorityFilter}
                            onChange={(value) => setPriorityFilter(value as TicketPriorityFilter)}
                            options={priorityOptions}
                        />
                    </div>
                </header>

                <div role="list" aria-label="Daftar tiket support">
                    {filteredTickets.map((ticket) => (
                        <SupportTicketRow
                            key={ticket.ticketId}
                            ticket={ticket}
                            onOpen={() => openTicketDetail(ticket)}
                        />
                    ))}
                </div>
            </section>

            {selectedTicket ? (
                <SupportTicketDetailModal
                    draft={ticketDraft}
                    onClose={closeTicketDetail}
                    onSave={handleSaveTicket}
                    ticket={selectedTicket}
                    onDraftChange={(field, nextValue) =>
                        setTicketDraft((currentDraft) => ({
                            ...currentDraft,
                            [field]: nextValue,
                        }))
                    }
                />
            ) : null}
        </SuperadminShell>
    );
}
