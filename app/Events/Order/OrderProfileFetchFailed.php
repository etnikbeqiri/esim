<?php

namespace App\Events\Order;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\States\OrderState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;
use Thunk\Verbs\Facades\Verbs;

class OrderProfileFetchFailed extends Event
{
    #[StateId(OrderState::class)]
    public int $order_id;

    public function __construct(
        int $order_id,
        public string $provider_order_id,
        public string $failure_reason,
    ) {
        $this->order_id = $order_id;
    }

    public function validate(OrderState $state): void
    {
        $this->assert(
            $state->provider_order_id !== null,
            'Order must have a provider_order_id before profile fetch can fail'
        );
    }

    public function apply(OrderState $state): void
    {
        $state->status = OrderStatus::AdminReview;
        $state->failure_reason = $this->failure_reason;
        $state->failure_code = 'profile_fetch_failed';
    }

    public function handle(OrderState $state): void
    {
        Order::where('id', $this->order_id)->update([
            'status' => OrderStatus::AdminReview,
            'failure_reason' => $this->failure_reason,
        ]);

        Verbs::unlessReplaying(function () {
            $order = Order::with(['customer.user', 'package'])->find($this->order_id);

            if (!$order) {
                return;
            }

            \Log::warning('OrderProfileFetchFailed: Purchase succeeded but profile fetch failed - admin review required', [
                'order_id' => $this->order_id,
                'provider_order_id' => $this->provider_order_id,
                'failure_reason' => $this->failure_reason,
            ]);
        });
    }
}
