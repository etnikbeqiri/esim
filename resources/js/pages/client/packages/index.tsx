import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Client', href: '/client' },
    { title: 'Packages', href: '/client/packages' },
];

export default function PackagesIndex({ packages, countries, regions, filters, customer }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/client/packages', { ...filters, search }, { preserveState: true });
    }

    function handleFilterChange(key: string, value: string) {
        const newFilters = { ...filters, [key]: value === 'all' ? undefined : value };
        router.get('/client/packages', newFilters, { preserveState: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="eSIM Packages" />
            <div className="flex flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">eSIM Packages</h1>
                        <p className="text-muted-foreground">{packages.total} packages available</p>
                    </div>
                    {customer?.is_b2b && (
                        <Badge variant="outline" className="text-lg px-4 py-2">
                            Balance: €{Number(customer.balance || 0).toFixed(2)}
                        </Badge>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search packages or countries..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 w-[250px]"
                            />
                        </div>
                        <Button type="submit" variant="secondary">Search</Button>
                    </form>

                    <Select
                        value={filters.country || 'all'}
                        onValueChange={(v) => handleFilterChange('country', v)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All countries" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All countries</SelectItem>
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
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="price">Price</SelectItem>
                            <SelectItem value="data">Data</SelectItem>
                            <SelectItem value="validity">Validity</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.direction || 'asc'}
                        onValueChange={(v) => handleFilterChange('direction', v)}
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Order" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Packages Grid */}
                {packages.data.length === 0 ? (
                    <div className="text-center py-12">
                        <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No packages found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {packages.data.map((pkg) => (
                            <Card key={pkg.id} className="flex flex-col">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-base line-clamp-2">
                                                {pkg.name}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {pkg.country || pkg.region || 'Global'}
                                            </p>
                                        </div>
                                        {pkg.is_featured && (
                                            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500 shrink-0" />
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
                                            <span className="text-muted-foreground">Validity:</span>
                                            <span>{pkg.validity_label}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex items-center justify-between pt-3 border-t">
                                    <div>
                                        <span className="text-xl font-bold">
                                            €{Number(pkg.price).toFixed(2)}
                                        </span>
                                        {pkg.has_discount && (
                                            <span className="text-sm text-muted-foreground line-through ml-2">
                                                €{Number(pkg.original_price).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    <Button size="sm" asChild>
                                        <Link href={`/client/checkout/${pkg.id}`}>Buy Now</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {packages.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: Math.min(packages.last_page, 10) }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === packages.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get('/client/packages', { ...filters, page })}
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
