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
import { ArrowDown, ArrowUp, ArrowUpDown, Check, ChevronDown, Pencil, Plus, Power, Search, Smartphone, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Brand {
    id: number;
    name: string;
    slug: string;
}

interface Device {
    id: number;
    name: string;
    slug: string;
    release_year: number | null;
    esim_supported: boolean;
    is_active: boolean;
    model_identifiers: string[] | null;
    brand: Brand;
}

interface Props {
    devices: {
        data: Device[];
        current_page: number;
        last_page: number;
        total: number;
    };
    brands: Brand[];
    filters: {
        search?: string;
        brand_id?: string;
        esim_supported?: string;
        sort?: string;
        direction?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Devices', href: '/admin/devices' },
];

interface DeviceFormData {
    brand_id: string;
    name: string;
    release_year: string;
    model_identifiers: string;
    esim_supported: boolean;
    is_active: boolean;
}

const initialFormData: DeviceFormData = {
    brand_id: '',
    name: '',
    release_year: '',
    model_identifiers: '',
    esim_supported: true,
    is_active: true,
};

export default function DevicesIndex({ devices, brands, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteDevice, setDeleteDevice] = useState<Device | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editDevice, setEditDevice] = useState<Device | null>(null);
    const [formData, setFormData] = useState<DeviceFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    const allSelected = devices.data.length > 0 && selectedIds.length === devices.data.length;
    const someSelected = selectedIds.length > 0 && selectedIds.length < devices.data.length;

    function toggleSelectAll() {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(devices.data.map((d) => d.id));
        }
    }

    function toggleSelect(id: number) {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    }

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/admin/devices', { ...filters, search }, { preserveState: true });
    }

    function handleFilterChange(key: string, value: string) {
        const newFilters = { ...filters, [key]: value === 'all' ? undefined : value };
        router.get('/admin/devices', newFilters, { preserveState: true });
    }

    function handleToggleActive(device: Device) {
        router.post(`/admin/devices/${device.slug}/toggle`, {}, { preserveState: true });
    }

    function handleDelete() {
        if (!deleteDevice) return;
        router.delete(`/admin/devices/${deleteDevice.slug}`, {
            preserveState: true,
            onSuccess: () => setDeleteDevice(null),
        });
    }

    function handleBulkDelete() {
        router.post('/admin/devices/bulk-delete', { ids: selectedIds }, {
            preserveState: true,
            onSuccess: () => {
                setSelectedIds([]);
                setShowBulkDeleteConfirm(false);
            },
        });
    }

    function handleBulkToggle(isActive: boolean) {
        router.post('/admin/devices/bulk-toggle', { ids: selectedIds, is_active: isActive }, {
            preserveState: true,
            onSuccess: () => setSelectedIds([]),
        });
    }

    function handleSort(field: string) {
        const currentSort = filters.sort || 'name';
        const currentDirection = filters.direction || 'asc';

        let newDirection = 'asc';
        if (currentSort === field) {
            newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
        }

        router.get('/admin/devices', { ...filters, sort: field, direction: newDirection }, { preserveState: true });
    }

    function SortIcon({ field }: { field: string }) {
        const currentSort = filters.sort || 'name';
        const currentDirection = filters.direction || 'asc';

        if (currentSort !== field) {
            return <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground/50" />;
        }
        return currentDirection === 'asc'
            ? <ArrowUp className="ml-1 h-4 w-4" />
            : <ArrowDown className="ml-1 h-4 w-4" />;
    }

    function openCreateDialog() {
        setFormData(initialFormData);
        setEditDevice(null);
        setIsCreateOpen(true);
    }

    function openEditDialog(device: Device) {
        setFormData({
            brand_id: device.brand.id.toString(),
            name: device.name,
            release_year: device.release_year?.toString() || '',
            model_identifiers: device.model_identifiers?.join(', ') || '',
            esim_supported: device.esim_supported,
            is_active: device.is_active,
        });
        setEditDevice(device);
        setIsCreateOpen(true);
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        const data = {
            brand_id: parseInt(formData.brand_id),
            name: formData.name,
            release_year: formData.release_year ? parseInt(formData.release_year) : null,
            model_identifiers: formData.model_identifiers
                ? formData.model_identifiers.split(',').map((s) => s.trim()).filter(Boolean)
                : null,
            esim_supported: formData.esim_supported,
            is_active: formData.is_active,
        };

        if (editDevice) {
            router.put(`/admin/devices/${editDevice.slug}`, data, {
                preserveState: true,
                onSuccess: () => {
                    setIsCreateOpen(false);
                    setEditDevice(null);
                },
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post('/admin/devices', data, {
                preserveState: true,
                onSuccess: () => setIsCreateOpen(false),
                onFinish: () => setIsSubmitting(false),
            });
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Devices" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Devices</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage eSIM compatible devices
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{devices.total} devices</span>
                        <Button asChild variant="outline">
                            <Link href="/admin/brands">
                                <Smartphone className="mr-2 h-4 w-4" />
                                Manage Brands
                            </Link>
                        </Button>
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Device
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search devices..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 w-[200px]"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>

                    <Select
                        value={filters.brand_id || 'all'}
                        onValueChange={(v) => handleFilterChange('brand_id', v)}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Brand" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Brands</SelectItem>
                            {brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id.toString()}>
                                    {brand.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 ml-auto">
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
                                    <DropdownMenuItem onClick={() => handleBulkToggle(true)}>
                                        <Power className="mr-2 h-4 w-4" />
                                        Activate Selected
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleBulkToggle(false)}>
                                        <Power className="mr-2 h-4 w-4" />
                                        Deactivate Selected
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => setShowBulkDeleteConfirm(true)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Selected
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
                                        className={someSelected ? 'opacity-50' : ''}
                                    />
                                </TableHead>
                                <TableHead>
                                    <button
                                        onClick={() => handleSort('brand')}
                                        className="flex items-center font-medium hover:text-foreground"
                                    >
                                        Brand
                                        <SortIcon field="brand" />
                                    </button>
                                </TableHead>
                                <TableHead>
                                    <button
                                        onClick={() => handleSort('name')}
                                        className="flex items-center font-medium hover:text-foreground"
                                    >
                                        Device Name
                                        <SortIcon field="name" />
                                    </button>
                                </TableHead>
                                <TableHead>
                                    <button
                                        onClick={() => handleSort('release_year')}
                                        className="flex items-center font-medium hover:text-foreground"
                                    >
                                        Year
                                        <SortIcon field="release_year" />
                                    </button>
                                </TableHead>
                                <TableHead>eSIM</TableHead>
                                <TableHead>
                                    <button
                                        onClick={() => handleSort('is_active')}
                                        className="flex items-center font-medium hover:text-foreground"
                                    >
                                        Status
                                        <SortIcon field="is_active" />
                                    </button>
                                </TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {devices.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        No devices found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                devices.data.map((device) => (
                                    <TableRow
                                        key={device.id}
                                        className={selectedIds.includes(device.id) ? 'bg-muted/50' : ''}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(device.id)}
                                                onCheckedChange={() => toggleSelect(device.id)}
                                                aria-label={`Select ${device.name}`}
                                            />
                                        </TableCell>
                                        <TableCell>{device.brand?.name}</TableCell>
                                        <TableCell className="font-medium">{device.name}</TableCell>
                                        <TableCell>{device.release_year || '-'}</TableCell>
                                        <TableCell>
                                            {device.esim_supported ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <X className="h-4 w-4 text-red-500" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={device.is_active ? 'default' : 'secondary'}
                                                className="cursor-pointer"
                                                onClick={() => handleToggleActive(device)}
                                            >
                                                {device.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditDialog(device)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteDevice(device)}
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

                {devices.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from(
                            { length: Math.min(devices.last_page, 10) },
                            (_, i) => i + 1
                        ).map((page) => (
                            <Button
                                key={page}
                                variant={page === devices.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get('/admin/devices', { ...filters, page })}
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
                        <DialogTitle>{editDevice ? 'Edit Device' : 'Add Device'}</DialogTitle>
                        <DialogDescription>
                            {editDevice
                                ? 'Update the device information below.'
                                : 'Add a new eSIM compatible device.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="brand_id">Brand</Label>
                                <Select
                                    value={formData.brand_id}
                                    onValueChange={(v) =>
                                        setFormData({ ...formData, brand_id: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id.toString()}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Device Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="e.g., iPhone 15 Pro Max"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="release_year">Release Year</Label>
                                <Input
                                    id="release_year"
                                    type="number"
                                    value={formData.release_year}
                                    onChange={(e) =>
                                        setFormData({ ...formData, release_year: e.target.value })
                                    }
                                    placeholder="e.g., 2023"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="model_identifiers">
                                    Model Identifiers (comma-separated)
                                </Label>
                                <Input
                                    id="model_identifiers"
                                    value={formData.model_identifiers}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            model_identifiers: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., iPhone16,1, iPhone16,2"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Used for auto-detecting user's device via User Agent
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.esim_supported}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                esim_supported: e.target.checked,
                                            })
                                        }
                                        className="rounded"
                                    />
                                    <span className="text-sm">eSIM Supported</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
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
                                    : editDevice
                                      ? 'Update Device'
                                      : 'Add Device'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog
                open={!!deleteDevice}
                onOpenChange={(open) => !open && setDeleteDevice(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Device</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deleteDevice?.brand?.name}{' '}
                            {deleteDevice?.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
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
                        <AlertDialogTitle>Delete {selectedIds.length} Devices</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedIds.length} selected device(s)?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete {selectedIds.length} Devices
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
