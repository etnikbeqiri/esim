import { index as ordersIndex } from '@/actions/App/Http/Controllers/Client/OrderController';
import { index as packagesIndex } from '@/actions/App/Http/Controllers/Client/PackageController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CountryFlag } from '@/components/country-flag';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTrans } from '@/hooks/use-trans';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronRight as ArrowRight,
    Clock,
    Loader2,
    Package,
    RefreshCw,
    ShoppingCart,
    XCircle,
} from 'lucide-react';
import { useEffect } from 'react';

interface Order {
    uuid: string;
    order_number: string;
    status: string;
    status_label: string;
    status_color: string;
    type: string;
    amount: string;
    package: {
        name: string;
        data_label: string;
        validity_label: string;
        country: string | null;
        country_iso: string | null;
    } | null;
    has_esim: boolean;
    payment_status: string | null;
    retry_count: number;
    max_retries: number;
    next_retry_at: string | null;
    failure_reason: string | null;
    created_at: string;
    completed_at: string | null;
}

interface Customer {
    is_b2b: boolean;
    balance: number | null;
}

interface Props {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        status?: string;
    };
    customer: Customer | null;
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'completed':
            return <CheckCircle2 className="h-3.5 w-3.5" />;
        case 'processing':
        case 'provider_purchased':
            return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
        case 'pending_retry':
            return <RefreshCw className="h-3.5 w-3.5" />;
        case 'failed':
            return <XCircle className="h-3.5 w-3.5" />;
        case 'awaiting_payment':
        case 'pending':
            return <Clock className="h-3.5 w-3.5" />;
        default:
            return <Clock className="h-3.5 w-3.5" />;
    }
}

function getStatusStyle(color: string): string {
    const colors: Record<string, string> = {
        green: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20',
        yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:ring-yellow-500/20',
        red: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
        blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20',
        gray: 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20',
        orange: 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20',
    };
    return colors[color] || colors.gray;
}

export default function OrdersIndex({ orders, filters }: Props) {
    const { trans } = useTrans();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: trans('nav.destinations'), href: packagesIndex.url() },
        { title: trans('client_orders.title'), href: ordersIndex.url() },
    ];

    const hasActiveOrders = orders.data.some((order) =>
        [
            'processing',
            'provider_purchased',
            'pending_retry',
            'pending',
            'awaiting_payment',
        ].includes(order.status),
    );

    useEffect(() => {
        if (!hasActiveOrders) return;

        const interval = setInterval(() => {
            router.reload({
                only: ['orders'],
                preserveState: true,
                preserveScroll: true,
            } as Parameters<typeof router.reload>[0]);
        }, 3000);

        return () => clearInterval(interval);
    }, [hasActiveOrders]);

    function handleFilterChange(key: string, value: string) {
        const newFilters = {
            ...filters,
            [key]: value === 'all' ? undefined : value,
        };
        router.get(ordersIndex.url(), newFilters, { preserveState: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={trans('client_orders.title')} />
            <div className="mx-auto w-full max-w-4xl space-y-5 p-4 md:space-y-6 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold md:text-2xl">
                            {trans('client_orders.title')}
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {orders.total} {trans('client_orders.order').toLowerCase()}
                            {orders.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button asChild size="sm" className="gap-2">
                        <Link href={packagesIndex.url()}>
                            <ShoppingCart className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                {trans('client_orders.new_order')}
                            </span>
                        </Link>
                    </Button>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2">
                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(v) => handleFilterChange('status', v)}
                    >
                        <SelectTrigger className="h-9 w-[160px]">
                            <SelectValue
                                placeholder={trans('client_orders.all_statuses')}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {trans('client_orders.all_statuses')}
                            </SelectItem>
                            <SelectItem value="pending">
                                {trans('client_orders.statuses.pending')}
                            </SelectItem>
                            <SelectItem value="awaiting_payment">
                                {trans('client_orders.statuses.awaiting_payment')}
                            </SelectItem>
                            <SelectItem value="processing">
                                {trans('client_orders.statuses.processing')}
                            </SelectItem>
                            <SelectItem value="pending_retry">
                                {trans('client_orders.statuses.pending_retry')}
                            </SelectItem>
                            <SelectItem value="completed">
                                {trans('client_orders.statuses.completed')}
                            </SelectItem>
                            <SelectItem value="failed">
                                {trans('client_orders.statuses.failed')}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {filters.status && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 text-xs"
                            onClick={() =>
                                router.get(
                                    ordersIndex.url(),
                                    {},
                                    { preserveState: true },
                                )
                            }
                        >
                            Clear
                        </Button>
                    )}
                </div>

                {/* Order list */}
                {orders.data.length === 0 ? (
                    <div className="rounded-xl border bg-card">
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="mb-4 rounded-full bg-muted p-4">
                                <Package className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <h3 className="text-base font-semibold">
                                {trans('client_orders.no_orders')}
                            </h3>
                            <p className="mt-1 mb-5 max-w-xs text-center text-sm text-muted-foreground">
                                {trans('client_orders.no_orders_desc')}
                            </p>
                            <Button asChild>
                                <Link href={packagesIndex.url()}>
                                    {trans('client_orders.browse_packages')}
                                </Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y rounded-xl border bg-card">
                        {orders.data.map((order) => (
                            <Link
                                key={order.uuid}
                                href={`/client/orders/${order.uuid}`}
                                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50 md:gap-5 md:py-5"
                            >
                                {/* Flag / Icon */}
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted md:h-14 md:w-14">
                                    {order.package?.country_iso ? (
                                        <CountryFlag
                                            countryCode={order.package.country_iso}
                                            size="md"
                                        />
                                    ) : (
                                        <Package className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-foreground md:text-base">
                                                {order.package?.name || order.order_number}
                                            </p>
                                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                                                {order.package && (
                                                    <span>
                                                        {order.package.data_label} &middot;{' '}
                                                        {order.package.validity_label}
                                                    </span>
                                                )}
                                                <span>{order.created_at}</span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-semibold tabular-nums text-foreground md:text-base">
                                                €{Number(order.amount).toFixed(2)}
                                            </p>
                                            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                                                {order.order_number}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bottom row: status + arrow */}
                                    <div className="mt-2.5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className={`${getStatusStyle(order.status_color)} inline-flex items-center gap-1 ring-1 ring-inset`}
                                            >
                                                {getStatusIcon(order.status)}
                                                {order.status_label}
                                            </Badge>

                                            {/* Retry info */}
                                            {order.status === 'pending_retry' && (
                                                <span className="text-[11px] text-orange-600 dark:text-orange-400">
                                                    Retry {order.retry_count}/{order.max_retries}
                                                </span>
                                            )}

                                            {/* Failure reason */}
                                            {order.status === 'failed' && order.failure_reason && (
                                                <span className="max-w-[200px] truncate text-[11px] text-red-600 dark:text-red-400">
                                                    {order.failure_reason}
                                                </span>
                                            )}
                                        </div>

                                        <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
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
                                    router.get(ordersIndex.url(), {
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
                                    router.get(ordersIndex.url(), {
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
