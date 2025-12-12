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

class PayrexxWebhookController extends Controller
{
    public function __construct(
        private PaymentGatewayFactory $gatewayFactory,
    ) {}

    /**
     * Handle Payrexx webhook.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        $signature = $request->header('Payrexx-Signature');

        Log::info('Payrexx webhook received', [
            'payload' => $payload,
            'has_signature' => !empty($signature),
        ]);

        // Parse webhook using gateway
        $gateway = $this->gatewayFactory->default();
        $parsed = $gateway->handleWebhook($payload, $signature);

        $eventType = $parsed['event'];
        $referenceId = $parsed['payment_id']; // This is the order UUID
        $status = $parsed['status'];
        $data = $parsed['data'];

        if (!$referenceId) {
            Log::warning('Payrexx webhook missing reference ID', ['payload' => $payload]);
            return response()->json(['status' => 'ignored', 'reason' => 'missing_reference'], 200);
        }

        // Find order by UUID (reference ID)
        $order = Order::where('uuid', $referenceId)->first();

        if (!$order) {
            Log::warning('Payrexx webhook: Order not found', ['reference_id' => $referenceId]);
            return response()->json(['status' => 'ignored', 'reason' => 'order_not_found'], 200);
        }

        // Find associated payment
        $payment = Payment::where('order_id', $order->id)
            ->where('gateway_id', $data['gateway_id'] ?? null)
            ->orWhere(function ($query) use ($order) {
                $query->where('order_id', $order->id)
                    ->latest();
            })
            ->first();

        if (!$payment) {
            Log::warning('Payrexx webhook: Payment not found', [
                'order_id' => $order->id,
                'gateway_id' => $data['gateway_id'] ?? null,
            ]);
            return response()->json(['status' => 'ignored', 'reason' => 'payment_not_found'], 200);
        }

        // Record webhook received event
        WebhookReceived::fire(
            payment_id: $payment->id,
            event_type: $eventType,
            gateway_status: $status,
            payload: $payload,
        );

        // Process based on event type
        return match ($eventType) {
            'payment.success' => $this->handleSuccess($payment, $data, $status),
            'payment.failed' => $this->handleFailed($payment, $status),
            'payment.cancelled' => $this->handleCancelled($payment),
            'payment.refunded' => $this->handleRefunded($payment, $data),
            default => response()->json(['status' => 'acknowledged', 'event' => $eventType]),
        };
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
            confirmed_amount: $data['amount'] ?? null,
            gateway_status: $status,
            metadata: $data,
        );

        Log::info('Payrexx payment succeeded via webhook', [
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
            failure_code: 'gateway_declined',
            failure_message: $status ?? 'Payment declined',
            gateway_status: $status,
        );

        Log::info('Payrexx payment failed via webhook', [
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

        Log::info('Payrexx payment cancelled via webhook', ['payment_id' => $payment->id]);

        return response()->json(['status' => 'cancelled']);
    }

    private function handleRefunded(Payment $payment, array $data): JsonResponse
    {
        $refundedAmount = $data['amount'] ?? $payment->amount;

        $payment->update([
            'status' => \App\Enums\PaymentStatus::Refunded,
            'refunded_amount' => $refundedAmount,
            'refunded_at' => now(),
        ]);

        Log::info('Payrexx payment refunded via webhook', [
            'payment_id' => $payment->id,
            'amount' => $refundedAmount,
        ]);

        return response()->json(['status' => 'refunded']);
    }
}
