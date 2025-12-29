<?php

namespace App\Events\Payment;

use App\Enums\PaymentStatus;
use App\Events\Order\OrderFailed;
use App\Models\Order;
use App\Models\Payment;
use App\Services\EmailService;
use App\States\PaymentState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;
use Thunk\Verbs\Facades\Verbs;

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

        // Send payment failed email
        Verbs::unlessReplaying(function () use ($state) {
            if ($state->order_id) {
                $order = Order::with(['customer.user', 'package'])->find($state->order_id);

                if ($order) {
                    $emailService = app(EmailService::class);

                    // Send payment failed email to customer
                    $emailService->sendPaymentFailed($order, $this->failure_message ?? 'Payment was declined');

                    // Send admin notification
                    $emailService->notifyAdminPaymentFailed(
                        $order,
                        $this->failure_code ?? '',
                        $this->failure_message ?? ''
                    );
                }
            }
        });

        // Trigger order failure
        if ($state->order_id) {
            OrderFailed::fire(
                order_id: $state->order_id,
                failure_reason: $this->failure_message ?? 'Payment failed',
                failure_code: $this->failure_code ?? 'payment_failed',
            );
        }
    }
}
