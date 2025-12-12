<?php

namespace App\Events\Order;

use App\Enums\OrderStatus;
use App\Jobs\Order\ProcessProviderPurchase;
use App\Models\Order;
use App\States\OrderState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;
use Thunk\Verbs\Facades\Verbs;

class OrderProcessingStarted extends Event
{
    #[StateId(OrderState::class)]
    public int $order_id;

    public function __construct(int $order_id)
    {
        $this->order_id = $order_id;
    }

    public function validate(OrderState $state): void
    {
        $this->assert(
            $state->canTransitionTo(OrderStatus::Processing),
            "Order cannot transition to processing from status: {$state->status->value}"
        );
    }

    public function apply(OrderState $state): void
    {
        $state->status = OrderStatus::Processing;
    }

    public function handle(OrderState $state): void
    {
        Order::where('id', $this->order_id)->update([
            'status' => OrderStatus::Processing,
        ]);

        // Dispatch job to process the eSIM purchase
        Verbs::unlessReplaying(function () {
            ProcessProviderPurchase::dispatch($this->order_id);
        });
    }
}
