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
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Eye, Package, Star } from 'lucide-react';

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
        router.post(`/admin/countries/${country.id}/toggle-active`);
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
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/countries">
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
                            <h1 className="text-2xl font-semibold">
                                {country.name}
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            {country.iso_code} / {country.iso_code_3} |{' '}
                            {country.region || 'No region'}
                        </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                        {country.is_popular && (
                            <Badge
                                variant="outline"
                                className="border-yellow-500 text-yellow-600"
                            >
                                Popular
                            </Badge>
                        )}
                        <Badge
                            variant={
                                country.is_active ? 'default' : 'secondary'
                            }
                        >
                            {country.is_active ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleToggleActive}
                        >
                            {country.is_active ? 'Disable' : 'Enable'} Country
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Packages
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {country.packages_count}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Active Packages
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                                {country.active_packages_count}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Inactive Packages
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-muted-foreground">
                                {country.packages_count -
                                    country.active_packages_count}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Packages ({packages.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {packages.data.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">
                                No packages in this country
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
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
                                            <TableRow key={pkg.id}>
                                                <TableCell className="max-w-[200px] truncate font-medium">
                                                    <div className="flex items-center gap-1">
                                                        {pkg.is_featured && (
                                                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                                        )}
                                                        {pkg.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {pkg.provider?.name || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {formatData(pkg.data_mb)}
                                                </TableCell>
                                                <TableCell>
                                                    {pkg.validity_days}d
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {currencySymbol}
                                                    {Number(
                                                        pkg.cost_price,
                                                    ).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-1">
                                                        {currencySymbol}
                                                        {price.toFixed(2)}
                                                        {isCustom && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs"
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

                        {packages.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-2">
                                {Array.from(
                                    {
                                        length: Math.min(
                                            packages.last_page,
                                            10,
                                        ),
                                    },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <Button
                                        key={page}
                                        variant={
                                            page === packages.current_page
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            router.get(
                                                `/admin/countries/${country.id}`,
                                                { page },
                                            )
                                        }
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
