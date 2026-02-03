import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Eye, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

interface Provider {
    id: number;
    slug: string;
    name: string;
    api_base_url: string;
    is_active: boolean;
    rate_limit_ms: number;
    markup_percentage: number;
    packages_count: number;
    sync_jobs_count: number;
    created_at: string;
}

interface Props {
    providers: {
        data: Provider[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        is_active?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Providers', href: '/admin/providers' },
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

export default function ProvidersIndex({ providers, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const hasActiveFilters = useMemo(() => {
        return !!(filters.search || filters.is_active || filters.sort_by);
    }, [filters]);

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/admin/providers', { ...filters, search }, { preserveState: true });
    }

    function handleFilterChange(key: string, value: string) {
        router.get('/admin/providers', { ...filters, [key]: value === 'all' ? undefined : value }, { preserveState: true });
    }

    function handleSort(column: string) {
        const newDir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
        router.get('/admin/providers', { ...filters, sort_by: column, sort_dir: newDir }, { preserveState: true });
    }

    function resetFilters() {
        setSearch('');
        router.get('/admin/providers', {}, { preserveState: true });
    }

    function handleDelete(provider: Provider) {
        if (confirm(`Are you sure you want to delete "${provider.name}"?`)) {
            router.delete(`/admin/providers/${provider.id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Providers" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold">Providers</h1>
                        <Badge variant="secondary" className="font-normal">
                            {providers.total}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={resetFilters}>
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                Reset
                            </Button>
                        )}
                        <Button size="sm" asChild>
                            <Link href="/admin/providers/create">
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                Add Provider
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
                        value={filters.is_active ?? 'all'}
                        onValueChange={(v) => handleFilterChange('is_active', v)}
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

                <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <SortableHeader column="name" label="Name" currentSort={filters.sort_by} currentDir={filters.sort_dir} onSort={handleSort} />
                                    <SortableHeader column="slug" label="Slug" currentSort={filters.sort_by} currentDir={filters.sort_dir} onSort={handleSort} />
                                    <SortableHeader column="is_active" label="Status" currentSort={filters.sort_by} currentDir={filters.sort_dir} onSort={handleSort} />
                                    <SortableHeader column="markup_percentage" label="Markup" currentSort={filters.sort_by} currentDir={filters.sort_dir} onSort={handleSort} />
                                    <SortableHeader column="rate_limit_ms" label="Rate Limit" currentSort={filters.sort_by} currentDir={filters.sort_dir} onSort={handleSort} />
                                    <SortableHeader column="packages_count" label="Packages" currentSort={filters.sort_by} currentDir={filters.sort_dir} onSort={handleSort} />
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {providers.data.length === 0 ? (
                                    <TableRow className="hover:bg-transparent">
                                        <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                                            No providers found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    providers.data.map((provider) => (
                                        <TableRow key={provider.id} className={`group ${!provider.is_active ? 'opacity-60' : ''}`}>
                                            <TableCell>
                                                <Link href={`/admin/providers/${provider.id}`} className="font-medium text-primary hover:underline">
                                                    {provider.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs">{provider.slug}</code>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={provider.is_active ? 'default' : 'secondary'}>
                                                    {provider.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="tabular-nums">{provider.markup_percentage}%</TableCell>
                                            <TableCell className="tabular-nums text-muted-foreground">{provider.rate_limit_ms}ms</TableCell>
                                            <TableCell className="tabular-nums">{provider.packages_count}</TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                        <Link href={`/admin/providers/${provider.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                        <Link href={`/admin/providers/${provider.id}/edit`}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleDelete(provider)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                {providers.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Page {providers.current_page} of {providers.last_page}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                disabled={providers.current_page === 1}
                                onClick={() => router.get('/admin/providers', { ...filters, page: providers.current_page - 1 })}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                disabled={providers.current_page === providers.last_page}
                                onClick={() => router.get('/admin/providers', { ...filters, page: providers.current_page + 1 })}
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
