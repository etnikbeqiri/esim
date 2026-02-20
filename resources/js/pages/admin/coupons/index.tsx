import { index as couponsIndex, create as couponsCreate, destroy as couponsDestroy, toggleActive as couponsToggle } from '@/actions/App/Http/Controllers/Admin/CouponController';
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
import { type BreadcrumbItem, type Coupon } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Eye,
    Pencil,
    Plus,
    Power,
    RotateCcw,
    Search,
    Trash2,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

interface PaginatedCoupons {
    data: Coupon[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    coupons: PaginatedCoupons;
    filters: {
        search?: string;
        type?: string;
        is_active?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Coupons', href: '/admin/coupons' },
];

function SortableHeader({
    column,
    label,
    currentSort,
    currentDir,
    onSort,
}: {
    column: string;
    label: string;
    currentSort?: string;
    currentDir?: 'asc' | 'desc';
    onSort: (column: string) => void;
}) {
    const isActive = currentSort === column;
    return (
        <TableHead
            className="cursor-pointer select-none hover:bg-muted/50"
            onClick={() => onSort(column)}
        >
            <div className="flex items-center gap-1">
                {label}
                {isActive ? (
                    currentDir === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )
                ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-30" />
                )}
            </div>
        </TableHead>
    );
}

export default function CouponsIndex({ coupons, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const allSelected =
        coupons.data.length > 0 && selectedIds.length === coupons.data.length;
    const someSelected =
        selectedIds.length > 0 && selectedIds.length < coupons.data.length;

    const hasActiveFilters = useMemo(() => {
        return !!(
            filters.search ||
            filters.type ||
            filters.is_active ||
            filters.sort_by
        );
    }, [filters]);

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            couponsIndex.url(),
            { ...filters, search },
            { preserveState: true },
        );
    }

    function handleFilterChange(key: string, value: string) {
        router.get(
            couponsIndex.url(),
            { ...filters, [key]: value === 'all' ? undefined : value, page: 1 },
            { preserveState: true },
        );
    }

    function handleSort(column: string) {
        const newDir =
            filters.sort_by === column && filters.sort_dir === 'asc'
                ? 'desc'
                : 'asc';
        router.get(
            couponsIndex.url(),
            { ...filters, sort_by: column, sort_dir: newDir },
            { preserveState: true },
        );
    }

    function resetFilters() {
        setSearch('');
        router.get(couponsIndex.url(), {}, { preserveState: true });
    }

    function handleDelete(coupon: Coupon) {
        if (confirm(`Delete coupon "${coupon.code}"?`)) {
            router.delete(couponsDestroy.url(coupon.id));
        }
    }

    function handleToggle(coupon: Coupon) {
        router.post(couponsToggle.url(coupon.id));
    }

    function toggleSelectAll() {
        setSelectedIds(allSelected ? [] : coupons.data.map((c) => c.id));
    }

    function toggleSelect(id: number) {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    }

    function handleBulkAction(action: 'activate' | 'deactivate' | 'delete') {
        if (selectedIds.length === 0) return;
        if (
            confirm(
                `${action === 'delete' ? 'Delete' : action === 'activate' ? 'Activate' : 'Deactivate'} ${selectedIds.length} coupons?`,
            )
        ) {
            router.post(
                `/admin/coupons/bulk-${action}`,
                { ids: selectedIds },
                {
                    onSuccess: () => setSelectedIds([]),
                },
            );
        }
    }

    function getStatus(coupon: Coupon): {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
    } {
        if (!coupon.is_active)
            return { label: 'Inactive', variant: 'secondary' };
        if (coupon.valid_until && new Date(coupon.valid_until) < new Date())
            return { label: 'Expired', variant: 'destructive' };
        if (coupon.valid_from && new Date(coupon.valid_from) > new Date())
            return { label: 'Upcoming', variant: 'outline' };
        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit)
            return { label: 'Used Up', variant: 'secondary' };
        return { label: 'Active', variant: 'default' };
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Coupons" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold">Coupons</h1>
                        <Badge variant="secondary" className="font-normal">
                            {coupons.total}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
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
                        <Button size="sm" asChild>
                            <Link href={couponsCreate.url()}>
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                Add Coupon
                            </Link>
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
                    </form>
                    <Select
                        value={filters.type || 'all'}
                        onValueChange={(v) => handleFilterChange('type', v)}
                    >
                        <SelectTrigger className="h-9 w-[140px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="percentage">
                                Percentage
                            </SelectItem>
                            <SelectItem value="fixed_amount">Fixed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.is_active || 'all'}
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
                                onClick={() => handleBulkAction('activate')}
                            >
                                Activate
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={() => handleBulkAction('deactivate')}
                            >
                                Deactivate
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                className="h-8"
                                onClick={() => handleBulkAction('delete')}
                            >
                                Delete
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
                                    column="code"
                                    label="Code"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="name"
                                    label="Name"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="type"
                                    label="Type"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="value"
                                    label="Discount"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="usage_count"
                                    label="Usage"
                                    currentSort={filters.sort_by}
                                    currentDir={filters.sort_dir}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    column="valid_from"
                                    label="Validity"
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
                                <TableHead className="w-[100px] text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.data.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell
                                        colSpan={9}
                                        className="py-8 text-center text-sm text-muted-foreground"
                                    >
                                        No coupons found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                coupons.data.map((coupon) => {
                                    const status = getStatus(coupon);
                                    const isSelected = selectedIds.includes(
                                        coupon.id,
                                    );
                                    return (
                                        <TableRow
                                            key={coupon.id}
                                            className={`group ${isSelected ? 'bg-primary/5' : ''} ${!coupon.is_active ? 'opacity-60' : ''}`}
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() =>
                                                        toggleSelect(coupon.id)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/admin/coupons/${coupon.id}`}
                                                    className="font-mono font-medium text-primary hover:underline"
                                                >
                                                    {coupon.code}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {coupon.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {coupon.type ===
                                                    'percentage'
                                                        ? '%'
                                                        : '€'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium tabular-nums">
                                                {coupon.type === 'percentage'
                                                    ? `${coupon.value}%`
                                                    : `€${coupon.value}`}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground tabular-nums">
                                                {coupon.usage_count}
                                                {coupon.usage_limit
                                                    ? `/${coupon.usage_limit}`
                                                    : ''}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {coupon.valid_from && (
                                                    <span>
                                                        {new Date(
                                                            coupon.valid_from,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {coupon.valid_from &&
                                                    coupon.valid_until &&
                                                    ' → '}
                                                {coupon.valid_until && (
                                                    <span>
                                                        {new Date(
                                                            coupon.valid_until,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {!coupon.valid_from &&
                                                    !coupon.valid_until &&
                                                    '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={status.variant}>
                                                    {status.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            handleToggle(coupon)
                                                        }
                                                    >
                                                        <Power
                                                            className={`h-4 w-4 ${coupon.is_active ? 'text-green-600' : ''}`}
                                                        />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/admin/coupons/${coupon.id}`}
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
                                                            href={`/admin/coupons/${coupon.id}/edit`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            handleDelete(coupon)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
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

                {coupons.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Page {coupons.current_page} of {coupons.last_page}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                disabled={coupons.current_page === 1}
                                onClick={() =>
                                    router.get(couponsIndex.url(), {
                                        ...filters,
                                        page: coupons.current_page - 1,
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
                                    coupons.current_page === coupons.last_page
                                }
                                onClick={() =>
                                    router.get(couponsIndex.url(), {
                                        ...filters,
                                        page: coupons.current_page + 1,
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
