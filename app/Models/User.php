<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class);
    }

    public function isB2B(): bool
    {
        return $this->customer?->isB2B() ?? false;
    }

    public function isB2C(): bool
    {
        return $this->customer?->isB2C() ?? true;
    }

    /**
     * Check if the user is an admin.
     * Admin users are identified by having id=1 or email containing 'admin'.
     * In production, use proper role management.
     */
    public function isAdmin(): bool
    {
        return $this->id === 1 || str_contains($this->email, 'admin');
    }
}
