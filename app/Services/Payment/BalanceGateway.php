<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayContract;
use App\DTOs\Payment\CheckoutResult;
use App\DTOs\Payment\PaymentValidationResult;
use App\Enums\BalanceTransactionType;
use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Events\Balance\BalanceDeducted;
use App\Events\Balance\BalanceReserved;
use App\Models\BalanceTransaction;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BalanceGateway implements PaymentGatewayContract
{
    public function getProvider(): PaymentProvider
    {
        return PaymentProvider::Balance;
    }

    public function createCheckout(
        Order $order,
        string $successUrl,
        string $cancelUrl,
        ?string $failUrl = null,
        string $language = 'en',
    ): CheckoutResult {
        $customer = $order->customer;

        if (!$customer) {
            return CheckoutResult::failed(
                provider: PaymentProvider::Balance,
                errorMessage: 'Customer not found',
                amount: $order->amount,
            );
        }

        if (!$customer->isB2B()) {
            return CheckoutResult::failed(
                provider: PaymentProvider::Balance,
                errorMessage: 'Balance payments only available for B2B customers',
                amount: $order->amount,
            );
        }

        $balance = $customer->balance;
        if (!$balance || !$balance->canDeduct($order->amount)) {
            return CheckoutResult::failed(
                provider: PaymentProvider::Balance,
                errorMessage: 'Insufficient balance',
                amount: $order->amount,
                currencyId: $order->currency_id,
            );
        }

        // Balance payments are instant - no redirect needed
        return CheckoutResult::success(
            provider: PaymentProvider::Balance,
            checkoutUrl: $successUrl, // Redirect directly to success
            gatewayId: 'balance_' . $order->uuid,
            referenceId: $order->uuid,
            amount: $order->amount,
            currencyId: $order->currency_id,
            metadata: [
                'payment_type' => 'balance',
                'customer_id' => $customer->id,
                'available_balance' => $balance->available_balance,
            ],
        );
    }

    /**
     * Process balance payment immediately (reserve and deduct).
     */
    public function processBalancePayment(Order $order): CheckoutResult
    {
        $customer = $order->customer;

        if (!$customer || !$customer->isB2B()) {
            return CheckoutResult::failed(
                provider: PaymentProvider::Balance,
                errorMessage: 'B2B customer required for balance payments',
                amount: $order->amount,
            );
        }

        $balance = $customer->balance;
        if (!$balance || !$balance->canDeduct($order->amount)) {
            return CheckoutResult::failed(
                provider: PaymentProvider::Balance,
                errorMessage: 'Insufficient balance',
                amount: $order->amount,
            );
        }

        try {
            DB::beginTransaction();

            // Reserve balance first
            BalanceReserved::fire(
                customer_id: $customer->id,
                amount: $order->amount,
                order_id: $order->id,
                description: "Order #{$order->order_number}",
            );

            // Then deduct (converts reservation to actual deduction)
            BalanceDeducted::fire(
                customer_id: $customer->id,
                amount: $order->amount,
                order_id: $order->id,
                description: "Purchase: " . ($order->package?->name ?? 'eSIM Package'),
                from_reservation: true,
            );

            DB::commit();

            Log::info('Balance payment processed', [
                'order_uuid' => $order->uuid,
                'customer_id' => $customer->id,
                'amount' => $order->amount,
            ]);

            return CheckoutResult::success(
                provider: PaymentProvider::Balance,
                checkoutUrl: '', // No redirect needed
                gatewayId: 'balance_' . $order->uuid,
                referenceId: $order->uuid,
                amount: $order->amount,
                currencyId: $order->currency_id,
                metadata: [
                    'payment_type' => 'balance',
                    'processed_at' => now()->toIso8601String(),
                ],
            );
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Balance payment failed', [
                'order_uuid' => $order->uuid,
                'error' => $e->getMessage(),
            ]);

            return CheckoutResult::failed(
                provider: PaymentProvider::Balance,
                errorMessage: $e->getMessage(),
                amount: $order->amount,
            );
        }
    }

    public function validatePayment(Payment $payment): PaymentValidationResult
    {
        // For balance payments, check the transaction record
        $transaction = BalanceTransaction::where('order_id', $payment->order_id)
            ->where('type', BalanceTransactionType::Purchase)
            ->first();

        if ($transaction) {
            return PaymentValidationResult::confirmed(
                transactionId: $transaction->uuid,
                amount: $transaction->amount,
                gatewayStatus: 'completed',
                metadata: [
                    'transaction_id' => $transaction->id,
                    'balance_after' => $transaction->balance_after,
                ],
            );
        }

        // Check if there's a reservation waiting
        $reservation = BalanceTransaction::where('order_id', $payment->order_id)
            ->where('type', BalanceTransactionType::Reservation)
            ->first();

        if ($reservation) {
            return PaymentValidationResult::pending(
                gatewayStatus: 'reserved',
            );
        }

        return PaymentValidationResult::failed(
            errorMessage: 'No balance transaction found for this payment',
        );
    }

    public function refund(Payment $payment, float $amount, ?string $reason = null): bool
    {
        $customer = $payment->customer;

        if (!$customer || !$customer->isB2B()) {
            Log::error('Cannot refund - customer not found or not B2B', [
                'payment_uuid' => $payment->uuid,
            ]);
            return false;
        }

        try {
            $balance = $customer->balance;
            $balanceBefore = $balance->balance;

            // Refund by adding balance back
            $balance->increment('balance', $amount);

            // Create refund transaction record
            BalanceTransaction::create([
                'customer_id' => $customer->id,
                'order_id' => $payment->order_id,
                'payment_id' => $payment->id,
                'type' => BalanceTransactionType::Refund,
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $balance->fresh()->balance,
                'description' => $reason ?? 'Payment refund',
            ]);

            Log::info('Balance refund processed', [
                'payment_uuid' => $payment->uuid,
                'amount' => $amount,
                'customer_id' => $customer->id,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Balance refund failed', [
                'payment_uuid' => $payment->uuid,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function handleWebhook(array $payload, ?string $signature = null): array
    {
        // Balance payments don't have webhooks
        return [
            'event' => 'balance.no_webhook',
            'payment_id' => null,
            'status' => null,
            'data' => [],
        ];
    }

    /**
     * Check if customer has sufficient balance for an amount.
     */
    public function checkBalance(Customer $customer, float $amount): bool
    {
        $balance = $customer->balance;
        return $balance && $balance->canDeduct($amount);
    }

    /**
     * Get available balance for a customer.
     */
    public function getAvailableBalance(Customer $customer): float
    {
        return $customer->balance?->available_balance ?? 0.00;
    }
}
