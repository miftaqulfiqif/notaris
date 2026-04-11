const fs = require('fs');

const mocks = {
  'src/app/superadmin/tenants/page.test.tsx': `jest.mock('@/features/superadmin/hooks/useSuperadminTenants', () => ({
    useSuperadminTenants: () => ({
        tenants: [
            { id: '1', name: 'PT Graha Notaris', status: 'active', userCount: 10, totalTransaction: 1000000, lastActive: '2024-03-20', plan: { name: 'Pro' } },
            { id: '2', name: 'KN Surya Hukum', status: 'trial', userCount: 5, totalTransaction: 500000, lastActive: '2024-03-19', plan: { name: 'Starter' } },
            { id: '3', name: 'KN Mitra Akta', status: 'trial', userCount: 5, totalTransaction: 500000, lastActive: '2024-03-19', plan: { name: 'Starter' } },
            { id: '4', name: 'Firma Hukum', status: 'trial', userCount: 5, totalTransaction: 500000, lastActive: '2024-03-19', plan: { name: 'Starter' } },
            { id: '5', name: 'Test 5', status: 'inactive', userCount: 5, totalTransaction: 500000, lastActive: '2024-03-19', plan: { name: 'Starter' } },
            { id: '6', name: 'Test 6', status: 'inactive', userCount: 5, totalTransaction: 500000, lastActive: '2024-03-19', plan: { name: 'Starter' } },
            { id: '7', name: 'Test 7', status: 'inactive', userCount: 5, totalTransaction: 500000, lastActive: '2024-03-19', plan: { name: 'Starter' } }
        ],
        isLoading: false,
        summary: { total: 284, active: 142, newThisMonth: 12, inactive: 4 },
        fetchTenants: jest.fn(),
    })
}));`,
  'src/app/superadmin/support/page.test.tsx': `jest.mock('@/features/superadmin/hooks/useSuperadminSupport', () => ({
    useSuperadminSupport: () => ({
        tickets: [
            { id: '#TKT-2402-041', title: 'Tidak bisa login - akun terkunci setelah reset password', status: 'open', priority: 'high', tenant_name: 'PT Graha Notaris', created_at: '2024-03-20' },
            { id: '#TKT-2402-039', title: 'Dokumen tidak bisa diunduh - error 500', status: 'in-progress', priority: 'high', tenant_name: 'PT Graha Notaris', created_at: '2024-03-19' },
            { id: '#TKT-2402-038', title: 'Invoice tidak terkirim ke email klien', status: 'resolved', priority: 'medium', tenant_name: 'KN Surya Hukum', created_at: '2024-03-18' }
        ],
        replies: {},
        isLoading: false,
        summary: { openTickets: 7, resolvedToday: 12, avgResolutionTime: '2.4 jam', slaBreaches: 1 },
        fetchTickets: jest.fn(),
        fetchReplies: jest.fn(),
        replyTicket: jest.fn(),
    })
}));`,
  'src/app/superadmin/laporan/page.test.tsx': `jest.mock('@/features/superadmin/hooks/useSuperadminReports', () => ({
    useSuperadminReports: () => ({
        recentReports: [
            { id: '1', report_type: 'Transaksi Bulanan', period_start: '2024-03-01', period_end: '2024-03-31', status: 'ready', format: 'csv', created_at: '2024-04-01' },
            { id: '2', report_type: 'Aktivitas Login', period_start: '2024-03-01', period_end: '2024-03-31', status: 'ready', format: 'pdf', created_at: '2024-04-01' }
        ],
        scheduledReports: [
            { id: '1', report_type: 'Rekap Transaksi', schedule_type: 'weekly', email_to: 'admin@notarix.com', next_run: '2024-04-08' }
        ],
        isLoading: false,
        generateReport: jest.fn().mockResolvedValue({ success: true, data: [] }),
        scheduleReport: jest.fn().mockResolvedValue(true),
        fetchData: jest.fn()
    })
}));`,
  'src/app/superadmin/transaksi/page.test.tsx': `jest.mock('@/features/superadmin/hooks/useSuperadminTransactions', () => ({
    useSuperadminTransactions: () => ({
        transactions: [
            { id: 'TRX-123', reference_number: 'TRX-123', tenant_name: 'PT Graha Notaris', amount: 2500000, type: 'subscription', status: 'success', created_at: '2024-03-20', payment_method: 'va' },
            { id: 'TRX-124', reference_number: 'TRX-124', tenant_name: 'KN Surya Hukum', amount: 1500000, type: 'subscription', status: 'pending', created_at: '2024-03-20', payment_method: 'ewallet' }
        ],
        isLoading: false,
        summary: { totalVolume: 124500000, successRate: '98.5%', totalFee: 1245000, activeTransactions: 142 },
        fetchTransactions: jest.fn()
    })
}));`,
  'src/app/superadmin/billing-invoices/page.test.tsx': `jest.mock('@/features/superadmin/hooks/useSuperadminBilling', () => ({
    useSuperadminBilling: () => ({
        invoices: [
            { id: 'INV-001', invoice_number: 'INV-2024-001', tenant_name: 'PT Graha Notaris', amount: 2500000, status: 'paid', due_date: '2024-03-25', created_at: '2024-03-01' },
            { id: 'INV-002', invoice_number: 'INV-2024-002', tenant_name: 'KN Surya Hukum', amount: 1500000, status: 'pending', due_date: '2024-03-28', created_at: '2024-03-05' }
        ],
        isLoading: false,
        summary: { totalRevenue: 124500000, pendingAmount: 1500000, overdueAmount: 0, mrr: 45000000 },
        fetchInvoices: jest.fn()
    })
}));`,
  'src/app/superadmin/paket-langganan/page.test.tsx': `jest.mock('@/features/superadmin/hooks/useSuperadminPackages', () => ({
    useSuperadminPackages: () => ({
        packages: [
            { id: '1', name: 'Starter', price: 500000, user_limit: 5, active_tenants: 142, status: 'active', type: 'subscription' },
            { id: '2', name: 'Pro', price: 1500000, user_limit: 15, active_tenants: 85, status: 'active', type: 'subscription' },
            { id: '3', name: 'Enterprise', price: 3500000, user_limit: -1, active_tenants: 24, status: 'active', type: 'subscription' }
        ],
        isLoading: false,
        fetchPackages: jest.fn(),
        createPackage: jest.fn().mockResolvedValue(true)
    })
}));`,
  'src/app/superadmin/page.test.tsx': `jest.mock('@/features/superadmin/hooks/useSuperadminDashboard', () => ({
    useSuperadminDashboard: () => ({
        summary: { activeTenants: 284, recurringRevenue: 218000000, totalTransactions: 1250, alerts: 2 },
        recentActivity: [],
        isLoading: false,
        fetchDashboardData: jest.fn()
    })
}));
jest.mock('@/features/superadmin/hooks/useSuperadminTenants', () => ({
    useSuperadminTenants: () => ({
        tenants: [
            { id: '1', name: 'PT Graha Notaris', status: 'active' },
            { id: '2', name: 'KN Surya Hukum', status: 'active' }
        ],
        isLoading: false,
        fetchTenants: jest.fn()
    })
}));
jest.mock('@/features/superadmin/hooks/useSuperadminTransactions', () => ({
    useSuperadminTransactions: () => ({
        transactions: [
            { id: '1', tenant_name: 'PT Graha Notaris', amount: 500000, status: 'success' }
        ],
        isLoading: false,
        fetchTransactions: jest.fn()
    })
}));`
};

for (const [file, mock] of Object.entries(mocks)) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // insert mock after imports
        const lastImportIndex = content.lastIndexOf('import ');
        let insertIndex = content.indexOf('\n', lastImportIndex) + 1;
        content = content.slice(0, insertIndex) + '\n' + mock + '\n' + content.slice(insertIndex);
        fs.writeFileSync(file, content);
    }
}
