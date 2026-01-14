<?php

namespace App\Services;

use App\Enums\EmailTemplate;
use App\Enums\TicketPriority;
use App\Events\Ticket\TicketCreated;
use App\Events\Ticket\TicketMessageCreated;
use App\Mail\TemplatedMail;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Services\Streaming\SseStream;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Thunk\Verbs\Facades\Verbs;

class TicketService
{
    /**
     * Create a new ticket.
     */
    public function createTicket(array $data, ?int $userId = null): Ticket
    {
        $priority = TicketPriority::tryFrom($data['priority'] ?? 'medium') ?? TicketPriority::Medium;

        $event = TicketCreated::fire(
            name: $data['name'],
            email: $data['email'],
            subject: $data['subject'],
            message: $data['message'],
            priority: $priority,
            user_id: $userId,
        );

        Verbs::commit();

        return Ticket::findOrFail($event->ticket_id);
    }

    /**
     * Add a message to a ticket.
     */
    public function addMessage(
        Ticket $ticket,
        string $message,
        bool $isInternal = false,
        ?int $userId = null,
        ?string $senderName = null,
        ?string $senderEmail = null
    ): void {
        TicketMessageCreated::fire(
            ticket_id: $ticket->id,
            message: $message,
            is_internal: $isInternal,
            user_id: $userId,
            sender_name: $senderName ?? $ticket->name,
            sender_email: $senderEmail ?? $ticket->email,
        );
    }

    /**
     * Send ticket creation confirmation to customer.
     */
    public function notifyCustomerTicketCreated(Ticket $ticket): void
    {
        $ticketUrl = $this->getCustomerTicketUrl($ticket);

        Mail::to($ticket->email)->queue(
            new TemplatedMail(
                template: EmailTemplate::TicketCreated,
                templateData: [
                    'customerName' => $ticket->name,
                    'ticketReference' => $ticket->reference,
                    'ticketSubject' => $ticket->subject,
                    'ticketUrl' => $ticketUrl,
                ],
            )
        );
    }

    /**
     * Notify support team about new ticket.
     */
    public function notifyAdminTicketCreated(Ticket $ticket): void
    {
        $supportEmail = config('contact.support_email');

        if (!$supportEmail) {
            return;
        }

        Mail::to($supportEmail)->queue(
            new TemplatedMail(
                template: EmailTemplate::AdminTicketCreated,
                templateData: [
                    'ticketReference' => $ticket->reference,
                    'customerName' => $ticket->name,
                    'customerEmail' => $ticket->email,
                    'ticketSubject' => $ticket->subject,
                    'ticketPriority' => $ticket->priority->label(),
                    'ticketMessage' => $ticket->message,
                    'adminTicketUrl' => $this->getAdminTicketUrl($ticket),
                ],
            )
        );
    }

    /**
     * Notify customer about admin reply.
     */
    public function notifyCustomerReply(Ticket $ticket, string $message): void
    {
        Mail::to($ticket->email)->queue(
            new TemplatedMail(
                template: EmailTemplate::TicketReply,
                templateData: [
                    'customerName' => $ticket->name,
                    'ticketReference' => $ticket->reference,
                    'ticketSubject' => $ticket->subject,
                    'ticketUrl' => $this->getCustomerTicketUrl($ticket),
                    'replyPreview' => \Illuminate\Support\Str::limit($message, 200),
                ],
                customSubject: "Re: {$ticket->subject} [{$ticket->reference}]",
            )
        );
    }

    /**
     * Notify admin about customer reply.
     */
    public function notifyAdminReply(Ticket $ticket, string $message): void
    {
        $notifyEmail = $ticket->assignedAdmin?->email ?? config('contact.support_email');

        if (!$notifyEmail) {
            return;
        }

        Mail::to($notifyEmail)->queue(
            new TemplatedMail(
                template: EmailTemplate::AdminTicketReply,
                templateData: [
                    'ticketReference' => $ticket->reference,
                    'customerName' => $ticket->name,
                    'customerEmail' => $ticket->email,
                    'ticketSubject' => $ticket->subject,
                    'replyMessage' => $message,
                    'adminTicketUrl' => $this->getAdminTicketUrl($ticket),
                    'assignedTo' => $ticket->assignedAdmin?->name,
                ],
                customSubject: "Re: {$ticket->subject} [{$ticket->reference}]",
            )
        );
    }

    /**
     * Get messages for a ticket including the initial message.
     */
    public function getMessagesWithInitial(Ticket $ticket, bool $includeInternal = false): Collection
    {
        $ticket->loadMissing(['messages' => function ($query) {
            $query->orderBy('created_at');
        }]);

        // Start with initial ticket message
        $messages = collect([[
            'uuid' => 'initial',
            'message' => $ticket->message,
            'is_internal' => false,
            'sender_name' => $ticket->name,
            'sender_email' => $ticket->email,
            'is_admin' => false,
            'created_at' => $ticket->created_at->format('M j, Y H:i'),
        ]]);

        // Filter internal messages if needed
        $ticketMessages = $includeInternal
            ? $ticket->messages
            : $ticket->messages->where('is_internal', false);

        return $messages->concat(
            $ticketMessages->map(fn($msg) => $this->formatMessage($msg))
        );
    }

    /**
     * Format a message for API response.
     */
    public function formatMessage(TicketMessage $message): array
    {
        return [
            'uuid' => $message->uuid,
            'message' => $message->message,
            'is_internal' => $message->is_internal,
            'sender_name' => $message->sender_name,
            'sender_email' => $message->sender_email,
            'is_admin' => $message->isAdmin(),
            'created_at' => $message->created_at->format('M j, Y H:i'),
        ];
    }

    /**
     * Format a ticket for API response.
     */
    public function formatTicket(Ticket $ticket, bool $detailed = false): array
    {
        $data = [
            'uuid' => $ticket->uuid,
            'reference' => $ticket->reference,
            'subject' => $ticket->subject,
            'status' => $ticket->status->value,
            'status_label' => $ticket->status->label(),
            'status_color' => $ticket->status->color(),
            'priority' => $ticket->priority->value,
            'priority_label' => $ticket->priority->label(),
            'priority_color' => $ticket->priority->color(),
            'created_at' => $ticket->created_at->format('M j, Y H:i'),
        ];

        if ($detailed) {
            $data = array_merge($data, [
                'id' => $ticket->id,
                'name' => $ticket->name,
                'email' => $ticket->email,
                'message' => $ticket->message,
                'last_message_at' => $ticket->last_message_at?->format('M j, Y H:i'),
                'assigned_to' => $ticket->assignedAdmin?->name ?? null,
                'assigned_to_id' => $ticket->assigned_to,
                'user_id' => $ticket->user_id,
                'can_add_message' => $ticket->canAddMessage(),
            ]);
        }

        return $data;
    }

    /**
     * Stream ticket updates via SSE.
     */
    public function streamUpdates(Ticket $ticket, bool $includeInternal = false): StreamedResponse
    {
        $lastMessageCount = $ticket->messages()->count();
        $lastUpdated = $ticket->updated_at;

        return SseStream::make("ticket.{$ticket->uuid}")
            ->retry(3000)
            ->heartbeatInterval(15)
            ->maxDuration(60)
            ->poll(
                checker: function () use ($ticket, &$lastMessageCount, &$lastUpdated, $includeInternal) {
                    $ticket->refresh();
                    $currentMessageCount = $ticket->messages()->count();

                    // Check if there are updates
                    if ($currentMessageCount <= $lastMessageCount && $ticket->updated_at <= $lastUpdated) {
                        return null;
                    }

                    // Get new messages (filter internal based on context)
                    $query = $ticket->messages()->orderBy('created_at', 'desc');
                    if (!$includeInternal) {
                        $query->where('is_internal', false);
                    }

                    $newMessages = $query
                        ->take($currentMessageCount - $lastMessageCount)
                        ->get()
                        ->reverse()
                        ->map(fn($msg) => $this->formatMessage($msg))
                        ->values();

                    // Update tracking
                    $lastMessageCount = $currentMessageCount;
                    $lastUpdated = $ticket->updated_at;

                    return [
                        'messages' => $newMessages,
                        'ticket' => [
                            'status' => $ticket->status->value,
                            'status_label' => $ticket->status->label(),
                            'status_color' => $ticket->status->color(),
                            'can_add_message' => $ticket->canAddMessage(),
                        ],
                    ];
                },
                eventName: 'messages',
                intervalSeconds: 2
            );
    }

    /**
     * Get the customer-facing ticket URL.
     */
    protected function getCustomerTicketUrl(Ticket $ticket): string
    {
        return config('app.url') . '/tickets/' . $ticket->uuid . '/' . $ticket->email;
    }

    /**
     * Get the admin ticket URL.
     */
    protected function getAdminTicketUrl(Ticket $ticket): string
    {
        return config('app.url') . '/admin/tickets/' . $ticket->uuid;
    }
}
