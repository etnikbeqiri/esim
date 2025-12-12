<?php

namespace App\Events\Order;

use App\Enums\OrderStatus;
use App\Events\Balance\BalanceReservationReleased;
use App\Models\Order;
use App\States\OrderState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;
use Thunk\Verbs\Facades\Verbs;

class OrderCancelled extends Event
{
    #[StateId(OrderState::class)]
    public int $order_id;

    public function __construct(
        int $order_id,
        public ?string $cancellation_reason = null,
    ) {
        $this->order_id = $order_id;
    }

    public function validate(OrderState $state): void
    {
        $this->assert(
            $state->canTransitionTo(OrderStatus::Cancelled),
            "Order cannot transition to cancelled from status: {$state->status->value}"
        );
    }

    public function apply(OrderState $state): void
    {
        $state->status = OrderStatus::Cancelled;
    }

    public function handle(OrderState $state): void
    {
        Order::where('id', $this->order_id)->update([
            'status' => OrderStatus::Cancelled,
        ]);

        // Release any reserved balance for B2B orders
        Verbs::unlessReplaying(function () use ($state) {
            if ($state->isB2B()) {
                BalanceReservationReleased::fire(
                    customer_id: $state->customer_id,
                    amount: $state->amount,
                    order_id: $this->order_id,
                    description: "Order #{$state->order_number} cancelled",
                );
            }
        });
    }
}
