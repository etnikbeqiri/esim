import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CountryFlag } from '@/components/country-flag';
import { Progress } from '@/components/ui/progress';
import { useTrans } from '@/hooks/use-trans';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Building2,
    CheckCircle2,
    ChevronRight,
    Clock,
    CreditCard,
    Globe,
    Loader2,
    Package,
    RefreshCw,
    ShoppingCart,
    Smartphone,
    Wallet,
    Wifi,
    XCircle,
} from 'lucide-react';

interface Customer {
    type: string;
    type_label: string;
    is_b2b: boolean;
    balance: number | null;
    available_balance: number | null;
    reserved_balance: number | null;
    discount_percentage: string;
    display_name: string;
    company_name: string | null;
}

interface RecentOrder {
    uuid: string;
    order_number: string;
    status: string;
    status_label: string;
    status_color: string;
    amount: string;
    package_name: string | null;
    country_name: string | null;
    country_iso: string | null;
    data_label: string | null;
    has_esim: boolean;
    esim_status: string | null;
    created_at: string;
    created_at_date: string;
}

interface ActiveEsim {
    order_uuid: string;
    iccid: string;
    status: string;
    country: string | null;
    country_iso: string | null;
    data_used_bytes: number;
    data_total_bytes: number;
    package_name: string | null;
}

interface BalanceTransaction {
    id: number;
    type: string;
    type_label: string;
    amount: number;
    balance_after: number;
    description: string | null;
    created_at: string;
}

interface Stats {
    total_orders: number;
    completed_orders: number;
    pending_orders: number;
    active_esims: number;
    total_spent: number;
    spent_this_month: number;
}

interface Props {
    customer: Customer | null;
    recentOrders: RecentOrder[];
    activeEsims: ActiveEsim[];
    balanceHistory: BalanceTransaction[];
    stats: Stats | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/client' },
];

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
        case 'cancelled':
            return <XCircle className="h-3.5 w-3.5" />;
        case 'awaiting_payment':
        case 'pending':
            return <Clock className="h-3.5 w-3.5" />;
        default:
            return null;
    }
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatCurrency(amount: number | string): string {
    return `€${Number(amount).toFixed(2)}`;
}

export default function ClientDashboard({
    customer,
    recentOrders,
    activeEsims,
    balanceHistory,
    stats,
}: Props) {
    const { trans } = useTrans();
    const isB2B = customer?.is_b2b ?? false;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={trans('client_dashboard.welcome')} />
            <div className="mx-auto w-full max-w-4xl space-y-5 p-4 md:space-y-6 md:p-6">
                {/* Welcome header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold md:text-2xl">
                            {trans('client_dashboard.welcome')}
                            {customer ? `, ${customer.display_name}` : ''}
                        </h1>
                        <div className="mt-1 flex items-center gap-2">
                            {customer && (
                                <Badge
                                    variant="secondary"
                                    className="text-xs ring-1 ring-inset ring-gray-600/10"
                                >
                                    {isB2B ? (
                                        <Building2 className="mr-1 h-3 w-3" />
                                    ) : null}
                                    {customer.type_label}
                                </Badge>
                            )}
                            {isB2B &&
                                customer?.company_name && (
                                    <span className="text-sm text-muted-foreground">
                                        {customer.company_name}
                                    </span>
                                )}
                            {customer?.discount_percentage &&
                                Number(customer.discount_percentage) > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-green-50 text-xs text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400"
                                    >
                                        {customer.discount_percentage}% discount
                                    </Badge>
                                )}
                        </div>
                    </div>
                    <Button asChild size="sm" className="gap-2">
                        <Link href="/client/packages">
                            <Globe className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                {trans('client_dashboard.browse_packages')}
                            </span>
                        </Link>
                    </Button>
                </div>

                {/* Stats row */}
                <div className="rounded-xl border bg-card">
                    <div
                        className={`grid divide-y md:divide-x md:divide-y-0 ${isB2B ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}
                    >
                        {isB2B && (
                            <Link
                                href="/client/balance"
                                className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 dark:bg-green-500/10">
                                    <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">
                                        {trans('client_dashboard.available_balance')}
                                    </p>
                                    <p className="text-lg font-semibold tabular-nums text-green-600 dark:text-green-400">
                                        {formatCurrency(customer?.available_balance || 0)}
                                    </p>
                                </div>
                            </Link>
                        )}
                        <div className="flex items-center gap-3 px-5 py-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    {trans('client_dashboard.total_orders')}
                                </p>
                                <p className="text-lg font-semibold tabular-nums">
                                    {stats?.total_orders ?? 0}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 dark:bg-green-500/10">
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    {trans('client_dashboard.completed')}
                                </p>
                                <p className="text-lg font-semibold tabular-nums">
                                    {stats?.completed_orders ?? 0}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                                <Wifi className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    {trans('client_dashboard.active_esims')}
                                </p>
                                <p className="text-lg font-semibold tabular-nums">
                                    {stats?.active_esims ?? 0}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    {trans('client_dashboard.total_spent')}
                                </p>
                                <p className="text-lg font-semibold tabular-nums">
                                    {formatCurrency(stats?.total_spent ?? 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active eSIMs */}
                {activeEsims.length > 0 && (
                    <div className="rounded-xl border bg-card">
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <div className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                <h2 className="text-base font-semibold">
                                    {trans('client_dashboard.your_active_esims')}
                                </h2>
                            </div>
                        </div>
                        <div className="divide-y">
                            {activeEsims.map((esim) => {
                                const usagePercent =
                                    esim.data_total_bytes > 0
                                        ? (esim.data_used_bytes /
                                              esim.data_total_bytes) *
                                          100
                                        : 0;
                                return (
                                    <Link
                                        key={esim.iccid}
                                        href={`/client/orders/${esim.order_uuid}`}
                                        className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                                            {esim.country_iso ? (
                                                <CountryFlag
                                                    countryCode={esim.country_iso}
                                                    size="md"
                                                />
                                            ) : (
                                                <Wifi className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate text-sm font-semibold">
                                                            {esim.country || esim.package_name}
                                                        </p>
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-green-50 text-[11px] text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400"
                                                        >
                                                            {esim.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {esim.package_name}
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                                            </div>
                                            <div className="mt-2.5">
                                                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>
                                                        {trans('client_dashboard.data_used')}
                                                    </span>
                                                    <span className="tabular-nums">
                                                        {formatBytes(esim.data_used_bytes)} /{' '}
                                                        {formatBytes(esim.data_total_bytes)}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={usagePercent}
                                                    className="h-1.5"
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recent Orders + Balance History */}
                <div className={`grid gap-5 md:gap-6 ${isB2B && balanceHistory.length > 0 ? 'lg:grid-cols-2' : ''}`}>
                    {/* Recent Orders */}
                    <div className="rounded-xl border bg-card">
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <h2 className="text-base font-semibold">
                                {trans('client_dashboard.recent_orders')}
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-xs text-muted-foreground"
                                asChild
                            >
                                <Link href="/client/orders">
                                    {trans('client_dashboard.view_all')}
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </div>
                        {recentOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="mb-3 rounded-full bg-muted p-3">
                                    <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {trans('client_dashboard.no_orders')}
                                </p>
                                <Button asChild size="sm" className="mt-3">
                                    <Link href="/client/packages">
                                        {trans('client_dashboard.browse_packages')}
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {recentOrders.map((order) => (
                                    <Link
                                        key={order.uuid}
                                        href={`/client/orders/${order.uuid}`}
                                        className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                            {order.country_iso ? (
                                                <CountryFlag
                                                    countryCode={order.country_iso}
                                                    size="sm"
                                                />
                                            ) : (
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="truncate text-sm font-medium">
                                                    {order.package_name ||
                                                        trans('client_dashboard.esim_package')}
                                                </p>
                                                <span className="shrink-0 text-sm font-semibold tabular-nums">
                                                    {formatCurrency(order.amount)}
                                                </span>
                                            </div>
                                            <div className="mt-0.5 flex items-center justify-between gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {order.country_name &&
                                                        `${order.country_name} · `}
                                                    {order.data_label} · {order.created_at}
                                                </span>
                                                <Badge
                                                    variant="secondary"
                                                    className={`${getStatusStyle(order.status_color)} inline-flex shrink-0 items-center gap-1 text-[11px] ring-1 ring-inset`}
                                                >
                                                    {getStatusIcon(order.status)}
                                                    {order.status_label}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right column: Balance History (B2B only) */}
                    {isB2B && balanceHistory.length > 0 && (
                        <div className="rounded-xl border bg-card">
                            <div className="flex items-center justify-between border-b px-5 py-4">
                                <h2 className="text-base font-semibold">
                                    {trans('client_dashboard.balance_history')}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1 text-xs text-muted-foreground"
                                    asChild
                                >
                                    <Link href="/client/balance">
                                        {trans('client_dashboard.view_all')}
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="divide-y">
                                {balanceHistory.map((tx) => {
                                    const isCredit = [
                                        'top_up',
                                        'refund',
                                    ].includes(tx.type);
                                    return (
                                        <div
                                            key={tx.id}
                                            className="flex items-center gap-3 px-5 py-3.5"
                                        >
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                                    isCredit
                                                        ? 'bg-green-50 dark:bg-green-500/10'
                                                        : 'bg-red-50 dark:bg-red-500/10'
                                                }`}
                                            >
                                                {isCredit ? (
                                                    <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-medium">
                                                        {tx.type_label}
                                                    </p>
                                                    <span
                                                        className={`shrink-0 text-sm font-semibold tabular-nums ${
                                                            isCredit
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : 'text-red-600 dark:text-red-400'
                                                        }`}
                                                    >
                                                        {isCredit ? '+' : '-'}
                                                        {formatCurrency(tx.amount)}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {tx.description || tx.created_at}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </AppLayout>
    );
}
