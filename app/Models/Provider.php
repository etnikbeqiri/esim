<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provider extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'api_base_url',
        'is_active',
        'rate_limit_ms',
        'markup_percentage',
        'config',
        'description',
        'last_synced_at',
        'custom_regions',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'rate_limit_ms' => 'integer',
            'markup_percentage' => 'decimal:2',
            'config' => 'array',
            'custom_regions' => 'array',
            'last_synced_at' => 'datetime',
        ];
    }

    /**
     * Get custom region codes for this provider.
     * Format: ["EU" => "European Union", "ASIA" => "Asia Pacific"]
     */
    public function getCustomRegionCodes(): array
    {
        return $this->custom_regions ?? [];
    }

    public function packages(): HasMany
    {
        return $this->hasMany(Package::class);
    }

    public function syncJobs(): HasMany
    {
        return $this->hasMany(SyncJob::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getApiKey(): ?string
    {
        $envKey = strtoupper($this->slug) . '_API_KEY';
        return config("services.providers.{$this->slug}.api_key") ?? env($envKey);
    }

    public function calculateRetailPrice(float $costPrice): float
    {
        return round($costPrice * (1 + $this->markup_percentage / 100), 2);
    }
}
