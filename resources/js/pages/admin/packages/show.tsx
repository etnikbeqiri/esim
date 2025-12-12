import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ArrowLeft, Pencil, Star } from 'lucide-react';

interface Order {
    id: number;
    order_number: string;
    status: string;
    amount: string | number;
    created_at: string;
}

interface Package {
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
    package: Package;
    defaultCurrency: Currency | null;
}

function formatData(mb: number): string {
    if (mb >= 1024) {
        return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
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
    const customRetailPrice = pkg.custom_retail_price ? Number(pkg.custom_retail_price) : null;
    const effectivePrice = customRetailPrice ?? retailPrice;
    const sourceCostPrice = pkg.source_cost_price ? Number(pkg.source_cost_price) : null;
    const margin = effectivePrice - costPrice;
    const marginPercent = costPrice > 0 ? ((margin / costPrice) * 100).toFixed(1) : '0';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pkg.name} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/packages">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold">{pkg.name}</h1>
                            {pkg.is_featured && (
                                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                            )}
                        </div>
                        <p className="text-muted-foreground">
                            Provider: {pkg.provider?.name} | Country: {pkg.country?.name}
                        </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                        {pkg.is_featured && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                Featured
                            </Badge>
                        )}
                        {customRetailPrice !== null && (
                            <Badge variant="secondary">Custom Price</Badge>
                        )}
                        <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                            {pkg.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={pkg.in_stock ? 'default' : 'destructive'}>
                            {pkg.in_stock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/packages/${pkg.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{formatData(pkg.data_mb)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Validity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{pkg.validity_days} days</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Margin</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{margin.toFixed(2)} ({marginPercent}%)</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Package Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Provider Package ID</span>
                                <span className="font-mono">{pkg.provider_package_id}</span>
                            </div>
                            {sourceCostPrice !== null && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Source Cost ({pkg.source_currency?.code || 'USD'})</span>
                                    <span>{pkg.source_currency?.symbol || '$'}{sourceCostPrice.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cost Price ({currencyCode})</span>
                                <span>{currencySymbol}{costPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">System Price ({currencyCode})</span>
                                <span className={customRetailPrice !== null ? 'text-muted-foreground line-through' : 'font-medium'}>
                                    {currencySymbol}{retailPrice.toFixed(2)}
                                </span>
                            </div>
                            {customRetailPrice !== null && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Custom Price ({currencyCode})</span>
                                    <span className="font-medium text-primary">{currencySymbol}{customRetailPrice.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="text-muted-foreground">Effective Price</span>
                                <span className="font-bold">{currencySymbol}{effectivePrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span>{new Date(pkg.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Updated</span>
                                <span>{new Date(pkg.updated_at).toLocaleDateString()}</span>
                            </div>
                            {pkg.description && (
                                <div className="pt-2">
                                    <span className="text-muted-foreground">Description</span>
                                    <p className="mt-1">{pkg.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pkg.orders.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No orders yet</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pkg.orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>
                                                    <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                                                        {order.order_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{order.status}</Badge>
                                                </TableCell>
                                                <TableCell>{currencySymbol}{Number(order.amount).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
