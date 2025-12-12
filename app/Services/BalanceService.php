<?php

namespace App\Services;

use App\DTOs\Payment\CheckoutResult;
use App\Enums\PaymentProvider;
use App\Models\BalanceTransaction;
use App\Models\Customer;
use App\Services\Payment\BalanceTopUpService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class BalanceService
{
    public function __construct(
        private readonly CurrencyService $currencyService,
        private readonly BalanceTopUpService $topUpService,
    ) {}

    /**
     * Get balance summary for a customer.
     */
    public function getBalanceSummary(Customer $customer): array
    {
        return [
            'current' => $customer->balance?->balance ?? 0,
            'reserved' => $customer->balance?->reserved ?? 0,
            'available' => $customer->available_balance,
        ];
    }

    /**
     * Get paginated transactions for a customer.
     */
    public function getTransactions(Customer $customer, int $perPage = 20): LengthAwarePaginator
    {
        return BalanceTransaction::where('customer_id', $customer->id)
            ->with(['order'])
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Transform transactions for API/frontend response.
     */
    public function transformTransactions(LengthAwarePaginator $transactions): LengthAwarePaginator
    {
        return $transactions->through(fn ($tx) => [
            'uuid' => $tx->uuid,
            'type' => $tx->type->value,
            'type_label' => $tx->type->label(),
            'is_credit' => $tx->isCredit(),
            'amount' => $tx->amount,
            'signed_amount' => $tx->signed_amount,
            'balance_before' => $tx->balance_before,
            'balance_after' => $tx->balance_after,
            'description' => $tx->description,
            'order_number' => $tx->order?->order_number,
            'created_at' => $tx->created_at->format('M j, Y H:i'),
        ]);
    }

    /**
     * Get currency data for the balance page.
     */
    public function getCurrencyData(): array
    {
        $currency = $this->currencyService->getDefaultCurrency();

        return [
            'code' => $currency->code,
            'symbol' => $currency->symbol,
        ];
    }

    /**
     * Get active payment providers for top-up.
     */
    public function getPaymentProviders(): array
    {
        return PaymentProvider::activePublicProvidersArray();
    }

    /**
     * Get default payment provider.
     */
    public function getDefaultProvider(): string
    {
        return PaymentProvider::default()->value;
    }

    /**
     * Validate and process a top-up request.
     *
     * @return array{success: bool, result?: CheckoutResult, error?: string}
     */
    public function initiateTopUp(Customer $customer, float $amount, string $providerValue): array
    {
        // Validate amount
        if ($amount < 10 || $amount > 10000) {
            return [
                'success' => false,
                'error' => 'Amount must be between €10 and €10,000.',
            ];
        }

        // Validate payment provider
        $paymentProvider = PaymentProvider::tryFrom($providerValue);

        if (!$paymentProvider) {
            return [
                'success' => false,
                'error' => 'Invalid payment provider.',
            ];
        }

        if (!$paymentProvider->isActive()) {
            return [
                'success' => false,
                'error' => 'Selected payment provider is not available.',
            ];
        }

        // Exclude balance provider for top-ups
        if ($paymentProvider === PaymentProvider::Balance) {
            return [
                'success' => false,
                'error' => 'Cannot use balance to top-up balance.',
            ];
        }

        Log::info('Initiating balance top-up', [
            'customer_id' => $customer->id,
            'amount' => $amount,
            'provider' => $providerValue,
        ]);

        $result = $this->topUpService->createTopUpCheckout(
            customer: $customer,
            amount: $amount,
            paymentProvider: $paymentProvider,
            successUrl: route('client.balance.topup.callback'),
            cancelUrl: route('client.balance.index'),
            failUrl: route('client.balance.index') . '?error=payment_failed',
        );

        if (!$result->success) {
            return [
                'success' => false,
                'error' => $result->errorMessage ?? 'Failed to create top-up checkout.',
            ];
        }

        return [
            'success' => true,
            'result' => $result,
        ];
    }

    /**
     * Process top-up callback and verify payment.
     *
     * @return array{success: bool, message: string, type: string}
     */
    public function processTopUpCallback(?string $paymentId, ?string $status): array
    {
        if (!$paymentId) {
            return [
                'success' => false,
                'message' => 'Invalid payment callback.',
                'type' => 'error',
            ];
        }

        if ($status === 'cancelled') {
            return [
                'success' => false,
                'message' => 'Top-up cancelled.',
                'type' => 'message',
            ];
        }

        $verified = $this->topUpService->verifyTopUpPayment($paymentId);

        if ($status === 'failed' || !$verified) {
            return [
                'success' => false,
                'message' => 'Top-up payment failed or could not be verified.',
                'type' => 'error',
            ];
        }

        return [
            'success' => true,
            'message' => 'Balance topped up successfully!',
            'type' => 'success',
        ];
    }

    /**
     * Check if customer can use balance features.
     */
    public function canAccessBalance(Customer $customer): bool
    {
        return $customer->isB2B();
    }
}
