import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CircleCheck, CircleMinus, Save } from 'lucide-react';
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
    show_on_homepage: boolean;
    featured_order: number;
    featured_label: string | null;
    provider: { id: number; name: string; slug: string } | null;
    country: { id: number; name: string; iso_code: string } | null;
    source_currency: { id: number; code: string; symbol: string } | null;
}

interface Currency {
    id: number;
    code: string;
    symbol: string;
}

interface CompetitorPlan {
    plan_code: string;
    plan_name: string;
    price: number;
    data_gb: number;
    duration_days: number;
    destination_name: string;
    is_regional: boolean;
}

interface CompetitorMatch {
    competitor: string;
    display_name: string;
    currency: string;
    exact: CompetitorPlan | null;
    same_gb: CompetitorPlan[];
    same_days: CompetitorPlan[];
}

interface Props {
    package: Package;
    defaultCurrency: Currency | null;
    competitorPricing: Record<string, CompetitorMatch>;
}

function formatData(mb: number): string {
    if (mb >= 1024) {
        return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
}

export default function PackageEdit({
    package: pkg,
    defaultCurrency,
    competitorPricing,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Packages', href: '/admin/packages' },
        { title: pkg.name, href: `/admin/packages/${pkg.id}` },
        { title: 'Edit', href: `/admin/packages/${pkg.id}/edit` },
    ];

    const currencySymbol = defaultCurrency?.symbol || '€';
    const retailPrice = Number(pkg.retail_price);
    const customPrice = pkg.custom_retail_price
        ? Number(pkg.custom_retail_price)
        : null;

    const { data, setData, put, processing, errors } = useForm({
        custom_retail_price: pkg.custom_retail_price?.toString() || '',
        is_active: pkg.is_active,
        is_featured: pkg.is_featured,
        show_on_homepage: pkg.show_on_homepage,
        featured_order: pkg.featured_order || 0,
        featured_label: pkg.featured_label || '',
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
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            type="button"
                        >
                            <Link href={`/admin/packages/${pkg.id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                Edit Package
                            </h1>
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
                                <CardDescription>
                                    Read-only package details from provider
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Provider
                                    </span>
                                    <span>{pkg.provider?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Country
                                    </span>
                                    <span>
                                        {pkg.country?.name} (
                                        {pkg.country?.iso_code})
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Package ID
                                    </span>
                                    <span className="font-mono text-sm">
                                        {pkg.provider_package_id}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Data
                                    </span>
                                    <span>{formatData(pkg.data_mb)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Validity
                                    </span>
                                    <span>{pkg.validity_days} days</span>
                                </div>
                                {pkg.source_cost_price && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Source Cost (
                                            {pkg.source_currency?.code})
                                        </span>
                                        <span>
                                            {pkg.source_currency?.symbol}
                                            {Number(
                                                pkg.source_cost_price,
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Cost Price
                                    </span>
                                    <span>
                                        {currencySymbol}
                                        {Number(pkg.cost_price).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        System Retail Price
                                    </span>
                                    <span>
                                        {currencySymbol}
                                        {retailPrice.toFixed(2)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Price Override</CardTitle>
                                <CardDescription>
                                    Set a custom retail price (optional)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="custom_retail_price">
                                        Custom Retail Price (
                                        {defaultCurrency?.code || 'EUR'})
                                    </Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                                                {currencySymbol}
                                            </span>
                                            <Input
                                                id="custom_retail_price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder={retailPrice.toFixed(
                                                    2,
                                                )}
                                                value={data.custom_retail_price}
                                                onChange={(e) =>
                                                    setData(
                                                        'custom_retail_price',
                                                        e.target.value,
                                                    )
                                                }
                                                className="pl-7"
                                            />
                                        </div>
                                        {data.custom_retail_price && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={clearCustomPrice}
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                    {errors.custom_retail_price && (
                                        <p className="text-sm text-destructive">
                                            {errors.custom_retail_price}
                                        </p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Leave empty to use the system calculated
                                        price ({currencySymbol}
                                        {retailPrice.toFixed(2)})
                                    </p>
                                </div>

                                {data.custom_retail_price && (
                                    <div className="rounded-lg border bg-muted/50 p-3">
                                        <div className="flex justify-between text-sm">
                                            <span>System Price</span>
                                            <span className="text-muted-foreground line-through">
                                                {currencySymbol}
                                                {retailPrice.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between font-medium">
                                            <span>Custom Price</span>
                                            <span className="text-primary">
                                                {currencySymbol}
                                                {Number(
                                                    data.custom_retail_price ||
                                                        0,
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {competitorPricing &&
                            Object.keys(competitorPricing).length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Competitor Pricing
                                        </CardTitle>
                                        <CardDescription>
                                            Compare with competitor prices for{' '}
                                            {formatData(pkg.data_mb)} /{' '}
                                            {pkg.validity_days}d
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {Object.values(competitorPricing).map(
                                            (match) => {
                                                const {
                                                    exact,
                                                    same_gb,
                                                    same_days,
                                                } = match;
                                                const hasData =
                                                    exact ||
                                                    same_gb.length > 0 ||
                                                    same_days.length > 0;

                                                return (
                                                    <div
                                                        key={match.competitor}
                                                        className="space-y-2"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {exact ? (
                                                                <CircleCheck className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                                                            ) : (
                                                                <CircleMinus
                                                                    className={`h-4 w-4 shrink-0 ${hasData ? 'text-yellow-500' : 'text-muted-foreground/50'}`}
                                                                />
                                                            )}
                                                            <span className="text-sm font-medium">
                                                                {
                                                                    match.display_name
                                                                }
                                                            </span>
                                                            {exact && (
                                                                <span className="ml-auto text-sm font-semibold">
                                                                    {
                                                                        currencySymbol
                                                                    }
                                                                    {exact.price.toFixed(
                                                                        2,
                                                                    )}
                                                                    {(() => {
                                                                        const ourPrice =
                                                                            customPrice ??
                                                                            retailPrice;
                                                                        const diff =
                                                                            exact.price -
                                                                            ourPrice;
                                                                        const pct =
                                                                            ourPrice >
                                                                            0
                                                                                ? (
                                                                                      (diff /
                                                                                          ourPrice) *
                                                                                      100
                                                                                  ).toFixed(
                                                                                      0,
                                                                                  )
                                                                                : '0';
                                                                        return (
                                                                            <span
                                                                                className={`ml-1.5 rounded px-1 py-0.5 text-[10px] font-medium ${
                                                                                    diff >
                                                                                    0
                                                                                        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                                                                                        : diff <
                                                                                            0
                                                                                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                                                                          : 'bg-gray-100 text-gray-600'
                                                                                }`}
                                                                            >
                                                                                {diff >
                                                                                0
                                                                                    ? '+'
                                                                                    : ''}
                                                                                {
                                                                                    pct
                                                                                }
                                                                                %
                                                                            </span>
                                                                        );
                                                                    })()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {exact && (
                                                            <p className="ml-6 text-xs text-muted-foreground">
                                                                {
                                                                    exact.plan_name
                                                                }
                                                                {exact.is_regional &&
                                                                    ` (${exact.destination_name})`}
                                                            </p>
                                                        )}
                                                        {!exact && hasData && (
                                                            <p className="ml-6 text-xs text-muted-foreground">
                                                                No exact match.{' '}
                                                                {same_gb.length >
                                                                    0 &&
                                                                    `${same_gb.length} same GB. `}
                                                                {same_days.length >
                                                                    0 &&
                                                                    `${same_days.length} same days.`}
                                                            </p>
                                                        )}
                                                        {same_gb.length >
                                                            0 && (
                                                            <div className="ml-6 flex flex-wrap gap-1.5">
                                                                {same_gb.map(
                                                                    (p) => (
                                                                        <span
                                                                            key={`${p.plan_code}-${p.duration_days}-${p.price}`}
                                                                            className="rounded border bg-muted/50 px-1.5 py-0.5 text-[11px]"
                                                                        >
                                                                            {
                                                                                p.duration_days
                                                                            }
                                                                            d ={' '}
                                                                            {
                                                                                currencySymbol
                                                                            }
                                                                            {p.price.toFixed(
                                                                                2,
                                                                            )}
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                        {same_days.length >
                                                            0 && (
                                                            <div className="ml-6 flex flex-wrap gap-1.5">
                                                                {same_days.map(
                                                                    (p) => (
                                                                        <span
                                                                            key={`${p.plan_code}-${p.data_gb}-${p.price}`}
                                                                            className="rounded border bg-muted/50 px-1.5 py-0.5 text-[11px]"
                                                                        >
                                                                            {p.data_gb ===
                                                                            0
                                                                                ? 'Unlim'
                                                                                : `${p.data_gb}GB`}
                                                                            ={' '}
                                                                            {
                                                                                currencySymbol
                                                                            }
                                                                            {p.price.toFixed(
                                                                                2,
                                                                            )}
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                        {!hasData && (
                                                            <p className="ml-6 text-xs text-muted-foreground">
                                                                No matching
                                                                plans
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            },
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                                <CardDescription>
                                    Control package visibility and availability
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_active">
                                            Active
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Package will be available for
                                            purchase
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) =>
                                            setData('is_active', checked)
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_featured">
                                            Featured
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Highlight with gold badge on country
                                            page
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onCheckedChange={(checked) =>
                                            setData('is_featured', checked)
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="show_on_homepage">
                                            Show on Homepage
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Display in the homepage carousel
                                        </p>
                                    </div>
                                    <Switch
                                        id="show_on_homepage"
                                        checked={data.show_on_homepage}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'show_on_homepage',
                                                checked,
                                            )
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {data.show_on_homepage && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Featured Settings</CardTitle>
                                    <CardDescription>
                                        Control how this package appears in the
                                        homepage carousel
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="featured_label">
                                            Badge Label
                                        </Label>
                                        <select
                                            id="featured_label"
                                            value={data.featured_label}
                                            onChange={(e) =>
                                                setData(
                                                    'featured_label',
                                                    e.target.value,
                                                )
                                            }
                                            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                                        >
                                            <option value="">
                                                None
                                            </option>
                                            <option value="featured">
                                                Featured
                                            </option>
                                            <option value="best_value">
                                                Best Value
                                            </option>
                                            <option value="popular">
                                                Popular
                                            </option>
                                            <option value="hot_deal">
                                                Hot Deal
                                            </option>
                                        </select>
                                        {errors.featured_label && (
                                            <p className="text-sm text-destructive">
                                                {errors.featured_label}
                                            </p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            Optional badge shown on the homepage
                                            carousel card
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="featured_order">
                                            Sort Order
                                        </Label>
                                        <Input
                                            id="featured_order"
                                            type="number"
                                            min="0"
                                            value={data.featured_order}
                                            onChange={(e) =>
                                                setData(
                                                    'featured_order',
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                        />
                                        {errors.featured_order && (
                                            <p className="text-sm text-destructive">
                                                {errors.featured_order}
                                            </p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            Lower numbers appear first. Default
                                            is 0.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" asChild type="button">
                            <Link href={`/admin/packages/${pkg.id}`}>
                                Cancel
                            </Link>
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
