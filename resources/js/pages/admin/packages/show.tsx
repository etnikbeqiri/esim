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
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Pencil, Star } from 'lucide-react';

interface Order {
    id: number;
    order_number: string;
    status: string;
    amount: string | number;
    created_at: string;
}

interface PackageData {
    id: number;
    name: string;
    provider_package_id: string;
    data_mb: number;
    validity_days: number;
    source_cost_price: string | number | null;
    cost_price: string | number;
    retail_price: string | number;
    custom_retail_price: string | number | null;
    is_active: boolean;
    in_stock: boolean;
    is_featured: boolean;
    featured_order: number;
    description: string | null;
    provider: { id: number; name: string; slug: string } | null;
    country: { id: number; name: string; iso_code: string } | null;
    source_currency: { id: number; code: string; symbol: string } | null;
    orders: Order[];
    created_at: string;
    updated_at: string;
}

interface Currency {
    id: number;
    code: string;
    symbol: string;
}

interface Props {
    package: PackageData;
    defaultCurrency: Currency | null;
}

function formatData(mb: number): string {
    if (mb >= 1024) {
        return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
}

function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'pending':
            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'failed':
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'processing':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        default:
            return '';
    }
}

export default function PackageShow({ package: pkg, defaultCurrency }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Packages', href: '/admin/packages' },
        { title: pkg.name, href: `/admin/packages/${pkg.id}` },
    ];

    const currencySymbol = defaultCurrency?.symbol || '€';
    const currencyCode = defaultCurrency?.code || 'EUR';
    const costPrice = Number(pkg.cost_price);
    const retailPrice = Number(pkg.retail_price);
    const customRetailPrice = pkg.custom_retail_price
        ? Number(pkg.custom_retail_price)
        : null;
    const effectivePrice = customRetailPrice ?? retailPrice;
    const sourceCostPrice = pkg.source_cost_price
        ? Number(pkg.source_cost_price)
        : null;
    const margin = effectivePrice - costPrice;
    const marginPercent =
        costPrice > 0 ? ((margin / costPrice) * 100).toFixed(1) : '0';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pkg.name} />
            <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4 p-4">
                    <div className="flex items-start gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            asChild
                        >
                            <Link href="/admin/packages">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-semibold">
                                    {pkg.name}
                                </h1>
                                {pkg.is_featured && (
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                )}
                            </div>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                {pkg.provider?.name || 'No provider'} ·{' '}
                                {pkg.country?.name || 'No country'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={pkg.is_active ? 'default' : 'secondary'}
                        >
                            {pkg.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge
                            variant={pkg.in_stock ? 'outline' : 'destructive'}
                        >
                            {pkg.in_stock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                        <Button size="sm" asChild>
                            <Link href={`/admin/packages/${pkg.id}/edit`}>
                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-5xl space-y-6 px-4">
                    <div className="grid grid-cols-4 gap-px overflow-hidden rounded-lg border bg-border">
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                Data
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {formatData(pkg.data_mb)}
                            </p>
                        </div>
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                Validity
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {pkg.validity_days} days
                            </p>
                        </div>
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                Price
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {currencySymbol}
                                {effectivePrice.toFixed(2)}
                                {customRetailPrice !== null && (
                                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                        (custom)
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                Margin
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {currencySymbol}
                                {margin.toFixed(2)}
                                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                    ({marginPercent}%)
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-2">
                        <div>
                            <h2 className="mb-4 text-sm font-medium">
                                Pricing Details
                            </h2>
                            <div className="rounded-lg border">
                                <div className="divide-y">
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            Package ID
                                        </span>
                                        <code className="text-sm">
                                            {pkg.provider_package_id}
                                        </code>
                                    </div>
                                    {sourceCostPrice !== null && (
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Source Cost (
                                                {pkg.source_currency?.code ||
                                                    'USD'}
                                                )
                                            </span>
                                            <span className="text-sm">
                                                {pkg.source_currency?.symbol ||
                                                    '$'}
                                                {sourceCostPrice.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            Cost Price ({currencyCode})
                                        </span>
                                        <span className="text-sm">
                                            {currencySymbol}
                                            {costPrice.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            System Price ({currencyCode})
                                        </span>
                                        <span
                                            className={`text-sm ${customRetailPrice !== null ? 'text-muted-foreground line-through' : ''}`}
                                        >
                                            {currencySymbol}
                                            {retailPrice.toFixed(2)}
                                        </span>
                                    </div>
                                    {customRetailPrice !== null && (
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Custom Price ({currencyCode})
                                            </span>
                                            <span className="text-sm font-medium">
                                                {currencySymbol}
                                                {customRetailPrice.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between bg-muted/30 px-4 py-3">
                                        <span className="text-sm font-medium">
                                            Effective Price
                                        </span>
                                        <span className="text-sm font-semibold">
                                            {currencySymbol}
                                            {effectivePrice.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {pkg.description && (
                                <div className="mt-6">
                                    <h2 className="mb-2 text-sm font-medium">
                                        Description
                                    </h2>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {pkg.description}
                                    </p>
                                </div>
                            )}

                            <div className="mt-6 flex gap-6 text-xs text-muted-foreground">
                                <span>
                                    Created{' '}
                                    {new Date(
                                        pkg.created_at,
                                    ).toLocaleDateString()}
                                </span>
                                <span>
                                    Updated{' '}
                                    {new Date(
                                        pkg.updated_at,
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-sm font-medium">
                                    Recent Orders
                                </h2>
                                {pkg.orders.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 text-xs"
                                        asChild
                                    >
                                        <Link
                                            href={`/admin/orders?package_id=${pkg.id}`}
                                        >
                                            View all
                                            <ExternalLink className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                            <div className="rounded-lg border">
                                {pkg.orders.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                        No orders yet
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-xs">
                                                    Order
                                                </TableHead>
                                                <TableHead className="text-xs">
                                                    Date
                                                </TableHead>
                                                <TableHead className="text-xs">
                                                    Status
                                                </TableHead>
                                                <TableHead className="text-right text-xs">
                                                    Amount
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pkg.orders.map((order) => (
                                                <TableRow key={order.id}>
                                                    <TableCell className="py-2">
                                                        <Link
                                                            href={`/admin/orders/${order.id}`}
                                                            className="text-sm font-medium hover:underline"
                                                        >
                                                            {order.order_number}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="py-2 text-sm text-muted-foreground">
                                                        {new Date(
                                                            order.created_at,
                                                        ).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="py-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`text-xs ${getStatusColor(order.status)}`}
                                                        >
                                                            {order.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-2 text-right text-sm tabular-nums">
                                                        {currencySymbol}
                                                        {Number(
                                                            order.amount,
                                                        ).toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
