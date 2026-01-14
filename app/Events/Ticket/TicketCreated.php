<?php

namespace App\Events\Ticket;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\States\TicketState;
use Illuminate\Support\Str;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class TicketCreated extends Event
{
    #[StateId(TicketState::class)]
    public int $ticket_id;

    public function __construct(
        public string $name,
        public string $email,
        public string $subject,
        public string $message,
        public TicketPriority $priority = TicketPriority::Medium,
        public ?int $user_id = null,
    ) {
        $this->ticket_id = snowflake_id();
    }

    public function apply(TicketState $state): void
    {
        $state->ticket_id = $this->ticket_id;
        $state->uuid = Str::uuid()->toString();
        $state->reference = 'TKT-' . strtoupper(substr(uniqid(), -8));
        $state->name = $this->name;
        $state->email = $this->email;
        $state->subject = $this->subject;
        $state->message = $this->message;
        $state->priority = $this->priority;
        $state->status = TicketStatus::Open;
        $state->user_id = $this->user_id;
        $state->created_at = now();
        $state->updated_at = now();
    }

    public function handle(TicketState $state): Ticket
    {
        return Ticket::create([
            'id' => $state->ticket_id,
            'uuid' => $state->uuid,
            'reference' => $state->reference,
            'name' => $state->name,
            'email' => $state->email,
            'subject' => $state->subject,
            'message' => $state->message,
            'priority' => $state->priority->value,
            'status' => $state->status->value,
            'user_id' => $state->user_id,
        ]);
    }
}
