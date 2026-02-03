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
import { type BreadcrumbItem, type Coupon } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2, Power } from 'lucide-react';
import { FormEvent, useState } from 'react';

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
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Coupons', href: '/admin/coupons' },
];

export default function CouponsIndex({ coupons, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');
    const [isActive, setIsActive] = useState(filters.is_active || '');
    const [status, setStatus] = useState(filters.status || '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/admin/coupons', { search, type, is_active: isActive, status }, { preserveState: true });
    }

    function handleFilter(key: string, value: string) {
        router.get('/admin/coupons', { ...filters, [key]: value, page: 1 }, { preserveState: true });
    }

    function handleDelete(coupon: Coupon) {
        if (confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
            router.delete(`/admin/coupons/${coupon.id}`);
        }
    }

    function handleToggle(coupon: Coupon) {
        router.post(`/admin/coupons/${coupon.id}/toggle`);
    }

    function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.checked) {
            setSelectedIds(coupons.data.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    }

    function handleSelectId(id: number) {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    }

    function handleBulkAction(action: 'activate' | 'deactivate' | 'delete') {
        if (selectedIds.length === 0) return;

        const confirmMsg = action === 'delete'
            ? `Are you sure you want to delete ${selectedIds.length} coupons?`
            : `Are you sure you want to ${action} ${selectedIds.length} coupons?`;

        if (confirm(confirmMsg)) {
            router.post(`/admin/coupons/bulk-${action}`, { ids: selectedIds }, {
                onSuccess: () => setSelectedIds([]),
            });
        }
    }

    function getStatus(coupon: Coupon): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
        if (!coupon.is_active) {
            return { label: 'Inactive', variant: 'secondary' };
        }
        if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
            return { label: 'Expired', variant: 'destructive' };
        }
        if (coupon.valid_from && new Date(coupon.valid_from) > new Date()) {
            return { label: 'Upcoming', variant: 'outline' };
        }
        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
            return { label: 'Used Up', variant: 'secondary' };
        }
        return { label: 'Active', variant: 'default' };
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Coupons" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Coupons</h1>
                    <Button asChild>
                        <Link href="/admin/coupons/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Coupon
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
                    <div className="relative max-w-sm flex-1 min-w-[200px]">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search coupons..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={type || 'all'} onValueChange={v => handleFilter('type', v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={isActive || 'all'} onValueChange={v => handleFilter('is_active', v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="1">Active</SelectItem>
                            <SelectItem value="0">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                    {(search || type || isActive || status) && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.get('/admin/coupons')}
                        >
                            Clear
                        </Button>
                    )}
                </form>

                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                        <span className="text-sm text-muted-foreground">
                            {selectedIds.length} selected
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkAction('activate')}
                        >
                            Activate
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkAction('deactivate')}
                        >
                            Deactivate
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBulkAction('delete')}
                        >
                            Delete
                        </Button>
                    </div>
                )}

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={selectedIds.length === coupons.data.length && coupons.data.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Validity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[120px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No coupons found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                coupons.data.map((coupon) => {
                                    const status = getStatus(coupon);
                                    return (
                                        <TableRow key={coupon.id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={selectedIds.includes(coupon.id)}
                                                    onChange={() => handleSelectId(coupon.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono font-medium">
                                                {coupon.code}
                                            </TableCell>
                                            <TableCell>{coupon.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {coupon.type === 'percentage' ? '%' : '€'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {coupon.type === 'percentage'
                                                    ? `${coupon.value}%`
                                                    : `€${coupon.value}`}
                                            </TableCell>
                                            <TableCell>
                                                {coupon.usage_count}
                                                {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {coupon.valid_from && (
                                                    <div>{new Date(coupon.valid_from).toLocaleDateString()}</div>
                                                )}
                                                {coupon.valid_until && (
                                                    <div className="text-muted-foreground">
                                                        → {new Date(coupon.valid_until).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={status.variant}>{status.label}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleToggle(coupon)}
                                                        title={coupon.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <Power className={`h-4 w-4 ${coupon.is_active ? 'text-green-600' : 'text-muted-foreground'}`} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link href={`/admin/coupons/${coupon.id}`}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(coupon)}
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
                    <div className="flex justify-center gap-2">
                        {Array.from(
                            { length: Math.min(5, coupons.last_page) },
                            (_, i) => {
                                let page;
                                if (coupons.last_page <= 5) {
                                    page = i + 1;
                                } else if (coupons.current_page <= 3) {
                                    page = i + 1;
                                } else if (coupons.current_page >= coupons.last_page - 2) {
                                    page = coupons.last_page - 4 + i;
                                } else {
                                    page = coupons.current_page - 2 + i;
                                }

                                return (
                                    <Button
                                        key={page}
                                        variant={
                                            page === coupons.current_page
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            router.get('/admin/coupons', {
                                                ...filters,
                                                page,
                                            })
                                        }
                                    >
                                        {page}
                                    </Button>
                                );
                            }
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
