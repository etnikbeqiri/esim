import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { AlertTriangle, Eye, Pencil, Search, Star } from 'lucide-react';
import { FormEvent, useState } from 'react';

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
    country: {
        id: number;
        name: string;
        iso_code: string;
        is_active: boolean;
    } | null;
}

interface Provider {
    id: number;
    name: string;
}

interface Country {
    id: number;
    name: string;
    iso_code: string;
    is_active: boolean;
}

interface Currency {
    id: number;
    code: string;
    symbol: string;
}

interface Props {
    packages: {
        data: Package[];
        current_page: number;
        last_page: number;
        total: number;
    };
    providers: Provider[];
    countries: Country[];
    filters: {
        search?: string;
        provider_id?: string;
        country_id?: string;
        is_active?: string;
        country_active?: string;
    };
    defaultCurrency: Currency | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Packages', href: '/admin/packages' },
];

function formatData(mb: number): string {
    if (mb >= 1024) {
        return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
}

export default function PackagesIndex({
    packages,
    providers,
    countries,
    filters,
    defaultCurrency,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const currencySymbol = defaultCurrency?.symbol || '€';

    const allSelected =
        packages.data.length > 0 && selectedIds.length === packages.data.length;
    const someSelected =
        selectedIds.length > 0 && selectedIds.length < packages.data.length;

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            '/admin/packages',
            { ...filters, search },
            { preserveState: true },
        );
    }

    function handleFilterChange(key: string, value: string) {
        const newFilters = {
            ...filters,
            [key]: value === 'all' ? undefined : value,
        };
        router.get('/admin/packages', newFilters, { preserveState: true });
    }

    function toggleSelectAll() {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(packages.data.map((p) => p.id));
        }
    }

    function toggleSelect(id: number) {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    }

    function handleBulkActivate() {
        if (selectedIds.length === 0) return;
        router.post(
            '/admin/packages/bulk-activate',
            { ids: selectedIds },
            {
                preserveState: true,
                onSuccess: () => setSelectedIds([]),
            },
        );
    }

    function handleBulkDeactivate() {
        if (selectedIds.length === 0) return;
        router.post(
            '/admin/packages/bulk-deactivate',
            { ids: selectedIds },
            {
                preserveState: true,
                onSuccess: () => setSelectedIds([]),
            },
        );
    }

    function toggleFeatured(id: number) {
        router.post(
            `/admin/packages/${id}/toggle-featured`,
            {},
            { preserveState: true },
        );
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
            <Head title="Packages" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Packages</h1>
                    <span className="text-muted-foreground">
                        {packages.total} packages
                    </span>
                </div>

                <div className="flex flex-wrap gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search packages..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-[200px] pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>

                    <Select
                        value={filters.provider_id || 'all'}
                        onValueChange={(v) =>
                            handleFilterChange('provider_id', v)
                        }
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="All providers" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All providers</SelectItem>
                            {providers.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.country_id || 'all'}
                        onValueChange={(v) =>
                            handleFilterChange('country_id', v)
                        }
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="All countries" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All countries</SelectItem>
                            {countries.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name} ({c.iso_code}){' '}
                                    {!c.is_active && '(Disabled)'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.is_active ?? 'all'}
                        onValueChange={(v) =>
                            handleFilterChange('is_active', v)
                        }
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="1">Active</SelectItem>
                            <SelectItem value="0">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.country_active ?? 'all'}
                        onValueChange={(v) =>
                            handleFilterChange('country_active', v)
                        }
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Country Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            <SelectItem value="1">Enabled Countries</SelectItem>
                            <SelectItem value="0">
                                Disabled Countries
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2">
                        <span className="text-sm font-medium">
                            {selectedIds.length} selected
                        </span>
                        <div className="ml-auto flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleBulkActivate}
                            >
                                Activate Selected
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleBulkDeactivate}
                            >
                                Deactivate Selected
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedIds([])}
                            >
                                Clear Selection
                            </Button>
                        </div>
                    </div>
                )}

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]">
                                    <Checkbox
                                        checked={allSelected}
                                        ref={(el) => {
                                            if (el)
                                                (el as any).indeterminate =
                                                    someSelected;
                                        }}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Provider</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Validity</TableHead>
                                <TableHead>Cost</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {packages.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={10}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No packages found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                packages.data.map((pkg) => {
                                    const { price, isCustom } =
                                        getEffectivePrice(pkg);
                                    const countryDisabled =
                                        pkg.country && !pkg.country.is_active;
                                    return (
                                        <TableRow
                                            key={pkg.id}
                                            className={
                                                selectedIds.includes(pkg.id)
                                                    ? 'bg-muted/50'
                                                    : ''
                                            }
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedIds.includes(
                                                        pkg.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleSelect(pkg.id)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate font-medium">
                                                {pkg.name}
                                            </TableCell>
                                            <TableCell>
                                                {pkg.provider?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {pkg.country?.name || '-'}
                                                    {countryDisabled && (
                                                        <AlertTriangle
                                                            className="h-3 w-3 text-orange-500"
                                                            title="Country disabled"
                                                        />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatData(pkg.data_mb)}
                                            </TableCell>
                                            <TableCell>
                                                {pkg.validity_days}d
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {currencySymbol}
                                                {Number(pkg.cost_price).toFixed(
                                                    2,
                                                )}
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
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            toggleFeatured(
                                                                pkg.id,
                                                            )
                                                        }
                                                        title={
                                                            pkg.is_featured
                                                                ? 'Remove from featured'
                                                                : 'Add to featured'
                                                        }
                                                    >
                                                        <Star
                                                            className={`h-4 w-4 ${pkg.is_featured ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`}
                                                        />
                                                    </Button>
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
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/admin/packages/${pkg.id}/edit`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {packages.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from(
                            { length: Math.min(packages.last_page, 10) },
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
                                    router.get('/admin/packages', {
                                        ...filters,
                                        page,
                                    })
                                }
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
