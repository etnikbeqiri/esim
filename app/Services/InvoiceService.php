<?php

namespace App\Services;

use App\Enums\InvoiceStatus;
use App\Enums\InvoiceType;
use App\Models\BalanceTransaction;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    public function __construct(
        private readonly CurrencyService $currencyService,
    ) {}

    /**
     * Create a top-up invoice.
     */
    public function createTopUpInvoice(
        Customer $customer,
        BalanceTransaction $transaction,
        Payment $payment
    ): Invoice {
        return DB::transaction(function () use ($customer, $transaction, $payment) {
            $amount = (float) $transaction->amount;

            $invoice = Invoice::create([
                'customer_id' => $customer->id,
                'balance_transaction_id' => $transaction->id,
                'payment_id' => $payment->id,
                'type' => InvoiceType::TopUp,
                'status' => InvoiceStatus::Paid,
                'invoice_date' => now(),
                'issued_at' => now(),
                'paid_at' => now(),
                'seller_details' => $this->getSellerDetails(),
                'buyer_details' => $this->getBuyerDetails($customer),
                'subtotal' => $amount,
                'vat_rate' => $this->getVatRate($customer),
                'vat_amount' => $this->calculateVat($amount, $customer),
                'total' => $amount,
                'currency_id' => $this->currencyService->getDefaultCurrency()?->id,
                'balance_before' => $transaction->balance_before,
                'balance_after' => $transaction->balance_after,
                'payment_method' => $payment->provider->label(),
                'payment_reference' => $payment->transaction_id ?? $payment->gateway_id ?? $payment->uuid,
                'line_items' => [
                    [
                        'description' => 'Account Balance Top-Up',
                        'quantity' => 1,
                        'unit_price' => $amount,
                        'total' => $amount,
                    ],
                ],
            ]);

            return $invoice;
        });
    }

    /**
     * Create a purchase invoice.
     */
    public function createPurchaseInvoice(
        Customer $customer,
        Order $order,
        ?Payment $payment = null
    ): Invoice {
        return DB::transaction(function () use ($customer, $order, $payment) {
            $package = $order->package;
            $amount = (float) $order->amount;

            $invoice = Invoice::create([
                'customer_id' => $customer->id,
                'order_id' => $order->id,
                'payment_id' => $payment?->id,
                'type' => InvoiceType::Purchase,
                'status' => InvoiceStatus::Paid,
                'invoice_date' => now(),
                'issued_at' => now(),
                'paid_at' => $order->paid_at ?? now(),
                'seller_details' => $this->getSellerDetails(),
                'buyer_details' => $this->getBuyerDetails($customer),
                'subtotal' => $amount,
                'vat_rate' => $this->getVatRate($customer),
                'vat_amount' => $this->calculateVat($amount, $customer),
                'total' => $amount,
                'currency_id' => $this->currencyService->getDefaultCurrency()?->id,
                'payment_method' => $order->isB2B() ? 'Account Balance' : ($payment?->provider?->label() ?? 'N/A'),
                'payment_reference' => $order->order_number,
                'line_items' => [
                    [
                        'description' => $package?->name ?? 'eSIM Package',
                        'details' => $package ? sprintf(
                            '%s - %s | %s',
                            $package->country?->name ?? 'Global',
                            $package->data_label ?? '',
                            $package->validity_label ?? ''
                        ) : null,
                        'quantity' => 1,
                        'unit_price' => $amount,
                        'total' => $amount,
                    ],
                ],
            ]);

            return $invoice;
        });
    }

    /**
     * Generate account statement for a date range.
     */
    public function generateAccountStatement(
        Customer $customer,
        \DateTime $startDate,
        \DateTime $endDate
    ): Invoice {
        return DB::transaction(function () use ($customer, $startDate, $endDate) {
            $transactions = BalanceTransaction::where('customer_id', $customer->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->orderBy('created_at')
                ->get();

            $lineItems = $transactions->map(fn ($tx) => [
                'date' => $tx->created_at->format('Y-m-d'),
                'description' => $tx->description ?? $tx->type->label(),
                'type' => $tx->type->value,
                'debit' => $tx->isDebit() ? (float) $tx->amount : null,
                'credit' => $tx->isCredit() ? (float) $tx->amount : null,
                'balance' => (float) $tx->balance_after,
            ])->toArray();

            $totalCredits = $transactions->filter->isCredit()->sum('amount');
            $totalDebits = $transactions->filter->isDebit()->sum('amount');
            $openingBalance = $transactions->first()?->balance_before ?? 0;
            $closingBalance = $transactions->last()?->balance_after ?? ($customer->balance?->balance ?? 0);

            return Invoice::create([
                'customer_id' => $customer->id,
                'type' => InvoiceType::Statement,
                'status' => InvoiceStatus::Issued,
                'invoice_date' => now(),
                'issued_at' => now(),
                'seller_details' => $this->getSellerDetails(),
                'buyer_details' => $this->getBuyerDetails($customer),
                'subtotal' => $totalCredits - $totalDebits,
                'vat_rate' => 0,
                'vat_amount' => 0,
                'total' => (float) $closingBalance,
                'currency_id' => $this->currencyService->getDefaultCurrency()?->id,
                'balance_before' => (float) $openingBalance,
                'balance_after' => (float) $closingBalance,
                'line_items' => $lineItems,
                'notes' => sprintf(
                    'Statement period: %s to %s',
                    $startDate->format('M j, Y'),
                    $endDate->format('M j, Y')
                ),
                'metadata' => [
                    'statement_start' => $startDate->format('Y-m-d'),
                    'statement_end' => $endDate->format('Y-m-d'),
                    'total_credits' => (float) $totalCredits,
                    'total_debits' => (float) $totalDebits,
                    'transaction_count' => $transactions->count(),
                ],
            ]);
        });
    }

    /**
     * Get invoices for a customer.
     */
    public function getCustomerInvoices(Customer $customer, int $perPage = 15): LengthAwarePaginator
    {
        return Invoice::where('customer_id', $customer->id)
            ->visible()
            ->orderByDesc('invoice_date')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /**
     * Transform invoices for frontend response.
     */
    public function transformInvoices(LengthAwarePaginator $invoices): LengthAwarePaginator
    {
        return $invoices->through(fn ($invoice) => [
            'uuid' => $invoice->uuid,
            'invoice_number' => $invoice->invoice_number,
            'type' => $invoice->type->value,
            'type_label' => $invoice->type->shortLabel(),
            'status' => $invoice->status->value,
            'status_label' => $invoice->status->label(),
            'status_color' => $invoice->status->color(),
            'invoice_date' => $invoice->invoice_date->format('M j, Y'),
            'total' => (float) $invoice->total,
            'currency_code' => $invoice->currency?->code ?? 'EUR',
            'formatted_total' => $invoice->formatted_total,
        ]);
    }

    /**
     * Generate PDF for an invoice.
     */
    public function generatePdf(Invoice $invoice): string
    {
        $currency = $this->currencyService->getDefaultCurrency();

        $pdf = Pdf::loadView('invoices.pdf', [
            'invoice' => $invoice,
            'currency' => $currency,
            'seller' => $invoice->seller_details,
            'buyer' => $invoice->buyer_details,
        ]);

        $pdf->setPaper(
            config('invoice.pdf.paper', 'a4'),
            config('invoice.pdf.orientation', 'portrait')
        );

        return $pdf->output();
    }

    /**
     * Get HTML view data for an invoice.
     */
    public function getViewData(Invoice $invoice): array
    {
        $currency = $this->currencyService->getDefaultCurrency();

        return [
            'invoice' => [
                'uuid' => $invoice->uuid,
                'invoice_number' => $invoice->invoice_number,
                'type' => $invoice->type->value,
                'type_label' => $invoice->type->label(),
                'status' => $invoice->status->value,
                'status_label' => $invoice->status->label(),
                'status_color' => $invoice->status->color(),
                'invoice_date' => $invoice->invoice_date->format('F j, Y'),
                'due_date' => $invoice->due_date?->format('F j, Y'),
                'issued_at' => $invoice->issued_at?->format('F j, Y H:i'),
                'paid_at' => $invoice->paid_at?->format('F j, Y H:i'),
                'subtotal' => (float) $invoice->subtotal,
                'vat_rate' => (float) $invoice->vat_rate,
                'vat_amount' => (float) $invoice->vat_amount,
                'total' => (float) $invoice->total,
                'currency_code' => $invoice->currency?->code ?? 'EUR',
                'balance_before' => $invoice->balance_before ? (float) $invoice->balance_before : null,
                'balance_after' => $invoice->balance_after ? (float) $invoice->balance_after : null,
                'payment_method' => $invoice->payment_method,
                'payment_reference' => $invoice->payment_reference,
                'line_items' => $invoice->line_items,
                'notes' => $invoice->notes,
                'is_top_up' => $invoice->isTopUp(),
                'is_purchase' => $invoice->isPurchase(),
                'is_statement' => $invoice->isStatement(),
            ],
            'seller' => $invoice->seller_details,
            'buyer' => $invoice->buyer_details,
            'currency' => [
                'code' => $currency->code,
                'symbol' => $currency->symbol,
            ],
        ];
    }

    /**
     * Get seller details from config.
     */
    public function getSellerDetails(): array
    {
        return [
            'company_name' => config('invoice.seller.company_name', config('app.name')),
            'address' => config('invoice.seller.address', ''),
            'city' => config('invoice.seller.city', ''),
            'postal_code' => config('invoice.seller.postal_code', ''),
            'country' => config('invoice.seller.country', ''),
            'vat_number' => config('invoice.seller.vat_number', ''),
            'registration_number' => config('invoice.seller.registration_number', ''),
            'email' => config('invoice.seller.email', config('contact.support_email')),
            'phone' => config('invoice.seller.phone', config('contact.phone')),
            'bank_name' => config('invoice.seller.bank_name', ''),
            'bank_iban' => config('invoice.seller.bank_iban', ''),
            'bank_swift' => config('invoice.seller.bank_swift', ''),
        ];
    }

    /**
     * Get buyer details from customer.
     */
    public function getBuyerDetails(Customer $customer): array
    {
        return [
            'company_name' => $customer->company_name ?? $customer->user?->name,
            'contact_name' => $customer->user?->name,
            'email' => $customer->user?->email,
            'address' => $customer->address ?? '',
            'vat_number' => $customer->vat_number ?? '',
            'phone' => $customer->phone ?? '',
        ];
    }

    /**
     * Get VAT rate for customer.
     */
    protected function getVatRate(Customer $customer): float
    {
        // B2B customers with valid VAT numbers may be exempt
        if ($customer->vat_number && $this->isValidEuVat($customer->vat_number)) {
            return 0.00;
        }

        return (float) config('invoice.default_vat_rate', 0.00);
    }

    /**
     * Calculate VAT amount.
     */
    protected function calculateVat(float $amount, Customer $customer): float
    {
        $rate = $this->getVatRate($customer);

        return round($amount * ($rate / 100), 2);
    }

    /**
     * Check if VAT number is valid EU VAT format.
     */
    protected function isValidEuVat(?string $vatNumber): bool
    {
        if (empty($vatNumber)) {
            return false;
        }

        // Simplified check - in production, consider using VIES API
        return (bool) preg_match('/^[A-Z]{2}[A-Z0-9]+$/', strtoupper($vatNumber));
    }

    /**
     * Check if a non-voided invoice already exists for a top-up transaction.
     */
    public function hasTopUpInvoice(BalanceTransaction $transaction): bool
    {
        return Invoice::where('balance_transaction_id', $transaction->id)
            ->where('type', InvoiceType::TopUp)
            ->where('status', '!=', InvoiceStatus::Voided)
            ->exists();
    }

    /**
     * Check if a non-voided invoice already exists for an order.
     */
    public function hasOrderInvoice(Order $order): bool
    {
        return Invoice::where('order_id', $order->id)
            ->where('type', InvoiceType::Purchase)
            ->where('status', '!=', InvoiceStatus::Voided)
            ->exists();
    }
}
