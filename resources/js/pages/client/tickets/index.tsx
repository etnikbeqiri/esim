import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTrans } from '@/hooks/use-trans';
import { Link, usePage } from '@inertiajs/react';

interface TicketFilters {
    status?: string;
}

interface Ticket {
    id: number;
    uuid: string;
    ticket_number: string;
    subject: string;
    status: string;
    status_label: string;
    status_color: string;
    priority: string;
    priority_label: string;
    created_at: string;
    updated_at: string;
    last_reply_at: string | null;
}

interface PaginatedTickets {
    data: Ticket[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

export default function TicketIndex() {
    const { trans } = useTrans();
    const { tickets, filters } = usePage().props as unknown as { tickets: PaginatedTickets; filters: TicketFilters };

    const getStatusColor = (color: string) => {
        const colors: Record<string, string> = {
            green: 'bg-green-100 text-green-800',
            blue: 'bg-blue-100 text-blue-800',
            yellow: 'bg-yellow-100 text-yellow-800',
            gray: 'bg-gray-100 text-gray-800',
        };
        return colors[color] || colors.gray;
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {trans('ticket.my_tickets')}
                    </h1>
                    <p className="mt-1 text-gray-600">
                        View and manage your support tickets
                    </p>
                </div>

                <Link href={'/client/tickets/create'}>
                    <Button>{trans('ticket.create_title')}</Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row">
                <div className="flex-1">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        {trans('ticket.status')}
                    </label>
                    <Link href={'/client/tickets'} preserveState>
                        <Button
                            variant={!filters.status ? 'default' : 'outline'}
                            size="sm"
                            className="w-full justify-start"
                        >
                            All
                        </Button>
                    </Link>
                    <div className="mt-2 space-y-2">
                        <Link
                            href={`/client/tickets?status=open`}
                            preserveState
                        >
                            <Button
                                variant={
                                    filters.status === 'open'
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                className="w-full justify-start"
                            >
                                {trans('ticket.statuses.open')}
                            </Button>
                        </Link>
                        <Link
                            href={`/client/tickets?status=in_progress`}
                            preserveState
                        >
                            <Button
                                variant={
                                    filters.status === 'in_progress'
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                className="w-full justify-start"
                            >
                                {trans('ticket.statuses.in_progress')}
                            </Button>
                        </Link>
                        <Link
                            href={`/client/tickets?status=closed`}
                            preserveState
                        >
                            <Button
                                variant={
                                    filters.status === 'closed'
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                className="w-full justify-start"
                            >
                                {trans('ticket.statuses.closed')}
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="flex-1">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Search
                    </label>
                    <Input placeholder="Search tickets..." className="w-full" />
                </div>
            </div>

            {/* Tickets List */}
            {tickets.data.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                    <p className="text-gray-600">
                        {trans('ticket.no_tickets_desc')}
                    </p>
                    <Link
                        href={'/client/tickets/create'}
                        className="mt-4 inline-block"
                    >
                        <Button>{trans('ticket.create_title')}</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {tickets.data.map((ticket: any) => (
                        <Link
                            key={ticket.uuid}
                            href={'/client/tickets/' + ticket.uuid}
                            className="block rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-primary-300"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex-1">
                                    <div className="mb-2 flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {ticket.subject}
                                        </h3>
                                        <Badge
                                            className={getStatusColor(
                                                ticket.status_color,
                                            )}
                                        >
                                            {ticket.status_label}
                                        </Badge>
                                        {ticket.priority !== 'medium' && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {ticket.priority_label}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">
                                                {trans('ticket.reference')}:
                                            </span>{' '}
                                            {ticket.reference}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                {trans('ticket.created_at')}:
                                            </span>{' '}
                                            {ticket.created_at}
                                        </div>
                                        {ticket.last_message_at && (
                                            <div>
                                                <span className="font-medium">
                                                    {trans(
                                                        'ticket.last_message',
                                                    )}
                                                    :
                                                </span>{' '}
                                                {ticket.last_message_at}
                                            </div>
                                        )}
                                        {ticket.assigned_to && (
                                            <div>
                                                <span className="font-medium">
                                                    {trans(
                                                        'ticket.assigned_to',
                                                    )}
                                                    :
                                                </span>{' '}
                                                {ticket.assigned_to}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {ticket.can_add_message && (
                                    <Button variant="outline" size="sm">
                                        {trans('ticket.reply')}
                                    </Button>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {tickets.links && (
                <div className="mt-8 flex justify-center">
                    <nav className="flex space-x-2">
                        {tickets.links.map((link: any, index: number) => (
                            <Link
                                key={index}
                                href={link.url}
                                className={`rounded-md border px-4 py-2 ${
                                    link.active
                                        ? 'border-primary-600 bg-primary-600 text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </nav>
                </div>
            )}
        </div>
    );
}
