import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    Clock,
    CreditCard,
    Globe,
    Loader2,
    Package,
    RefreshCw,
    ShoppingCart,
    Smartphone,
    TrendingUp,
    User,
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

interface FeaturedPackage {
    id: number;
    name: string;
    country: string | null;
    country_iso: string | null;
    data_label: string;
    validity_label: string;
    price: string;
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
    featuredPackages: FeaturedPackage[];
    activeEsims: ActiveEsim[];
    balanceHistory: BalanceTransaction[];
    stats: Stats | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/client' }];

function getStatusBadgeClass(color: string): string {
    const colors: Record<string, string> = {
        green: 'bg-primary-100 text-primary-700 border-primary-200',
        yellow: 'bg-accent-100 text-accent-700 border-accent-200',
        red: 'bg-red-100 text-red-700 border-red-200',
        blue: 'bg-primary-100 text-primary-700 border-primary-200',
        gray: 'bg-neutral-100 text-neutral-700 border-neutral-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
        orange: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[color] || colors.gray;
}

function getStatusIcon(status: string, size = 'h-3 w-3') {
    switch (status) {
        case 'completed':
            return <CheckCircle2 className={`${size} text-primary-500`} />;
        case 'processing':
            return (
                <Loader2 className={`${size} animate-spin text-primary-500`} />
            );
        case 'pending_retry':
            return <RefreshCw className={`${size} text-orange-500`} />;
        case 'failed':
        case 'cancelled':
            return <XCircle className={`${size} text-red-500`} />;
        case 'awaiting_payment':
        case 'pending':
            return <Clock className={`${size} text-accent-500`} />;
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
    featuredPackages,
    activeEsims,
    balanceHistory,
    stats,
}: Props) {
    const { trans } = useTrans();
    const isB2B = customer?.is_b2b ?? false;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={trans('client_dashboard.welcome')} />
            <div className="flex flex-col gap-6 p-4">
                {/* Welcome Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-semibold">
                            {trans('client_dashboard.welcome')}
                            {customer ? `, ${customer.display_name}` : ''}
                            {isB2B && customer?.company_name && (
                                <Badge
                                    variant="outline"
                                    className="border-primary-200 bg-primary-100 text-primary-700"
                                >
                                    <Building2 className="mr-1 h-3 w-3" />
                                    {customer.company_name}
                                </Badge>
                            )}
                        </h1>
                        {customer && (
                            <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                                <Badge
                                    variant="outline"
                                    className={
                                        isB2B
                                            ? 'border-primary-200 bg-primary-100 text-primary-700'
                                            : 'border-purple-200 bg-purple-100 text-purple-700'
                                    }
                                >
                                    {isB2B ? (
                                        <Building2 className="mr-1 h-3 w-3" />
                                    ) : (
                                        <User className="mr-1 h-3 w-3" />
                                    )}
                                    {customer.type_label}
                                </Badge>
                                {customer.discount_percentage &&
                                    Number(customer.discount_percentage) >
                                        0 && (
                                        <Badge
                                            variant="secondary"
                                            className="bg-primary-100 text-primary-700"
                                        >
                                            {customer.discount_percentage}%
                                            discount
                                        </Badge>
                                    )}
                            </p>
                        )}
                    </div>
                    <Button asChild>
                        <Link href="/client/packages">
                            <Globe className="mr-2 h-4 w-4" />
                            {trans('client_dashboard.browse_packages')}
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div
                    className={`grid gap-4 ${isB2B ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}
                >
                    {isB2B && (
                        <Card className="border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-primary-700">
                                    {trans(
                                        'client_dashboard.available_balance',
                                    )}
                                </CardTitle>
                                <Wallet className="h-4 w-4 text-primary-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary-700">
                                    {formatCurrency(
                                        customer?.available_balance || 0,
                                    )}
                                </div>
                                {Number(customer?.reserved_balance || 0) >
                                    0 && (
                                    <p className="text-xs text-primary-600">
                                        {formatCurrency(
                                            customer?.reserved_balance || 0,
                                        )}{' '}
                                        {trans('client_dashboard.reserved')}
                                    </p>
                                )}
                                <Link
                                    href="/client/balance"
                                    className="mt-1 inline-block text-xs text-primary-600 hover:underline"
                                >
                                    {trans(
                                        'client_dashboard.view_transactions',
                                    )}{' '}
                                    →
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {trans('client_dashboard.total_orders')}
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.total_orders ?? 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.pending_orders ?? 0}{' '}
                                {trans('client_dashboard.pending')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {trans('client_dashboard.completed')}
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-primary-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary-600">
                                {stats?.completed_orders ?? 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {trans('client_dashboard.successful_orders')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {trans('client_dashboard.active_esims')}
                            </CardTitle>
                            <Wifi className="h-4 w-4 text-primary-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.active_esims ?? 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {trans('client_dashboard.ready_to_use')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {trans('client_dashboard.total_spent')}
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(stats?.total_spent ?? 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(stats?.spent_this_month ?? 0)}{' '}
                                {trans('client_dashboard.this_month')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Active eSIMs (if any) */}
                {activeEsims.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-primary-500" />
                                {trans('client_dashboard.your_active_esims')}
                            </CardTitle>
                            <CardDescription>
                                {trans('client_dashboard.monitor_usage')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
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
                                            className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="font-medium">
                                                    {esim.country}
                                                </span>
                                                <Badge
                                                    variant={
                                                        esim.status === 'active'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {esim.status}
                                                </Badge>
                                            </div>
                                            <p className="mb-2 text-sm text-muted-foreground">
                                                {esim.package_name}
                                            </p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span>
                                                        {trans(
                                                            'client_dashboard.data_used',
                                                        )}
                                                    </span>
                                                    <span>
                                                        {formatBytes(
                                                            esim.data_used_bytes,
                                                        )}{' '}
                                                        /{' '}
                                                        {formatBytes(
                                                            esim.data_total_bytes,
                                                        )}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={usagePercent}
                                                    className="h-2"
                                                />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Orders */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>
                                    {trans('client_dashboard.recent_orders')}
                                </CardTitle>
                                <CardDescription>
                                    {trans('client_dashboard.latest_purchases')}
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/client/orders">
                                    {trans('client_dashboard.view_all')}
                                    <ArrowUpRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentOrders.length === 0 ? (
                                <div className="py-8 text-center">
                                    <ShoppingCart className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                                    <p className="mb-3 text-muted-foreground">
                                        {trans('client_dashboard.no_orders')}
                                    </p>
                                    <Button asChild>
                                        <Link href="/client/packages">
                                            {trans(
                                                'client_dashboard.browse_packages',
                                            )}
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentOrders.map((order) => (
                                        <Link
                                            key={order.uuid}
                                            href={`/client/orders/${order.uuid}`}
                                            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {order.package_name ||
                                                            trans(
                                                                'client_dashboard.esim_package',
                                                            )}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={`${getStatusBadgeClass(order.status_color)} flex items-center gap-1`}
                                                    >
                                                        {getStatusIcon(
                                                            order.status,
                                                        )}
                                                        {order.status_label}
                                                    </Badge>
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {order.country_name &&
                                                        `${order.country_name} · `}
                                                    {order.data_label} ·{' '}
                                                    {order.created_at}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold">
                                                    {formatCurrency(
                                                        order.amount,
                                                    )}
                                                </span>
                                                {order.has_esim && (
                                                    <p className="flex items-center justify-end gap-1 text-xs text-primary-600">
                                                        <Wifi className="h-3 w-3" />
                                                        {trans(
                                                            'client_dashboard.esim_ready',
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Balance History (B2B) or Featured Packages (B2C) */}
                    {isB2B && balanceHistory.length > 0 ? (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        {trans(
                                            'client_dashboard.balance_history',
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        {trans(
                                            'client_dashboard.recent_transactions',
                                        )}
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/client/balance">
                                        {trans('client_dashboard.view_all')}
                                        <ArrowUpRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {balanceHistory.map((tx) => {
                                        const isCredit = [
                                            'top_up',
                                            'refund',
                                        ].includes(tx.type);
                                        return (
                                            <div
                                                key={tx.id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`rounded-full p-2 ${isCredit ? 'bg-primary-100' : 'bg-red-100'}`}
                                                    >
                                                        {isCredit ? (
                                                            <ArrowDownLeft className="h-4 w-4 text-primary-600" />
                                                        ) : (
                                                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {tx.type_label}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {tx.description ||
                                                                tx.created_at}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span
                                                        className={`font-bold ${isCredit ? 'text-primary-600' : 'text-red-600'}`}
                                                    >
                                                        {isCredit ? '+' : '-'}
                                                        {formatCurrency(
                                                            tx.amount,
                                                        )}
                                                    </span>
                                                    <p className="text-xs text-muted-foreground">
                                                        {trans(
                                                            'client_dashboard.balance',
                                                        )}
                                                        :{' '}
                                                        {formatCurrency(
                                                            tx.balance_after,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        {trans(
                                            'client_dashboard.featured_packages',
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        {trans(
                                            'client_dashboard.popular_plans',
                                        )}
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/client/packages">
                                        {trans('client_dashboard.view_all')}
                                        <ArrowUpRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {featuredPackages.length === 0 ? (
                                    <p className="py-8 text-center text-muted-foreground">
                                        {trans(
                                            'client_dashboard.no_featured_packages',
                                        )}
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {featuredPackages
                                            .slice(0, 5)
                                            .map((pkg) => (
                                                <Link
                                                    key={pkg.id}
                                                    href={`/client/packages/${pkg.id}`}
                                                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                                >
                                                    <div>
                                                        <p className="font-medium">
                                                            {pkg.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {pkg.country} ·{' '}
                                                            {pkg.data_label} ·{' '}
                                                            {pkg.validity_label}
                                                        </p>
                                                    </div>
                                                    <span className="font-bold text-primary">
                                                        {formatCurrency(
                                                            pkg.price,
                                                        )}
                                                    </span>
                                                </Link>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Featured Packages for B2B (they already have balance history) */}
                {isB2B && featuredPackages.length > 0 && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    {trans(
                                        'client_dashboard.featured_packages',
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {trans('client_dashboard.popular_plans')}
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/client/packages">
                                    {trans('client_dashboard.view_all')}
                                    <ArrowUpRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-3">
                                {featuredPackages.slice(0, 6).map((pkg) => (
                                    <Link
                                        key={pkg.id}
                                        href={`/client/packages/${pkg.id}`}
                                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {pkg.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {pkg.country} · {pkg.data_label}
                                            </p>
                                        </div>
                                        <span className="font-bold text-primary">
                                            {formatCurrency(pkg.price)}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
