<?php

namespace App\Http\Controllers\Api\Webhooks;

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

class PayseraWebhookController extends Controller
{
    public function __construct(
        private PaymentGatewayFactory $gatewayFactory,
    ) {}

    /**
     * Handle Paysera webhook callback.
     *
     * Paysera sends a callback when payment status changes.
     * The callback includes parameters: projectid, orderid, amount, currency, status, etc.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        Log::info('Paysera webhook received', [
            'payload' => $payload,
        ]);

        // Parse webhook using gateway
        $gateway = $this->gatewayFactory->make(\App\Enums\PaymentProvider::Paysera);
        $parsed = $gateway->handleWebhook($payload);

        $eventType = $parsed['event'];
        $referenceId = $parsed['payment_id']; // This is the order UUID
        $status = $parsed['status'];
        $data = $parsed['data'];

        if (!$referenceId) {
            Log::warning('Paysera webhook missing order ID', ['payload' => $payload]);
            return response()->json(['status' => 'error', 'message' => 'missing_order_id'], 400);
        }

        // Find order by UUID (reference ID)
        $order = Order::where('uuid', $referenceId)->first();

        if (!$order) {
            Log::warning('Paysera webhook: Order not found', ['reference_id' => $referenceId]);
            return response()->json(['status' => 'error', 'message' => 'order_not_found'], 404);
        }

        // Find associated payment by order_id
        $payment = Payment::where('order_id', $order->id)->latest()->first();

        if (!$payment) {
            Log::warning('Paysera webhook: Payment not found', [
                'order_id' => $order->id,
                'order_uuid' => $referenceId,
            ]);
            return response()->json(['status' => 'error', 'message' => 'payment_not_found'], 404);
        }

        // Record webhook received event
        WebhookReceived::fire(
            payment_id: $payment->id,
            event_type: $eventType,
            gateway_status: $status,
            payload: $payload,
        );

        // Process based on event type
        $response = match ($eventType) {
            'payment.success' => $this->handleSuccess($payment, $data, $status),
            'payment.failed' => $this->handleFailed($payment, $status),
            'payment.cancelled' => $this->handleCancelled($payment),
            'payment.pending' => $this->handlePending($payment, $status),
            default => response()->json(['status' => 'acknowledged', 'event' => $eventType]),
        };

        // Paysera expects a specific response format
        if ($response->status() === 200) {
            return response()->make('OK', 200, ['Content-Type' => 'text/plain']);
        }

        return $response;
    }

    private function handleSuccess(Payment $payment, array $data, ?string $status): JsonResponse
    {
        if ($payment->isSuccessful()) {
            Log::info('Payment already successful, skipping', ['payment_id' => $payment->id]);
            return response()->json(['status' => 'already_processed']);
        }

        PaymentSucceeded::fire(
            payment_id: $payment->id,
            transaction_id: $data['gateway_id'] ?? null,
            confirmed_amount: $data['payamount'] ?? $data['amount'] ?? null,
            gateway_status: $status,
            metadata: $data,
        );

        Log::info('Paysera payment succeeded via webhook', [
            'payment_id' => $payment->id,
            'order_id' => $payment->order_id,
        ]);

        return response()->json(['status' => 'success']);
    }

    private function handleFailed(Payment $payment, ?string $status): JsonResponse
    {
        if ($payment->status->isTerminal()) {
            Log::info('Payment already terminal, skipping', ['payment_id' => $payment->id]);
            return response()->json(['status' => 'already_processed']);
        }

        PaymentFailed::fire(
            payment_id: $payment->id,
            failure_code: 'paysera_declined',
            failure_message: $status ?? 'Payment declined',
            gateway_status: $status,
        );

        Log::info('Paysera payment failed via webhook', [
            'payment_id' => $payment->id,
            'status' => $status,
        ]);

        return response()->json(['status' => 'failed']);
    }

    private function handleCancelled(Payment $payment): JsonResponse
    {
        if ($payment->status->isTerminal()) {
            return response()->json(['status' => 'already_processed']);
        }

        $payment->update(['status' => \App\Enums\PaymentStatus::Cancelled]);

        Log::info('Paysera payment cancelled via webhook', ['payment_id' => $payment->id]);

        return response()->json(['status' => 'cancelled']);
    }

    private function handlePending(Payment $payment, ?string $status): JsonResponse
    {
        Log::info('Paysera payment pending', [
            'payment_id' => $payment->id,
            'status' => $status,
        ]);

        return response()->json(['status' => 'pending']);
    }
}
