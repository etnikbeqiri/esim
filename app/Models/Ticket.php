<?php

namespace App\Models;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'uuid',
        'reference',
        'name',
        'email',
        'subject',
        'message',
        'status',
        'priority',
        'assigned_to',
        'resolved_at',
        'closed_at',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => TicketStatus::class,
            'priority' => TicketPriority::class,
            'resolved_at' => 'datetime',
            'closed_at' => 'datetime',
            'last_message_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Ticket $ticket) {
            if (empty($ticket->uuid)) {
                $ticket->uuid = Str::uuid()->toString();
            }
            if (empty($ticket->reference)) {
                $ticket->reference = 'TKT-' . strtoupper(substr(uniqid(), -8));
            }
        });
    }

    /**
     * Get the user that owns the ticket.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin assigned to the ticket.
     */
    public function assignedAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the messages for the ticket.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(TicketMessage::class)->orderBy('created_at');
    }

    /**
     * Get public messages (not internal).
     */
    public function publicMessages(): HasMany
    {
        return $this->messages()->where('is_internal', false);
    }

    /**
     * Get the route key name.
     */
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /**
     * Scope to filter by status.
     */
    public function scopeWithStatus($query, TicketStatus $status)
    {
        return $query->where('status', $status->value);
    }

    /**
     * Scope to get open tickets.
     */
    public function scopeOpen($query)
    {
        return $query->where('status', TicketStatus::Open);
    }

    /**
     * Scope to get in progress tickets.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', TicketStatus::InProgress);
    }

    /**
     * Scope to get waiting on customer tickets.
     */
    public function scopeWaitingOnCustomer($query)
    {
        return $query->where('status', TicketStatus::WaitingOnCustomer);
    }

    /**
     * Scope to get closed tickets.
     */
    public function scopeClosed($query)
    {
        return $query->where('status', TicketStatus::Closed);
    }

    /**
     * Scope to get active tickets.
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', [
            TicketStatus::Open,
            TicketStatus::InProgress,
            TicketStatus::WaitingOnCustomer,
        ]);
    }

    /**
     * Scope to filter by priority.
     */
    public function scopeWithPriority($query, TicketPriority $priority)
    {
        return $query->where('priority', $priority->value);
    }

    /**
     * Scope to get unassigned tickets.
     */
    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }

    /**
     * Scope to get assigned tickets.
     */
    public function scopeAssigned($query)
    {
        return $query->whereNotNull('assigned_to');
    }

    /**
     * Check if ticket is active.
     */
    public function isActive(): bool
    {
        return $this->status->isActive();
    }

    /**
     * Check if ticket is closed.
     */
    public function isClosed(): bool
    {
        return $this->status->isTerminal();
    }

    /**
     * Check if ticket can have messages added.
     */
    public function canAddMessage(): bool
    {
        return $this->status->canAddMessage();
    }

    /**
     * Check if ticket can transition to a new status.
     */
    public function canTransitionTo(TicketStatus $newStatus): bool
    {
        return $this->status->canTransitionTo($newStatus);
    }

    /**
     * Get ticket URL for customer.
     */
    public function getCustomerUrl(): string
    {
        return route('tickets.show', ['uuid' => $this->uuid, 'email' => $this->email]);
    }

    /**
     * Get the ticket state for Verbs.
     */
    public function getState(): TicketState
    {
        return TicketState::load($this->id);
    }
}
