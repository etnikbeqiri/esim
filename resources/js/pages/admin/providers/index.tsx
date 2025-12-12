import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

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
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Providers', href: '/admin/providers' },
];

export default function ProvidersIndex({ providers, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/admin/providers', { search }, { preserveState: true });
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
                    <h1 className="text-2xl font-semibold">Providers</h1>
                    <Button asChild>
                        <Link href="/admin/providers/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Provider
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search providers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button type="submit" variant="secondary">Search</Button>
                </form>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Markup</TableHead>
                                <TableHead>Rate Limit</TableHead>
                                <TableHead>Packages</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {providers.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No providers found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                providers.data.map((provider) => (
                                    <TableRow key={provider.id}>
                                        <TableCell className="font-medium">{provider.name}</TableCell>
                                        <TableCell className="font-mono text-sm">{provider.slug}</TableCell>
                                        <TableCell>
                                            <Badge variant={provider.is_active ? 'default' : 'secondary'}>
                                                {provider.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{provider.markup_percentage}%</TableCell>
                                        <TableCell>{provider.rate_limit_ms}ms</TableCell>
                                        <TableCell>{provider.packages_count}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/admin/providers/${provider.id}/edit`}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
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
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: providers.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === providers.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get('/admin/providers', { ...filters, page })}
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
