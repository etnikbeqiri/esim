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
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __construct(
        private PaymentGatewayFactory $gatewayFactory,
    ) {}

    /**
     * Handle Stripe webhook.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');

        Log::info('Stripe webhook received', [
            'has_signature' => !empty($signature),
        ]);

        // Verify signature if webhook secret is configured
        $event = null;
        $webhookSecret = config('services.stripe.webhook_secret');

        if ($webhookSecret && $signature) {
            try {
                $event = Webhook::constructEvent($payload, $signature, $webhookSecret);
            } catch (SignatureVerificationException $e) {
                Log::warning('Stripe webhook signature verification failed', [
                    'error' => $e->getMessage(),
                ]);
                return response()->json(['error' => 'Invalid signature'], 400);
            }
        } else {
            $event = json_decode($payload, true);
        }

        if (!$event) {
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        // Convert Stripe Event object to array if needed
        $eventData = is_array($event) ? $event : $event->toArray();
        $type = $eventData['type'] ?? null;
        $data = $eventData['data']['object'] ?? [];

        Log::info('Stripe webhook event', [
            'type' => $type,
            'session_id' => $data['id'] ?? null,
        ]);

        // Handle checkout.session.completed - main success event
        if ($type === 'checkout.session.completed') {
            return $this->handleCheckoutCompleted($data);
        }

        // Handle checkout.session.expired
        if ($type === 'checkout.session.expired') {
            return $this->handleCheckoutExpired($data);
        }

        return response()->json(['status' => 'acknowledged', 'event' => $type]);
    }

    private function handleCheckoutCompleted(array $data): JsonResponse
    {
        $referenceId = $data['client_reference_id'] ?? $data['metadata']['order_uuid'] ?? null;
        $sessionId = $data['id'] ?? null;

        if (!$referenceId) {
            Log::warning('Stripe webhook missing reference ID', ['data' => $data]);
            return response()->json(['status' => 'ignored', 'reason' => 'missing_reference'], 200);
        }

        // Find order by UUID
        $order = Order::where('uuid', $referenceId)->first();

        if (!$order) {
            Log::warning('Stripe webhook: Order not found', ['reference_id' => $referenceId]);
            return response()->json(['status' => 'ignored', 'reason' => 'order_not_found'], 200);
        }

        // Find payment by gateway_id (session ID)
        $payment = Payment::where('order_id', $order->id)
            ->where(function ($query) use ($sessionId) {
                $query->where('gateway_id', $sessionId)
                    ->orWhereNull('gateway_id');
            })
            ->latest()
            ->first();

        if (!$payment) {
            Log::warning('Stripe webhook: Payment not found', [
                'order_id' => $order->id,
                'session_id' => $sessionId,
            ]);
            return response()->json(['status' => 'ignored', 'reason' => 'payment_not_found'], 200);
        }

        if ($payment->isSuccessful()) {
            Log::info('Payment already successful, skipping', ['payment_id' => $payment->id]);
            return response()->json(['status' => 'already_processed']);
        }

        // Record webhook
        WebhookReceived::fire(
            payment_id: $payment->id,
            event_type: 'checkout.session.completed',
            gateway_status: $data['payment_status'] ?? 'paid',
            payload: $data,
        );

        // Fire success event
        PaymentSucceeded::fire(
            payment_id: $payment->id,
            transaction_id: $data['payment_intent'] ?? $sessionId,
            confirmed_amount: isset($data['amount_total']) ? $data['amount_total'] / 100 : null,
            gateway_status: 'paid',
            metadata: [
                'session_id' => $sessionId,
                'payment_intent' => $data['payment_intent'] ?? null,
            ],
        );

        Log::info('Stripe payment succeeded via webhook', [
            'payment_id' => $payment->id,
            'order_id' => $order->id,
        ]);

        return response()->json(['status' => 'success']);
    }

    private function handleCheckoutExpired(array $data): JsonResponse
    {
        $referenceId = $data['client_reference_id'] ?? $data['metadata']['order_uuid'] ?? null;

        if (!$referenceId) {
            return response()->json(['status' => 'ignored', 'reason' => 'missing_reference'], 200);
        }

        $order = Order::where('uuid', $referenceId)->first();

        if (!$order) {
            return response()->json(['status' => 'ignored', 'reason' => 'order_not_found'], 200);
        }

        $payment = Payment::where('order_id', $order->id)->latest()->first();

        if (!$payment || $payment->status->isTerminal()) {
            return response()->json(['status' => 'already_processed']);
        }

        PaymentFailed::fire(
            payment_id: $payment->id,
            failure_code: 'session_expired',
            failure_message: 'Checkout session expired',
            gateway_status: 'expired',
        );

        Log::info('Stripe checkout expired via webhook', ['payment_id' => $payment->id]);

        return response()->json(['status' => 'expired']);
    }
}
