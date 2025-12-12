<?php

namespace App\Services\Payment;

use App\DTOs\Payment\CheckoutResult;
use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Events\Balance\BalanceTopUpCompleted;
use App\Models\Customer;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BalanceTopUpService
{
    public function __construct(
        private readonly PaymentGatewayFactory $gatewayFactory,
    ) {}

    public function createTopUpCheckout(
        Customer $customer,
        float $amount,
        PaymentProvider $paymentProvider,
        string $successUrl,
        string $cancelUrl,
        string $failUrl,
    ): CheckoutResult {
        try {
            DB::beginTransaction();

            $paymentUuid = Str::uuid()->toString();
            Payment::create([
                'uuid' => $paymentUuid,
                'customer_id' => $customer->id,
                'provider' => $paymentProvider,
                'type' => PaymentType::TopUp,
                'status' => PaymentStatus::Pending,
                'amount' => $amount,
                'metadata' => [
                    'type' => 'balance_topup',
                    'customer_email' => $customer->user?->email,
                ],
            ]);

            $payment = Payment::where('uuid', $paymentUuid)->firstOrFail();

            $successUrlWithId = $this->appendPaymentId($successUrl, $payment->uuid);
            $cancelUrlWithId = $this->appendPaymentId($cancelUrl, $payment->uuid, 'cancelled');
            $failUrlWithId = $this->appendPaymentId($failUrl, $payment->uuid, 'failed');

            $gateway = $this->gatewayFactory->make($paymentProvider);

            $result = match ($paymentProvider) {
                PaymentProvider::Stripe => $gateway->createBalanceTopUpCheckout(
                    payment: $payment,
                    amount: $amount,
                    successUrl: $successUrlWithId,
                    cancelUrl: $cancelUrlWithId,
                    customerEmail: $customer->user?->email,
                ),
                PaymentProvider::Payrexx => $gateway->createBalanceTopUpCheckout(
                    payment: $payment,
                    amount: $amount,
                    successUrl: $successUrlWithId,
                    cancelUrl: $cancelUrlWithId,
                    failUrl: $failUrlWithId,
                    customerEmail: $customer->user?->email,
                ),
                default => throw new \InvalidArgumentException("Payment provider {$paymentProvider->value} does not support balance top-up."),
            };

            if (!$result->success) {
                DB::rollBack();
                return $result;
            }

            $payment->update([
                'gateway_id' => $result->gatewayId,
                'metadata' => array_merge($payment->metadata ?? [], $result->metadata),
            ]);

            DB::commit();

            Log::info('Balance top-up checkout created', [
                'payment_uuid' => $payment->uuid,
                'customer_id' => $customer->id,
                'amount' => $amount,
                'provider' => $paymentProvider->value,
            ]);

            return $result;

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Balance top-up checkout creation failed', [
                'customer_id' => $customer->id,
                'amount' => $amount,
                'provider' => $paymentProvider->value,
                'error' => $e->getMessage(),
            ]);

            return CheckoutResult::failed(
                provider: $paymentProvider,
                errorMessage: 'Failed to create top-up checkout. Please try again.',
                amount: $amount,
            );
        }
    }

    public function verifyTopUpPayment(string $paymentUuid): bool
    {
        $payment = Payment::where('uuid', $paymentUuid)->first();

        if (!$payment) {
            Log::warning('Top-up payment not found', ['payment_uuid' => $paymentUuid]);
            return false;
        }

        if ($payment->status === PaymentStatus::Completed) {
            return true;
        }

        $metadata = $payment->metadata ?? [];
        if (($metadata['type'] ?? '') !== 'balance_topup') {
            Log::warning('Payment is not a balance top-up', ['payment_uuid' => $paymentUuid]);
            return false;
        }

        try {
            $gateway = $this->gatewayFactory->make($payment->provider);
            $validationResult = $gateway->validatePayment($payment);

            if (!$validationResult->isCompleted()) {
                Log::info('Top-up payment not yet completed', [
                    'payment_uuid' => $paymentUuid,
                    'gateway_status' => $validationResult->gatewayStatus,
                ]);
                return false;
            }

            DB::beginTransaction();

            $payment->update([
                'status' => PaymentStatus::Completed,
                'metadata' => array_merge(
                    $payment->metadata ?? [],
                    ['validation' => $validationResult->metadata]
                ),
            ]);

            BalanceTopUpCompleted::fire(
                customer_id: $payment->customer_id,
                amount: (float) $payment->amount,
                payment_id: $payment->id,
                description: 'Balance top-up via ' . $payment->provider->label(),
            );

            DB::commit();

            Log::info('Balance top-up completed successfully', [
                'payment_uuid' => $paymentUuid,
                'customer_id' => $payment->customer_id,
                'amount' => $payment->amount,
            ]);

            return true;

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to process top-up payment', [
                'payment_uuid' => $paymentUuid,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    private function appendPaymentId(string $url, string $paymentUuid, ?string $status = null): string
    {
        $separator = str_contains($url, '?') ? '&' : '?';
        $params = "payment_id={$paymentUuid}";

        if ($status) {
            $params .= "&status={$status}";
        }

        return "{$url}{$separator}{$params}";
    }
}
