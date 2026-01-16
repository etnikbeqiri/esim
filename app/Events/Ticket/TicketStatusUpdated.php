<?php

namespace App\Events\Ticket;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\States\TicketState;
use Carbon\Carbon;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class TicketStatusUpdated extends Event
{
    #[StateId(TicketState::class)]
    public int $ticket_id;

    public function __construct(
        int $ticket_id,
        public TicketStatus $new_status,
        public ?int $updated_by = null,
    ) {
        $this->ticket_id = $ticket_id;
    }

    public function apply(TicketState $state): void
    {
        $oldStatus = $state->status;
        $state->old_status = $oldStatus;
        $state->status = $this->new_status;
        $state->updated_by = $this->updated_by;
        $state->updated_at = now();

        // Set resolved_at if transitioning to resolved
        if ($this->new_status === TicketStatus::Resolved && !$state->resolved_at) {
            $state->resolved_at = now();
        }

        // Set closed_at if transitioning to closed
        if ($this->new_status === TicketStatus::Closed && !$state->closed_at) {
            $state->closed_at = now();
        }
    }

    public function handle(TicketState $state): void
    {
        $ticket = Ticket::find($state->ticket_id);
        if (!$ticket) {
            return;
        }

        $ticket->update([
            'status' => $state->status->value,
            'assigned_to' => $state->assigned_to,
            'resolved_at' => $state->resolved_at,
            'closed_at' => $state->closed_at,
        ]);
    }
}
