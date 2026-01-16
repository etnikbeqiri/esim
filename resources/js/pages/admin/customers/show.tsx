import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    KeyRound,
    Loader2,
    LogIn,
    Pencil,
    Receipt,
    RefreshCw,
    ShoppingCart,
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
        green: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        gray: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
        purple: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        orange: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    };
    return colors[color] || colors.gray;
}

function getStatusIcon(status: string, size = 'h-3 w-3') {
    switch (status) {
        case 'completed':
            return <CheckCircle2 className={`${size} text-green-500`} />;
        case 'processing':
            return <Loader2 className={`${size} animate-spin text-blue-500`} />;
        case 'pending_retry':
            return <RefreshCw className={`${size} text-orange-500`} />;
        case 'failed':
        case 'cancelled':
            return <XCircle className={`${size} text-red-500`} />;
        case 'awaiting_payment':
        case 'pending':
            return <Clock className={`${size} text-yellow-500`} />;
        default:
            return <AlertCircle className={`${size} text-gray-500`} />;
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
        impersonateForm.post(`/admin/customers/${customer.id}/impersonate`);
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
            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/customers">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold">
                                {customer.user?.name ||
                                    `Customer #${customer.id}`}
                            </h1>
                            {!customer.is_active && (
                                <Badge variant="destructive">Inactive</Badge>
                            )}
                        </div>
                        {customer.user && (
                            <p className="text-muted-foreground">
                                {customer.user.email}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={
                                customer.type === 'b2b'
                                    ? 'border-blue-200 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'border-purple-200 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            }
                        >
                            {customer.type.toUpperCase()}
                        </Badge>
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
                        <Button variant="outline" size="sm" asChild>
                            <Link
                                href={`/admin/invoices/generate?customer_id=${customer.id}`}
                            >
                                <Receipt className="mr-2 h-4 w-4" />
                                Generate Invoice
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/customers/${customer.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Orders
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {stats.total_orders}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Spent
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                €{Number(stats.total_spent).toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.completed_orders}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-yellow-600">
                                {stats.pending_orders}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                                <XCircle className="h-4 w-4 text-red-500" />
                                Failed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-red-600">
                                {stats.failed_orders}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Details Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Customer ID
                                </span>
                                <span className="font-mono">
                                    #{customer.id}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
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
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Discount
                                </span>
                                <span className="font-medium">
                                    {customer.discount_percentage}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
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
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Status
                                </span>
                                <Badge
                                    variant={
                                        customer.is_active
                                            ? 'default'
                                            : 'destructive'
                                    }
                                >
                                    {customer.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            {customer.stripe_customer_id && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Stripe ID
                                    </span>
                                    <span className="font-mono text-xs">
                                        {customer.stripe_customer_id}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Joined
                                </span>
                                <span>
                                    {new Date(
                                        customer.created_at,
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {customer.type === 'b2b' ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Balance & Business Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {customer.balance && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Total Balance
                                            </span>
                                            <span className="font-medium">
                                                €
                                                {Number(
                                                    customer.balance.balance,
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Reserved
                                            </span>
                                            <span className="text-orange-600">
                                                €
                                                {Number(
                                                    customer.balance.reserved,
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Available
                                            </span>
                                            <span className="font-bold text-green-600">
                                                €
                                                {Number(
                                                    customer.balance
                                                        .available_balance,
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                        <hr className="my-2" />
                                    </>
                                )}
                                {customer.company_name && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Company
                                        </span>
                                        <span>{customer.company_name}</span>
                                    </div>
                                )}
                                {customer.vat_number && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            VAT Number
                                        </span>
                                        <span className="font-mono text-sm">
                                            {customer.vat_number}
                                        </span>
                                    </div>
                                )}
                                {customer.phone && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Phone
                                        </span>
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div>
                                        <span className="text-muted-foreground">
                                            Address
                                        </span>
                                        <p className="mt-1 text-sm">
                                            {customer.address}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {customer.phone && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Phone
                                        </span>
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div>
                                        <span className="text-muted-foreground">
                                            Address
                                        </span>
                                        <p className="mt-1 text-sm">
                                            {customer.address}
                                        </p>
                                    </div>
                                )}
                                {!customer.phone && !customer.address && (
                                    <p className="py-4 text-center text-muted-foreground">
                                        No contact info provided
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Orders Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Orders
                        </CardTitle>
                        {orders.total > 0 && (
                            <span className="text-sm text-muted-foreground">
                                Showing {orders.from}-{orders.to} of{' '}
                                {orders.total}
                            </span>
                        )}
                    </CardHeader>
                    <CardContent>
                        {orders.data.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">
                                No orders yet
                            </p>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Package</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.data.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>
                                                    <Link
                                                        href={`/admin/orders/${order.uuid}`}
                                                        className="font-mono text-sm text-primary hover:underline"
                                                    >
                                                        {order.order_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">
                                                        {order.package_name ||
                                                            '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
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
                                                                    variant="outline"
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
                                                <TableCell className="font-medium">
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
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/admin/orders/${order.uuid}`}
                                                            >
                                                                View
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

                                {/* Pagination */}
                                {orders.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                                        <p className="text-sm text-muted-foreground">
                                            Page {orders.current_page} of{' '}
                                            {orders.last_page}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    goToPage(
                                                        orders.current_page - 1,
                                                    )
                                                }
                                                disabled={
                                                    orders.current_page === 1
                                                }
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    goToPage(
                                                        orders.current_page + 1,
                                                    )
                                                }
                                                disabled={
                                                    orders.current_page ===
                                                    orders.last_page
                                                }
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Invoices Table (B2B only) */}
                {customer.type === 'b2b' && invoices.length > 0 && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                Recent Invoices
                            </CardTitle>
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={`/admin/invoices?customer_id=${customer.id}`}
                                >
                                    View All
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell>
                                                <Link
                                                    href={`/admin/invoices/${invoice.uuid}`}
                                                    className="font-mono text-sm text-primary hover:underline"
                                                >
                                                    {invoice.invoice_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {invoice.type_label}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={getStatusBadgeClass(
                                                        invoice.status_color,
                                                    )}
                                                >
                                                    {invoice.status_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                €
                                                {Number(invoice.total).toFixed(
                                                    2,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {invoice.invoice_date}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/admin/invoices/${invoice.uuid}`}
                                                    >
                                                        View
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
