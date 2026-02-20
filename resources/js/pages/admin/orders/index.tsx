import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { useTrans } from '@/hooks/use-trans';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowUpDown,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clock,
    Eye,
    Loader2,
    RefreshCw,
    Search,
    XCircle,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface Order {
    id: number;
    uuid: string;
    order_number: string;
    status: string;
    status_label: string;
    status_color: string;
    type: string;
    amount: number;
    retry_count: number;
    max_retries: number;
    next_retry_at: string | null;
    failure_reason: string | null;
    created_at: string;
    customer: {
        id: number;
        user: { name: string; email: string } | null;
    } | null;
    package: { id: number; name: string } | null;
}

interface Currency {
    id: number;
    code: string;
    symbol: string;
}

interface Props {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        total: number;
    };
    statuses: { value: string; label: string; color: string }[];
    filters: {
        search?: string;
        status?: string;
        type?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
    };
    defaultCurrency: Currency | null;
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'completed':
            return <CheckCircle2 className="h-3.5 w-3.5" />;
        case 'processing':
            return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
        case 'pending_retry':
            return <RefreshCw className="h-3.5 w-3.5" />;
        case 'failed':
        case 'cancelled':
            return <XCircle className="h-3.5 w-3.5" />;
        case 'awaiting_payment':
        case 'pending':
            return <Clock className="h-3.5 w-3.5" />;
        default:
            return <AlertCircle className="h-3.5 w-3.5" />;
    }
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

function SortableHeader({
    column,
    label,
    currentSort,
    currentDir,
    onSort,
}: {
    column: string;
    label: string;
    currentSort?: string;
    currentDir?: 'asc' | 'desc';
    onSort: (column: string) => void;
}) {
    const isActive = currentSort === column;
    return (
        <TableHead
            className="cursor-pointer select-none hover:bg-muted/50"
            onClick={() => onSort(column)}
        >
            <div className="flex items-center gap-1">
                {label}
                {isActive ? (
                    currentDir === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )
                ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-30" />
                )}
            </div>
        </TableHead>
    );
}

export default function OrdersIndex({
    orders,
    statuses,
    filters,
    defaultCurrency,
}: Props) {
    const { trans } = useTrans();
    const [search, setSearch] = useState(filters.search || '');
    const currencySymbol = defaultCurrency?.symbol || '€';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: trans('admin.dashboard.title'), href: '/dashboard' },
        { title: trans('admin.orders.title'), href: '/admin/orders' },
    ];

    const hasActiveOrders = orders.data.some((order) =>
        ['processing', 'pending_retry', 'pending', 'awaiting_payment'].includes(
            order.status,
        ),
    );

    useEffect(() => {
        if (!hasActiveOrders) return;
        const interval = setInterval(() => {
            router.reload({
                only: ['orders'],
                preserveState: true,
                preserveScroll: true,
            } as Parameters<typeof router.reload>[0]);
        }, 5000);
        return () => clearInterval(interval);
    }, [hasActiveOrders]);

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            '/admin/orders',
            { ...filters, search },
            { preserveState: true },
        );
    }

    function handleFilterChange(key: string, value: string) {
        const newFilters = {
            ...filters,
            [key]: value === 'all' ? undefined : value,
        };
        router.get('/admin/orders', newFilters, { preserveState: true });
    }

    function handleSort(column: string) {
        const newDir =
            filters.sort_by === column && filters.sort_dir === 'asc'
                ? 'desc'
                : 'asc';
        router.get(
            '/admin/orders',
            { ...filters, sort_by: column, sort_dir: newDir },
            { preserveState: true },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={trans('admin.orders.title')} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">
                        {trans('admin.orders.title')}
                    </h1>
                    <span className="text-sm text-muted-foreground">
                        {orders.total} orders
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder={trans(
                                    'admin.orders.search_placeholder',
                                )}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 w-[200px] pl-9"
                            />
                        </div>
                    </form>

                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(v) => handleFilterChange('status', v)}
                    >
                        <SelectTrigger className="h-9 w-[140px]">
                            <SelectValue
                                placeholder={trans(
                                    'admin.orders.filter.all_statuses',
                                )}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {trans('admin.orders.filter.all_statuses')}
                            </SelectItem>
                            {statuses.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.type || 'all'}
                        onValueChange={(v) => handleFilterChange('type', v)}
                    >
                        <SelectTrigger className="h-9 w-[100px]">
                            <SelectValue
                                placeholder={trans(
                                    'admin.orders.filter.type_placeholder',
                                )}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {trans('admin.orders.filter.all_types')}
                            </SelectItem>
                            <SelectItem value="b2b">
                                {trans('admin.orders.filter.type_b2b')}
                            </SelectItem>
                            <SelectItem value="b2c">
                                {trans('admin.orders.filter.type_b2c')}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {(filters.search ||
                        filters.status ||
                        filters.type ||
                        filters.sort_by) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9"
                            onClick={() =>
                                router.get(
                                    '/admin/orders',
                                    {},
                                    { preserveState: true },
                                )
                            }
                        >
                            Clear
                        </Button>
                    )}
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <SortableHeader
                                    column="order_number"
                                    label="Order"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="customer"
                                    label="Customer"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="package"
                                    label="Package"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="type"
                                    label="Type"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="status"
                                    label="Status"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="amount"
                                    label="Amount"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="created_at"
                                    label="Date"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        {trans('admin.orders.table.no_orders')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.data.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        className={`group ${
                                            order.status === 'failed'
                                                ? 'bg-red-50/50 dark:bg-red-950/10'
                                                : order.status ===
                                                    'pending_retry'
                                                  ? 'bg-orange-50/50 dark:bg-orange-950/10'
                                                  : ''
                                        }`}
                                    >
                                        <TableCell>
                                            <Link
                                                href={`/admin/orders/${order.uuid}`}
                                                className="font-mono text-sm text-primary hover:underline"
                                            >
                                                {order.order_number}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {order.customer?.user ? (
                                                <div>
                                                    <Link
                                                        href={`/admin/customers/${order.customer.id}`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {
                                                            order.customer.user
                                                                .name
                                                        }
                                                    </Link>
                                                    <div className="text-xs text-muted-foreground">
                                                        {
                                                            order.customer.user
                                                                .email
                                                        }
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-[150px] truncate">
                                            {order.package ? (
                                                <Link
                                                    href={`/admin/packages/${order.package.id}`}
                                                    className="text-muted-foreground hover:text-foreground hover:underline"
                                                >
                                                    {order.package.name}
                                                </Link>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {order.type.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <Badge
                                                    variant="secondary"
                                                    className={`${getStatusBadgeClass(order.status_color)} flex w-fit items-center gap-1`}
                                                >
                                                    {getStatusIcon(
                                                        order.status,
                                                    )}
                                                    {order.status_label}
                                                </Badge>
                                                {order.status ===
                                                    'pending_retry' && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <div className="space-y-1">
                                                                    <div className="text-xs text-orange-600">
                                                                        Retry{' '}
                                                                        {
                                                                            order.retry_count
                                                                        }
                                                                        /
                                                                        {
                                                                            order.max_retries
                                                                        }
                                                                    </div>
                                                                    <Progress
                                                                        value={
                                                                            (order.retry_count /
                                                                                order.max_retries) *
                                                                            100
                                                                        }
                                                                        className="h-1 w-16"
                                                                    />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent
                                                                side="bottom"
                                                                className="max-w-xs"
                                                            >
                                                                {order.failure_reason && (
                                                                    <p className="text-sm text-red-400">
                                                                        {
                                                                            order.failure_reason
                                                                        }
                                                                    </p>
                                                                )}
                                                                {order.next_retry_at && (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Next:{' '}
                                                                        {
                                                                            order.next_retry_at
                                                                        }
                                                                    </p>
                                                                )}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                                {order.status === 'failed' &&
                                                    order.failure_reason && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <div className="flex cursor-help items-center gap-1 text-xs text-red-600">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        <span className="max-w-[80px] truncate">
                                                                            {
                                                                                order.failure_reason
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent
                                                                    side="bottom"
                                                                    className="max-w-xs"
                                                                >
                                                                    <p className="text-sm">
                                                                        {
                                                                            order.failure_reason
                                                                        }
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium tabular-nums">
                                            {currencySymbol}
                                            {Number(order.amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                                            {order.created_at}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                                asChild
                                            >
                                                <Link
                                                    href={`/admin/orders/${order.uuid}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {orders.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Page {orders.current_page} of {orders.last_page}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                disabled={orders.current_page === 1}
                                onClick={() =>
                                    router.get('/admin/orders', {
                                        ...filters,
                                        page: orders.current_page - 1,
                                    })
                                }
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                disabled={
                                    orders.current_page === orders.last_page
                                }
                                onClick={() =>
                                    router.get('/admin/orders', {
                                        ...filters,
                                        page: orders.current_page + 1,
                                    })
                                }
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
