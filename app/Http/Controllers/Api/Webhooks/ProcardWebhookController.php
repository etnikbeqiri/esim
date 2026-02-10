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

class ProcardWebhookController extends Controller
{
    public function __construct(
        private PaymentGatewayFactory $gatewayFactory,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        Log::info('Procard webhook received', ['payload' => $payload]);

        $gateway = $this->gatewayFactory->make(PaymentProvider::Procard);
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
            Log::warning('Procard webhook: order not found', ['reference_id' => $referenceId]);
            return response()->json(['status' => 'error', 'message' => 'order_not_found'], 404);
        }

        $payment = Payment::where('order_id', $order->id)->latest()->first();

        if (!$payment) {
            Log::warning('Procard webhook: payment not found', ['order_uuid' => $referenceId]);
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
            transaction_id: $data['gateway_id'] ?? null,
            confirmed_amount: $data['amount'] ?? null,
            gateway_status: $status,
            metadata: array_filter([
                'card_pan' => $data['card_pan'] ?? null,
                'card_type' => $data['card_type'] ?? null,
                'fee' => $data['fee'] ?? null,
                'reason' => $data['reason'] ?? null,
                'reason_code' => $data['reason_code'] ?? null,
                'pc_transaction_id' => $data['pc_transaction_id'] ?? null,
                'pc_approval_code' => $data['pc_approval_code'] ?? null,
            ]),
        );

        Log::info('Procard payment succeeded via webhook', [
            'payment_id' => $payment->id,
            'order_id' => $payment->order_id,
            'transaction_id' => $data['gateway_id'] ?? null,
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
            failure_code: 'procard_declined',
            failure_message: $status ?? 'Payment declined',
            gateway_status: $status,
        );

        Log::info('Procard payment failed via webhook', [
            'payment_id' => $payment->id,
            'status' => $status,
        ]);

        return response()->json(['status' => 'failed']);
    }

    private function handlePending(Payment $payment): JsonResponse
    {
        Log::info('Procard payment needs clarification', ['payment_id' => $payment->id]);

        return response()->json(['status' => 'pending']);
    }
}
