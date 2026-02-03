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
import { ArrowLeft, Pencil, Power, Trash2 } from 'lucide-react';

interface Props {
    coupon: Coupon;
    analytics: CouponAnalytics;
    recentUsages: CouponUsage[];
}

export default function ShowCoupon({ coupon, analytics, recentUsages }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Coupons', href: '/admin/coupons' },
        { title: coupon.code, href: '#' },
    ];

    function handleDelete() {
        if (confirm(`Delete coupon "${coupon.code}"?`)) {
            router.delete(`/admin/coupons/${coupon.id}`);
        }
    }

    function handleToggle() {
        router.post(`/admin/coupons/${coupon.id}/toggle`);
    }

    function getStatusBadge() {
        if (!coupon.is_active) return <Badge variant="secondary">Inactive</Badge>;
        if (analytics.is_expired) return <Badge variant="destructive">Expired</Badge>;
        if (analytics.is_upcoming) return <Badge variant="outline">Upcoming</Badge>;
        return <Badge variant="default">Active</Badge>;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${coupon.code} - Coupon`} />
            <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4 p-4">
                    <div className="flex items-start gap-4">
                        <Button variant="ghost" size="icon" className="shrink-0" asChild>
                            <Link href="/admin/coupons">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-mono text-xl font-semibold">{coupon.code}</h1>
                                {getStatusBadge()}
                            </div>
                            <p className="mt-0.5 text-sm text-muted-foreground">{coupon.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={handleToggle}>
                            <Power className="mr-1.5 h-3.5 w-3.5" />
                            {coupon.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/coupons/${coupon.id}/edit`}>
                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                            </Link>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-5xl space-y-6 px-4">
                <div className="grid grid-cols-4 gap-px overflow-hidden rounded-lg border bg-border">
                    <div className="bg-card p-4">
                        <p className="text-xs text-muted-foreground">Discount</p>
                        <p className="mt-1 text-lg font-semibold">
                            {coupon.type === 'percentage' ? `${coupon.value}%` : `€${coupon.value}`}
                        </p>
                    </div>
                    <div className="bg-card p-4">
                        <p className="text-xs text-muted-foreground">Min Order</p>
                        <p className="mt-1 text-lg font-semibold">€{coupon.min_order_amount}</p>
                    </div>
                    <div className="bg-card p-4">
                        <p className="text-xs text-muted-foreground">Usage</p>
                        <p className="mt-1 text-lg font-semibold">
                            {coupon.usage_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''}
                        </p>
                    </div>
                    <div className="bg-card p-4">
                        <p className="text-xs text-muted-foreground">Per Customer</p>
                        <p className="mt-1 text-lg font-semibold">{coupon.per_customer_limit}</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                        <h2 className="mb-4 text-sm font-medium">Details</h2>
                        <div className="rounded-lg border">
                            <div className="divide-y">
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-sm text-muted-foreground">Valid From</span>
                                    <span className="text-sm">
                                        {coupon.valid_from ? new Date(coupon.valid_from).toLocaleDateString() : '—'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-sm text-muted-foreground">Valid Until</span>
                                    <span className="text-sm">
                                        {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : '—'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-sm text-muted-foreground">Stackable</span>
                                    <Badge variant={coupon.is_stackable ? 'default' : 'secondary'}>
                                        {coupon.is_stackable ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-sm text-muted-foreground">First Time Only</span>
                                    <Badge variant={coupon.first_time_only ? 'default' : 'secondary'}>
                                        {coupon.first_time_only ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {coupon.description && (
                            <div className="mt-6">
                                <h2 className="mb-2 text-sm font-medium">Description</h2>
                                <p className="text-sm text-muted-foreground">{coupon.description}</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="mb-4 text-sm font-medium">Analytics</h2>
                        <div className="rounded-lg border">
                            <div className="divide-y">
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-sm text-muted-foreground">Total Usages</span>
                                    <span className="text-sm font-medium">{analytics.total_usages}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-sm text-muted-foreground">Unique Customers</span>
                                    <span className="text-sm font-medium">{analytics.unique_customers}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-sm text-muted-foreground">Total Discount</span>
                                    <span className="text-sm font-medium">€{analytics.total_discount_given.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-sm text-muted-foreground">Revenue Generated</span>
                                    <span className="text-sm font-medium text-green-600">€{analytics.total_revenue_generated.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-sm text-muted-foreground">Avg Order Value</span>
                                    <span className="text-sm font-medium">€{analytics.average_order_value.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {coupon.usage_limit && (
                            <div className="mt-4 rounded-lg border p-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Usage Progress</span>
                                    <span>{coupon.usage_count}/{coupon.usage_limit}</span>
                                </div>
                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${Math.min(100, (coupon.usage_count / coupon.usage_limit) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="mb-4 text-sm font-medium">Recent Usages ({analytics.total_usages})</h2>
                    <div className="rounded-lg border">
                        {recentUsages.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                No usages yet
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Original</TableHead>
                                        <TableHead>Discount</TableHead>
                                        <TableHead>Final</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentUsages.map((usage) => (
                                        <TableRow key={usage.id} className="group">
                                            <TableCell>
                                                {usage.customer ? (
                                                    <div>
                                                        <Link href={`/admin/customers/${usage.customer.id}`} className="font-medium hover:underline">
                                                            {usage.customer.company_name || usage.customer.user?.name || 'N/A'}
                                                        </Link>
                                                        {usage.customer.user?.email && (
                                                            <div className="text-xs text-muted-foreground">{usage.customer.user.email}</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {usage.order ? (
                                                    <Link href={`/admin/orders/${usage.order.uuid}`} className="font-mono text-xs text-primary hover:underline">
                                                        {usage.order.order_number}
                                                    </Link>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="tabular-nums">€{Number(usage.original_amount).toFixed(2)}</TableCell>
                                            <TableCell className="tabular-nums text-green-600">-€{Number(usage.discount_amount).toFixed(2)}</TableCell>
                                            <TableCell className="tabular-nums font-medium">€{Number(usage.final_amount).toFixed(2)}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(usage.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>

                {analytics.top_customers && analytics.top_customers.length > 0 && (
                    <div>
                        <h2 className="mb-4 text-sm font-medium">Top Customers</h2>
                        <div className="rounded-lg border divide-y">
                            {analytics.top_customers.map((tc) => (
                                <div key={tc.customer_id} className="flex items-center justify-between px-4 py-3">
                                    <div>
                                        <Link href={`/admin/customers/${tc.customer_id}`} className="font-medium hover:underline">
                                            {tc.customer?.company_name || tc.customer?.user?.name || `Customer #${tc.customer_id}`}
                                        </Link>
                                        {tc.customer?.user?.email && (
                                            <div className="text-xs text-muted-foreground">{tc.customer.user.email}</div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{tc.usage_count} uses</div>
                                        <div className="text-xs text-muted-foreground">€{tc.total_discount.toFixed(2)} saved</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                </div>
            </div>
        </AppLayout>
    );
}
