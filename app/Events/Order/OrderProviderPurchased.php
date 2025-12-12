<?php

namespace App\Events\Order;

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

    public function apply(OrderState $state): void
    {
        $state->provider_order_id = $this->provider_order_id;
    }

    public function handle(OrderState $state): void
    {
        Order::where('id', $this->order_id)->update([
            'provider_order_id' => $this->provider_order_id,
        ]);
    }
}
