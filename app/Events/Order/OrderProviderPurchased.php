<?php

namespace App\Events\Order;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\States\OrderState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class OrderProviderPurchased extends Event
{
    #[StateId(OrderState::class)]
    public int $order_id;

    public function __construct(
        int $order_id,
        public string $provider_order_id,
    ) {
        $this->order_id = $order_id;
    }

    public function validate(OrderState $state): void
    {
        $this->assert(
            $state->canTransitionTo(OrderStatus::ProviderPurchased),
            "Order cannot transition to provider_purchased from status: {$state->status->value}"
        );
    }

    public function apply(OrderState $state): void
    {
        $state->provider_order_id = $this->provider_order_id;
        $state->status = OrderStatus::ProviderPurchased;
    }

    public function handle(OrderState $state): void
    {
        Order::where('id', $this->order_id)->update([
            'provider_order_id' => $this->provider_order_id,
            'status' => OrderStatus::ProviderPurchased,
        ]);
    }
}
