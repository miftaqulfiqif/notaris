export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export type SuperadminDashboardStats = {
    total_tenants: number;
    active_tenants: number;
    transactions_today: number;
    monthly_revenue: number;
    open_tickets: number;
};

export type TrendDataPoint = {
    date: string;
    revenue: number;
};

export type RecentTransaction = {
    id: string;
    tenant_name: string;
    amount: number;
    method: string;
    status: string;
    date: string;
};

export type TenantRecord = {
    contact_email?: string | null;
    contact_phone?: string | null;
    created_at?: string;
    id: string;
    name: string;
    package: string;
    status: string;
    joined_date: string;
    users_count: number;
};

export type TenantStats = {
    total_tenants: number;
    active_tenants: number;
    trial_tenants: number;
    suspended_tenants: number;
};

export type InvoiceRecord = {
    id: string;
    tenant_name: string;
    period: string;
    amount: number;
    status: string;
    due_date?: string;
    paid_at?: string;
};

export type InvoiceStats = {
    total_revenue: number;
    pending_invoices: number;
    overdue_invoices: number;
    overdue_value: number;
};

export type RevenueData = {
    month: string;
    revenue: number;
};

export type AgingData = {
    label: string;
    value: number;
    color: string;
};

export type PackagePlan = {
    active_tenants?: number;
    can_delete?: boolean;
    features: string[] | string;
    id: string;
    name: string;
    monthly_price: number;
    max_users: number;
    storage_gb: number;
    documents_per_month: string;
    status: string;
    total_subscriptions?: number;
};

export type PackageTenantRecord = {
    end_date: string;
    id: string;
    start_date: string;
    tenant_name: string;
    package_name: string;
    status: string;
};

export type PackageMetrics = {
    total_mrr: number;
    active_subscriptions: number;
    churn_rate: string;
    upgrade_rate: string;
};

export type SupportTicket = {
    id: string;
    notaris_id?: string;
    title: string;
    description: string;
    tenant_name: string;
    reporter_email: string;
    priority: string;
    status: string;
    assignee?: string;
    internal_note?: string;
    sla_breached: boolean;
    created_at: string;
};

export type TicketReply = {
    id: string;
    ticket_id: string;
    sender_email: string;
    message: string;
    is_internal: boolean;
    created_at: string;
};

export type SupportStats = {
    open_tickets: number;
    in_progress: number;
    resolved: number;
    closed: number;
    sla_breached: number;
    resolved_today?: number;
    avg_response_time?: number;
};

export type ReportRecord = {
    id: string;
    title: string;
    report_type: string;
    period_start: string;
    period_end: string;
    format: string;
    file_path?: string;
    created_at: string;
};

export type ScheduledReport = {
    id: string;
    created_at: string;
    recipient_email: string;
    report_type: string;
    schedule: string;
    status: string;
};

export type ReportGenerateRequest = {
    format: string;
    period_end: string;
    period_start: string;
    report_type: string;
};

export type ScheduledReportRequest = {
    recipient_email: string;
    report_type: string;
    schedule: string;
};

export type TransactionLog = {
    created_at?: string;
    id?: string;
    message: string;
    tone: string;
};

export type TransactionRecord = {
    error_code?: string;
    id: string;
    tenant_name: string;
    amount: number;
    method: string;
    status: string;
    date: string;
    description?: string;
    provider_ref?: string;
};

export type TransactionDetail = TransactionRecord & {
    transaction_logs?: TransactionLog[];
};

export type TransactionStats = {
    total_value: number;
    success_count: number;
    pending_count: number;
    refund_count: number;
};
