<?php

namespace App\Events\Payment;

use App\Enums\PaymentStatus;
use App\Events\Order\OrderPaymentCompleted;
use App\Models\Payment;
use App\States\PaymentState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class PaymentSucceeded extends Event
{
    #[StateId(PaymentState::class)]
    public int $payment_id;

    public function __construct(
        int $payment_id,
        public ?string $transaction_id = null,
        public ?float $confirmed_amount = null,
        public ?string $gateway_status = null,
        public array $metadata = [],
    ) {
        $this->payment_id = $payment_id;
    }

    public function validate(PaymentState $state): void
    {
        $this->assert(
            $state->status === PaymentStatus::Pending || $state->status === PaymentStatus::Processing,
            "Payment cannot succeed from status: {$state->status->value}"
        );
    }

    public function apply(PaymentState $state): void
    {
        $state->status = PaymentStatus::Completed;
        $state->completed_at = now();

        if ($this->transaction_id) {
            $state->transaction_id = $this->transaction_id;
        }

        if ($this->metadata) {
            $state->metadata = array_merge($state->metadata, $this->metadata);
        }
    }

    public function handle(PaymentState $state): void
    {
        Payment::where('id', $this->payment_id)->update([
            'status' => PaymentStatus::Completed,
            'transaction_id' => $state->transaction_id,
            'completed_at' => now(),
            'metadata' => $state->metadata,
        ]);

        // Trigger order payment completed
        if ($state->order_id) {
            OrderPaymentCompleted::fire(
                order_id: $state->order_id,
                payment_id: $this->payment_id,
            );
        }
    }
}
