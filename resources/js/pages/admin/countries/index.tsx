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
import { ChevronLeft, ChevronRight, Eye, RefreshCw, RotateCcw, Search } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

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

    const allSelected = countries.data.length > 0 && selectedIds.length === countries.data.length;
    const someSelected = selectedIds.length > 0 && selectedIds.length < countries.data.length;

    const hasActiveFilters = useMemo(() => {
        return !!(filters.search || filters.region || filters.is_active);
    }, [filters]);

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/admin/countries', { ...filters, search }, { preserveState: true });
    }

    function handleFilterChange(key: string, value: string) {
        router.get('/admin/countries', { ...filters, [key]: value === 'all' ? undefined : value }, { preserveState: true });
    }

    function resetFilters() {
        setSearch('');
        router.get('/admin/countries', {}, { preserveState: true });
    }

    function toggleSelectAll() {
        setSelectedIds(allSelected ? [] : countries.data.map((c) => c.id));
    }

    function toggleSelect(id: number) {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    }

    function handleBulkActivate() {
        if (selectedIds.length === 0) return;
        router.post('/admin/countries/bulk-activate', { ids: selectedIds }, {
            preserveState: true,
            onSuccess: () => setSelectedIds([]),
        });
    }

    function handleBulkDeactivate() {
        if (selectedIds.length === 0) return;
        router.post('/admin/countries/bulk-deactivate', { ids: selectedIds }, {
            preserveState: true,
            onSuccess: () => setSelectedIds([]),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Countries" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold">Countries</h1>
                        <Badge variant="secondary" className="font-normal">
                            {countries.total}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={resetFilters}>
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                Reset
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.post('/admin/countries/sync-disabled')}
                        >
                            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                            Sync Disabled
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 w-[200px] pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="sm">
                            Search
                        </Button>
                    </form>
                    <Select value={filters.region || 'all'} onValueChange={(v) => handleFilterChange('region', v)}>
                        <SelectTrigger className="h-9 w-[150px]">
                            <SelectValue placeholder="Region" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All regions</SelectItem>
                            {regions.map((r) => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filters.is_active ?? 'all'} onValueChange={(v) => handleFilterChange('is_active', v)}>
                        <SelectTrigger className="h-9 w-[120px]">
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
                    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                {selectedIds.length}
                            </div>
                            <span className="text-sm font-medium">selected</span>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-8" onClick={handleBulkActivate}>
                                Enable
                            </Button>
                            <Button size="sm" variant="outline" className="h-8" onClick={handleBulkDeactivate}>
                                Disable
                            </Button>
                            <div className="mx-1 h-4 w-px bg-border" />
                            <Button size="sm" variant="ghost" className="h-8" onClick={() => setSelectedIds([])}>
                                Clear
                            </Button>
                        </div>
                    </div>
                )}

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[40px]">
                                    <Checkbox
                                        checked={allSelected}
                                        ref={(el) => { if (el) (el as any).indeterminate = someSelected; }}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>ISO</TableHead>
                                <TableHead>Region</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Packages</TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {countries.data.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                                        No countries found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                countries.data.map((country) => {
                                    const isSelected = selectedIds.includes(country.id);
                                    return (
                                        <TableRow
                                            key={country.id}
                                            className={`group ${isSelected ? 'bg-primary/5' : ''} ${!country.is_active ? 'opacity-60' : ''}`}
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleSelect(country.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {country.flag_emoji && <span>{country.flag_emoji}</span>}
                                                    <span className="font-medium">{country.name}</span>
                                                    {country.is_region && (
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0">Region</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs">{country.iso_code}</code>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {country.region || '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={country.is_active ? 'default' : 'secondary'}>
                                                    {country.is_active ? 'Enabled' : 'Disabled'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="tabular-nums">
                                                <span className="text-muted-foreground">
                                                    {country.active_packages_count}/{country.packages_count}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                                    asChild
                                                >
                                                    <Link href={`/admin/countries/${country.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {countries.last_page > 1 && (
                    <div className="flex items-center justify-between border-t pt-4">
                        <span className="text-sm text-muted-foreground">
                            Page {countries.current_page} of {countries.last_page}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                disabled={countries.current_page === 1}
                                onClick={() => router.get('/admin/countries', { ...filters, page: countries.current_page - 1 })}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                disabled={countries.current_page === countries.last_page}
                                onClick={() => router.get('/admin/countries', { ...filters, page: countries.current_page + 1 })}
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
