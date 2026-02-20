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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    CircleMinus,
    Eye,
    Info,
    Pencil,
    RotateCcw,
    Search,
    Star,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

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

interface CompetitorPlan {
    competitor: string;
    plan_code: string;
    plan_name: string;
    price: number;
    currency: string;
    data_gb: number;
    duration_days: number;
    destination_code: string;
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
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
        per_page?: string;
    };
    defaultCurrency: Currency | null;
    competitorPricing: Record<number, Record<string, CompetitorMatch>>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Packages', href: '/admin/packages' },
];

type SortColumn =
    | 'name'
    | 'provider'
    | 'country'
    | 'data_mb'
    | 'validity_days'
    | 'cost_price'
    | 'retail_price'
    | 'is_active'
    | 'created_at';

function formatData(mb: number): string {
    return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
}

function SortableHeader({
    column,
    label,
    currentSort,
    currentDir,
    onSort,
}: {
    column: SortColumn;
    label: string;
    currentSort?: string;
    currentDir?: 'asc' | 'desc';
    onSort: (column: SortColumn) => void;
}) {
    const isActive = currentSort === column;
    return (
        <TableHead
            className="cursor-pointer select-none hover:bg-muted/50"
            onClick={() => onSort(column)}
        >
            <div className="flex items-center gap-1">
                <span>{label}</span>
                {isActive ? (
                    currentDir === 'asc' ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                    ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                    )
                ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                )}
            </div>
        </TableHead>
    );
}

function CompetitorPriceCell({
    matches,
    ourPrice,
    currencySymbol,
}: {
    matches: Record<string, CompetitorMatch> | undefined;
    ourPrice: number;
    currencySymbol: string;
}) {
    if (!matches) return <span className="text-muted-foreground">-</span>;

    const entries = Object.values(matches);
    if (entries.length === 0)
        return <span className="text-muted-foreground">-</span>;

    return (
        <div className="flex flex-col gap-1">
            {entries.map((match) => {
                const { exact, same_gb, same_days } = match;
                const hasData = exact || same_gb.length > 0 || same_days.length > 0;

                if (!hasData) {
                    return (
                        <div
                            key={match.competitor}
                            className="flex items-center gap-1 text-xs text-muted-foreground"
                        >
                            <CircleMinus className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                            <span>{match.display_name}</span>
                        </div>
                    );
                }

                if (exact) {
                    const diff = exact.price - ourPrice;
                    const diffPct =
                        ourPrice > 0
                            ? ((diff / ourPrice) * 100).toFixed(0)
                            : '0';
                    const isHigher = diff > 0;
                    const isLower = diff < 0;

                    return (
                        <TooltipProvider key={match.competitor}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <CircleCheck className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400" />
                                        <span className="font-medium text-muted-foreground">
                                            {match.display_name}:
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                            {currencySymbol}
                                            {exact.price.toFixed(2)}
                                        </span>
                                        <span
                                            className={`rounded px-1 py-0.5 text-[10px] font-medium ${
                                                isHigher
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                                                    : isLower
                                                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            }`}
                                        >
                                            {isHigher ? '+' : ''}
                                            {diffPct}%
                                        </span>
                                        {exact.is_regional && (
                                            <span className="rounded bg-blue-100 px-1 py-0.5 text-[10px] text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                                                {exact.destination_name}
                                            </span>
                                        )}
                                        {(same_gb.length > 0 ||
                                            same_days.length > 0) && (
                                            <Info className="h-3 w-3 text-muted-foreground" />
                                        )}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="left"
                                    className="max-w-xs"
                                >
                                    <div className="space-y-2 text-xs">
                                        <div>
                                            <span className="font-semibold">
                                                Exact match
                                                {exact.is_regional
                                                    ? ` (${exact.destination_name})`
                                                    : ''}
                                                :
                                            </span>{' '}
                                            {exact.plan_name} -{' '}
                                            {currencySymbol}
                                            {exact.price.toFixed(2)}
                                        </div>
                                        {same_gb.length > 0 && (
                                            <div>
                                                <span className="font-semibold">
                                                    Same GB, different days:
                                                </span>
                                                <ul className="mt-0.5 space-y-0.5">
                                                    {same_gb.map((p) => (
                                                        <li
                                                            key={p.plan_code}
                                                            className="text-muted-foreground"
                                                        >
                                                            {p.duration_days}d -{' '}
                                                            {currencySymbol}
                                                            {p.price.toFixed(2)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {same_days.length > 0 && (
                                            <div>
                                                <span className="font-semibold">
                                                    Same days, different GB:
                                                </span>
                                                <ul className="mt-0.5 space-y-0.5">
                                                    {same_days.map((p) => (
                                                        <li
                                                            key={p.plan_code}
                                                            className="text-muted-foreground"
                                                        >
                                                            {p.data_gb === 0
                                                                ? 'Unlimited'
                                                                : `${p.data_gb}GB`}{' '}
                                                            - {currencySymbol}
                                                            {p.price.toFixed(2)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                }

                // No exact match - show alternatives summary
                return (
                    <TooltipProvider key={match.competitor}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <CircleMinus className="h-3.5 w-3.5 shrink-0 text-yellow-500 dark:text-yellow-400" />
                                    <span className="font-medium text-muted-foreground">
                                        {match.display_name}:
                                    </span>
                                    <span className="italic text-muted-foreground">
                                        ~{same_gb.length + same_days.length}{' '}
                                        similar
                                    </span>
                                    <Info className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs">
                                <div className="space-y-2 text-xs">
                                    <div className="font-medium text-yellow-600 dark:text-yellow-400">
                                        No exact match found
                                    </div>
                                    {same_gb.length > 0 && (
                                        <div>
                                            <span className="font-semibold">
                                                Same GB, different days:
                                            </span>
                                            <ul className="mt-0.5 space-y-0.5">
                                                {same_gb.map((p) => (
                                                    <li
                                                        key={p.plan_code}
                                                        className="text-muted-foreground"
                                                    >
                                                        {p.duration_days}d -{' '}
                                                        {currencySymbol}
                                                        {p.price.toFixed(2)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {same_days.length > 0 && (
                                        <div>
                                            <span className="font-semibold">
                                                Same days, different GB:
                                            </span>
                                            <ul className="mt-0.5 space-y-0.5">
                                                {same_days.map((p) => (
                                                    <li
                                                        key={p.plan_code}
                                                        className="text-muted-foreground"
                                                    >
                                                        {p.data_gb === 0
                                                            ? 'Unlimited'
                                                            : `${p.data_gb}GB`}{' '}
                                                        - {currencySymbol}
                                                        {p.price.toFixed(2)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            })}
        </div>
    );
}

export default function PackagesIndex({
    packages,
    providers,
    countries,
    filters,
    defaultCurrency,
    competitorPricing,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const currencySymbol = defaultCurrency?.symbol || '€';

    const allSelected =
        packages.data.length > 0 && selectedIds.length === packages.data.length;
    const someSelected =
        selectedIds.length > 0 && selectedIds.length < packages.data.length;

    const hasActiveFilters = useMemo(() => {
        return !!(
            filters.search ||
            filters.provider_id ||
            filters.country_id ||
            filters.is_active ||
            filters.country_active ||
            filters.sort_by
        );
    }, [filters]);

    function resetFilters() {
        setSearch('');
        router.get(
            '/admin/packages',
            { per_page: filters.per_page },
            { preserveState: true },
        );
    }

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            '/admin/packages',
            { ...filters, search },
            { preserveState: true },
        );
    }

    function handleFilterChange(key: string, value: string) {
        router.get(
            '/admin/packages',
            { ...filters, [key]: value === 'all' ? undefined : value },
            { preserveState: true },
        );
    }

    function handleSort(column: SortColumn) {
        const newDir =
            filters.sort_by === column && filters.sort_dir === 'asc'
                ? 'desc'
                : 'asc';
        router.get(
            '/admin/packages',
            { ...filters, sort_by: column, sort_dir: newDir, page: 1 },
            { preserveState: true },
        );
    }

    function handlePerPageChange(value: string) {
        router.get(
            '/admin/packages',
            { ...filters, per_page: value, page: 1 },
            { preserveState: true },
        );
    }

    function toggleSelectAll() {
        setSelectedIds(allSelected ? [] : packages.data.map((p) => p.id));
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
            { preserveState: true, onSuccess: () => setSelectedIds([]) },
        );
    }

    function handleBulkDeactivate() {
        if (selectedIds.length === 0) return;
        router.post(
            '/admin/packages/bulk-deactivate',
            { ids: selectedIds },
            { preserveState: true, onSuccess: () => setSelectedIds([]) },
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
        if (pkg.custom_retail_price !== null)
            return { price: Number(pkg.custom_retail_price), isCustom: true };
        return { price: Number(pkg.retail_price), isCustom: false };
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Packages" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold">Packages</h1>
                        <Badge variant="secondary" className="font-normal">
                            {packages.total.toLocaleString()}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.post(
                                    '/admin/competitor-pricing/refresh',
                                    {},
                                    { preserveState: true },
                                )
                            }
                        >
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                            Refresh Competitors
                        </Button>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                            >
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                Reset
                            </Button>
                        )}
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
                    <Select
                        value={filters.provider_id || 'all'}
                        onValueChange={(v) =>
                            handleFilterChange('provider_id', v)
                        }
                    >
                        <SelectTrigger className="h-9 w-[140px]">
                            <SelectValue placeholder="Provider" />
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
                        <SelectTrigger className="h-9 w-[140px]">
                            <SelectValue placeholder="Country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All countries</SelectItem>
                            {countries.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
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
                        <SelectTrigger className="h-9 w-[120px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="1">Active</SelectItem>
                            <SelectItem value="0">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.per_page || '50'}
                        onValueChange={handlePerPageChange}
                    >
                        <SelectTrigger className="h-9 w-[80px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="200">200</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                {selectedIds.length}
                            </div>
                            <span className="text-sm font-medium">
                                selected
                            </span>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={handleBulkActivate}
                            >
                                Activate
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={handleBulkDeactivate}
                            >
                                Deactivate
                            </Button>
                            <div className="mx-1 h-4 w-px bg-border" />
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8"
                                onClick={() => setSelectedIds([])}
                            >
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
                                        ref={(el) => {
                                            if (el)
                                                (el as any).indeterminate =
                                                    someSelected;
                                        }}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <SortableHeader
                                    column="name"
                                    label="Name"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="provider"
                                    label="Provider"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="country"
                                    label="Country"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="data_mb"
                                    label="Data"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="validity_days"
                                    label="Validity"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="cost_price"
                                    label="Cost"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="retail_price"
                                    label="Price"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="is_active"
                                    label="Status"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <TableHead>Competitor</TableHead>
                                <TableHead className="w-[100px] text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {packages.data.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell
                                        colSpan={11}
                                        className="py-8 text-center text-sm text-muted-foreground"
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
                                    const isSelected = selectedIds.includes(
                                        pkg.id,
                                    );
                                    return (
                                        <TableRow
                                            key={pkg.id}
                                            className={`group ${isSelected ? 'bg-primary/5' : ''} ${!pkg.is_active ? 'opacity-60' : ''}`}
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() =>
                                                        toggleSelect(pkg.id)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    {pkg.is_featured && (
                                                        <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                                                    )}
                                                    <span className="font-medium">
                                                        {pkg.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {pkg.provider?.name || '—'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <span>
                                                        {pkg.country?.name ||
                                                            '—'}
                                                    </span>
                                                    {countryDisabled && (
                                                        <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="tabular-nums">
                                                {formatData(pkg.data_mb)}
                                            </TableCell>
                                            <TableCell className="tabular-nums">
                                                {pkg.validity_days}d
                                            </TableCell>
                                            <TableCell className="text-muted-foreground tabular-nums">
                                                {currencySymbol}
                                                {Number(pkg.cost_price).toFixed(
                                                    2,
                                                )}
                                            </TableCell>
                                            <TableCell className="tabular-nums">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-medium">
                                                        {currencySymbol}
                                                        {price.toFixed(2)}
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
                                                <CompetitorPriceCell
                                                    matches={
                                                        competitorPricing?.[
                                                            pkg.id
                                                        ]
                                                    }
                                                    ourPrice={price}
                                                    currencySymbol={
                                                        currencySymbol
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-0.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            toggleFeatured(
                                                                pkg.id,
                                                            )
                                                        }
                                                    >
                                                        <Star
                                                            className={`h-4 w-4 ${pkg.is_featured ? 'fill-yellow-400 text-yellow-400' : ''}`}
                                                        />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
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
                                                        className="h-8 w-8"
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
                    <div className="flex items-center justify-between border-t pt-4">
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
                                    router.get('/admin/packages', {
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
                                    router.get('/admin/packages', {
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
