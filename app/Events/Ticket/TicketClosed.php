<?php

namespace App\Events\Ticket;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\States\TicketState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;
use Thunk\Verbs\Facades\Verbs;

class TicketClosed extends Event
{
    #[StateId(TicketState::class)]
    public int $ticket_id;

    public function __construct(
        int $ticket_id,
        public ?int $closed_by = null,
        public ?string $resolution_note = null,
    ) {
        $this->ticket_id = $ticket_id;
    }

    public function apply(TicketState $state): void
    {
        $state->status = TicketStatus::Closed;
        $state->closed_by = $this->closed_by;
        $state->closed_at = now();
        $state->resolution_note = $this->resolution_note;
        $state->updated_at = now();
    }

    public function handle(TicketState $state): void
    {
        $ticket = Ticket::find($state->ticket_id);
        if (!$ticket) {
            return;
        }

        $ticket->update([
            'status' => $state->status->value,
            'closed_at' => $state->closed_at,
        ]);

        // Send closure email
        Verbs::unlessReplaying(function () use ($ticket, $state) {
            // Send email notification to ticket owner
        });
    }
}
