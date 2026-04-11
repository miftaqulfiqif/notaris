'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Search } from 'lucide-react';
import {
    SuperadminActionButton,
    SuperadminModal,
    SuperadminSelectField,
    SuperadminTextarea,
    SuperadminTextInput,
    type SuperadminSelectOption,
} from '@/features/superadmin/presentation/components/SuperadminOverlay';
import {
    SuperadminShell,
    SuperadminStatCard,
    SuperadminStatusBadge,
    type SuperadminStatusTone,
} from '@/features/superadmin/presentation/components/SuperadminShell';
import { useSuperadminSupport } from '../../hooks/useSuperadminSupport';
import { SupportTicket as SupportType } from '../../types';

type TicketPriorityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';
type TicketStatusFilter = 'all' | 'open' | 'inProgress' | 'resolved' | 'closed' | 'slaBreach';
type TicketWorkflowStatus = Exclude<TicketStatusFilter, 'all' | 'slaBreach'>;

type TicketDraftState = {
    assignee: string;
    internalNote: string;
    statusValue: TicketWorkflowStatus;
    replyMessage: string;
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

function normalizeTicketStatus(status?: string): TicketWorkflowStatus {
    if (status === 'inProgress' || status === 'resolved' || status === 'closed') {
        return status;
    }

    return 'open';
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
    ticket: SupportType;
}>) {
    const statusMeta = supportStatusMeta(normalizeTicketStatus(ticket.status));

    return (
        <button
            type="button"
            onClick={onOpen}
            aria-label={`Buka detail tiket ${ticket.id}`}
            className="flex w-full gap-4 border-b border-[#303030] px-4 py-4 text-left transition-colors hover:bg-[#191C20] last:border-b-0"
        >
            <div className={`mt-1 h-12 w-1 rounded-full ${ticket.status === 'open' ? 'bg-[#E0A030]' : ticket.status === 'resolved' ? 'bg-[#3CB057]' : 'bg-[#6F6F6F]'}`} aria-hidden="true" />

            <div className="min-w-0 flex-1">
                <h2 className="text-[16px] font-medium leading-6 text-white">{ticket.title}</h2>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[#797F8F]">
                    <span>{ticket.tenant_name}</span>
                    <span>{ticket.id}</span>
                    <span>{new Date(ticket.created_at).toLocaleDateString('id-ID')}</span>
                </div>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                <SuperadminStatusBadge tone={ticket.priority === 'high' || ticket.priority === 'critical' ? 'danger' : ticket.priority === 'medium' ? 'warning' : 'muted'} value={ticket.priority} />
                <SuperadminStatusBadge
                    tone={statusMeta.tone}
                    value={statusMeta.label}
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
    onReply,
    ticket,
    replies
}: Readonly<{
    draft: TicketDraftState;
    onClose: () => void;
    onDraftChange: (field: keyof TicketDraftState, nextValue: string) => void;
    onSave: () => void;
    onReply: () => void;
    ticket: SupportType;
    replies: import('../../types').TicketReply[];
}>) {
    const statusMeta = supportStatusMeta(draft.statusValue);

    return (
        <SuperadminModal
            maxWidthClassName="max-w-[700px]"
            onClose={onClose}
            title={`${ticket.title}`}
        >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 px-5 py-5 h-[70vh] md:h-[600px] overflow-hidden">
                <div className="flex flex-col h-full overflow-hidden border-r border-[#25282D] pr-4">
                    <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                        <div className="rounded-[8px] border border-[#212121] bg-[#0F1012] px-4 py-3">
                            <p className="text-[12px] text-[#C9AA6F] mb-1">{ticket.reporter_email || ticket.tenant_name}</p>
                            <p className="text-[14px] leading-5 text-white">{ticket.description}</p>
                            <span className="text-[10px] text-[#6F6F6F] mt-2 block">{new Date(ticket.created_at).toLocaleString('id-ID')}</span>
                        </div>
                        
                        {replies?.map((reply) => (
                            <div key={reply.id} className={`rounded-[8px] px-4 py-3 w-[85%] ${reply.is_internal ? 'bg-[#191C20] border border-[#25282D] ml-auto' : 'bg-[#0F1012] border border-[#212121]'}`}>
                                <p className={`text-[12px] mb-1 ${reply.is_internal ? 'text-white' : 'text-[#C9AA6F]'}`}>{reply.is_internal ? 'Admin' : reply.sender_email}</p>
                                <p className="text-[14px] leading-5 text-white">{reply.message}</p>
                                <span className="text-[10px] text-[#6F6F6F] mt-2 block">{new Date(reply.created_at).toLocaleString('id-ID')}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="pt-3 border-t border-[#25282D] shrink-0">
                        <SuperadminTextarea
                            label="Kirim Balasan"
                            value={draft.replyMessage}
                            onChange={(nextValue) => onDraftChange('replyMessage', nextValue)}
                            rows={3}
                        />
                        <div className="flex justify-end mt-2">
                             <SuperadminActionButton variant="primary" onClick={onReply}>
                                Kirim Pesan
                            </SuperadminActionButton>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 h-full overflow-y-auto pl-2 pb-4">
                    <div className="flex flex-col gap-2">
                        <SuperadminStatusBadge tone={ticket.priority === 'urgent' ? 'danger' : ticket.priority === 'high' ? 'warning' : 'muted'} value={ticket.priority} />
                        <SuperadminStatusBadge tone={statusMeta.tone} value={statusMeta.label} />
                        <span className="text-[10px] text-[#6F6F6F]">Dibuat: {new Date(ticket.created_at).toLocaleString('id-ID')}</span>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[12px] text-[#6F6F6F]">Tenant: {ticket.tenant_name}</p>
                        <p className="text-[12px] text-[#6F6F6F]">Email: {ticket.reporter_email || '-'}</p>
                    </div>

                    <div className="space-y-4">
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
                        <SuperadminTextarea
                            label="Internal Note"
                            value={draft.internalNote}
                            onChange={(nextValue) => onDraftChange('internalNote', nextValue)}
                            rows={2}
                        />
                         <div className="pt-2">
                            <SuperadminActionButton variant="primary" className="w-full justify-center" onClick={onSave}>
                                Simpan Detail
                            </SuperadminActionButton>
                        </div>
                    </div>
                </div>
            </div>
        </SuperadminModal>
    );
}

export function SuperadminSupport() {
    const { 
        tickets, 
        stats, 
        isLoading, 
        search, 
        setSearch, 
        statusFilter, 
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        createTicket,
        updateTicket,
        replies,
        fetchReplies,
        sendReply
    } = useSuperadminSupport();
    
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({ title: '', description: '', priority: 'medium' });
    const [ticketDraft, setTicketDraft] = useState<TicketDraftState>({
        assignee: 'Unassigned',
        statusValue: 'open',
        internalNote: '',
        replyMessage: '',
    });

    const selectedTicket = selectedTicketId === null ? null : tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;

    const openTicketDetail = (ticket: SupportType) => {
        setSelectedTicketId(ticket.id);
        fetchReplies(ticket.id);
        setTicketDraft({
            assignee: ticket.assignee || 'Unassigned',
            statusValue: normalizeTicketStatus(ticket.status),
            internalNote: ticket.internal_note || '',
            replyMessage: '',
        });
    };

    const closeTicketDetail = () => {
        setSelectedTicketId(null);
    };

    const handleCreateTicket = async () => {
        if (!createForm.title.trim()) return;
        const success = await createTicket({
            title: createForm.title.trim(),
            description: createForm.description.trim(),
            priority: createForm.priority,
        });
        if (success) {
            setShowCreateModal(false);
            setCreateForm({ title: '', description: '', priority: 'medium' });
        }
    };

    const handleSaveTicket = async () => {
        if (!selectedTicketId) return;

        const success = await updateTicket(selectedTicketId, {
            assignee: ticketDraft.assignee,
            internal_note: ticketDraft.internalNote,
            status: ticketDraft.statusValue,
        });

        if (success) {
            closeTicketDetail();
        }
    };

    const handleSendReply = async () => {
        if (!selectedTicketId || !ticketDraft.replyMessage.trim()) return;

        const success = await sendReply(selectedTicketId, ticketDraft.replyMessage, true);
        if (success) {
            setTicketDraft(prev => ({ ...prev, replyMessage: '' }));
        }
    };

    if (isLoading) {
        return (
            <SuperadminShell activePage="support" title="Support">
                <div className="flex h-64 items-center justify-center text-[#6F6F6F]">
                    Loading...
                </div>
            </SuperadminShell>
        );
    }

    return (
        <SuperadminShell
            activePage="support"
            title="Support"
            headerActions={
                <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C9AA6F] px-4 text-[14px] text-[#25282D] transition-colors hover:bg-[#D7B97F]"
                >
                    <Plus className="h-4 w-4" />
                    Buat Tiket
                </button>
            }
        >
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SuperadminStatCard
                    label="TIKET TERBUKA"
                    value={stats?.open_tickets?.toString() || '0'}
                />
                <SuperadminStatCard
                    label="IN PROGRESS"
                    value={stats?.in_progress?.toString() || '0'}
                />
                <SuperadminStatCard
                    label="RESOLVED"
                    value={stats?.resolved?.toString() || '0'}
                />
                <SuperadminStatCard
                    label="SLA BREACHED"
                    value={stats?.sla_breached?.toString() || '0'}
                    valueClassName="text-[#FF6B71]"
                />
            </section>

            <section className="overflow-hidden rounded-[12px] border border-[#25282D] bg-[#16181C]">
                <header className="flex flex-col gap-3 border-b border-[#25282D] p-4 xl:flex-row xl:items-center xl:justify-between">
                    <label className="relative block w-full xl:max-w-[280px]">
                        <span className="sr-only">Cari tiket</span>
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6F6F6F]" />
                        <input
                            type="search"
                            aria-label="Cari tiket"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
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
                    {tickets.map((ticket) => (
                        <SupportTicketRow
                            key={ticket.id}
                            ticket={ticket}
                            onOpen={() => openTicketDetail(ticket)}
                        />
                    ))}
                    {tickets.length === 0 && (
                        <div className="px-4 py-8 text-center text-[14px] text-[#6F6F6F]">
                            Tidak ada data
                        </div>
                    )}
                </div>
            </section>

            {selectedTicket ? (
                <SupportTicketDetailModal
                    draft={ticketDraft}
                    onClose={closeTicketDetail}
                    onSave={handleSaveTicket}
                    onReply={handleSendReply}
                    ticket={selectedTicket}
                    replies={replies[selectedTicket.id] || []}
                    onDraftChange={(field, nextValue) =>
                        setTicketDraft((currentDraft) => ({
                            ...currentDraft,
                            [field]: nextValue,
                        }))
                    }
                />
            ) : null}

            {showCreateModal ? (
                <SuperadminModal
                    maxWidthClassName="max-w-[500px]"
                    onClose={() => setShowCreateModal(false)}
                    title="Buat Tiket Baru"
                >
                    <div className="space-y-4 px-5 py-5">
                        <SuperadminTextInput
                            label="Judul Tiket"
                            value={createForm.title}
                            onChange={(v) => setCreateForm((f) => ({ ...f, title: v }))}
                        />
                        <SuperadminTextarea
                            label="Deskripsi"
                            value={createForm.description}
                            onChange={(v) => setCreateForm((f) => ({ ...f, description: v }))}
                            rows={3}
                        />
                        <SuperadminSelectField
                            label="Prioritas"
                            value={createForm.priority}
                            onChange={(v) => setCreateForm((f) => ({ ...f, priority: v }))}
                            options={[
                                { label: 'Low', value: 'low' },
                                { label: 'Medium', value: 'medium' },
                                { label: 'High', value: 'high' },
                                { label: 'Urgent', value: 'urgent' },
                            ]}
                        />
                        <div className="flex justify-end gap-3 border-t border-[#4B4B4B] pt-5">
                            <SuperadminActionButton onClick={() => setShowCreateModal(false)}>Batal</SuperadminActionButton>
                            <SuperadminActionButton
                                variant="primary"
                                onClick={handleCreateTicket}
                            >
                                Buat Tiket
                            </SuperadminActionButton>
                        </div>
                    </div>
                </SuperadminModal>
            ) : null}
        </SuperadminShell>
    );
}
