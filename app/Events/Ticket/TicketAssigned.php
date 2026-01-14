<?php

namespace App\Events\Ticket;

use App\States\TicketState;
use App\Models\Ticket;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;
use Thunk\Verbs\Facades\Verbs;

class TicketAssigned extends Event
{
    #[StateId(TicketState::class)]
    public int $ticket_id;

    public function __construct(
        int $ticket_id,
        public ?int $assigned_to,
        public ?int $assigned_by = null,
    ) {
        $this->ticket_id = $ticket_id;
    }

    public function apply(TicketState $state): void
    {
        $state->assigned_to = $this->assigned_to;
        $state->updated_at = now();

        // Auto-transition to in_progress if open and assigned to someone
        if ($state->status->value === 'open' && $this->assigned_to) {
            $state->status = \App\Enums\TicketStatus::InProgress;
        }
    }

    public function handle(TicketState $state): void
    {
        $ticket = Ticket::find($state->ticket_id);
        if (!$ticket) {
            return;
        }

        $ticket->update([
            'assigned_to' => $state->assigned_to,
            'status' => $state->status->value,
        ]);

        // Send notification to assigned admin
        Verbs::unlessReplaying(function () use ($ticket) {
            if ($ticket->assignedAdmin) {
                // Email notification could be sent here
            }
        });
    }
}
