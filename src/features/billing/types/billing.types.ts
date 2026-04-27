export interface BillingPackage {
    annual_price: number;
    current_monthly_price: number;
    documents_per_month: string;
    features: string[];
    id: string;
    intro_monthly_price: number;
    is_promo_active: boolean;
    list_monthly_price: number;
    max_users: number;
    monthly_price: number;
    name: string;
    promo_badge?: string | null;
    promo_ends_at?: string | null;
    promo_starts_at?: string | null;
    status: string;
    storage_gb: number;
}

export interface BillingQuote {
    charge_amount: number;
    discount: number;
    subtotal: number;
    tax: number;
    total: number;
}

export interface BillingInvoice {
    amount: number;
    billing_cycle: string;
    discount_amount: number;
    due_date?: string | null;
    id: string;
    package_id?: string | null;
    paid_at?: string | null;
    period: string;
    status: string;
    subtotal_amount: number;
    tax_amount: number;
}

export interface PaymentMethodChannel {
    code: string;
    label: string;
}

export interface PaymentMethodGroup {
    channels: PaymentMethodChannel[];
    group: string;
    label: string;
}

export interface PaymentInstructionPayload {
    actions?: Array<{ name?: string; method?: string; url?: string }>;
    bill_key?: string | null;
    biller_code?: string | null;
    currency?: string | null;
    expiry_time?: string | null;
    gross_amount?: string | number | null;
    payment_channel?: string | null;
    payment_code?: string | null;
    payment_group?: string | null;
    payment_type?: string | null;
    permata_va_number?: string | null;
    qr_url?: string | null;
    redirect_url?: string | null;
    status_code?: string | null;
    store?: string | null;
    transaction_id?: string | null;
    transaction_status?: string | null;
    va_numbers?: Array<{ bank?: string; va_number?: string }>;
}

export interface BillingTransaction {
    amount: number;
    created_at?: string | null;
    description?: string | null;
    error_code?: string | null;
    expires_at?: string | null;
    id: string;
    instruction_payload?: PaymentInstructionPayload | null;
    invoice_id?: string | null;
    method: string;
    midtrans_order_id?: string | null;
    midtrans_transaction_id?: string | null;
    payment_channel?: string | null;
    payment_group?: string | null;
    provider?: string | null;
    provider_ref?: string | null;
    status: string;
    updated_at?: string | null;
}

export interface BillingSubscription {
    activated_at?: string | null;
    billing_phase: string;
    created_at?: string;
    expired_at?: string | null;
    id: string;
    package: BillingPackage | null;
    renewal_date?: string | null;
    start_date?: string | null;
    status: string;
    updated_at?: string;
}

export interface CheckoutContext {
    invoice: BillingInvoice | null;
    package: BillingPackage | null;
    payment_methods: PaymentMethodGroup[];
    quote: BillingQuote;
    subscription: BillingSubscription | null;
    transaction: BillingTransaction | null;
}

export interface PackagesResponse {
    data: BillingPackage[];
}

export interface CheckoutResponse {
    data: CheckoutContext;
    message?: string;
}
