import { index as ticketsIndex, create as ticketsCreate } from '@/actions/App/Http/Controllers/Client/TicketController';
import { TicketMessage } from '@/components/ticket-message';
import { TicketReplyForm } from '@/components/ticket-reply-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSse } from '@/hooks/use-sse';
import { useTrans } from '@/hooks/use-trans';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface TicketData {
    uuid: string;
    reference: string;
    subject: string;
    name: string;
    email: string;
    status: string;
    status_label: string;
    status_color: string;
    priority: string;
    priority_label: string;
    priority_color: string;
    created_at: string;
    last_message_at?: string;
    can_add_message: boolean;
    assigned_to: string | null;
}

interface MessageData {
    uuid: string;
    message: string;
    is_internal: boolean;
    sender_name: string;
    sender_email: string;
    is_admin: boolean;
    created_at: string;
}

interface Props {
    ticket: TicketData;
    messages: MessageData[];
}

interface SseUpdateData {
    messages: MessageData[];
    ticket: {
        status: string;
        status_label: string;
        status_color: string;
        can_add_message: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/client' },
    { title: 'Tickets', href: ticketsIndex.url() },
    { title: 'Ticket Details', href: '#' },
];

export default function TicketShow() {
    const { trans } = useTrans();
    const { ticket: initialTicket, messages: initialMessages } = usePage<{
        props: Props;
    }>().props as unknown as Props;

    // Local state for real-time updates
    const [messages, setMessages] = useState<MessageData[]>(initialMessages);
    const [ticket, setTicket] = useState<TicketData>(initialTicket);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle incoming SSE updates
    const handleMessagesUpdate = useCallback((data: unknown) => {
        const update = data as SseUpdateData;

        // Add new messages
        if (update.messages && Array.isArray(update.messages)) {
            setMessages((prev) => {
                const existingUuids = new Set(prev.map((m) => m.uuid));
                const newMessages = update.messages.filter(
                    (m) => !existingUuids.has(m.uuid),
                );
                return [...prev, ...newMessages];
            });
        }

        // Update ticket status
        if (update.ticket) {
            setTicket((prev) => ({
                ...prev,
                status: update.ticket.status,
                status_label: update.ticket.status_label,
                status_color: update.ticket.status_color,
                can_add_message: update.ticket.can_add_message,
            }));
        }
    }, []);

    // SSE connection URL
    const streamUrl = useMemo(
        () => `/client/tickets/${ticket.uuid}/stream`,
        [ticket.uuid],
    );

    // Connect to SSE stream
    const { status: sseStatus } = useSse(streamUrl, {
        onEvent: {
            messages: handleMessagesUpdate,
        },
        autoReconnect: true,
        maxReconnects: 10,
    });

    const getStatusColor = (color: string) => {
        const colors: Record<string, string> = {
            green: 'bg-green-100 text-green-800 border-green-200',
            blue: 'bg-blue-100 text-blue-800 border-blue-200',
            yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            gray: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return colors[color] || colors.gray;
    };

    const getConnectionIndicator = () => {
        switch (sseStatus) {
            case 'connected':
                return (
                    <div className="flex items-center gap-1.5 text-xs text-green-600">
                        <Wifi className="h-3 w-3" />
                        <span>{trans('ticket.live_updates') || 'Live'}</span>
                    </div>
                );
            case 'connecting':
                return (
                    <div className="flex items-center gap-1.5 text-xs text-yellow-600">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>
                            {trans('ticket.connecting') || 'Connecting...'}
                        </span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <WifiOff className="h-3 w-3" />
                        <span>{trans('ticket.offline') || 'Offline'}</span>
                    </div>
                );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`${trans('ticket.title') || 'Ticket'} - ${ticket.reference}`}
            />

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={ticketsIndex.url()}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold">
                                    {ticket.subject}
                                </h1>
                                {getConnectionIndicator()}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {ticket.reference} •{' '}
                                {trans('ticket.created_at')}:{' '}
                                {ticket.created_at}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Ticket Info Card */}
                <div className="rounded-md border bg-card p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {trans('ticket.status')}:
                            </span>
                            <Badge
                                className={getStatusColor(ticket.status_color)}
                            >
                                {ticket.status_label}
                            </Badge>
                        </div>
                        {ticket.priority !== 'medium' && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    {trans('ticket.priority')}:
                                </span>
                                <Badge variant="outline" className="text-xs">
                                    {ticket.priority_label}
                                </Badge>
                            </div>
                        )}
                        {ticket.assigned_to && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    {trans('ticket.assigned_to')}:
                                </span>
                                <span className="text-sm">
                                    {ticket.assigned_to}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <div className="rounded-md border">
                    <div className="border-b bg-muted px-4 py-3">
                        <h2 className="font-semibold">
                            {trans('ticket.conversation') || 'Conversation'} (
                            {messages.length})
                        </h2>
                    </div>
                    <div className="max-h-[500px] space-y-4 overflow-y-auto p-4">
                        {messages.map((msg) => (
                            <TicketMessage key={msg.uuid} message={msg} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Reply Form */}
                {ticket.can_add_message && (
                    <div className="rounded-md border bg-card p-4">
                        <h3 className="mb-4 text-lg font-semibold">
                            {trans('ticket.reply')}
                        </h3>
                        <TicketReplyForm
                            ticketUuid={ticket.uuid}
                            replyRoute={
                                '/client/tickets/' + ticket.uuid + '/reply'
                            }
                        />
                    </div>
                )}

                {!ticket.can_add_message && (
                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-center text-yellow-800">
                        {trans('ticket.closed_message', {
                            status: ticket.status_label,
                        }) ||
                            `This ticket is ${ticket.status_label}. No further messages can be added.`}
                        <div className="mt-4">
                            <Button asChild>
                                <Link href={ticketsCreate.url()}>
                                    {trans('ticket.create_title') ||
                                        'Create New Ticket'}
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
