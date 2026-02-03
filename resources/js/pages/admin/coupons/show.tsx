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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Coupon, type CouponAnalytics, type CouponUsage } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Power,
    Calendar,
    Users,
    Euro,
    TrendingDown,
    TrendingUp,
    BarChart3,
} from 'lucide-react';

interface Props {
    coupon: Coupon;
    analytics: CouponAnalytics;
    recentUsages: CouponUsage[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Coupons', href: '/admin/coupons' },
    { title: 'Coupon Details', href: '#' },
];

export default function ShowCoupon({ coupon, analytics, recentUsages }: Props) {
    function handleDelete() {
        if (confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
            router.delete(`/admin/coupons/${coupon.id}`);
        }
    }

    function handleToggle() {
        router.post(`/admin/coupons/${coupon.id}/toggle`);
    }

    function getStatusBadge() {
        if (!coupon.is_active) {
            return <Badge variant="secondary">Inactive</Badge>;
        }
        if (analytics.is_expired) {
            return <Badge variant="destructive">Expired</Badge>;
        }
        if (analytics.is_upcoming) {
            return <Badge variant="outline">Upcoming</Badge>;
        }
        return <Badge variant="default">Active</Badge>;
    }

    const statCards = [
        {
            title: 'Total Usages',
            value: analytics.total_usages.toString(),
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-950',
        },
        {
            title: 'Unique Customers',
            value: analytics.unique_customers.toString(),
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-950',
        },
        {
            title: 'Total Discount Given',
            value: `€${analytics.total_discount_given.toFixed(2)}`,
            icon: TrendingDown,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-950',
        },
        {
            title: 'Revenue Generated',
            value: `€${analytics.total_revenue_generated.toFixed(2)}`,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-950',
        },
        {
            title: 'Avg Order Value',
            value: `€${analytics.average_order_value.toFixed(2)}`,
            icon: Euro,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-950',
        },
        {
            title: 'Avg Discount',
            value: `€${analytics.average_discount.toFixed(2)}`,
            icon: BarChart3,
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50 dark:bg-cyan-950',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${coupon.code} - Coupon`} />
            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/coupons">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold font-mono">{coupon.code}</h1>
                                {getStatusBadge()}
                            </div>
                            <p className="text-muted-foreground">{coupon.name}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleToggle}>
                            <Power className="mr-2 h-4 w-4" />
                            {coupon.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/admin/coupons/${coupon.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Coupon Details */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Discount Type</h3>
                        <p className="text-lg font-semibold">
                            {coupon.type === 'percentage' ? `${coupon.value}% off` : `€${coupon.value} off`}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Minimum Order</h3>
                        <p className="text-lg font-semibold">€{coupon.min_order_amount}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Usage Limit</h3>
                        <p className="text-lg font-semibold">
                            {coupon.usage_count} / {coupon.usage_limit ?? 'Unlimited'}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Per Customer Limit</h3>
                        <p className="text-lg font-semibold">{coupon.per_customer_limit} use{coupon.per_customer_limit > 1 ? 's' : ''}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Valid From</h3>
                        <p className="text-lg font-semibold">
                            {coupon.valid_from ? new Date(coupon.valid_from).toLocaleDateString() : 'No limit'}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Valid Until</h3>
                        <p className="text-lg font-semibold">
                            {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'No limit'}
                        </p>
                    </div>
                </div>

                {/* Options */}
                <div className="rounded-lg border p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Options</h3>
                    <div className="flex flex-wrap gap-3">
                        <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                            {coupon.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={coupon.is_stackable ? 'default' : 'outline'}>
                            Stackable: {coupon.is_stackable ? 'Yes' : 'No'}
                        </Badge>
                        <Badge variant={coupon.first_time_only ? 'default' : 'outline'}>
                            First Time Only: {coupon.first_time_only ? 'Yes' : 'No'}
                        </Badge>
                    </div>
                </div>

                {/* Analytics Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.title} className={`rounded-lg border p-4 ${stat.bgColor}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                        <Icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Usage Progress */}
                {coupon.usage_limit && (
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">Usage Progress</h3>
                            <span className="text-sm text-muted-foreground">
                                {coupon.usage_count} of {coupon.usage_limit} used
                            </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${Math.min(100, (coupon.usage_count / coupon.usage_limit) * 100)}%` }}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            {analytics.remaining_usages} uses remaining
                        </p>
                    </div>
                )}

                {/* Description */}
                {coupon.description && (
                    <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                        <p>{coupon.description}</p>
                    </div>
                )}

                {/* Recent Usages */}
                <div className="rounded-lg border">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold">Recent Usages</h3>
                        <p className="text-sm text-muted-foreground">
                            {analytics.total_usages} total usage{analytics.total_usages !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Original</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Final</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentUsages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No usages yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentUsages.map((usage) => (
                                    <TableRow key={usage.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {usage.customer?.company_name || usage.customer?.user?.name || 'N/A'}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {usage.customer?.user?.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {usage.order?.order_number}
                                        </TableCell>
                                        <TableCell>€{Number(usage.original_amount).toFixed(2)}</TableCell>
                                        <TableCell className="text-green-600">
                                            -€{Number(usage.discount_amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            €{Number(usage.final_amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(usage.created_at).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Top Customers */}
                {analytics.top_customers && analytics.top_customers.length > 0 && (
                    <div className="rounded-lg border p-4">
                        <h3 className="font-semibold mb-4">Top Customers</h3>
                        <div className="space-y-3">
                            {analytics.top_customers.map((tc) => (
                                <div key={tc.customer_id} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div>
                                        <div className="font-medium">
                                            {tc.customer?.company_name || tc.customer?.user?.name || `Customer #${tc.customer_id}`}
                                        </div>
                                        {tc.customer?.user?.email && (
                                            <div className="text-sm text-muted-foreground">{tc.customer.user.email}</div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">{tc.usage_count} use{tc.usage_count > 1 ? 's' : ''}</div>
                                        <div className="text-sm text-muted-foreground">
                                            €{tc.total_discount.toFixed(2)} saved
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
