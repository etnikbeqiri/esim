import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, Pencil, Star, Trash2 } from 'lucide-react';

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
    country: { id: number; name: string; iso_code: string } | null;
}

interface SyncJob {
    id: number;
    status: string;
    started_at: string | null;
    completed_at: string | null;
    packages_created: number;
    packages_updated: number;
    error_message: string | null;
}

interface Provider {
    id: number;
    slug: string;
    name: string;
    api_base_url: string;
    is_active: boolean;
    rate_limit_ms: number;
    markup_percentage: number;
    custom_regions: Record<string, string> | null;
    last_synced_at: string | null;
    packages_count: number;
    sync_jobs_count: number;
    orders_count: number;
    sync_jobs: SyncJob[];
    created_at: string;
    updated_at: string;
}

interface Currency {
    id: number;
    code: string;
    symbol: string;
}

interface Stats {
    total_packages: number;
    active_packages: number;
    total_orders: number;
    total_revenue: number;
}

interface Props {
    provider: Provider;
    packages: {
        data: Package[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats: Stats;
    defaultCurrency: Currency | null;
}

function formatData(mb: number): string {
    return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
}

function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'running':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'failed':
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'pending':
            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        default:
            return '';
    }
}

export default function ProviderShow({ provider, packages, stats, defaultCurrency }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Providers', href: '/admin/providers' },
        { title: provider.name, href: `/admin/providers/${provider.id}` },
    ];

    const currencySymbol = defaultCurrency?.symbol || '€';

    function handleDelete() {
        if (confirm(`Delete provider "${provider.name}"? This will also delete all associated packages.`)) {
            router.delete(`/admin/providers/${provider.id}`);
        }
    }

    function getEffectivePrice(pkg: Package): { price: number; isCustom: boolean } {
        if (pkg.custom_retail_price !== null) {
            return { price: Number(pkg.custom_retail_price), isCustom: true };
        }
        return { price: Number(pkg.retail_price), isCustom: false };
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={provider.name} />
            <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4 p-4">
                    <div className="flex items-start gap-4">
                        <Button variant="ghost" size="icon" className="shrink-0" asChild>
                            <Link href="/admin/providers">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-semibold">{provider.name}</h1>
                                <Badge variant={provider.is_active ? 'default' : 'secondary'}>
                                    {provider.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                <code>{provider.slug}</code> · {provider.api_base_url}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/providers/${provider.id}/edit`}>
                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                            </Link>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-5xl space-y-6 px-4">
                    <div className="grid grid-cols-4 gap-px overflow-hidden rounded-lg border bg-border">
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">Total Packages</p>
                            <p className="mt-1 text-lg font-semibold">{stats.total_packages}</p>
                        </div>
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">Active Packages</p>
                            <p className="mt-1 text-lg font-semibold text-green-600">{stats.active_packages}</p>
                        </div>
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">Total Orders</p>
                            <p className="mt-1 text-lg font-semibold">{stats.total_orders}</p>
                        </div>
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">Total Revenue</p>
                            <p className="mt-1 text-lg font-semibold">{currencySymbol}{Number(stats.total_revenue).toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                            <h2 className="mb-4 text-sm font-medium">Configuration</h2>
                            <div className="rounded-lg border">
                                <div className="divide-y">
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">Markup</span>
                                        <span className="text-sm font-medium">{provider.markup_percentage}%</span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">Rate Limit</span>
                                        <span className="text-sm">{provider.rate_limit_ms}ms</span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">Last Synced</span>
                                        <span className="text-sm">
                                            {provider.last_synced_at
                                                ? new Date(provider.last_synced_at).toLocaleString()
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">Sync Jobs</span>
                                        <span className="text-sm">{provider.sync_jobs_count}</span>
                                    </div>
                                </div>
                            </div>

                            {provider.custom_regions && Object.keys(provider.custom_regions).length > 0 && (
                                <div className="mt-6">
                                    <h2 className="mb-2 text-sm font-medium">Custom Regions</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(provider.custom_regions).map(([code, name]) => (
                                            <Badge key={code} variant="outline">
                                                {code}: {name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex gap-6 text-xs text-muted-foreground">
                                <span>Created {new Date(provider.created_at).toLocaleDateString()}</span>
                                <span>Updated {new Date(provider.updated_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div>
                            <h2 className="mb-4 text-sm font-medium">Recent Sync Jobs</h2>
                            <div className="rounded-lg border">
                                {provider.sync_jobs.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                        No sync jobs yet
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="text-xs">Status</TableHead>
                                                <TableHead className="text-xs">Created</TableHead>
                                                <TableHead className="text-xs">Updated</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {provider.sync_jobs.map((job) => (
                                                <TableRow key={job.id}>
                                                    <TableCell className="py-2">
                                                        <Badge variant="secondary" className={`text-xs ${getStatusColor(job.status)}`}>
                                                            {job.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-2 text-sm text-muted-foreground">
                                                        +{job.packages_created}
                                                    </TableCell>
                                                    <TableCell className="py-2 text-sm text-muted-foreground">
                                                        ~{job.packages_updated}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-4 text-sm font-medium">Packages ({packages.total})</h2>
                        <div className="rounded-lg border">
                            {packages.data.length === 0 ? (
                                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                    No packages from this provider
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead>Name</TableHead>
                                            <TableHead>Country</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Validity</TableHead>
                                            <TableHead>Cost</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-[60px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {packages.data.map((pkg) => {
                                            const { price, isCustom } = getEffectivePrice(pkg);
                                            return (
                                                <TableRow key={pkg.id} className={`group ${!pkg.is_active ? 'opacity-60' : ''}`}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            {pkg.is_featured && (
                                                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                                            )}
                                                            <span className="font-medium">{pkg.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {pkg.country?.name || '—'}
                                                    </TableCell>
                                                    <TableCell className="tabular-nums">{formatData(pkg.data_mb)}</TableCell>
                                                    <TableCell className="tabular-nums">{pkg.validity_days}d</TableCell>
                                                    <TableCell className="tabular-nums text-muted-foreground">
                                                        {currencySymbol}{Number(pkg.cost_price).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="tabular-nums">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-medium">{currencySymbol}{price.toFixed(2)}</span>
                                                            {isCustom && (
                                                                <Badge variant="outline" className="text-[10px] px-1 py-0">Custom</Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                                                            {pkg.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                                            asChild
                                                        >
                                                            <Link href={`/admin/packages/${pkg.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </div>

                        {packages.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Page {packages.current_page} of {packages.last_page}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8"
                                        disabled={packages.current_page === 1}
                                        onClick={() => router.get(`/admin/providers/${provider.id}`, { page: packages.current_page - 1 })}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8"
                                        disabled={packages.current_page === packages.last_page}
                                        onClick={() => router.get(`/admin/providers/${provider.id}`, { page: packages.current_page + 1 })}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
