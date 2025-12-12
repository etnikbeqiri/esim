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
