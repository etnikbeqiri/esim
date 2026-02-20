import { index as syncJobsIndex } from '@/actions/App/Http/Controllers/Admin/SyncJobController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Head, router, useForm } from '@inertiajs/react';
import { Play, RefreshCw } from 'lucide-react';

interface SyncJob {
    id: number;
    type: string;
    status: string;
    progress: number;
    total: number;
    duration_ms: number | null;
    error_message: string | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
    provider: { id: number; name: string } | null;
}

interface Provider {
    id: number;
    name: string;
}

interface Props {
    syncJobs: {
        data: SyncJob[];
        current_page: number;
        last_page: number;
        total: number;
    };
    providers: Provider[];
    statuses: { value: string; label: string }[];
    types: { value: string; label: string }[];
    filters: {
        provider_id?: string;
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Sync Jobs', href: '/admin/sync-jobs' },
];

function getStatusVariant(
    status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'completed':
            return 'default';
        case 'running':
            return 'secondary';
        case 'failed':
            return 'destructive';
        default:
            return 'outline';
    }
}

function formatDuration(durationMs: number | null, status: string): string {
    if (durationMs === null) {
        return status === 'running' ? 'running...' : '-';
    }
    if (durationMs < 1000) return `${durationMs}ms`;
    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

export default function SyncJobsIndex({
    syncJobs,
    providers,
    statuses,
    types,
    filters,
}: Props) {
    const { data, setData, post, processing } = useForm({
        provider_id: '',
        type: 'sync_packages',
    });

    function handleFilterChange(key: string, value: string) {
        const newFilters = {
            ...filters,
            [key]: value === 'all' ? undefined : value,
        };
        router.get(syncJobsIndex.url(), newFilters, { preserveState: true });
    }

    function handleStartSync(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/sync-jobs');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sync Jobs" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Sync Jobs</h1>
                    <span className="text-muted-foreground">
                        {syncJobs.total} jobs
                    </span>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Start New Sync
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleStartSync}
                            className="flex flex-wrap gap-2"
                        >
                            <Select
                                value={data.provider_id}
                                onValueChange={(v) => setData('provider_id', v)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    {providers.map((p) => (
                                        <SelectItem
                                            key={p.id}
                                            value={String(p.id)}
                                        >
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={data.type}
                                onValueChange={(v) => setData('type', v)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Sync type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map((t) => (
                                        <SelectItem
                                            key={t.value}
                                            value={t.value}
                                        >
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                type="submit"
                                disabled={processing || !data.provider_id}
                            >
                                <Play className="mr-2 h-4 w-4" />
                                Start Sync
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="flex flex-wrap gap-2">
                    <Select
                        value={filters.provider_id || 'all'}
                        onValueChange={(v) =>
                            handleFilterChange('provider_id', v)
                        }
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="All providers" />
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
                        value={filters.status || 'all'}
                        onValueChange={(v) => handleFilterChange('status', v)}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {statuses.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.reload()}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Provider</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Started</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {syncJobs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No sync jobs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                syncJobs.data.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-mono">
                                            #{job.id}
                                        </TableCell>
                                        <TableCell>
                                            {job.provider?.name || '-'}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {job.type}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getStatusVariant(
                                                    job.status,
                                                )}
                                            >
                                                {job.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {job.total > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-24 rounded-full bg-muted">
                                                        <div
                                                            className="h-2 rounded-full bg-primary transition-all"
                                                            style={{
                                                                width: `${(job.progress / job.total) * 100}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {job.progress}/
                                                        {job.total}
                                                    </span>
                                                </div>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDuration(
                                                job.duration_ms,
                                                job.status,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {job.started_at
                                                ? new Date(
                                                      job.started_at,
                                                  ).toLocaleString()
                                                : new Date(
                                                      job.created_at,
                                                  ).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {syncJobs.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from(
                            { length: Math.min(syncJobs.last_page, 10) },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <Button
                                key={page}
                                variant={
                                    page === syncJobs.current_page
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                    router.get(syncJobsIndex.url(), {
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
