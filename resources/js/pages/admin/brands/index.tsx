import { index as brandsIndex, store as brandsStore, update as brandsUpdate, destroy as brandsDestroy } from '@/actions/App/Http/Controllers/Admin/BrandController';
import { index as devicesIndex } from '@/actions/App/Http/Controllers/Admin/DeviceController';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    ArrowLeft,
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
    Pencil,
    Plus,
    Power,
    Search,
    Trash2,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo_url: string | null;
    is_active: boolean;
    sort_order: number;
    devices_count: number;
}

interface Props {
    brands: {
        data: Brand[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Devices', href: '/admin/devices' },
    { title: 'Brands', href: '/admin/brands' },
];

interface BrandFormData {
    name: string;
    logo_url: string;
    sort_order: string;
    is_active: boolean;
}

const initialFormData: BrandFormData = {
    name: '',
    logo_url: '',
    sort_order: '0',
    is_active: true,
};

export default function BrandsIndex({ brands, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editBrand, setEditBrand] = useState<Brand | null>(null);
    const [formData, setFormData] = useState<BrandFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    const allSelected =
        brands.data.length > 0 && selectedIds.length === brands.data.length;
    const someSelected =
        selectedIds.length > 0 && selectedIds.length < brands.data.length;

    // Get brands that can be deleted (no devices)
    const deletableSelectedIds = selectedIds.filter((id) => {
        const brand = brands.data.find((b) => b.id === id);
        return brand && brand.devices_count === 0;
    });

    function toggleSelectAll() {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(brands.data.map((b) => b.id));
        }
    }

    function toggleSelect(id: number) {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    }

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            brandsIndex.url(),
            { ...filters, search },
            { preserveState: true },
        );
    }

    function handleSort(field: string) {
        const newDirection =
            filters.sort === field && filters.direction === 'asc'
                ? 'desc'
                : 'asc';
        router.get(
            brandsIndex.url(),
            { ...filters, sort: field, direction: newDirection },
            { preserveState: true },
        );
    }

    function SortIcon({ field }: { field: string }) {
        if (filters.sort !== field) {
            return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
        }
        return filters.direction === 'asc' ? (
            <ChevronUp className="ml-1 h-3 w-3" />
        ) : (
            <ChevronDown className="ml-1 h-3 w-3" />
        );
    }

    function handleToggleActive(brand: Brand) {
        router.post(
            `/admin/brands/${brand.slug}/toggle`,
            {},
            { preserveState: true },
        );
    }

    function handleDelete() {
        if (!deleteBrand) return;
        router.delete(brandsDestroy.url(deleteBrand.slug), {
            preserveState: true,
            onSuccess: () => setDeleteBrand(null),
        });
    }

    function handleBulkDelete() {
        router.post(
            '/admin/brands/bulk-delete',
            { ids: deletableSelectedIds },
            {
                preserveState: true,
                onSuccess: () => {
                    setSelectedIds([]);
                    setShowBulkDeleteConfirm(false);
                },
            },
        );
    }

    function handleBulkToggle(isActive: boolean) {
        router.post(
            '/admin/brands/bulk-toggle',
            { ids: selectedIds, is_active: isActive },
            {
                preserveState: true,
                onSuccess: () => setSelectedIds([]),
            },
        );
    }

    function openCreateDialog() {
        setFormData(initialFormData);
        setEditBrand(null);
        setIsCreateOpen(true);
    }

    function openEditDialog(brand: Brand) {
        setFormData({
            name: brand.name,
            logo_url: brand.logo_url || '',
            sort_order: brand.sort_order.toString(),
            is_active: brand.is_active,
        });
        setEditBrand(brand);
        setIsCreateOpen(true);
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        const data = {
            name: formData.name,
            logo_url: formData.logo_url || null,
            sort_order: parseInt(formData.sort_order) || 0,
            is_active: formData.is_active,
        };

        if (editBrand) {
            router.put(brandsUpdate.url(editBrand.slug), data, {
                preserveState: true,
                onSuccess: () => {
                    setIsCreateOpen(false);
                    setEditBrand(null);
                },
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post(brandsStore.url(), data, {
                preserveState: true,
                onSuccess: () => setIsCreateOpen(false),
                onFinish: () => setIsSubmitting(false),
            });
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Brands" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Brands</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage device brands
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                            {brands.total} brands
                        </span>
                        <Button asChild variant="outline">
                            <Link href={devicesIndex.url()}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Devices
                            </Link>
                        </Button>
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Brand
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search brands..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-[200px] pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>

                    {selectedIds.length > 0 && (
                        <div className="ml-auto flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {selectedIds.length} selected
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Bulk Actions
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => handleBulkToggle(true)}
                                    >
                                        <Power className="mr-2 h-4 w-4" />
                                        Activate Selected
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleBulkToggle(false)}
                                    >
                                        <Power className="mr-2 h-4 w-4" />
                                        Deactivate Selected
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() =>
                                            setShowBulkDeleteConfirm(true)
                                        }
                                        className="text-destructive focus:text-destructive"
                                        disabled={
                                            deletableSelectedIds.length === 0
                                        }
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Selected (
                                        {deletableSelectedIds.length})
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedIds([])}
                            >
                                Clear
                            </Button>
                        </div>
                    )}
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all"
                                        className={
                                            someSelected ? 'opacity-50' : ''
                                        }
                                    />
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleSort('name')}
                                >
                                    <span className="flex items-center">
                                        Brand Name
                                        <SortIcon field="name" />
                                    </span>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleSort('slug')}
                                >
                                    <span className="flex items-center">
                                        Slug
                                        <SortIcon field="slug" />
                                    </span>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleSort('devices_count')}
                                >
                                    <span className="flex items-center">
                                        Devices
                                        <SortIcon field="devices_count" />
                                    </span>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleSort('sort_order')}
                                >
                                    <span className="flex items-center">
                                        Sort Order
                                        <SortIcon field="sort_order" />
                                    </span>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleSort('is_active')}
                                >
                                    <span className="flex items-center">
                                        Status
                                        <SortIcon field="is_active" />
                                    </span>
                                </TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {brands.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No brands found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                brands.data.map((brand) => (
                                    <TableRow
                                        key={brand.id}
                                        className={
                                            selectedIds.includes(brand.id)
                                                ? 'bg-muted/50'
                                                : ''
                                        }
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(
                                                    brand.id,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleSelect(brand.id)
                                                }
                                                aria-label={`Select ${brand.name}`}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {brand.name}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {brand.slug}
                                        </TableCell>
                                        <TableCell>
                                            {brand.devices_count}
                                        </TableCell>
                                        <TableCell>
                                            {brand.sort_order}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    brand.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    handleToggleActive(brand)
                                                }
                                            >
                                                {brand.is_active
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
                                                        openEditDialog(brand)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setDeleteBrand(brand)
                                                    }
                                                    disabled={
                                                        brand.devices_count > 0
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {brands.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from(
                            { length: Math.min(brands.last_page, 10) },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <Button
                                key={page}
                                variant={
                                    page === brands.current_page
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                    router.get(brandsIndex.url(), {
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

            {/* Create/Edit Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editBrand ? 'Edit Brand' : 'Add Brand'}
                        </DialogTitle>
                        <DialogDescription>
                            {editBrand
                                ? 'Update the brand information below.'
                                : 'Add a new device brand.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Brand Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Apple"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="logo_url">
                                    Logo URL (optional)
                                </Label>
                                <Input
                                    id="logo_url"
                                    value={formData.logo_url}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            logo_url: e.target.value,
                                        })
                                    }
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sort_order">Sort Order</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            sort_order: e.target.value,
                                        })
                                    }
                                    placeholder="0"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Lower numbers appear first
                                </p>
                            </div>
                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            is_active: e.target.checked,
                                        })
                                    }
                                    className="rounded"
                                />
                                <span className="text-sm">Active</span>
                            </label>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? 'Saving...'
                                    : editBrand
                                      ? 'Update Brand'
                                      : 'Add Brand'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog
                open={!!deleteBrand}
                onOpenChange={(open) => !open && setDeleteBrand(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Brand</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteBrand?.devices_count &&
                            deleteBrand.devices_count > 0 ? (
                                <>
                                    Cannot delete "{deleteBrand?.name}" because
                                    it has {deleteBrand.devices_count}{' '}
                                    associated device(s). Remove all devices
                                    first.
                                </>
                            ) : (
                                <>
                                    Are you sure you want to delete "
                                    {deleteBrand?.name}"? This action cannot be
                                    undone.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        {deleteBrand?.devices_count === 0 && (
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation */}
            <AlertDialog
                open={showBulkDeleteConfirm}
                onOpenChange={setShowBulkDeleteConfirm}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete {deletableSelectedIds.length} Brands
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {deletableSelectedIds.length <
                            selectedIds.length ? (
                                <>
                                    Only {deletableSelectedIds.length} of{' '}
                                    {selectedIds.length} selected brands can be
                                    deleted (brands with devices cannot be
                                    deleted). Are you sure you want to proceed?
                                </>
                            ) : (
                                <>
                                    Are you sure you want to delete{' '}
                                    {deletableSelectedIds.length} selected
                                    brand(s)? This action cannot be undone.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={deletableSelectedIds.length === 0}
                        >
                            Delete {deletableSelectedIds.length} Brands
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
