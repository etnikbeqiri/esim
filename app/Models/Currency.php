<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'symbol',
        'exchange_rate_to_eur',
        'is_default',
        'is_active',
        'rate_updated_at',
    ];

    protected $casts = [
        'exchange_rate_to_eur' => 'decimal:6',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'rate_updated_at' => 'datetime',
    ];

    public function packages(): HasMany
    {
        return $this->hasMany(Package::class, 'source_currency_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public static function getDefault(): ?self
    {
        return static::where('is_default', true)->first();
    }

    public static function findByCode(string $code): ?self
    {
        return static::where('code', strtoupper($code))->first();
    }

    public function convertToEur(float $amount): float
    {
        return round($amount * $this->exchange_rate_to_eur, 2);
    }

    public function convertFromEur(float $amountEur): float
    {
        if ($this->exchange_rate_to_eur == 0) {
            return 0;
        }
        return round($amountEur / $this->exchange_rate_to_eur, 2);
    }
}
