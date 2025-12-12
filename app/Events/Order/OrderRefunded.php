<?php

namespace App\Events\Order;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\States\OrderState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class OrderRefunded extends Event
{
    #[StateId(OrderState::class)]
    public int $order_id;

    public function __construct(
        int $order_id,
        public string $refund_reason,
        public ?int $payment_id = null,
    ) {
        $this->order_id = $order_id;
    }

    public function validate(OrderState $state): void
    {
        $this->assert(
            $state->canTransitionTo(OrderStatus::Refunded),
            "Order cannot transition to refunded from status: {$state->status->value}"
        );
    }

    public function apply(OrderState $state): void
    {
        $state->status = OrderStatus::Refunded;
    }

    public function handle(OrderState $state): void
    {
        Order::where('id', $this->order_id)->update([
            'status' => OrderStatus::Refunded,
        ]);
    }
}
