import { Button } from '@/components/ui/button';
import { CountryFlag } from '@/components/country-flag';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTrans } from '@/hooks/use-trans';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Globe,
    HardDrive,
    Search,
    Timer,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Package {
    id: number;
    name: string;
    slug: string;
    country: string | null;
    country_iso: string | null;
    region: string | null;
    data_mb: number;
    data_label: string;
    validity_days: number;
    validity_label: string;
    price: string | number;
    original_price: string | number;
    has_discount: boolean;
    is_featured: boolean;
    provider: string | null;
}

interface Country {
    id: number;
    name: string;
    iso_code: string;
    region: string | null;
}

interface Customer {
    is_b2b: boolean;
    balance: number | null;
    discount_percentage: string;
}

interface Props {
    packages: {
        data: Package[];
        current_page: number;
        last_page: number;
        total: number;
    };
    countries: Country[];
    regions: string[];
    filters: {
        country?: string;
        search?: string;
        data_min?: string;
        data_max?: string;
        sort?: string;
        direction?: string;
    };
    customer: Customer | null;
}

export default function PackagesIndex({
    packages,
    countries,
    filters,
    customer,
}: Props) {
    const { trans } = useTrans();
    const [search, setSearch] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/client' },
        { title: trans('client_packages.title'), href: '/client/packages' },
    ];

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            '/client/packages',
            { ...filters, search },
            { preserveState: true },
        );
    }

    function handleFilterChange(key: string, value: string) {
        const newFilters = {
            ...filters,
            [key]: value === 'all' ? undefined : value,
        };
        router.get('/client/packages', newFilters, { preserveState: true });
    }

    const hasFilters = filters.country || filters.search || filters.sort;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={trans('client_packages.title')} />
            <div className="mx-auto w-full max-w-4xl space-y-5 p-4 md:space-y-6 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold md:text-2xl">
                            {trans('client_packages.title')}
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {packages.total} {trans('client_packages.title').toLowerCase()}
                        </p>
                    </div>
                    {customer?.is_b2b && (
                        <Link
                            href="/client/balance"
                            className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 ring-1 ring-inset ring-green-600/20 transition-colors hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
                        >
                            €{Number(customer.balance || 0).toFixed(2)}
                        </Link>
                    )}
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <form onSubmit={handleSearch} className="contents">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder={trans('client_packages.search_placeholder')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 w-[200px] pl-9 sm:w-[240px]"
                            />
                        </div>
                    </form>

                    <Select
                        value={filters.country || 'all'}
                        onValueChange={(v) => handleFilterChange('country', v)}
                    >
                        <SelectTrigger className="h-9 w-[160px]">
                            <SelectValue
                                placeholder={trans('client_packages.all_countries')}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {trans('client_packages.all_countries')}
                            </SelectItem>
                            {countries.map((c) => (
                                <SelectItem key={c.id} value={c.iso_code}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.sort || 'price'}
                        onValueChange={(v) => handleFilterChange('sort', v)}
                    >
                        <SelectTrigger className="h-9 w-[130px]">
                            <SelectValue
                                placeholder={trans('client_packages.sort_by')}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="price">
                                {trans('client_packages.sort.price')}
                            </SelectItem>
                            <SelectItem value="data">
                                {trans('client_packages.sort.data')}
                            </SelectItem>
                            <SelectItem value="validity">
                                {trans('client_packages.sort.validity')}
                            </SelectItem>
                            <SelectItem value="name">
                                {trans('client_packages.sort.name')}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {hasFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 text-xs"
                            onClick={() =>
                                router.get(
                                    '/client/packages',
                                    {},
                                    { preserveState: true },
                                )
                            }
                        >
                            Clear
                        </Button>
                    )}
                </div>

                {/* Packages list */}
                {packages.data.length === 0 ? (
                    <div className="rounded-xl border bg-card">
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="mb-4 rounded-full bg-muted p-4">
                                <Globe className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <h3 className="text-base font-semibold">
                                {trans('client_packages.no_packages')}
                            </h3>
                            <p className="mt-1 max-w-xs text-center text-sm text-muted-foreground">
                                {trans('client_packages.no_packages_desc')}
                            </p>
                            {hasFilters && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    onClick={() =>
                                        router.get(
                                            '/client/packages',
                                            {},
                                            { preserveState: true },
                                        )
                                    }
                                >
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="divide-y rounded-xl border bg-card">
                        {packages.data.map((pkg) => (
                            <div
                                key={pkg.id}
                                className="flex items-center gap-4 px-5 py-4 md:gap-5"
                            >
                                {/* Flag */}
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted md:h-14 md:w-14">
                                    {pkg.country_iso ? (
                                        <CountryFlag
                                            countryCode={pkg.country_iso}
                                            size="md"
                                        />
                                    ) : (
                                        <Globe className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold md:text-base">
                                        {pkg.name}
                                    </p>
                                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <HardDrive className="h-3 w-3" />
                                            {pkg.data_label}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Timer className="h-3 w-3" />
                                            {pkg.validity_label}
                                        </span>
                                        {pkg.country && (
                                            <span>{pkg.country}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Price + Buy */}
                                <div className="flex shrink-0 items-center gap-3 md:gap-4">
                                    <div className="text-right">
                                        <p className="text-base font-semibold tabular-nums md:text-lg">
                                            €{Number(pkg.price).toFixed(2)}
                                        </p>
                                        {pkg.has_discount && (
                                            <p className="text-xs text-muted-foreground line-through">
                                                €{Number(pkg.original_price).toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                    <Button size="sm" asChild>
                                        <Link href={`/client/checkout/${pkg.id}`}>
                                            {trans('client_packages.buy_now')}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {packages.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Page {packages.current_page} of {packages.last_page}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                disabled={packages.current_page === 1}
                                onClick={() =>
                                    router.get('/client/packages', {
                                        ...filters,
                                        page: packages.current_page - 1,
                                    })
                                }
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                disabled={
                                    packages.current_page === packages.last_page
                                }
                                onClick={() =>
                                    router.get('/client/packages', {
                                        ...filters,
                                        page: packages.current_page + 1,
                                    })
                                }
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
