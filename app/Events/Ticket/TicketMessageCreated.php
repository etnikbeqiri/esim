<?php

namespace App\Events\Ticket;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\States\TicketState;
use Illuminate\Support\Str;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;
use Thunk\Verbs\Facades\Verbs;

class TicketMessageCreated extends Event
{
    #[StateId(TicketState::class)]
    public int $ticket_id;

    public function __construct(
        int $ticket_id,
        public string $message,
        public bool $is_internal = false,
        public ?int $user_id = null,
        public ?string $sender_name = null,
        public ?string $sender_email = null,
    ) {
        $this->ticket_id = $ticket_id;
        $this->uuid = Str::uuid()->toString();
    }

    public string $uuid;

    public function apply(TicketState $state): void
    {
        $state->last_message_at = now();
        $state->updated_at = now();

        // If customer sends a message and ticket is "waiting_on_customer", move back to "in_progress"
        if (!$this->is_internal && $state->status->value === 'waiting_on_customer') {
            $state->status = \App\Enums\TicketStatus::InProgress;
        }
    }

    public function handle(TicketState $state): TicketMessage
    {
        $ticketMessage = TicketMessage::create([
            'id' => snowflake_id(),
            'uuid' => $this->uuid,
            'ticket_id' => $state->ticket_id,
            'message' => $this->message,
            'user_id' => $this->user_id,
            'is_internal' => $this->is_internal,
            'sender_name' => $this->sender_name ?? $state->name,
            'sender_email' => $this->sender_email ?? $state->email,
        ]);

        // Update ticket last_message_at
        Ticket::where('id', $state->ticket_id)->update([
            'last_message_at' => now(),
            'status' => $state->status->value,
        ]);

        // Send email notifications
        Verbs::unlessReplaying(function () use ($ticketMessage, $state) {
            $ticket = Ticket::find($state->ticket_id);
            if (!$ticket) {
                return;
            }

            // If admin sent message, notify customer
            if (!$this->is_internal) {
                // Send email to ticket email
            }

            // If customer sent message, notify admin
            if ($this->is_internal && $ticket->assignedAdmin) {
                // Send email to assigned admin
            }
        });

        return $ticketMessage;
    }
}
