<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayContract;
use App\DTOs\Payment\CheckoutResult;
use App\DTOs\Payment\PaymentValidationResult;
use App\Enums\PaymentProvider;
use App\Models\Currency;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcardGateway implements PaymentGatewayContract
{
    private string $merchantId;
    private string $secretKey;
    private string $apiUrl;

    public function __construct()
    {
        $this->merchantId = config('services.procard.merchant_id', '');
        $this->secretKey = config('services.procard.secret_key', '');
        $this->apiUrl = rtrim(config('services.procard.api_url', 'https://pay.procard-ltd.com/api'), '/');
    }

    public function getProvider(): PaymentProvider
    {
        return PaymentProvider::Procard;
    }

    public function createCheckout(
        Order $order,
        string $successUrl,
        string $cancelUrl,
        ?string $failUrl = null,
        string $language = 'en',
    ): CheckoutResult {
        try {
            $currency = $order->currency ?? Currency::getDefault();
            $currencyCode = strtoupper($currency?->code ?? 'EUR');
            $orderId = $order->uuid;
            $amount = round($order->amount, 2);
            $description = $order->package
                ? "eSIM Package: {$order->package->name}"
                : "Order {$order->order_number}";

            $approveUrl = $this->appendParams($successUrl, $orderId, 'success');
            $declineUrl = $this->appendParams($failUrl ?? $cancelUrl, $orderId, 'failed');
            $cancelRedirectUrl = $this->appendParams($cancelUrl, $orderId, 'cancelled');

            $amountStr = $this->formatAmount($amount);

            $signature = $this->generateSignature(
                $this->merchantId,
                $orderId,
                $amountStr,
                $currencyCode,
                $description,
            );

            $payload = [
                'operation' => 'Purchase',
                'merchant_id' => $this->merchantId,
                'order_id' => $orderId,
                'amount' => $amount,
                'currency_iso' => $currencyCode,
                'description' => $description,
                'signature' => $signature,
                'auth_type' => 1,
                'approve_url' => $approveUrl,
                'decline_url' => $declineUrl,
                'cancel_url' => $cancelRedirectUrl,
                'callback_url' => route('webhooks.procard'),
                'redirect' => 0,
                'language' => $this->mapLanguage($language),
                'add_params' => (object) [],
            ];

            if ($order->customer_email) {
                $payload['email'] = $order->customer_email;
            }

            $response = Http::timeout(30)->post($this->apiUrl, $payload);
            $responseData = $response->json();

            if (isset($responseData['result']) && (int) $responseData['result'] === 0 && !empty($responseData['url'])) {
                Log::info('Procard checkout created', [
                    'order_uuid' => $orderId,
                    'amount' => $amount,
                    'currency' => $currencyCode,
                ]);

                return CheckoutResult::success(
                    provider: PaymentProvider::Procard,
                    checkoutUrl: $responseData['url'],
                    gatewayId: $orderId,
                    referenceId: $orderId,
                    amount: $order->amount,
                    currencyId: $currency?->id,
                    metadata: ['procard_order_id' => $orderId],
                );
            }

            Log::error('Procard checkout failed', [
                'order_uuid' => $orderId,
                'error_code' => $responseData['code'] ?? null,
                'error_message' => $responseData['message'] ?? null,
            ]);

            return CheckoutResult::failed(
                provider: PaymentProvider::Procard,
                errorMessage: 'Unable to process payment. Please try again.',
                amount: $order->amount,
            );
        } catch (\Exception $e) {
            Log::error('Procard checkout exception', [
                'order_uuid' => $order->uuid,
                'error' => $e->getMessage(),
            ]);

            return CheckoutResult::failed(
                provider: PaymentProvider::Procard,
                errorMessage: 'Unable to process payment. Please try again.',
                amount: $order->amount,
            );
        }
    }

    public function validatePayment(Payment $payment): PaymentValidationResult
    {
        try {
            $orderId = $payment->gateway_id ?? $payment->order?->uuid;

            if (!$orderId) {
                return PaymentValidationResult::failed('Missing order reference for validation');
            }

            $signature = $this->generateSignature($this->merchantId, $orderId);

            $response = Http::timeout(30)->post($this->apiUrl . '/check', [
                'merchant_id' => $this->merchantId,
                'order_id' => $orderId,
                'signature' => $signature,
            ]);

            $data = $response->json();

            if (!isset($data['code']) || (int) $data['code'] !== 0) {
                return PaymentValidationResult::failed(
                    errorMessage: $data['message'] ?? 'Validation request failed',
                );
            }

            $status = $data['transactionStatus'] ?? null;

            return match ($status) {
                'APPROVED' => PaymentValidationResult::confirmed(
                    transactionId: (string) ($data['transactionId'] ?? ''),
                    amount: isset($data['amount']) ? (float) $data['amount'] : null,
                    gatewayStatus: $status,
                    metadata: array_filter([
                        'card_pan' => $data['cardPan'] ?? null,
                        'card_type' => $data['cardType'] ?? null,
                        'rrn' => $data['rrn'] ?? null,
                        'pc_transaction_id' => $data['pcTransactionID'] ?? null,
                        'pc_approval_code' => $data['pcApprovalCode'] ?? null,
                    ]),
                ),
                'DECLINED' => PaymentValidationResult::failed(
                    errorMessage: $data['reason'] ?? 'Payment declined',
                    gatewayStatus: $status,
                ),
                'NEEDS-CLARIFICATION' => PaymentValidationResult::pending(
                    gatewayStatus: $status,
                ),
                default => PaymentValidationResult::pending(gatewayStatus: $status),
            };
        } catch (\Exception $e) {
            Log::error('Procard payment validation failed', [
                'payment_uuid' => $payment->uuid,
                'error' => $e->getMessage(),
            ]);

            return PaymentValidationResult::failed($e->getMessage());
        }
    }

    public function refund(Payment $payment, float $amount, ?string $reason = null): bool
    {
        try {
            $orderId = $payment->gateway_id ?? $payment->order?->uuid;

            if (!$orderId) {
                Log::error('Procard refund failed: missing order reference', ['payment_uuid' => $payment->uuid]);
                return false;
            }

            $signature = $this->generateSignature($this->merchantId, $orderId);

            $response = Http::timeout(30)->post($this->apiUrl . '/reverse', [
                'merchant_id' => $this->merchantId,
                'order_id' => $orderId,
                'signature' => $signature,
            ]);

            $data = $response->json();

            if (isset($data['code']) && (int) $data['code'] === 1) {
                Log::info('Procard refund successful', [
                    'payment_uuid' => $payment->uuid,
                    'order_id' => $orderId,
                ]);
                return true;
            }

            Log::warning('Procard refund failed', [
                'payment_uuid' => $payment->uuid,
                'response' => $data,
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('Procard refund exception', [
                'payment_uuid' => $payment->uuid,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function handleWebhook(array $payload, ?string $signature = null): array
    {
        if (!$this->verifyCallbackSignature($payload)) {
            Log::warning('Procard webhook signature verification failed');
            return [
                'event' => 'payment.unknown',
                'payment_id' => null,
                'status' => null,
                'data' => [],
            ];
        }

        $transactionStatus = $payload['transactionStatus'] ?? null;

        $eventType = match ($transactionStatus) {
            'Approved' => 'payment.success',
            'Declined' => 'payment.failed',
            'NEEDS-CLARIFICATION' => 'payment.pending',
            default => 'payment.unknown',
        };

        return [
            'event' => $eventType,
            'payment_id' => $payload['orderReference'] ?? null,
            'status' => $transactionStatus,
            'data' => [
                'gateway_id' => (string) ($payload['transactionId'] ?? ''),
                'amount' => isset($payload['amount']) ? (float) $payload['amount'] : null,
                'currency' => $payload['currency'] ?? null,
                'card_pan' => $payload['cardPan'] ?? null,
                'card_type' => $payload['cardType'] ?? null,
                'fee' => isset($payload['fee']) ? (float) $payload['fee'] : null,
                'reason' => $payload['reason'] ?? null,
                'reason_code' => $payload['reasonCode'] ?? null,
                'rec_token' => $payload['recToken'] ?? null,
                'pc_transaction_id' => $payload['pcTransactionID'] ?? null,
                'pc_approval_code' => $payload['pcApprovalCode'] ?? null,
                'created_date' => $payload['createdDate'] ?? null,
            ],
        ];
    }

    public function canHandleCallback(Request $request): bool
    {
        return $request->has('payment_id')
            && $request->has('status')
            && !$request->has('data')
            && !$request->has('ss1');
    }

    public function handleCallback(Request $request): ?array
    {
        $paymentId = $request->query('payment_id');
        $status = $request->query('status');

        if (!$paymentId || !$status) {
            return null;
        }

        return [
            'order_id' => $paymentId,
            'status' => $status,
        ];
    }

    private function generateSignature(string ...$params): string
    {
        return hash_hmac('sha512', implode(';', $params), $this->secretKey);
    }

    private function verifyCallbackSignature(array $payload): bool
    {
        $providedSignature = $payload['merchantSignature'] ?? null;

        if (!$providedSignature) {
            return false;
        }

        $expectedSignature = $this->generateSignature(
            $payload['merchantAccount'] ?? $this->merchantId,
            $payload['orderReference'] ?? '',
            (string) ($payload['amount'] ?? ''),
            $payload['currency'] ?? '',
        );

        return hash_equals($expectedSignature, $providedSignature);
    }

    /**
     * Format amount for signature consistency.
     * Ensures the string representation used in signature matches what Procard processes.
     */
    private function formatAmount(float $amount): string
    {
        return $amount == (int) $amount
            ? (string) (int) $amount
            : rtrim(rtrim(number_format($amount, 2, '.', ''), '0'), '.');
    }

    private function mapLanguage(string $language): string
    {
        return match (strtolower($language)) {
            'ua', 'uk' => 'ua',
            'ru' => 'ru',
            default => 'en',
        };
    }

    private function appendParams(string $url, string $uuid, string $status): string
    {
        $separator = str_contains($url, '?') ? '&' : '?';

        return "{$url}{$separator}payment_id={$uuid}&status={$status}";
    }
}
