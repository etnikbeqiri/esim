<?php

namespace App\States;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Carbon\Carbon;
use Thunk\Verbs\State;

class TicketState extends State
{
    public int $ticket_id;
    public string $uuid;
    public string $reference;
    public string $name;
    public string $email;
    public string $subject;
    public string $message;
    public TicketStatus $status;
    public TicketPriority $priority;
    public ?int $user_id = null;
    public ?int $assigned_to = null;
    public ?int $updated_by = null;
    public ?int $closed_by = null;
    public ?Carbon $created_at = null;
    public ?Carbon $updated_at = null;
    public ?Carbon $last_message_at = null;
    public ?Carbon $resolved_at = null;
    public ?Carbon $closed_at = null;
    public ?string $resolution_note = null;

    public function isActive(): bool
    {
        return $this->status->isActive();
    }

    public function isTerminal(): bool
    {
        return $this->status->isTerminal();
    }

    public function canAddMessage(): bool
    {
        return $this->status->canAddMessage();
    }

    public function canTransitionTo(TicketStatus $newStatus): bool
    {
        return $this->status->canTransitionTo($newStatus);
    }
}
