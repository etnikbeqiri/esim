<?php

namespace App\Events\Order;

use App\Enums\OrderStatus;
use App\Jobs\Order\ProcessProviderPurchase;
use App\Models\Order;
use App\States\OrderState;
use Carbon\Carbon;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;
use Thunk\Verbs\Facades\Verbs;

class OrderRetryScheduled extends Event
{
    #[StateId(OrderState::class)]
    public int $order_id;

    public function __construct(
        int $order_id,
        public string $failure_reason,
        public ?string $failure_code = null,
        public ?int $retry_delay_minutes = null,
    ) {
        $this->order_id = $order_id;
    }

    public function validate(OrderState $state): void
    {
        $this->assert(
            $state->canRetry(),
            "Order cannot be retried. Current status: {$state->status->value}, Retry count: {$state->retry_count}/{$state->max_retries}"
        );
    }

    public function apply(OrderState $state): void
    {
        $state->status = OrderStatus::PendingRetry;
        $state->retry_count++;
        $state->failure_reason = $this->failure_reason;
        $state->failure_code = $this->failure_code;

        $delayMinutes = $this->retry_delay_minutes ?? $state->getNextRetryDelay();
        $state->next_retry_at = Carbon::now()->addMinutes($delayMinutes);
    }

    public function handle(OrderState $state): void
    {
        Order::where('id', $this->order_id)->update([
            'status' => OrderStatus::PendingRetry,
            'retry_count' => $state->retry_count,
            'next_retry_at' => $state->next_retry_at,
            'failure_reason' => $this->failure_reason,
            'failure_code' => $this->failure_code,
        ]);

        // Schedule retry job
        Verbs::unlessReplaying(function () use ($state) {
            ProcessProviderPurchase::dispatch($this->order_id)
                ->delay($state->next_retry_at);
        });
    }
}
