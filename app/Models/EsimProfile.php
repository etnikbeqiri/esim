<?php

namespace App\Models;

use App\Enums\EsimProfileStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EsimProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'iccid',
        'activation_code',
        'smdp_address',
        'qr_code_data',
        'lpa_string',
        'pin',
        'puk',
        'apn',
        'status',
        'data_used_bytes',
        'data_total_bytes',
        'is_activated',
        'topup_available',
        'activated_at',
        'expires_at',
        'last_usage_check_at',
        'provider_data',
    ];

    protected function casts(): array
    {
        return [
            'status' => EsimProfileStatus::class,
            'data_used_bytes' => 'integer',
            'data_total_bytes' => 'integer',
            'is_activated' => 'boolean',
            'topup_available' => 'boolean',
            'activated_at' => 'datetime',
            'expires_at' => 'datetime',
            'last_usage_check_at' => 'datetime',
            'provider_data' => 'array',
        ];
    }

    protected $hidden = [
        'pin',
        'puk',
        'provider_data',
        'last_usage_check_at',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', EsimProfileStatus::Active);
    }

    public function scopeActivated($query)
    {
        return $query->where('status', EsimProfileStatus::Activated);
    }

    public function scopeUsable($query)
    {
        return $query->whereIn('status', [
            EsimProfileStatus::Active,
            EsimProfileStatus::Activated,
        ]);
    }

    public function scopeExpired($query)
    {
        return $query->where('status', EsimProfileStatus::Expired);
    }

    public function scopeExpiringSoon($query, int $days = 7)
    {
        return $query->usable()
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now()->addDays($days));
    }

    public function getDataUsedMbAttribute(): float
    {
        return round($this->data_used_bytes / (1024 * 1024), 2);
    }

    public function getDataTotalMbAttribute(): float
    {
        return round($this->data_total_bytes / (1024 * 1024), 2);
    }

    public function getDataUsedGbAttribute(): float
    {
        return round($this->data_used_bytes / (1024 * 1024 * 1024), 2);
    }

    public function getDataTotalGbAttribute(): float
    {
        return round($this->data_total_bytes / (1024 * 1024 * 1024), 2);
    }

    public function getDataRemainingBytesAttribute(): int
    {
        return max(0, $this->data_total_bytes - $this->data_used_bytes);
    }

    public function getDataUsagePercentageAttribute(): float
    {
        if ($this->data_total_bytes === 0) {
            return 0;
        }
        return round(($this->data_used_bytes / $this->data_total_bytes) * 100, 2);
    }

    public function isUsable(): bool
    {
        return $this->status->isUsable();
    }

    public function isExpired(): bool
    {
        if ($this->expires_at === null) {
            return false;
        }
        return $this->expires_at->isPast();
    }

    public function isDataConsumed(): bool
    {
        return $this->data_remaining_bytes <= 0;
    }

    public function getLpaStringAttribute(): ?string
    {
        if ($this->attributes['lpa_string'] ?? null) {
            return $this->attributes['lpa_string'];
        }
        if ($this->smdp_address && $this->activation_code) {
            return "LPA:1\${$this->smdp_address}\${$this->activation_code}";
        }
        return null;
    }
}
