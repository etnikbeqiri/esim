import { index as customersIndex, impersonate as customersImpersonate } from '@/actions/App/Http/Controllers/Admin/CustomerController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Ban,
    Building2,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    KeyRound,
    Loader2,
    LogIn,
    Pencil,
    Receipt,
    RefreshCw,
    User,
    XCircle,
} from 'lucide-react';

interface Order {
    id: number;
    uuid: string;
    order_number: string;
    status: string;
    status_label: string;
    status_color: string;
    type: string;
    amount: string | number;
    package_name: string | null;
    failure_reason: string | null;
    retry_count: number;
    created_at: string;
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Customer {
    id: number;
    type: string;
    type_label: string;
    discount_percentage: string | number;
    is_active: boolean;
    phone: string | null;
    company_name: string | null;
    vat_number: string | null;
    address: string | null;
    stripe_customer_id: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        email_verified_at: string | null;
    } | null;
    balance: {
        balance: string | number;
        reserved: string | number;
        available_balance: string | number;
    } | null;
}

interface Stats {
    total_orders: number;
    total_spent: number;
    completed_orders: number;
    failed_orders: number;
    pending_orders: number;
}

interface Invoice {
    id: number;
    uuid: string;
    invoice_number: string;
    type: string;
    type_label: string;
    status: string;
    status_label: string;
    status_color: string;
    total: number;
    invoice_date: string;
}

interface Props {
    customer: Customer;
    orders: PaginatedOrders;
    stats: Stats;
    invoices: Invoice[];
}

function getStatusBadgeClass(color: string): string {
    const colors: Record<string, string> = {
        green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
        purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[color] || colors.gray;
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'completed':
            return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
        case 'processing':
            return (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
            );
        case 'pending_retry':
            return <RefreshCw className="h-3.5 w-3.5 text-orange-500" />;
        case 'failed':
        case 'cancelled':
            return <XCircle className="h-3.5 w-3.5 text-red-500" />;
        case 'awaiting_payment':
        case 'pending':
            return <Clock className="h-3.5 w-3.5 text-yellow-500" />;
        default:
            return <AlertCircle className="h-3.5 w-3.5 text-gray-500" />;
    }
}

export default function CustomerShow({
    customer,
    orders,
    stats,
    invoices,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Customers', href: '/admin/customers' },
        {
            title: customer.user?.name || `Customer #${customer.id}`,
            href: `/admin/customers/${customer.id}`,
        },
    ];

    const impersonateForm = useForm({});
    const resetPasswordForm = useForm({ method: 'generate' });

    function handleImpersonate() {
        if (
            !confirm(
                `Are you sure you want to login as ${customer.user?.name}?`,
            )
        )
            return;
        impersonateForm.post(customersImpersonate.url(customer.id));
    }

    function handleResetPassword() {
        if (!confirm(`Generate a new password for ${customer.user?.email}?`))
            return;
        resetPasswordForm.post(
            `/admin/customers/${customer.id}/reset-password`,
        );
    }

    function goToPage(page: number) {
        router.get(
            `/admin/customers/${customer.id}`,
            { page },
            { preserveState: true, preserveScroll: true },
        );
    }

    const canFail = (status: string) =>
        ['awaiting_payment', 'pending_retry'].includes(status);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={customer.user?.name || `Customer #${customer.id}`} />
            <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4 p-4">
                    <div className="flex items-start gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            asChild
                        >
                            <Link href={customersIndex.url()}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-semibold">
                                    {customer.user?.name ||
                                        `Customer #${customer.id}`}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className={
                                        customer.type === 'b2b'
                                            ? 'border-blue-200 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'border-purple-200 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                    }
                                >
                                    {customer.type === 'b2b' ? (
                                        <Building2 className="mr-1 h-3 w-3" />
                                    ) : (
                                        <User className="mr-1 h-3 w-3" />
                                    )}
                                    {customer.type_label}
                                </Badge>
                                <Badge
                                    variant={
                                        customer.is_active
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {customer.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            {customer.user && (
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    {customer.user.email}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            {customer.user && (
                                <>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={handleImpersonate}
                                                disabled={
                                                    impersonateForm.processing
                                                }
                                            >
                                                {impersonateForm.processing ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <LogIn className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Login as this user
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={handleResetPassword}
                                                disabled={
                                                    resetPasswordForm.processing
                                                }
                                            >
                                                {resetPasswordForm.processing ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <KeyRound className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Reset password
                                        </TooltipContent>
                                    </Tooltip>
                                </>
                            )}
                        </TooltipProvider>
                        <Button size="sm" variant="outline" asChild>
                            <Link
                                href={`/admin/invoices/generate?customer_id=${customer.id}`}
                            >
                                <Receipt className="mr-1.5 h-3.5 w-3.5" />
                                Invoice
                            </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/customers/${customer.id}/edit`}>
                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-5xl space-y-6 px-4">
                    <div className="grid grid-cols-5 gap-px overflow-hidden rounded-lg border bg-border">
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                Total Orders
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {stats.total_orders}
                            </p>
                        </div>
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                Total Spent
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                €{Number(stats.total_spent).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                Completed
                            </p>
                            <p className="mt-1 text-lg font-semibold text-green-600">
                                {stats.completed_orders}
                            </p>
                        </div>
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                Pending
                            </p>
                            <p className="mt-1 text-lg font-semibold text-yellow-600">
                                {stats.pending_orders}
                            </p>
                        </div>
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                Failed
                            </p>
                            <p className="mt-1 text-lg font-semibold text-red-600">
                                {stats.failed_orders}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                            <h2 className="mb-4 text-sm font-medium">
                                Customer Details
                            </h2>
                            <div className="rounded-lg border">
                                <div className="divide-y">
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            Customer ID
                                        </span>
                                        <span className="font-mono text-sm">
                                            #{customer.id}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            Type
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={
                                                customer.type === 'b2b'
                                                    ? 'border-blue-200 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    : 'border-purple-200 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                            }
                                        >
                                            {customer.type_label}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            Discount
                                        </span>
                                        <span className="text-sm font-medium">
                                            {customer.discount_percentage}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            Email Verified
                                        </span>
                                        <Badge
                                            variant={
                                                customer.user?.email_verified_at
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {customer.user?.email_verified_at
                                                ? 'Yes'
                                                : 'No'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            Status
                                        </span>
                                        <Badge
                                            variant={
                                                customer.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {customer.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </div>
                                    {customer.stripe_customer_id && (
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Stripe ID
                                            </span>
                                            <code className="font-mono text-xs">
                                                {customer.stripe_customer_id}
                                            </code>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            Joined
                                        </span>
                                        <span className="text-sm">
                                            {new Date(
                                                customer.created_at,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="mb-4 text-sm font-medium">
                                {customer.type === 'b2b'
                                    ? 'Balance & Business Info'
                                    : 'Contact Info'}
                            </h2>
                            <div className="rounded-lg border">
                                <div className="divide-y">
                                    {customer.type === 'b2b' &&
                                        customer.balance && (
                                            <>
                                                <div className="flex items-center justify-between px-4 py-3">
                                                    <span className="text-sm text-muted-foreground">
                                                        Total Balance
                                                    </span>
                                                    <span className="text-sm font-medium">
                                                        €
                                                        {Number(
                                                            customer.balance
                                                                .balance,
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between px-4 py-3">
                                                    <span className="text-sm text-muted-foreground">
                                                        Reserved
                                                    </span>
                                                    <span className="text-sm text-orange-600">
                                                        €
                                                        {Number(
                                                            customer.balance
                                                                .reserved,
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between px-4 py-3">
                                                    <span className="text-sm text-muted-foreground">
                                                        Available
                                                    </span>
                                                    <span className="text-sm font-bold text-green-600">
                                                        €
                                                        {Number(
                                                            customer.balance
                                                                .available_balance,
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    {customer.company_name && (
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Company
                                            </span>
                                            <span className="text-sm">
                                                {customer.company_name}
                                            </span>
                                        </div>
                                    )}
                                    {customer.vat_number && (
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                VAT Number
                                            </span>
                                            <code className="font-mono text-xs">
                                                {customer.vat_number}
                                            </code>
                                        </div>
                                    )}
                                    {customer.phone && (
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Phone
                                            </span>
                                            <span className="text-sm">
                                                {customer.phone}
                                            </span>
                                        </div>
                                    )}
                                    {customer.address && (
                                        <div className="px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Address
                                            </span>
                                            <p className="mt-1 text-sm">
                                                {customer.address}
                                            </p>
                                        </div>
                                    )}
                                    {customer.type === 'b2c' &&
                                        !customer.phone &&
                                        !customer.address && (
                                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                                No contact info provided
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-medium">
                                Orders ({orders.total})
                            </h2>
                        </div>
                        <div className="rounded-lg border">
                            {orders.data.length === 0 ? (
                                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                    No orders yet
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Package</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="w-[80px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.data.map((order) => (
                                            <TableRow
                                                key={order.id}
                                                className="group"
                                            >
                                                <TableCell>
                                                    <Link
                                                        href={`/admin/orders/${order.uuid}`}
                                                        className="font-mono text-sm text-primary hover:underline"
                                                    >
                                                        {order.order_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {order.package_name || '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {order.type.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Badge
                                                                    variant="secondary"
                                                                    className={`${getStatusBadgeClass(order.status_color)} flex w-fit items-center gap-1`}
                                                                >
                                                                    {getStatusIcon(
                                                                        order.status,
                                                                    )}
                                                                    {
                                                                        order.status_label
                                                                    }
                                                                    {order.retry_count >
                                                                        0 && (
                                                                        <span className="ml-1 text-xs opacity-75">
                                                                            (
                                                                            {
                                                                                order.retry_count
                                                                            }
                                                                            )
                                                                        </span>
                                                                    )}
                                                                </Badge>
                                                            </TooltipTrigger>
                                                            {order.failure_reason && (
                                                                <TooltipContent className="max-w-xs">
                                                                    <p className="text-xs">
                                                                        {
                                                                            order.failure_reason
                                                                        }
                                                                    </p>
                                                                </TooltipContent>
                                                            )}
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                                <TableCell className="font-medium tabular-nums">
                                                    €
                                                    {Number(
                                                        order.amount,
                                                    ).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(
                                                        order.created_at,
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/admin/orders/${order.uuid}`}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        {canFail(
                                                            order.status,
                                                        ) && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                                            onClick={() => {
                                                                                if (
                                                                                    confirm(
                                                                                        'Mark this order as failed?',
                                                                                    )
                                                                                ) {
                                                                                    router.post(
                                                                                        `/admin/orders/${order.uuid}/fail`,
                                                                                        {
                                                                                            reason: 'Manually failed by admin',
                                                                                        },
                                                                                    );
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Ban className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        Mark as
                                                                        Failed
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>

                        {orders.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Page {orders.current_page} of{' '}
                                    {orders.last_page}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8"
                                        disabled={orders.current_page === 1}
                                        onClick={() =>
                                            goToPage(orders.current_page - 1)
                                        }
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8"
                                        disabled={
                                            orders.current_page ===
                                            orders.last_page
                                        }
                                        onClick={() =>
                                            goToPage(orders.current_page + 1)
                                        }
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {customer.type === 'b2b' && invoices.length > 0 && (
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-sm font-medium">
                                    Recent Invoices
                                </h2>
                                <Button variant="outline" size="sm" asChild>
                                    <Link
                                        href={`/admin/invoices?customer_id=${customer.id}`}
                                    >
                                        View All
                                    </Link>
                                </Button>
                            </div>
                            <div className="rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="w-[60px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoices.map((invoice) => (
                                            <TableRow
                                                key={invoice.id}
                                                className="group"
                                            >
                                                <TableCell>
                                                    <Link
                                                        href={`/admin/invoices/${invoice.uuid}`}
                                                        className="font-mono text-sm text-primary hover:underline"
                                                    >
                                                        {invoice.invoice_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {invoice.type_label}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className={getStatusBadgeClass(
                                                            invoice.status_color,
                                                        )}
                                                    >
                                                        {invoice.status_label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium tabular-nums">
                                                    €
                                                    {Number(
                                                        invoice.total,
                                                    ).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {invoice.invoice_date}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/admin/invoices/${invoice.uuid}`}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
