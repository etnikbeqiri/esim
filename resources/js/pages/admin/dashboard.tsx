import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useTrans } from '@/hooks/use-trans';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowUpRight,
    Building2,
    CheckCircle2,
    Clock,
    DollarSign,
    Loader2,
    Package,
    RefreshCw,
    ShoppingCart,
    TrendingUp,
    User,
    Users,
    Wallet,
    XCircle,
} from 'lucide-react';

interface RecentOrder {
    id: number;
    uuid: string;
    order_number: string;
    status: string;
    status_label: string;
    status_color: string;
    type: string;
    amount: number;
    customer_name: string;
    customer_email: string;
    package_name: string | null;
    created_at: string;
}

interface OrderNeedingAttention {
    id: number;
    uuid: string;
    order_number: string;
    status: string;
    status_label: string;
    status_color: string;
    failure_reason: string | null;
    retry_count: number;
    amount: number;
    customer_name: string;
    package_name: string | null;
    created_at: string;
}

interface SyncJob {
    id: number;
    type: string;
    type_label: string;
    status: string;
    status_label: string;
    provider_name: string | null;
    progress: number;
    total: number;
    created_at: string;
}

interface TrendData {
    date: string;
    revenue?: number;
    total?: number;
    completed?: number;
}

interface Stats {
    revenue: {
        today: number;
        this_month: number;
        last_month: number;
        total: number;
        total_profit: number;
    };
    orders: {
        total: number;
        completed: number;
        pending: number;
        failed: number;
        today: number;
        today_completed: number;
    };
    customers: {
        total: number;
        b2b: number;
        b2c: number;
        new_today: number;
        new_this_month: number;
    };
    packages: {
        total: number;
        active: number;
    };
}

interface Props {
    stats: Stats;
    recentOrders: RecentOrder[];
    ordersNeedingAttention: OrderNeedingAttention[];
    recentSyncJobs: SyncJob[];
    revenueTrend: TrendData[];
    orderTrend: TrendData[];
}

function getStatusBadgeClass(color: string): string {
    const colors: Record<string, string> = {
        green: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
        red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
        blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
        gray: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400',
        purple: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
        orange: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
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

function formatCurrency(amount: number | string): string {
    return `€${Number(amount).toFixed(2)}`;
}

export default function AdminDashboard({
    stats,
    recentOrders,
    ordersNeedingAttention,
    recentSyncJobs,
    revenueTrend,
    orderTrend,
}: Props) {
    const { trans } = useTrans();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: trans('admin.dashboard.title'), href: '/admin' },
    ];

    const revenueChange =
        stats.revenue.last_month > 0
            ? (
                  ((stats.revenue.this_month - stats.revenue.last_month) /
                      stats.revenue.last_month) *
                  100
              ).toFixed(1)
            : '0';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={trans('admin.dashboard.title')} />
            <div className="flex flex-col gap-6 p-4">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold">
                        {trans('admin.dashboard.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {trans('admin.dashboard.overview')}
                    </p>
                </div>

                {/* Revenue Stats */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Today's Revenue
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(stats.revenue.today)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {stats.orders.today_completed} orders completed
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                This Month
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {formatCurrency(stats.revenue.this_month)}
                            </p>
                            <p
                                className={`text-xs ${Number(revenueChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                                {Number(revenueChange) >= 0 ? '+' : ''}
                                {revenueChange}% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {trans('admin.dashboard.total_revenue')}
                            </CardTitle>
                            <Wallet className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {formatCurrency(stats.revenue.total)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                All time
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Profit
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(stats.revenue.total_profit)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {stats.revenue.total > 0
                                    ? `${((stats.revenue.total_profit / stats.revenue.total) * 100).toFixed(1)}% margin`
                                    : '0% margin'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Today's Orders
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {stats.orders.today}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {stats.orders.today_completed} completed
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Order & Customer Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {trans('admin.dashboard.total_orders')}
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {stats.orders.total}
                            </p>
                            <div className="mt-1 flex gap-2">
                                <span className="text-xs text-green-600">
                                    {stats.orders.completed} completed
                                </span>
                                <span className="text-xs text-yellow-600">
                                    {stats.orders.pending} pending
                                </span>
                                <span className="text-xs text-red-600">
                                    {stats.orders.failed} failed
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Customers
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {stats.customers.total}
                            </p>
                            <div className="mt-1 flex gap-2">
                                <span className="flex items-center gap-1 text-xs text-blue-600">
                                    <Building2 className="h-3 w-3" />
                                    {stats.customers.b2b} B2B
                                </span>
                                <span className="flex items-center gap-1 text-xs text-purple-600">
                                    <User className="h-3 w-3" />
                                    {stats.customers.b2c} B2C
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                New This Month
                            </CardTitle>
                            <Users className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                                +{stats.customers.new_this_month}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {stats.customers.new_today} today
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Packages
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {stats.packages.active}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                of {stats.packages.total} total active
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/orders">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            View Orders
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/admin/customers">
                            <Users className="mr-2 h-4 w-4" />
                            View Customers
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/admin/packages">
                            <Package className="mr-2 h-4 w-4" />
                            Manage Packages
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/admin/sync-jobs">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync Jobs
                        </Link>
                    </Button>
                </div>

                {/* Revenue Trend Chart (Simple) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
                        <CardDescription>
                            Daily revenue overview
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-32 items-end justify-between gap-2">
                            {revenueTrend.map((day, i) => {
                                const maxRevenue = Math.max(
                                    ...revenueTrend.map((d) => d.revenue || 0),
                                    1,
                                );
                                const height =
                                    ((day.revenue || 0) / maxRevenue) * 100;
                                return (
                                    <div
                                        key={i}
                                        className="flex flex-1 flex-col items-center gap-1"
                                    >
                                        <div
                                            className="relative w-full rounded-t bg-muted"
                                            style={{ height: '100px' }}
                                        >
                                            <div
                                                className="absolute bottom-0 w-full rounded-t bg-primary transition-all"
                                                style={{ height: `${height}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {day.date}
                                        </span>
                                        <span className="text-xs font-medium">
                                            €{(day.revenue || 0).toFixed(0)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Orders Needing Attention */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-orange-500" />
                                    {trans(
                                        'admin.dashboard.orders_needing_attention',
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    Orders requiring action
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/orders?status=failed">
                                    {trans('admin.dashboard.view_all_orders')}
                                    <ArrowUpRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {ordersNeedingAttention.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-500" />
                                    <p>All orders are in good standing!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {ordersNeedingAttention.map((order) => (
                                        <Link
                                            key={order.id}
                                            href={`/admin/orders/${order.uuid}`}
                                            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm">
                                                        {order.order_number}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={`${getStatusBadgeClass(order.status_color)} flex items-center gap-1`}
                                                    >
                                                        {getStatusIcon(
                                                            order.status,
                                                        )}
                                                        {trans(
                                                            `statuses.${order.status}`,
                                                        ) || order.status_label}
                                                    </Badge>
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {order.customer_name} ·{' '}
                                                    {order.package_name}
                                                </p>
                                                {order.failure_reason && (
                                                    <p className="mt-1 max-w-[250px] truncate text-xs text-red-500">
                                                        {order.failure_reason}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        order.amount,
                                                    )}
                                                </span>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.created_at}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Orders */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>
                                    {trans('admin.dashboard.recent_orders')}
                                </CardTitle>
                                <CardDescription>
                                    Latest order activity
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/orders">
                                    {trans('admin.dashboard.view_all_orders')}
                                    <ArrowUpRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentOrders.length === 0 ? (
                                <p className="py-8 text-center text-muted-foreground">
                                    {trans('admin.dashboard.no_orders')}
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {recentOrders.slice(0, 5).map((order) => (
                                        <Link
                                            key={order.id}
                                            href={`/admin/orders/${order.uuid}`}
                                            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm">
                                                        {order.order_number}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={`${getStatusBadgeClass(order.status_color)} flex items-center gap-1`}
                                                    >
                                                        {getStatusIcon(
                                                            order.status,
                                                        )}
                                                        {trans(
                                                            `statuses.${order.status}`,
                                                        ) || order.status_label}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {order.type.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {order.customer_name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        order.amount,
                                                    )}
                                                </span>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.created_at}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Sync Jobs */}
                {recentSyncJobs.length > 0 && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent Sync Jobs</CardTitle>
                                <CardDescription>
                                    Package synchronization status
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/sync-jobs">
                                    View All
                                    <ArrowUpRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Provider</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Progress</TableHead>
                                        <TableHead>Started</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentSyncJobs.map((job) => (
                                        <TableRow key={job.id}>
                                            <TableCell className="font-medium">
                                                {job.provider_name}
                                            </TableCell>
                                            <TableCell>
                                                {job.type_label}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        job.status ===
                                                        'completed'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {trans(
                                                        `statuses.${job.status}`,
                                                    ) || job.status_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {job.total > 0
                                                    ? `${job.progress}/${job.total}`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {job.created_at}
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
