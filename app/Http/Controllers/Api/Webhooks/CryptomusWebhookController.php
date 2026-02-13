<?php

namespace App\Http\Controllers\Api\Webhooks;

use App\Enums\PaymentProvider;
use App\Events\Payment\PaymentFailed;
use App\Events\Payment\PaymentSucceeded;
use App\Events\Payment\WebhookReceived;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\Payment\PaymentGatewayFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CryptomusWebhookController extends Controller
{
    public function __construct(
        private PaymentGatewayFactory $gatewayFactory,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        Log::info('Cryptomus webhook received', ['payload' => $payload]);

        $gateway = $this->gatewayFactory->make(PaymentProvider::Cryptomus);
        $parsed = $gateway->handleWebhook($payload);

        $eventType = $parsed['event'];
        $referenceId = $parsed['payment_id'];
        $status = $parsed['status'];
        $data = $parsed['data'];

        if (!$referenceId) {
            return response()->json(['status' => 'error', 'message' => 'missing_order_reference'], 400);
        }

        $order = Order::where('uuid', $referenceId)->first();

        if (!$order) {
            Log::warning('Cryptomus webhook: order not found', ['reference_id' => $referenceId]);
            return response()->json(['status' => 'error', 'message' => 'order_not_found'], 404);
        }

        $payment = Payment::where('order_id', $order->id)->latest()->first();

        if (!$payment) {
            Log::warning('Cryptomus webhook: payment not found', ['order_uuid' => $referenceId]);
            return response()->json(['status' => 'error', 'message' => 'payment_not_found'], 404);
        }

        WebhookReceived::fire(
            payment_id: $payment->id,
            event_type: $eventType,
            gateway_status: $status,
            payload: $payload,
        );

        return match ($eventType) {
            'payment.success' => $this->handleSuccess($payment, $data, $status),
            'payment.failed' => $this->handleFailed($payment, $status),
            'payment.pending' => $this->handlePending($payment),
            default => response()->json(['status' => 'acknowledged']),
        };
    }

    private function handleSuccess(Payment $payment, array $data, ?string $status): JsonResponse
    {
        if ($payment->isSuccessful()) {
            return response()->json(['status' => 'already_processed']);
        }

        PaymentSucceeded::fire(
            payment_id: $payment->id,
            transaction_id: $data['txid'] ?? $data['gateway_id'] ?? null,
            confirmed_amount: $data['amount'] ?? null,
            gateway_status: $status,
            metadata: array_filter([
                'network' => $data['network'] ?? null,
                'currency' => $data['currency'] ?? null,
                'txid' => $data['txid'] ?? null,
                'payment_amount' => $data['payment_amount'] ?? null,
                'payer_currency' => $data['payer_currency'] ?? null,
            ]),
        );

        Log::info('Cryptomus payment succeeded via webhook', [
            'payment_id' => $payment->id,
            'order_id' => $payment->order_id,
            'txid' => $data['txid'] ?? null,
        ]);

        return response()->json(['status' => 'success']);
    }

    private function handleFailed(Payment $payment, ?string $status): JsonResponse
    {
        if ($payment->status->isTerminal()) {
            return response()->json(['status' => 'already_processed']);
        }

        PaymentFailed::fire(
            payment_id: $payment->id,
            failure_code: 'cryptomus_' . ($status ?? 'failed'),
            failure_message: $status ?? 'Crypto payment failed',
            gateway_status: $status,
        );

        Log::info('Cryptomus payment failed via webhook', [
            'payment_id' => $payment->id,
            'status' => $status,
        ]);

        return response()->json(['status' => 'failed']);
    }

    private function handlePending(Payment $payment): JsonResponse
    {
        Log::info('Cryptomus payment pending', ['payment_id' => $payment->id]);

        return response()->json(['status' => 'pending']);
    }
}
