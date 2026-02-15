<?php

namespace App\Events\Order;

use App\Enums\OrderStatus;
use App\Jobs\Order\ExpireCheckoutSession;
use App\Models\Order;
use App\States\OrderState;
use Carbon\Carbon;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;
use Thunk\Verbs\Facades\Verbs;

class OrderAwaitingPayment extends Event
{
    #[StateId(OrderState::class)]
    public int $order_id;

    public function __construct(
        int $order_id,
        public int $payment_id,
        public ?int $expiration_minutes = null,
    ) {
        $this->order_id = $order_id;
    }

    public function validate(OrderState $state): void
    {
        $this->assert(
            $state->canTransitionTo(OrderStatus::AwaitingPayment),
            "Order cannot transition to awaiting_payment from status: {$state->status->value}"
        );
    }

    public function apply(OrderState $state): void
    {
        $state->status = OrderStatus::AwaitingPayment;
        $state->payment_id = $this->payment_id;

        // Set expiration time for the checkout session (1 day = 1440 minutes)
        $expirationMinutes = $this->expiration_minutes ?? config('services.payment.checkout_expiration_minutes', 1440);
        $state->checkout_expires_at = Carbon::now()->addMinutes($expirationMinutes);
    }

    public function handle(OrderState $state): void
    {
        Order::where('id', $this->order_id)->update([
            'status' => OrderStatus::AwaitingPayment,
        ]);

        // Schedule automatic expiration of the checkout session
        Verbs::unlessReplaying(function () use ($state) {
            ExpireCheckoutSession::dispatch($this->order_id)
                ->delay($state->checkout_expires_at);
        });
    }
}
