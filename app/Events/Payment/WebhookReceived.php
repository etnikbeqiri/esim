<?php

namespace App\Events\Payment;

use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\States\PaymentState;
use Illuminate\Support\Facades\Log;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class WebhookReceived extends Event
{
    #[StateId(PaymentState::class)]
    public int $payment_id;

    public function __construct(
        int $payment_id,
        public string $event_type,
        public ?string $gateway_status = null,
        public array $payload = [],
    ) {
        $this->payment_id = $payment_id;
    }

    public function apply(PaymentState $state): void
    {
        // Log webhook received
        $state->metadata = array_merge($state->metadata, [
            'last_webhook' => [
                'event' => $this->event_type,
                'status' => $this->gateway_status,
                'received_at' => now()->toIso8601String(),
            ],
        ]);
    }

    public function handle(PaymentState $state): void
    {
        Log::info('Payment webhook received', [
            'payment_id' => $this->payment_id,
            'event_type' => $this->event_type,
            'gateway_status' => $this->gateway_status,
        ]);

        // Process based on event type
        match ($this->event_type) {
            'payment.success' => $this->handleSuccess($state),
            'payment.failed' => $this->handleFailure($state),
            'payment.cancelled' => $this->handleCancellation($state),
            'payment.pending' => null, // No action needed
            default => null,
        };
    }

    private function handleSuccess(PaymentState $state): void
    {
        if ($state->status !== PaymentStatus::Completed) {
            PaymentSucceeded::fire(
                payment_id: $this->payment_id,
                transaction_id: $this->payload['data']['gateway_id'] ?? null,
                confirmed_amount: $this->payload['data']['amount'] ?? null,
                gateway_status: $this->gateway_status,
                metadata: ['webhook_payload' => $this->payload],
            );
        }
    }

    private function handleFailure(PaymentState $state): void
    {
        if (!$state->status->isTerminal()) {
            PaymentFailed::fire(
                payment_id: $this->payment_id,
                failure_code: 'gateway_failure',
                failure_message: $this->gateway_status ?? 'Payment failed',
                gateway_status: $this->gateway_status,
            );
        }
    }

    private function handleCancellation(PaymentState $state): void
    {
        if (!$state->status->isTerminal()) {
            Payment::where('id', $this->payment_id)->update([
                'status' => PaymentStatus::Cancelled,
            ]);
        }
    }
}
