import { TicketMessage } from '@/components/ticket-message';
import { TicketReplyForm } from '@/components/ticket-reply-form';
import { Badge } from '@/components/ui/badge';
import { useTrans } from '@/hooks/use-trans';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function TicketShow() {
    const { trans } = useTrans();
    const { ticket, messages } = usePage().props;

    const getStatusColor = (color: string) => {
        const colors: Record<string, string> = {
            green: 'bg-green-100 text-green-800 border-green-200',
            blue: 'bg-blue-100 text-blue-800 border-blue-200',
            yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            gray: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return colors[color] || colors.gray;
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-6">
                <Link
                    href={'/client/tickets'}
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {trans('ticket.my_tickets')}
                </Link>
            </div>

            {/* Ticket Header */}
            <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {ticket.subject}
                            </h1>
                            <Badge
                                className={getStatusColor(ticket.status_color)}
                            >
                                {ticket.status_label}
                            </Badge>
                            {ticket.priority !== 'medium' && (
                                <Badge variant="outline" className="text-xs">
                                    {ticket.priority_label}
                                </Badge>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">
                                    {trans('ticket.reference')}:
                                </span>{' '}
                                <span className="text-gray-900">
                                    {ticket.reference}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium">
                                    {trans('ticket.created_at')}:
                                </span>{' '}
                                <span className="text-gray-900">
                                    {ticket.created_at}
                                </span>
                            </div>
                            {ticket.last_message_at && (
                                <div>
                                    <span className="font-medium">
                                        {trans('ticket.last_message')}:
                                    </span>{' '}
                                    <span className="text-gray-900">
                                        {ticket.last_message_at}
                                    </span>
                                </div>
                            )}
                            {ticket.assigned_to && (
                                <div>
                                    <span className="font-medium">
                                        {trans('ticket.assigned_to')}:
                                    </span>{' '}
                                    <span className="text-gray-900">
                                        {ticket.assigned_to}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">{ticket.name}</span> (
                        {ticket.email})
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="mb-8 space-y-4">
                {messages.map((msg: any) => (
                    <TicketMessage key={msg.uuid} message={msg} />
                ))}
            </div>

            {/* Reply Form */}
            {ticket.can_add_message && (
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                        {trans('ticket.reply')}
                    </h3>
                    <TicketReplyForm
                        ticketUuid={ticket.uuid}
                        replyRoute={'/client/tickets/' + ticket.uuid + '/reply'}
                    />
                </div>
            )}

            {!ticket.can_add_message && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center text-yellow-800">
                    This ticket is {ticket.status_label}. No further messages
                    can be added.
                    <div className="mt-4">
                        <Link href={'/client/tickets/create'}>
                            <Button>{trans('ticket.create_title')}</Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
