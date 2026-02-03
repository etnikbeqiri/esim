import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSse } from '@/hooks/use-sse';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Archive,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Mail,
    Send,
    Trash2,
    User,
    Wifi,
    WifiOff,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Message {
    uuid: string;
    message: string;
    is_internal: boolean;
    sender_name: string;
    sender_email: string;
    is_admin: boolean;
    created_at: string;
}

interface Ticket {
    id: number;
    uuid: string;
    reference: string;
    name: string;
    email: string;
    subject: string;
    status: string;
    status_label: string;
    status_color: string;
    priority: string;
    priority_label: string;
    priority_color: string;
    created_at: string;
    last_message_at?: string;
    assigned_to?: string;
    assigned_to_id?: number | null;
    user?: {
        id: number;
        name: string;
        email: string;
    } | null;
    user_id?: number | null;
    can_add_message: boolean;
}

interface AdminUser {
    id: number;
    name: string;
    email: string;
}

interface Props {
    ticket: Ticket;
    messages: Message[];
    adminUsers: AdminUser[];
}

interface SseUpdateData {
    messages: Message[];
    ticket: {
        status: string;
        status_label: string;
        status_color: string;
        can_add_message: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Tickets', href: '/admin/tickets' },
    { title: 'Ticket Details', href: '#' },
];

const statusOptions = [
    { value: 'open', label: 'Open', color: 'green' },
    { value: 'in_progress', label: 'In Progress', color: 'blue' },
    {
        value: 'waiting_on_customer',
        label: 'Waiting on Customer',
        color: 'yellow',
    },
    { value: 'resolved', label: 'Resolved', color: 'green' },
    { value: 'closed', label: 'Closed', color: 'gray' },
    { value: 'archived', label: 'Archived', color: 'gray' },
];

function getStatusBadgeClass(color: string): string {
    const colors: Record<string, string> = {
        green: 'bg-green-100 text-green-700 border-green-200',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        red: 'bg-red-100 text-red-700 border-red-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[color] || colors.gray;
}

export default function TicketShow({
    ticket: initialTicket,
    messages: initialMessages,
    adminUsers,
}: Props) {
    const { data, setData, post, processing } = useForm({
        message: '',
        is_internal: false,
    });

    // Local state for real-time updates
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [ticket, setTicket] = useState<Ticket>(initialTicket);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const [currentStatus, setCurrentStatus] = useState(ticket.status);
    const [currentAssigned, setCurrentAssigned] = useState(
        ticket.assigned_to_id?.toString() || 'unassigned',
    );

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
            setCurrentStatus(update.ticket.status);
        }
    }, []);

    // SSE connection URL
    const streamUrl = useMemo(
        () => `/admin/tickets/${ticket.uuid}/stream`,
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

    const getConnectionIndicator = () => {
        switch (sseStatus) {
            case 'connected':
                return (
                    <div className="flex items-center gap-1.5 text-xs text-green-600">
                        <Wifi className="h-3 w-3" />
                        <span>Live</span>
                    </div>
                );
            case 'connecting':
                return (
                    <div className="flex items-center gap-1.5 text-xs text-yellow-600">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Connecting...</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <WifiOff className="h-3 w-3" />
                        <span>Offline</span>
                    </div>
                );
        }
    };

    function handleReply(e: React.FormEvent) {
        e.preventDefault();
        post(`/admin/tickets/${ticket.uuid}/reply`, {
            onSuccess: () => {
                setData('message', '');
            },
        });
    }

    function handleStatusChange(value: string) {
        setCurrentStatus(value);
        router.post(
            `/admin/tickets/${ticket.uuid}/status`,
            { status: value },
            { preserveScroll: true },
        );
    }

    function handleAssign(value: string) {
        setCurrentAssigned(value);
        const assignedTo = value === 'unassigned' ? null : value;
        router.post(
            `/admin/tickets/${ticket.uuid}/assign`,
            { assigned_to: assignedTo },
            { preserveScroll: true },
        );
    }

    function handleClose() {
        if (confirm('Are you sure you want to close this ticket?')) {
            router.post(
                `/admin/tickets/${ticket.uuid}/close`,
                {},
                { preserveScroll: true },
            );
        }
    }

    function deleteTicket() {
        if (confirm('Are you sure you want to delete this ticket?')) {
            router.delete(`/admin/tickets/${ticket.uuid}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ticket: ${ticket.reference}`} />

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/tickets">
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
                                {ticket.reference} • Created{' '}
                                {new Date(ticket.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={deleteTicket}
                        className="text-red-500 hover:text-red-700"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-4 lg:col-span-2">
                        {/* Ticket Info */}
                        <div className="space-y-4 rounded-md border bg-card p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold">
                                        {ticket.subject}
                                    </h2>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <Badge
                                            className={getStatusBadgeClass(
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
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span className="font-semibold">
                                    {ticket.name}
                                </span>
                                <span className="text-gray-400">
                                    ({ticket.email})
                                </span>
                                {ticket.user_id && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        Registered
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="rounded-md border">
                            <div className="border-b bg-muted px-4 py-3">
                                <h2 className="font-semibold">
                                    Conversation ({messages.length})
                                </h2>
                            </div>
                            <div className="max-h-[500px] space-y-4 overflow-y-auto p-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.uuid}
                                        className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg p-4 ${
                                                msg.is_internal
                                                    ? 'border border-amber-200 bg-amber-50'
                                                    : msg.is_admin
                                                      ? 'border border-blue-200 bg-blue-50'
                                                      : 'border border-green-200 bg-green-50'
                                            }`}
                                        >
                                            <div className="mb-2 flex items-center gap-2">
                                                <span className="text-sm font-semibold">
                                                    {msg.sender_name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {msg.sender_email}
                                                </span>
                                                {msg.is_internal && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        Internal
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">
                                                {msg.message}
                                            </p>
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                {msg.created_at}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Reply Form */}
                        {ticket.can_add_message && (
                            <div className="rounded-md border p-4">
                                <div className="mb-4">
                                    <h2 className="font-semibold">Add Reply</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Type your response below. Mark as
                                        internal if visible only to admins.
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleReply}
                                    className="space-y-4"
                                >
                                    <div>
                                        <Textarea
                                            rows={4}
                                            value={data.message}
                                            onChange={(e) =>
                                                setData(
                                                    'message',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Type your reply here..."
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_internal"
                                            checked={data.is_internal}
                                            onChange={(e) =>
                                                setData(
                                                    'is_internal',
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-4 w-4"
                                        />
                                        <label
                                            htmlFor="is_internal"
                                            className="text-sm"
                                        >
                                            Mark as internal note
                                        </label>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            <Send className="mr-2 h-4 w-4" />
                                            Send Reply
                                        </Button>

                                        {ticket.status !== 'closed' && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleClose}
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Close Ticket
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        )}

                        {!ticket.can_add_message && (
                            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-center">
                                <Archive className="mx-auto h-8 w-8 text-yellow-600" />
                                <p className="mt-2 font-semibold text-yellow-800">
                                    Ticket is {ticket.status_label}
                                </p>
                                <p className="text-sm text-yellow-700">
                                    No further messages can be added to this
                                    ticket.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Status Management */}
                        <div className="space-y-4 rounded-md border bg-card p-4">
                            <h3 className="font-semibold">Ticket Status</h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Change Status
                                </label>
                                <Select
                                    value={currentStatus}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Assign To
                                </label>
                                <Select
                                    value={currentAssigned}
                                    onValueChange={handleAssign}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select admin..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">
                                            Unassigned
                                        </SelectItem>
                                        {adminUsers.map((admin) => (
                                            <SelectItem
                                                key={admin.id}
                                                value={admin.id.toString()}
                                            >
                                                {admin.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {ticket.assigned_to && (
                                    <div className="text-sm text-green-600">
                                        Currently: {ticket.assigned_to}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ticket Details */}
                        <div className="space-y-4 rounded-md border bg-card p-4">
                            <h3 className="font-semibold">Ticket Details</h3>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Reference
                                    </span>
                                    <span className="font-medium">
                                        {ticket.reference}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Status
                                    </span>
                                    <span className="font-medium">
                                        {ticket.status_label}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Priority
                                    </span>
                                    <span className="font-medium">
                                        {ticket.priority_label}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Created
                                    </span>
                                    <span className="font-medium">
                                        {new Date(
                                            ticket.created_at,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                {ticket.last_message_at && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Last Message
                                        </span>
                                        <span className="font-medium">
                                            {new Date(
                                                ticket.last_message_at,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-2 rounded-md border bg-card p-4">
                            <h3 className="font-semibold">Quick Actions</h3>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => {
                                    if (
                                        confirm(
                                            `Send email notification to ${ticket.email} with link to view their ticket?`,
                                        )
                                    ) {
                                        router.post(
                                            `/admin/tickets/${ticket.uuid}/notify`,
                                        );
                                    }
                                }}
                            >
                                <Mail className="mr-2 h-4 w-4" />
                                Notify Customer
                            </Button>
                            {ticket.user && (
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    asChild
                                >
                                    <Link
                                        href={`/admin/customers/${ticket.user.id}`}
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        View Customer
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
