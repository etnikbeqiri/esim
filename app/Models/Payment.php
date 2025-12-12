<?php

namespace App\Models;

use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Payment extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $fillable = [
        'id',
        'uuid',
        'order_id',
        'customer_id',
        'currency_id',
        'provider',
        'type',
        'status',
        'amount',
        'refunded_amount',
        'gateway_id',
        'gateway_session_id',
        'transaction_id',
        'payment_method_type',
        'failure_code',
        'failure_message',
        'refund_reason',
        'refunded_at',
        'idempotency_key',
        'expires_at',
        'receipt_url',
        'customer_email',
        'customer_ip',
        'metadata',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'provider' => PaymentProvider::class,
            'type' => PaymentType::class,
            'status' => PaymentStatus::class,
            'amount' => 'decimal:2',
            'refunded_amount' => 'decimal:2',
            'refunded_at' => 'datetime',
            'expires_at' => 'datetime',
            'completed_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    protected $hidden = [
        'gateway_id',
    ];

    protected static function booted(): void
    {
        static::creating(function (Payment $payment) {
            if (empty($payment->uuid)) {
                $payment->uuid = Str::uuid()->toString();
            }
        });
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    public function scopeByStatus($query, PaymentStatus $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByType($query, PaymentType $type)
    {
        return $query->where('type', $type);
    }

    public function scopePending($query)
    {
        return $query->where('status', PaymentStatus::Pending);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', PaymentStatus::Completed);
    }

    public function scopeFailed($query)
    {
        return $query->where('status', PaymentStatus::Failed);
    }

    public function scopePayrexx($query)
    {
        return $query->where('provider', PaymentProvider::Payrexx);
    }

    public function scopeBalance($query)
    {
        return $query->where('provider', PaymentProvider::Balance);
    }

    public function scopeByProvider($query, PaymentProvider $provider)
    {
        return $query->where('provider', $provider);
    }

    public function isSuccessful(): bool
    {
        return $this->status->isSuccessful();
    }

    public function isExpired(): bool
    {
        if ($this->expires_at === null) {
            return false;
        }
        return $this->expires_at->isPast();
    }

    public function canRefund(): bool
    {
        return $this->status->canRefund();
    }

    public function getRemainingRefundableAttribute(): float
    {
        return max(0, $this->amount - ($this->refunded_amount ?? 0));
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
