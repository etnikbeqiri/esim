<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $fillable = [
        'id',
        'uuid',
        'order_number',
        'customer_id',
        'package_id',
        'provider_id',
        'type',
        'status',
        'payment_status',
        'amount',
        'cost_price',
        'profit',
        'provider_order_id',
        'retry_count',
        'max_retries',
        'next_retry_at',
        'failure_reason',
        'failure_code',
        'customer_email',
        'customer_name',
        'ip_address',
        'user_agent',
        'paid_at',
        'completed_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'type' => OrderType::class,
            'status' => OrderStatus::class,
            'payment_status' => PaymentStatus::class,
            'amount' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'profit' => 'decimal:2',
            'retry_count' => 'integer',
            'max_retries' => 'integer',
            'next_retry_at' => 'datetime',
            'paid_at' => 'datetime',
            'completed_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (empty($order->uuid)) {
                $order->uuid = Str::uuid()->toString();
            }
            if (empty($order->order_number)) {
                $order->order_number = self::generateOrderNumber();
            }
        });
    }

    public static function generateOrderNumber(): string
    {
        $prefix = 'ORD';
        $timestamp = now()->format('ymd');
        $random = strtoupper(Str::random(6));
        return "{$prefix}-{$timestamp}-{$random}";
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    public function esimProfile(): HasOne
    {
        return $this->hasOne(EsimProfile::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function emailQueue(): HasMany
    {
        return $this->hasMany(EmailQueue::class);
    }

    public function balanceTransactions(): HasMany
    {
        return $this->hasMany(BalanceTransaction::class);
    }

    public function scopeByStatus($query, OrderStatus $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByType($query, OrderType $type)
    {
        return $query->where('type', $type);
    }

    public function scopePending($query)
    {
        return $query->where('status', OrderStatus::Pending);
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', OrderStatus::Processing);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', OrderStatus::Completed);
    }

    public function scopeFailed($query)
    {
        return $query->where('status', OrderStatus::Failed);
    }

    public function scopePendingRetry($query)
    {
        return $query->where('status', OrderStatus::PendingRetry);
    }

    public function scopeReadyForRetry($query)
    {
        return $query->pendingRetry()
            ->where('retry_count', '<', \DB::raw('max_retries'))
            ->where('next_retry_at', '<=', now());
    }

    public function canTransitionTo(OrderStatus $newStatus): bool
    {
        return $this->status->canTransitionTo($newStatus);
    }

    public function canRetry(): bool
    {
        return $this->status->canRetry() && $this->retry_count < $this->max_retries;
    }

    public function isB2B(): bool
    {
        return $this->type === OrderType::B2B;
    }

    public function isB2C(): bool
    {
        return $this->type === OrderType::B2C;
    }

    public function isCompleted(): bool
    {
        return $this->status === OrderStatus::Completed;
    }

    public function isFailed(): bool
    {
        return $this->status === OrderStatus::Failed;
    }

    public function hasEsimProfile(): bool
    {
        return $this->esimProfile !== null;
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
