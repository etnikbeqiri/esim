import { index as countriesIndex, toggleActive as countryToggleActive } from '@/actions/App/Http/Controllers/Admin/CountryController';
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
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, Star } from 'lucide-react';

interface Package {
    id: number;
    name: string;
    data_mb: number;
    validity_days: number;
    cost_price: string | number;
    retail_price: string | number;
    custom_retail_price: string | number | null;
    is_active: boolean;
    is_featured: boolean;
    provider: { id: number; name: string } | null;
}

interface Country {
    id: number;
    iso_code: string;
    iso_code_3: string;
    name: string;
    region: string | null;
    flag_emoji: string | null;
    is_active: boolean;
    is_popular: boolean;
    packages_count: number;
    active_packages_count: number;
}

interface Currency {
    id: number;
    code: string;
    symbol: string;
}

interface Props {
    country: Country;
    packages: {
        data: Package[];
        current_page: number;
        last_page: number;
        total: number;
    };
    defaultCurrency: Currency | null;
}

function formatData(mb: number): string {
    if (mb >= 1024) {
        return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
}

export default function CountryShow({
    country,
    packages,
    defaultCurrency,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Countries', href: '/admin/countries' },
        { title: country.name, href: `/admin/countries/${country.id}` },
    ];

    const currencySymbol = defaultCurrency?.symbol || '€';

    function handleToggleActive() {
        router.post(countryToggleActive.url(country.id));
    }

    function getEffectivePrice(pkg: Package): {
        price: number;
        isCustom: boolean;
    } {
        if (pkg.custom_retail_price !== null) {
            return { price: Number(pkg.custom_retail_price), isCustom: true };
        }
        return { price: Number(pkg.retail_price), isCustom: false };
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={country.name} />
            <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4 p-4">
                    <div className="flex items-start gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            asChild
                        >
                            <Link href={countriesIndex.url()}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                {country.flag_emoji && (
                                    <span className="text-2xl">
                                        {country.flag_emoji}
                                    </span>
                                )}
                                <h1 className="text-xl font-semibold">
                                    {country.name}
                                </h1>
                                {country.is_popular && (
                                    <Badge
                                        variant="outline"
                                        className="border-yellow-500/50 text-yellow-600"
                                    >
                                        Popular
                                    </Badge>
                                )}
                            </div>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                {country.iso_code} / {country.iso_code_3} ·{' '}
                                {country.region || 'No region'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={
                                country.is_active ? 'default' : 'secondary'
                            }
                        >
                            {country.is_active ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleToggleActive}
                        >
                            {country.is_active ? 'Disable' : 'Enable'}
                        </Button>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-5xl space-y-6 px-4">
                    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border bg-border">
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                Total Packages
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {country.packages_count}
                            </p>
                        </div>
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                Active
                            </p>
                            <p className="mt-1 text-lg font-semibold text-green-600">
                                {country.active_packages_count}
                            </p>
                        </div>
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                Inactive
                            </p>
                            <p className="mt-1 text-lg font-semibold text-muted-foreground">
                                {country.packages_count -
                                    country.active_packages_count}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-4 text-sm font-medium">
                            Packages ({packages.total})
                        </h2>
                        <div className="rounded-lg border">
                            {packages.data.length === 0 ? (
                                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                    No packages in this country
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead>Name</TableHead>
                                            <TableHead>Provider</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Validity</TableHead>
                                            <TableHead>Cost</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-[60px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {packages.data.map((pkg) => {
                                            const { price, isCustom } =
                                                getEffectivePrice(pkg);
                                            return (
                                                <TableRow
                                                    key={pkg.id}
                                                    className={`group ${!pkg.is_active ? 'opacity-60' : ''}`}
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            {pkg.is_featured && (
                                                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                                            )}
                                                            <span className="font-medium">
                                                                {pkg.name}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {pkg.provider?.name ||
                                                            '—'}
                                                    </TableCell>
                                                    <TableCell className="tabular-nums">
                                                        {formatData(
                                                            pkg.data_mb,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="tabular-nums">
                                                        {pkg.validity_days}d
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground tabular-nums">
                                                        {currencySymbol}
                                                        {Number(
                                                            pkg.cost_price,
                                                        ).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="tabular-nums">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-medium">
                                                                {currencySymbol}
                                                                {price.toFixed(
                                                                    2,
                                                                )}
                                                            </span>
                                                            {isCustom && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="px-1 py-0 text-[10px]"
                                                                >
                                                                    Custom
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                pkg.is_active
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {pkg.is_active
                                                                ? 'Active'
                                                                : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/admin/packages/${pkg.id}`}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </div>

                        {packages.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Page {packages.current_page} of{' '}
                                    {packages.last_page}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8"
                                        disabled={packages.current_page === 1}
                                        onClick={() =>
                                            router.get(
                                                `/admin/countries/${country.id}`,
                                                {
                                                    page:
                                                        packages.current_page -
                                                        1,
                                                },
                                            )
                                        }
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8"
                                        disabled={
                                            packages.current_page ===
                                            packages.last_page
                                        }
                                        onClick={() =>
                                            router.get(
                                                `/admin/countries/${country.id}`,
                                                {
                                                    page:
                                                        packages.current_page +
                                                        1,
                                                },
                                            )
                                        }
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
