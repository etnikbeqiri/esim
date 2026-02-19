<?php

namespace App\Http\Controllers\Api\Webhooks;

use App\Events\Payment\PaymentFailed;
use App\Events\Payment\PaymentSucceeded;
use App\Events\Payment\WebhookReceived;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\Payment\PaymentGatewayFactory;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class PayseraWebhookController extends Controller
{
    public function __construct(
        private PaymentGatewayFactory $gatewayFactory,
    ) {}

    public function handle(Request $request): Response
    {
        $payload = $request->all();

        Log::info('Paysera webhook received', ['payload' => $payload]);

        $gateway = $this->gatewayFactory->make(\App\Enums\PaymentProvider::Paysera);
        $parsed = $gateway->handleWebhook($payload);

        $eventType = $parsed['event'];
        $referenceId = $parsed['payment_id'];
        $status = $parsed['status'];
        $data = $parsed['data'];

        if (!$referenceId) {
            Log::warning('Paysera webhook missing order ID', ['payload' => $payload]);
            return response('OK');
        }

        $order = Order::where('uuid', $referenceId)->first();

        if (!$order) {
            Log::warning('Paysera webhook: Order not found', ['reference_id' => $referenceId]);
            return response('OK');
        }

        $payment = Payment::where('order_id', $order->id)->latest()->first();

        if (!$payment) {
            Log::warning('Paysera webhook: Payment not found', [
                'order_id' => $order->id,
                'order_uuid' => $referenceId,
            ]);
            return response('OK');
        }

        WebhookReceived::fire(
            payment_id: $payment->id,
            event_type: $eventType,
            gateway_status: $status,
            payload: $payload,
        );

        match ($eventType) {
            'payment.success' => $this->handleSuccess($payment, $data, $status),
            'payment.failed' => $this->handleFailed($payment, $status),
            'payment.cancelled' => $this->handleCancelled($payment),
            'payment.pending' => $this->handlePending($payment, $status),
            default => null,
        };

        return response('OK');
    }

    private function handleSuccess(Payment $payment, array $data, ?string $status): void
    {
        if ($payment->isSuccessful()) {
            Log::info('Payment already successful, skipping', ['payment_id' => $payment->id]);
            return;
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
    }

    private function handleFailed(Payment $payment, ?string $status): void
    {
        if ($payment->status->isTerminal()) {
            Log::info('Payment already terminal, skipping', ['payment_id' => $payment->id]);
            return;
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
    }

    private function handleCancelled(Payment $payment): void
    {
        if ($payment->status->isTerminal()) {
            return;
        }

        $payment->update(['status' => \App\Enums\PaymentStatus::Cancelled]);

        Log::info('Paysera payment cancelled via webhook', ['payment_id' => $payment->id]);
    }

    private function handlePending(Payment $payment, ?string $status): void
    {
        Log::info('Paysera payment pending', [
            'payment_id' => $payment->id,
            'status' => $status,
        ]);
    }
}
