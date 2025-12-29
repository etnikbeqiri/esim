import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface LocaleOption {
    code: string;
    name: string;
    nativeName: string;
}

export interface ContactInfo {
    supportEmail: string;
    legalEmail: string;
    privacyEmail: string;
    phone: string | null;
    whatsapp: string | null;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    impersonating: boolean;
    flash: {
        success?: string;
        error?: string;
    };
    currency: {
        code: string;
        symbol: string;
        name: string;
    };
    locale: string;
    availableLocales: LocaleOption[];
    contact: ContactInfo;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    // Role/type information
    is_admin: boolean;
    is_b2b: boolean;
    is_b2c: boolean;
    customer_type: 'b2b' | 'b2c';
    has_customer: boolean;
    // Balance for B2B users
    balance?: {
        available: number;
        reserved: number;
        total: number;
    } | null;
    [key: string]: unknown;
}

// Invoice Types
export interface InvoiceLineItem {
    description: string;
    details?: string;
    quantity?: number;
    unit_price: number;
    total: number;
    // For statements
    date?: string;
    type?: string;
    debit?: number | null;
    credit?: number | null;
    balance?: number;
}

export interface SellerDetails {
    company_name: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
    vat_number: string;
    registration_number: string;
    email: string;
    phone: string;
    bank_name?: string;
    bank_iban?: string;
    bank_swift?: string;
}

export interface BuyerDetails {
    company_name: string;
    contact_name: string;
    email: string;
    address: string;
    vat_number: string;
    phone: string;
}

export interface InvoiceListItem {
    uuid: string;
    invoice_number: string;
    type: 'top_up' | 'purchase' | 'statement';
    type_label: string;
    status: 'draft' | 'issued' | 'paid' | 'voided';
    status_label: string;
    status_color: 'gray' | 'blue' | 'green' | 'red';
    invoice_date: string;
    total: number;
    currency_code: string;
    formatted_total: string;
}

export interface Invoice {
    uuid: string;
    invoice_number: string;
    type: 'top_up' | 'purchase' | 'statement';
    type_label: string;
    status: 'draft' | 'issued' | 'paid' | 'voided';
    status_label: string;
    status_color: 'gray' | 'blue' | 'green' | 'red';
    invoice_date: string;
    due_date: string | null;
    issued_at: string | null;
    paid_at: string | null;
    subtotal: number;
    vat_rate: number;
    vat_amount: number;
    total: number;
    currency_code: string;
    balance_before: number | null;
    balance_after: number | null;
    payment_method: string | null;
    payment_reference: string | null;
    line_items: InvoiceLineItem[];
    notes: string | null;
    is_top_up: boolean;
    is_purchase: boolean;
    is_statement: boolean;
}

export interface InvoiceViewData {
    invoice: Invoice;
    seller: SellerDetails;
    buyer: BuyerDetails;
    currency: {
        code: string;
        symbol: string;
    };
}

// Invoice Generator Types
export interface CustomerSearchResult {
    id: number;
    name: string | null;
    email: string | null;
    company_name: string | null;
    type: 'b2b' | 'b2c';
    has_balance: boolean;
}

export interface UninvoicedOrder {
    id: number;
    uuid: string;
    order_number: string;
    type: 'b2b' | 'b2c';
    amount: number;
    package_name: string | null;
    completed_at: string;
}

export interface UninvoicedTransaction {
    id: number;
    uuid: string;
    amount: number;
    description: string | null;
    balance_before: number;
    balance_after: number;
    payment_method: string | null;
    created_at: string;
}
