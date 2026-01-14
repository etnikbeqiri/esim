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
import { AlertCircle, CheckCircle2, Clock, Eye, Loader2, RefreshCw, Search, XCircle } from 'lucide-react';
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
        user: { name: string; email: string } | null;
    } | null;
    package: { name: string } | null;
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
    };
    defaultCurrency: Currency | null;
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

    // Poll for updates when there are active orders
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
            });
        }, 5000); // Poll every 5 seconds for admin

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

    function getStatusIcon(status: string) {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="h-4 w-4" />;
            case 'processing':
                return <Loader2 className="h-4 w-4 animate-spin" />;
            case 'pending_retry':
                return <RefreshCw className="h-4 w-4" />;
            case 'failed':
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            case 'awaiting_payment':
            case 'pending':
                return <Clock className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    }

    function getStatusBadgeClass(color: string): string {
        const colors: Record<string, string> = {
            green: 'bg-green-100 text-green-700 border-green-200',
            yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            red: 'bg-red-100 text-red-700 border-red-200',
            blue: 'bg-blue-100 text-blue-700 border-blue-200',
            gray: 'bg-gray-100 text-gray-700 border-gray-200',
            purple: 'bg-purple-100 text-purple-700 border-purple-200',
            orange: 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return colors[color] || colors.gray;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={trans('admin.orders.title')} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        {trans('admin.orders.title')}
                    </h1>
                    <span className="text-muted-foreground">
                        {trans('admin.orders.total_orders_count', {
                            count: orders.total,
                        })}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2">
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
                                className="w-[200px] pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            {trans('admin.orders.search_button')}
                        </Button>
                    </form>

                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(v) => handleFilterChange('status', v)}
                    >
                        <SelectTrigger className="w-[160px]">
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
                                    <span className="flex items-center gap-2">
                                        <span
                                            className={`h-2 w-2 rounded-full bg-${s.color}-500`}
                                        />
                                        {s.label}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.type || 'all'}
                        onValueChange={(v) => handleFilterChange('type', v)}
                    >
                        <SelectTrigger className="w-[100px]">
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
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    {trans('admin.orders.table.order_number')}
                                </TableHead>
                                <TableHead>
                                    {trans('admin.orders.table.customer')}
                                </TableHead>
                                <TableHead>
                                    {trans('admin.orders.table.package')}
                                </TableHead>
                                <TableHead>
                                    {trans('admin.orders.table.type')}
                                </TableHead>
                                <TableHead>
                                    {trans('admin.orders.table.status')}
                                </TableHead>
                                <TableHead>
                                    {trans('admin.orders.table.amount')}
                                </TableHead>
                                <TableHead>
                                    {trans('admin.orders.table.date')}
                                </TableHead>
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
                                        className={
                                            order.status === 'failed'
                                                ? 'bg-red-50/50 dark:bg-red-950/20'
                                                : order.status ===
                                                    'pending_retry'
                                                  ? 'bg-orange-50/50 dark:bg-orange-950/20'
                                                  : ''
                                        }
                                    >
                                        <TableCell className="font-mono">
                                            {order.order_number}
                                        </TableCell>
                                        <TableCell>
                                            {order.customer?.user ? (
                                                <div>
                                                    <div className="font-medium">
                                                        {
                                                            order.customer.user
                                                                .name
                                                        }
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {
                                                            order.customer.user
                                                                .email
                                                        }
                                                    </div>
                                                </div>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-[150px] truncate">
                                            {order.package?.name || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {order.type.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <Badge
                                                    variant="outline"
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
                                                                        {trans(
                                                                            'admin.orders.retry_info',
                                                                            {
                                                                                count: order.retry_count,
                                                                                max: order.max_retries,
                                                                            },
                                                                        )}
                                                                    </div>
                                                                    <Progress
                                                                        value={
                                                                            (order.retry_count /
                                                                                order.max_retries) *
                                                                            100
                                                                        }
                                                                        className="h-1 w-20"
                                                                    />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent
                                                                side="bottom"
                                                                className="max-w-xs"
                                                            >
                                                                <p className="font-semibold">
                                                                    {trans(
                                                                        'admin.orders.retry_info_title',
                                                                    )}
                                                                </p>
                                                                {order.failure_reason && (
                                                                    <p className="mt-1 text-sm text-red-400">
                                                                        {
                                                                            order.failure_reason
                                                                        }
                                                                    </p>
                                                                )}
                                                                {order.next_retry_at && (
                                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                                        {trans(
                                                                            'admin.orders.next_retry',
                                                                            {
                                                                                date: order.next_retry_at,
                                                                            },
                                                                        )}
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
                                                                        <span className="max-w-[100px] truncate">
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
                                                                    <p className="font-semibold text-red-400">
                                                                        {trans(
                                                                            'admin.orders.failure_reason',
                                                                        )}
                                                                    </p>
                                                                    <p className="mt-1 text-sm">
                                                                        {
                                                                            order.failure_reason
                                                                        }
                                                                    </p>
                                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                                        {trans(
                                                                            'admin.orders.retries_count',
                                                                            {
                                                                                count: order.retry_count,
                                                                                max: order.max_retries,
                                                                            },
                                                                        )}
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {currencySymbol}
                                            {Number(order.amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-muted-foreground">
                                            {order.created_at}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
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
                    <div className="flex justify-center gap-2">
                        {Array.from(
                            { length: Math.min(orders.last_page, 10) },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <Button
                                key={page}
                                variant={
                                    page === orders.current_page
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                    router.get('/admin/orders', {
                                        ...filters,
                                        page,
                                    })
                                }
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
