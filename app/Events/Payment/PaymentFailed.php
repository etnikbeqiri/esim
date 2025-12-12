<?php

namespace App\Events\Payment;

use App\Enums\PaymentStatus;
use App\Events\Order\OrderFailed;
use App\Models\Payment;
use App\States\PaymentState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class PaymentFailed extends Event
{
    #[StateId(PaymentState::class)]
    public int $payment_id;

    public function __construct(
        int $payment_id,
        public ?string $failure_code = null,
        public ?string $failure_message = null,
        public ?string $gateway_status = null,
    ) {
        $this->payment_id = $payment_id;
    }

    public function validate(PaymentState $state): void
    {
        $this->assert(
            !$state->status->isTerminal(),
            "Payment has already reached terminal status: {$state->status->value}"
        );
    }

    public function apply(PaymentState $state): void
    {
        $state->status = PaymentStatus::Failed;
        $state->failure_code = $this->failure_code;
        $state->failure_message = $this->failure_message;
    }

    public function handle(PaymentState $state): void
    {
        Payment::where('id', $this->payment_id)->update([
            'status' => PaymentStatus::Failed,
            'failure_code' => $this->failure_code,
            'failure_message' => $this->failure_message,
        ]);

        // Optionally trigger order failure
        if ($state->order_id) {
            OrderFailed::fire(
                order_id: $state->order_id,
                failure_reason: $this->failure_message ?? 'Payment failed',
                failure_code: $this->failure_code ?? 'payment_failed',
            );
        }
    }
}
