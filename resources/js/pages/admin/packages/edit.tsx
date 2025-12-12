import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent } from 'react';

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
    is_featured: boolean;
    featured_order: number;
    provider: { id: number; name: string; slug: string } | null;
    country: { id: number; name: string; iso_code: string } | null;
    source_currency: { id: number; code: string; symbol: string } | null;
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

export default function PackageEdit({ package: pkg, defaultCurrency }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Packages', href: '/admin/packages' },
        { title: pkg.name, href: `/admin/packages/${pkg.id}` },
        { title: 'Edit', href: `/admin/packages/${pkg.id}/edit` },
    ];

    const currencySymbol = defaultCurrency?.symbol || '€';
    const retailPrice = Number(pkg.retail_price);
    const customPrice = pkg.custom_retail_price ? Number(pkg.custom_retail_price) : null;

    const { data, setData, put, processing, errors } = useForm({
        custom_retail_price: pkg.custom_retail_price?.toString() || '',
        is_active: pkg.is_active,
        is_featured: pkg.is_featured,
        featured_order: pkg.featured_order || 0,
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        put(`/admin/packages/${pkg.id}`);
    }

    function clearCustomPrice() {
        setData('custom_retail_price', '');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${pkg.name}`} />
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild type="button">
                            <Link href={`/admin/packages/${pkg.id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold">Edit Package</h1>
                            <p className="text-muted-foreground">{pkg.name}</p>
                        </div>
                        <div className="ml-auto">
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Package Information</CardTitle>
                                <CardDescription>Read-only package details from provider</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Provider</span>
                                    <span>{pkg.provider?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Country</span>
                                    <span>{pkg.country?.name} ({pkg.country?.iso_code})</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Package ID</span>
                                    <span className="font-mono text-sm">{pkg.provider_package_id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Data</span>
                                    <span>{formatData(pkg.data_mb)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Validity</span>
                                    <span>{pkg.validity_days} days</span>
                                </div>
                                {pkg.source_cost_price && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Source Cost ({pkg.source_currency?.code})</span>
                                        <span>{pkg.source_currency?.symbol}{Number(pkg.source_cost_price).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Cost Price</span>
                                    <span>{currencySymbol}{Number(pkg.cost_price).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">System Retail Price</span>
                                    <span>{currencySymbol}{retailPrice.toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Price Override</CardTitle>
                                <CardDescription>Set a custom retail price (optional)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="custom_retail_price">Custom Retail Price ({defaultCurrency?.code || 'EUR'})</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                {currencySymbol}
                                            </span>
                                            <Input
                                                id="custom_retail_price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder={retailPrice.toFixed(2)}
                                                value={data.custom_retail_price}
                                                onChange={(e) => setData('custom_retail_price', e.target.value)}
                                                className="pl-7"
                                            />
                                        </div>
                                        {data.custom_retail_price && (
                                            <Button type="button" variant="outline" onClick={clearCustomPrice}>
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                    {errors.custom_retail_price && (
                                        <p className="text-sm text-destructive">{errors.custom_retail_price}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Leave empty to use the system calculated price ({currencySymbol}{retailPrice.toFixed(2)})
                                    </p>
                                </div>

                                {data.custom_retail_price && (
                                    <div className="rounded-lg border p-3 bg-muted/50">
                                        <div className="flex justify-between text-sm">
                                            <span>System Price</span>
                                            <span className="line-through text-muted-foreground">{currencySymbol}{retailPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-medium">
                                            <span>Custom Price</span>
                                            <span className="text-primary">{currencySymbol}{Number(data.custom_retail_price || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                                <CardDescription>Control package visibility and availability</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_active">Active</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Package will be available for purchase
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_featured">Featured</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Show in featured/promoted section
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onCheckedChange={(checked) => setData('is_featured', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {data.is_featured && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Featured Order</CardTitle>
                                    <CardDescription>Control the display order for featured packages</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Label htmlFor="featured_order">Sort Order</Label>
                                    <Input
                                        id="featured_order"
                                        type="number"
                                        min="0"
                                        value={data.featured_order}
                                        onChange={(e) => setData('featured_order', parseInt(e.target.value) || 0)}
                                    />
                                    {errors.featured_order && (
                                        <p className="text-sm text-destructive">{errors.featured_order}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Lower numbers appear first. Default is 0.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" asChild type="button">
                            <Link href={`/admin/packages/${pkg.id}`}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
