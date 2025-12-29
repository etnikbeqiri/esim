<?php

namespace App\Models;

use App\Enums\InvoiceStatus;
use App\Enums\InvoiceType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'invoice_number',
        'customer_id',
        'order_id',
        'balance_transaction_id',
        'payment_id',
        'type',
        'status',
        'invoice_date',
        'due_date',
        'issued_at',
        'paid_at',
        'seller_details',
        'buyer_details',
        'subtotal',
        'vat_rate',
        'vat_amount',
        'total',
        'currency_id',
        'balance_before',
        'balance_after',
        'payment_method',
        'payment_reference',
        'line_items',
        'notes',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'type' => InvoiceType::class,
            'status' => InvoiceStatus::class,
            'invoice_date' => 'date',
            'due_date' => 'date',
            'issued_at' => 'datetime',
            'paid_at' => 'datetime',
            'seller_details' => 'array',
            'buyer_details' => 'array',
            'line_items' => 'array',
            'metadata' => 'array',
            'subtotal' => 'decimal:2',
            'vat_rate' => 'decimal:2',
            'vat_amount' => 'decimal:2',
            'total' => 'decimal:2',
            'balance_before' => 'decimal:2',
            'balance_after' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Invoice $invoice) {
            if (empty($invoice->uuid)) {
                $invoice->uuid = Str::uuid()->toString();
            }
            if (empty($invoice->invoice_number)) {
                $invoice->invoice_number = self::generateInvoiceNumber($invoice->type);
            }
        });
    }

    public static function generateInvoiceNumber(InvoiceType $type): string
    {
        return DB::transaction(function () use ($type) {
            $year = now()->year;
            $prefix = $type->prefix();

            $sequence = DB::table('invoice_sequences')
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            if (! $sequence) {
                DB::table('invoice_sequences')->insert([
                    'year' => $year,
                    'last_number' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $number = 1;
            } else {
                $number = $sequence->last_number + 1;
                DB::table('invoice_sequences')
                    ->where('year', $year)
                    ->update(['last_number' => $number, 'updated_at' => now()]);
            }

            return sprintf('%s-%d-%05d', $prefix, $year, $number);
        });
    }

    // Relationships
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function balanceTransaction(): BelongsTo
    {
        return $this->belongsTo(BalanceTransaction::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    // Scopes
    public function scopeForCustomer($query, int $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeByType($query, InvoiceType $type)
    {
        return $query->where('type', $type);
    }

    public function scopeIssued($query)
    {
        return $query->where('status', InvoiceStatus::Issued);
    }

    public function scopePaid($query)
    {
        return $query->where('status', InvoiceStatus::Paid);
    }

    public function scopeVisible($query)
    {
        return $query->whereIn('status', [InvoiceStatus::Issued, InvoiceStatus::Paid]);
    }

    // Helper methods
    public function isTopUp(): bool
    {
        return $this->type === InvoiceType::TopUp;
    }

    public function isPurchase(): bool
    {
        return $this->type === InvoiceType::Purchase;
    }

    public function isStatement(): bool
    {
        return $this->type === InvoiceType::Statement;
    }

    public function markAsIssued(): void
    {
        $this->update([
            'status' => InvoiceStatus::Issued,
            'issued_at' => now(),
        ]);
    }

    public function markAsPaid(): void
    {
        $this->update([
            'status' => InvoiceStatus::Paid,
            'paid_at' => now(),
        ]);
    }

    public function markAsVoided(): void
    {
        $this->update([
            'status' => InvoiceStatus::Voided,
        ]);
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function getFormattedTotalAttribute(): string
    {
        $symbol = $this->currency?->symbol ?? '€';

        return $symbol.number_format((float) $this->total, 2);
    }
}
