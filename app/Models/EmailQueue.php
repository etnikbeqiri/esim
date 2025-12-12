<?php

namespace App\Models;

use App\Enums\EmailTemplate;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailQueue extends Model
{
    use HasFactory;

    protected $table = 'email_queue';

    protected $fillable = [
        'customer_id',
        'order_id',
        'template',
        'to_email',
        'to_name',
        'subject',
        'status',
        'priority',
        'attempts',
        'max_attempts',
        'next_attempt_at',
        'sent_at',
        'delivered_at',
        'opened_at',
        'provider',
        'provider_message_id',
        'error_code',
        'error_message',
        'data',
    ];

    protected function casts(): array
    {
        return [
            'template' => EmailTemplate::class,
            'priority' => 'integer',
            'attempts' => 'integer',
            'max_attempts' => 'integer',
            'next_attempt_at' => 'datetime',
            'sent_at' => 'datetime',
            'delivered_at' => 'datetime',
            'opened_at' => 'datetime',
            'data' => 'array',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeRetryable($query)
    {
        return $query->failed()
            ->where('attempts', '<', \DB::raw('max_attempts'));
    }

    public function scopeReadyToSend($query)
    {
        return $query->where(function ($q) {
            $q->pending()
                ->where(function ($subQ) {
                    $subQ->whereNull('next_attempt_at')
                        ->orWhere('next_attempt_at', '<=', now());
                });
        })->orWhere(function ($q) {
            $q->retryable()
                ->where(function ($subQ) {
                    $subQ->whereNull('next_attempt_at')
                        ->orWhere('next_attempt_at', '<=', now());
                });
        });
    }

    public function scopeByPriority($query)
    {
        return $query->orderBy('priority', 'asc')
            ->orderBy('created_at', 'asc');
    }

    public function canRetry(): bool
    {
        return $this->status === 'failed' && $this->attempts < $this->max_attempts;
    }

    public function markAsSending(): void
    {
        $this->update([
            'status' => 'sending',
            'attempts' => $this->attempts + 1,
        ]);
    }

    public function markAsSent(string $providerMessageId, string $provider = 'default'): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
            'provider' => $provider,
            'provider_message_id' => $providerMessageId,
            'error_code' => null,
            'error_message' => null,
        ]);
    }

    public function markAsFailed(string $errorCode, string $errorMessage): void
    {
        $backoffMinutes = min(pow(2, $this->attempts) * 5, 60);

        $this->update([
            'status' => 'failed',
            'error_code' => $errorCode,
            'error_message' => $errorMessage,
            'next_attempt_at' => now()->addMinutes($backoffMinutes),
        ]);
    }

    public function markAsDelivered(): void
    {
        $this->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);
    }

    public function markAsOpened(): void
    {
        $this->update([
            'opened_at' => now(),
        ]);
    }
}
