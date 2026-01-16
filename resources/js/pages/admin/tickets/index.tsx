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
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Archive,
    CheckCircle2,
    Clock,
    Loader2,
    Mail,
    MessageSquare,
    Search,
    Trash2,
    User,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Ticket {
    id: number;
    uuid: string;
    reference: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    status_label: string;
    status_color: string;
    priority: string;
    priority_label: string;
    created_at: string;
    last_message_at?: string;
    assigned_to?: string;
    user_id?: number | null;
}

interface Props {
    tickets: {
        data: Ticket[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        from: number;
        to: number;
    };
    statusCounts: {
        all: number;
        open: number;
        in_progress: number;
        waiting_on_customer: number;
        resolved: number;
        closed: number;
        archived: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Tickets', href: '/admin/tickets' },
];

const statusOptions = [
    { value: 'all', label: 'All', icon: MessageSquare },
    { value: 'open', label: 'Open', icon: Mail },
    { value: 'in_progress', label: 'In Progress', icon: Loader2 },
    { value: 'waiting_on_customer', label: 'Waiting', icon: Clock },
    { value: 'resolved', label: 'Resolved', icon: CheckCircle2 },
    { value: 'closed', label: 'Closed', icon: CheckCircle2 },
    { value: 'archived', label: 'Archived', icon: Archive },
];

function getPriorityClass(priority: string): string {
    switch (priority) {
        case 'urgent':
            return 'bg-red-100 text-red-700 border-red-200';
        case 'high':
            return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'medium':
            return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'low':
            return 'bg-gray-100 text-gray-600 border-gray-200';
        default:
            return 'bg-gray-100 text-gray-600 border-gray-200';
    }
}

function getStatusClass(status: string): string {
    switch (status) {
        case 'open':
            return 'bg-green-100 text-green-700 border-green-200';
        case 'in_progress':
            return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'waiting_on_customer':
            return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'resolved':
            return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'closed':
            return 'bg-gray-100 text-gray-600 border-gray-200';
        case 'archived':
            return 'bg-gray-100 text-gray-500 border-gray-200';
        default:
            return 'bg-gray-100 text-gray-600 border-gray-200';
    }
}

export default function TicketsIndex({
    tickets,
    statusCounts,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(
        filters.status || 'all',
    );

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            '/admin/tickets',
            { ...filters, search },
            { preserveState: true },
        );
    }

    function handleStatusChange(value: string) {
        setSelectedStatus(value);
        router.get(
            '/admin/tickets',
            { ...filters, status: value === 'all' ? undefined : value },
            { preserveState: true },
        );
    }

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    function deleteTicket(e: React.MouseEvent, ticketUuid: string) {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this ticket?')) {
            router.delete(`/admin/tickets/${ticketUuid}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Support Tickets" />

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Support Tickets</h1>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/50 p-1">
                        {statusOptions.map((option) => {
                            const Icon = option.icon;
                            const count =
                                statusCounts[
                                    option.value as keyof typeof statusCounts
                                ] || 0;
                            const isActive = selectedStatus === option.value;

                            return (
                                <button
                                    key={option.value}
                                    onClick={() =>
                                        handleStatusChange(option.value)
                                    }
                                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                                        isActive
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">
                                        {option.label}
                                    </span>
                                    <span
                                        className={`rounded-full px-1.5 text-xs ${
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted-foreground/20'
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search */}
                    <form
                        onSubmit={handleSearch}
                        className="flex gap-2 sm:w-auto sm:min-w-[300px]"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search tickets..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </form>
                </div>

                {/* Tickets Table */}
                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[140px]">
                                    Reference
                                </TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead className="w-[180px]">
                                    Customer
                                </TableHead>
                                <TableHead className="w-[120px]">
                                    Priority
                                </TableHead>
                                <TableHead className="w-[130px]">
                                    Status
                                </TableHead>
                                <TableHead className="w-[100px]">
                                    Assigned
                                </TableHead>
                                <TableHead className="w-[90px] text-right">
                                    Created
                                </TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-32 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                                            <p className="text-muted-foreground">
                                                No tickets found
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tickets.data.map((ticket) => (
                                    <TableRow
                                        key={ticket.id}
                                        className="cursor-pointer"
                                        onClick={() =>
                                            router.visit(
                                                `/admin/tickets/${ticket.uuid}`,
                                            )
                                        }
                                    >
                                        <TableCell>
                                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                                                {ticket.reference}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[300px]">
                                                <div className="truncate font-medium">
                                                    {ticket.subject}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-medium">
                                                        {ticket.name}
                                                    </div>
                                                    <div className="truncate text-xs text-muted-foreground">
                                                        {ticket.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`${getPriorityClass(ticket.priority)}`}
                                            >
                                                {ticket.priority === 'urgent' && (
                                                    <AlertCircle className="mr-1 h-3 w-3" />
                                                )}
                                                {ticket.priority_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getStatusClass(
                                                    ticket.status,
                                                )}
                                            >
                                                {ticket.status_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {ticket.assigned_to ? (
                                                <span className="text-sm">
                                                    {ticket.assigned_to}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right text-sm text-muted-foreground">
                                            {formatDate(ticket.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) =>
                                                    deleteTicket(
                                                        e,
                                                        ticket.uuid,
                                                    )
                                                }
                                                className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {tickets.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {tickets.from}-{tickets.to} of{' '}
                            {tickets.total}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={tickets.current_page === 1}
                                onClick={() => {
                                    const params = new URLSearchParams(
                                        window.location.search,
                                    );
                                    params.set(
                                        'page',
                                        String(tickets.current_page - 1),
                                    );
                                    router.get(
                                        `/admin/tickets?${params.toString()}`,
                                    );
                                }}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                    tickets.current_page === tickets.last_page
                                }
                                onClick={() => {
                                    const params = new URLSearchParams(
                                        window.location.search,
                                    );
                                    params.set(
                                        'page',
                                        String(tickets.current_page + 1),
                                    );
                                    router.get(
                                        `/admin/tickets?${params.toString()}`,
                                    );
                                }}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
