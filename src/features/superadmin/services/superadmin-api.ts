import { apiDelete, apiGet, apiPost, apiPatch, apiPut, ApiResponse } from '@/shared/api/api-client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import * as T from '../types';

const buildQueryString = (params: Record<string, string | undefined>) => {
    const sanitizedParams = Object.entries(params).reduce<Record<string, string>>((accumulator, [key, value]) => {
        if (value === undefined || value === null || value === '') {
            return accumulator;
        }

        accumulator[key] = value;
        return accumulator;
    }, {});

    const query = new URLSearchParams(sanitizedParams).toString();
    return query ? `?${query}` : '';
};

export const superadminApi = {
    // DASHBOARD
    getDashboardStats: () => 
        apiGet<ApiResponse<T.SuperadminDashboardStats>>(ENDPOINTS.SUPERADMIN.DASHBOARD.STATS),
    getDashboardTrend: () => 
        apiGet<ApiResponse<T.TrendDataPoint[]>>(ENDPOINTS.SUPERADMIN.DASHBOARD.TREND),
    getRecentTransactions: () => 
        apiGet<ApiResponse<T.RecentTransaction[]>>(ENDPOINTS.SUPERADMIN.DASHBOARD.RECENT_TRANSACTIONS),

    // TENANTS
    getTenants: (params: { search?: string, status?: string }) => {
        return apiGet<ApiResponse<T.TenantRecord[]>>(`${ENDPOINTS.SUPERADMIN.TENANTS.LIST}${buildQueryString(params)}`);
    },
    getTenantStats: () => 
        apiGet<ApiResponse<T.TenantStats>>(ENDPOINTS.SUPERADMIN.TENANTS.STATS),

    // INVOICES
    getInvoices: (params: { search?: string, status?: string }) => {
        return apiGet<ApiResponse<T.InvoiceRecord[]>>(`${ENDPOINTS.SUPERADMIN.INVOICES.LIST}${buildQueryString(params)}`);
    },
    getInvoiceStats: () => 
        apiGet<ApiResponse<T.InvoiceStats>>(ENDPOINTS.SUPERADMIN.INVOICES.STATS),
    getInvoiceRevenueTrend: () => 
        apiGet<ApiResponse<T.RevenueData[]>>(ENDPOINTS.SUPERADMIN.INVOICES.REVENUE),
    getInvoiceAging: () => 
        apiGet<ApiResponse<T.AgingData[]>>(ENDPOINTS.SUPERADMIN.INVOICES.AGING),
    markInvoicePaid: (id: string) => 
        apiPatch<ApiResponse<T.InvoiceRecord>>(ENDPOINTS.SUPERADMIN.INVOICES.MARK_PAID(id)),

    // PACKAGES
    getPackages: () => 
        apiGet<ApiResponse<T.PackagePlan[]>>(ENDPOINTS.SUPERADMIN.PACKAGES.LIST),
    createPackage: (data: Partial<T.PackagePlan>) => 
        apiPost<ApiResponse<T.PackagePlan>>(ENDPOINTS.SUPERADMIN.PACKAGES.CREATE, data),
    updatePackage: (id: string, data: Partial<T.PackagePlan>) => 
        apiPut<ApiResponse<T.PackagePlan>>(ENDPOINTS.SUPERADMIN.PACKAGES.UPDATE(id), data),
    deletePackage: (id: string) =>
        apiDelete<ApiResponse<T.PackagePlan>>(ENDPOINTS.SUPERADMIN.PACKAGES.DELETE(id)),
    getPackageTenants: () => 
        apiGet<ApiResponse<T.PackageTenantRecord[]>>(ENDPOINTS.SUPERADMIN.PACKAGES.TENANTS),
    getPackageMetrics: () => 
        apiGet<ApiResponse<T.PackageMetrics>>(ENDPOINTS.SUPERADMIN.PACKAGES.METRICS),

    // TICKETS
    getTickets: (params: { search?: string, status?: string, priority?: string }) => {
        return apiGet<ApiResponse<T.SupportTicket[]>>(`${ENDPOINTS.SUPERADMIN.TICKETS.LIST}${buildQueryString(params)}`);
    },
    getTicketStats: () => 
        apiGet<ApiResponse<T.SupportStats>>(ENDPOINTS.SUPERADMIN.TICKETS.STATS),
    createTicket: (data: Partial<T.SupportTicket>) => 
        apiPost<ApiResponse<T.SupportTicket>>(ENDPOINTS.SUPERADMIN.TICKETS.CREATE, data),
    updateTicket: (id: string, data: Partial<T.SupportTicket>) => 
        apiPatch<ApiResponse<T.SupportTicket>>(ENDPOINTS.SUPERADMIN.TICKETS.UPDATE(id), data),
    getTicketReplies: (id: string) => 
        apiGet<ApiResponse<T.TicketReply[]>>(ENDPOINTS.SUPERADMIN.TICKETS.REPLIES(id)),
    replyTicket: (id: string, data: { message: string, is_internal?: boolean, sender_email?: string }) => 
        apiPost<ApiResponse<T.TicketReply>>(ENDPOINTS.SUPERADMIN.TICKETS.REPLIES(id), data),

    // REPORTS
    getReports: () => 
        apiGet<ApiResponse<T.ReportRecord[]>>(ENDPOINTS.SUPERADMIN.REPORTS.LIST),
    generateReport: (data: T.ReportGenerateRequest) => 
        apiPost<{ data?: unknown; message?: string; report?: T.ReportRecord }>(ENDPOINTS.SUPERADMIN.REPORTS.GENERATE, data),
    getScheduledReports: () => 
        apiGet<ApiResponse<T.ScheduledReport[]>>(ENDPOINTS.SUPERADMIN.REPORTS.SCHEDULED),
    createScheduledReport: (data: T.ScheduledReportRequest) => 
        apiPost<ApiResponse<T.ScheduledReport>>(ENDPOINTS.SUPERADMIN.REPORTS.CREATE_SCHEDULED, data),

    // TRANSACTIONS
    getTransactions: (params: { search?: string, status?: string, method?: string, start_date?: string, end_date?: string }) => {
        return apiGet<ApiResponse<T.TransactionRecord[]>>(`${ENDPOINTS.SUPERADMIN.TRANSACTIONS.LIST}${buildQueryString(params)}`);
    },
    getTransactionStats: () => 
        apiGet<ApiResponse<T.TransactionStats>>(ENDPOINTS.SUPERADMIN.TRANSACTIONS.STATS),
    getTransactionDetail: (id: string) => 
        apiGet<ApiResponse<T.TransactionDetail>>(ENDPOINTS.SUPERADMIN.TRANSACTIONS.DETAIL(id)),
    refundTransaction: (id: string) => 
        apiPost<ApiResponse<T.TransactionRecord>>(ENDPOINTS.SUPERADMIN.TRANSACTIONS.REFUND(id)),
};
