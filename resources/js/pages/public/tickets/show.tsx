import { TicketMessage } from '@/components/ticket-message';
import { TicketReplyForm } from '@/components/ticket-reply-form';
import { Badge } from '@/components/ui/badge';
import { useSse } from '@/hooks/use-sse';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

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

interface TicketShowProps {
    ticket: TicketData;
    messages: MessageData[];
    customer_email: string;
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

export default function TicketShow() {
    const { trans } = useTrans();
    const { ticket: initialTicket, messages: initialMessages, customer_email } = usePage<{ props: TicketShowProps }>().props as unknown as TicketShowProps;

    // Local state for real-time updates
    const [messages, setMessages] = useState<MessageData[]>(initialMessages);
    const [ticket, setTicket] = useState<TicketData>(initialTicket);

    // Handle incoming SSE updates
    const handleMessagesUpdate = useCallback((data: unknown) => {
        const update = data as SseUpdateData;

        // Add new messages
        if (update.messages && Array.isArray(update.messages)) {
            setMessages(prev => {
                const existingUuids = new Set(prev.map(m => m.uuid));
                const newMessages = update.messages.filter(m => !existingUuids.has(m.uuid));
                return [...prev, ...newMessages];
            });
        }

        // Update ticket status
        if (update.ticket) {
            setTicket(prev => ({
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
        () => `/tickets/${ticket.uuid}/${customer_email}/stream`,
        [ticket.uuid, customer_email]
    );

    // Connect to SSE stream
    const { status: sseStatus, isConnected } = useSse(streamUrl, {
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

    const replyRoute = `/tickets/${ticket.uuid}/${customer_email}/reply`;

    const getConnectionIndicator = () => {
        switch (sseStatus) {
            case 'connected':
                return (
                    <div className="flex items-center gap-1.5 text-xs text-green-600">
                        <Wifi className="h-3 w-3" />
                        <span>{trans('ticket.live_updates')}</span>
                    </div>
                );
            case 'connecting':
                return (
                    <div className="flex items-center gap-1.5 text-xs text-yellow-600">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>{trans('ticket.connecting')}</span>
                    </div>
                );
            case 'error':
            case 'disconnected':
                return (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <WifiOff className="h-3 w-3" />
                        <span>{trans('ticket.offline')}</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <GuestLayout>
            <Head title={`${trans('ticket.title')} - ${ticket.reference}`} />

            <div className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        {/* Back Link */}
                        <div className="mb-6 flex items-center justify-between">
                            <a
                                href="/tickets"
                                className="inline-flex items-center gap-2 text-sm text-primary-600 transition-colors hover:text-primary-900"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {trans('ticket.back_to_support')}
                            </a>
                            {getConnectionIndicator()}
                        </div>

                        {/* Ticket Header */}
                        <div className="mb-8 rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex-1">
                                    <h1 className="mb-3 text-2xl font-bold text-primary-900">
                                        {ticket.subject}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-primary-600">
                                        <div>
                                            <span className="font-medium">
                                                {trans('ticket.reference')}:
                                            </span>{' '}
                                            <span className="font-mono text-primary-900">
                                                {ticket.reference}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {trans('ticket.status')}:
                                            </span>
                                            <Badge className={getStatusColor(ticket.status_color)}>
                                                {ticket.status_label}
                                            </Badge>
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                {trans('ticket.priority')}:
                                            </span>{' '}
                                            <span className="text-primary-900">
                                                {ticket.priority_label}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                {trans('ticket.created_at')}:
                                            </span>{' '}
                                            <span className="text-primary-900">
                                                {ticket.created_at}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {ticket.assigned_to && (
                                    <div className="text-sm text-primary-600">
                                        <span className="font-medium">
                                            {trans('ticket.assigned_to')}:
                                        </span>{' '}
                                        <span>{ticket.assigned_to}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 border-t border-primary-100 pt-4">
                                <p className="text-sm text-primary-600">
                                    <span className="font-medium">{ticket.name}</span>{' '}
                                    ({ticket.email})
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="mb-8 space-y-4">
                            {messages.map((msg) => (
                                <TicketMessage key={msg.uuid} message={msg} />
                            ))}
                        </div>

                        {/* Reply Form */}
                        {ticket.can_add_message && (
                            <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-semibold text-primary-900">
                                    {trans('ticket.reply')}
                                </h3>
                                <TicketReplyForm
                                    ticketUuid={ticket.uuid}
                                    email={customer_email}
                                    replyRoute={replyRoute}
                                />
                            </div>
                        )}

                        {!ticket.can_add_message && (
                            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-center">
                                <p className="text-yellow-800">
                                    {trans('ticket.closed_message', { status: ticket.status_label })}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
