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
import { Eye, RefreshCw, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Country {
    id: number;
    iso_code: string;
    iso_code_3: string;
    name: string;
    region: string | null;
    flag_emoji: string | null;
    is_active: boolean;
    is_region: boolean;
    packages_count: number;
    active_packages_count: number;
}

interface Props {
    countries: {
        data: Country[];
        current_page: number;
        last_page: number;
        total: number;
    };
    regions: string[];
    filters: {
        search?: string;
        region?: string;
        is_active?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Countries', href: '/admin/countries' },
];

export default function CountriesIndex({ countries, regions, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const allSelected =
        countries.data.length > 0 &&
        selectedIds.length === countries.data.length;
    const someSelected =
        selectedIds.length > 0 && selectedIds.length < countries.data.length;

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            '/admin/countries',
            { ...filters, search },
            { preserveState: true },
        );
    }

    function handleFilterChange(key: string, value: string) {
        const newFilters = {
            ...filters,
            [key]: value === 'all' ? undefined : value,
        };
        router.get('/admin/countries', newFilters, { preserveState: true });
    }

    function toggleSelectAll() {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(countries.data.map((c) => c.id));
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
            '/admin/countries/bulk-activate',
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
            '/admin/countries/bulk-deactivate',
            { ids: selectedIds },
            {
                preserveState: true,
                onSuccess: () => setSelectedIds([]),
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Countries" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Countries</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                            {countries.total} countries
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.post('/admin/countries/sync-disabled')
                            }
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync Disabled Countries
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search countries..."
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
                        value={filters.region || 'all'}
                        onValueChange={(v) => handleFilterChange('region', v)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All regions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All regions</SelectItem>
                            {regions.map((r) => (
                                <SelectItem key={r} value={r}>
                                    {r}
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
                            <SelectItem value="1">Enabled</SelectItem>
                            <SelectItem value="0">Disabled</SelectItem>
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
                                Enable Selected
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleBulkDeactivate}
                            >
                                Disable Selected
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
                                <TableHead>Country</TableHead>
                                <TableHead>ISO Code</TableHead>
                                <TableHead>Region</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Packages</TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {countries.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No countries found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                countries.data.map((country) => (
                                    <TableRow
                                        key={country.id}
                                        className={
                                            selectedIds.includes(country.id)
                                                ? 'bg-muted/50'
                                                : ''
                                        }
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(
                                                    country.id,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleSelect(country.id)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {country.flag_emoji && (
                                                    <span>
                                                        {country.flag_emoji}
                                                    </span>
                                                )}
                                                {country.name}
                                                {country.is_region && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        Region
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {country.iso_code} /{' '}
                                            {country.iso_code_3}
                                        </TableCell>
                                        <TableCell>
                                            {country.region || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    country.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {country.is_active
                                                    ? 'Enabled'
                                                    : 'Disabled'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-muted-foreground">
                                                {country.active_packages_count}{' '}
                                                / {country.packages_count}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={`/admin/countries/${country.id}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {countries.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from(
                            { length: Math.min(countries.last_page, 10) },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <Button
                                key={page}
                                variant={
                                    page === countries.current_page
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                    router.get('/admin/countries', {
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
