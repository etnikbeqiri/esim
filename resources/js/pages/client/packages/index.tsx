import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Globe, Search, Star, Wifi } from 'lucide-react';
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
    regions,
    filters,
    customer,
}: Props) {
    const { trans } = useTrans();
    const [search, setSearch] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Client', href: '/client' },
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={trans('client_packages.title')} />
            <div className="flex flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {trans('client_packages.title')}
                        </h1>
                        <p className="text-muted-foreground">
                            {trans('client_packages.available_packages', {
                                count: packages.total.toString(),
                            })}
                        </p>
                    </div>
                    {customer?.is_b2b && (
                        <Badge variant="outline" className="px-4 py-2 text-lg">
                            {trans('client_packages.balance')}: €
                            {Number(customer.balance || 0).toFixed(2)}
                        </Badge>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder={trans(
                                    'client_packages.search_placeholder',
                                )}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-[250px] pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            {trans('client_packages.search')}
                        </Button>
                    </form>

                    <Select
                        value={filters.country || 'all'}
                        onValueChange={(v) => handleFilterChange('country', v)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue
                                placeholder={trans(
                                    'client_packages.all_countries',
                                )}
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
                        <SelectTrigger className="w-[150px]">
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

                    <Select
                        value={filters.direction || 'asc'}
                        onValueChange={(v) =>
                            handleFilterChange('direction', v)
                        }
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue
                                placeholder={trans('client_packages.order')}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asc">
                                {trans('client_packages.direction.asc')}
                            </SelectItem>
                            <SelectItem value="desc">
                                {trans('client_packages.direction.desc')}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Packages Grid */}
                {packages.data.length === 0 ? (
                    <div className="py-12 text-center">
                        <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">
                            {trans('client_packages.no_packages')}
                        </h3>
                        <p className="text-muted-foreground">
                            {trans('client_packages.no_packages_desc')}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {packages.data.map((pkg) => (
                            <Card key={pkg.id} className="flex flex-col">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="line-clamp-2 text-base">
                                                {pkg.name}
                                            </CardTitle>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {pkg.country ||
                                                    pkg.region ||
                                                    trans(
                                                        'client_packages.global',
                                                    )}
                                            </p>
                                        </div>
                                        {pkg.is_featured && (
                                            <Star className="h-5 w-5 shrink-0 fill-yellow-500 text-yellow-500" />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Wifi className="h-4 w-4 text-muted-foreground" />
                                            <span>{pkg.data_label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">
                                                {trans(
                                                    'client_packages.validity',
                                                )}
                                                :
                                            </span>
                                            <span>{pkg.validity_label}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex items-center justify-between border-t pt-3">
                                    <div>
                                        <span className="text-xl font-bold">
                                            €{Number(pkg.price).toFixed(2)}
                                        </span>
                                        {pkg.has_discount && (
                                            <span className="ml-2 text-sm text-muted-foreground line-through">
                                                €
                                                {Number(
                                                    pkg.original_price,
                                                ).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    <Button size="sm" asChild>
                                        <Link
                                            href={`/client/checkout/${pkg.id}`}
                                        >
                                            {trans('client_packages.buy_now')}
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
