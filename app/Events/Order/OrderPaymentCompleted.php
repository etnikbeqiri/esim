<?php

namespace App\Events\Order;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Jobs\Order\ProcessProviderPurchase;
use App\Models\Order;
use App\States\OrderState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;
use Thunk\Verbs\Facades\Verbs;

class OrderPaymentCompleted extends Event
{
    #[StateId(OrderState::class)]
    public int $order_id;

    private bool $wasAlreadyProcessing = false;

    public function __construct(
        int $order_id,
        public int $payment_id,
    ) {
        $this->order_id = $order_id;
    }

    public function validate(OrderState $state): void
    {
        // Track if already processing (B2B case where OrderProcessingStarted ran first)
        $this->wasAlreadyProcessing = $state->status === OrderStatus::Processing;

        // Allow if order can transition to Processing OR is already Processing (B2B case)
        $this->assert(
            $state->canTransitionTo(OrderStatus::Processing) || $this->wasAlreadyProcessing,
            "Order cannot complete payment from status: {$state->status->value}"
        );
    }

    public function apply(OrderState $state): void
    {
        // Only set status if not already Processing
        if (!$this->wasAlreadyProcessing) {
            $state->status = OrderStatus::Processing;
        }
        $state->payment_status = PaymentStatus::Completed;
        $state->payment_id = $this->payment_id;
        $state->paid_at = now();
    }

    public function handle(OrderState $state): void
    {
        Order::where('id', $this->order_id)->update([
            'status' => OrderStatus::Processing,
            'payment_status' => PaymentStatus::Completed,
            'paid_at' => now(),
        ]);

        // Only dispatch job for B2C flow (when status wasn't already Processing)
        // For B2B, OrderProcessingStarted already dispatches the job
        if (!$this->wasAlreadyProcessing) {
            Verbs::unlessReplaying(function () {
                ProcessProviderPurchase::dispatch($this->order_id);
            });
        }
    }
}
