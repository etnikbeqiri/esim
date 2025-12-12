import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Eye,
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Shop', href: '/client/packages' },
    { title: 'My Orders', href: '/client/orders' },
];

function getStatusIcon(status: string) {
    switch (status) {
        case 'completed':
            return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case 'processing':
            return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
        case 'pending_retry':
            return <RefreshCw className="h-4 w-4 text-orange-500" />;
        case 'failed':
            return <XCircle className="h-4 w-4 text-red-500" />;
        case 'awaiting_payment':
        case 'pending':
            return <Clock className="h-4 w-4 text-yellow-500" />;
        default:
            return <Clock className="h-4 w-4 text-gray-500" />;
    }
}

function getStatusBadgeClass(color: string): string {
    const colors: Record<string, string> = {
        green: 'bg-green-100 text-green-700 border-green-200',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        red: 'bg-red-100 text-red-700 border-red-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        orange: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[color] || colors.gray;
}

export default function OrdersIndex({ orders, filters }: Props) {
    // Poll for updates when there are orders in processing/pending states
    const hasActiveOrders = orders.data.some(
        (order) => ['processing', 'pending_retry', 'pending', 'awaiting_payment'].includes(order.status)
    );

    useEffect(() => {
        if (!hasActiveOrders) return;

        const interval = setInterval(() => {
            router.reload({ only: ['orders'], preserveState: true, preserveScroll: true });
        }, 3000);

        return () => clearInterval(interval);
    }, [hasActiveOrders]);

    function handleFilterChange(key: string, value: string) {
        const newFilters = { ...filters, [key]: value === 'all' ? undefined : value };
        router.get('/client/orders', newFilters, { preserveState: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Orders" />
            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">My Orders</h1>
                        <p className="text-sm text-muted-foreground">{orders.total} orders</p>
                    </div>
                    <Button asChild>
                        <Link href="/client/packages">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            New Order
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(v) => handleFilterChange('status', v)}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="pending_retry">Pending Retry</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Orders Table */}
                {orders.data.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="rounded-full bg-muted p-3 mb-3">
                                <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold">No orders yet</h3>
                            <p className="text-sm text-muted-foreground mt-1 mb-3">
                                Get started by browsing our eSIM packages
                            </p>
                            <Button asChild size="sm">
                                <Link href="/client/packages">Browse Packages</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order</TableHead>
                                    <TableHead className="hidden sm:table-cell">Package</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.data.map((order) => (
                                    <TableRow
                                        key={order.uuid}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/client/orders/${order.uuid}`)}
                                    >
                                        <TableCell>
                                            <div className="font-mono text-sm">{order.order_number}</div>
                                            <div className="text-xs text-muted-foreground">{order.created_at}</div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {order.package ? (
                                                <div>
                                                    <div className="font-medium text-sm truncate max-w-[200px]">
                                                        {order.package.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {order.package.data_label} • {order.package.validity_label}
                                                    </div>
                                                </div>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`${getStatusBadgeClass(order.status_color)} flex items-center gap-1 w-fit`}
                                            >
                                                {getStatusIcon(order.status)}
                                                <span className="hidden sm:inline">{order.status_label}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            €{Number(order.amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: Math.min(orders.last_page, 10) }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === orders.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get('/client/orders', { ...filters, page })}
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
