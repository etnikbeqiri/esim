<?php

namespace App\Events\Order;

use App\Enums\BalanceTransactionType;
use App\Enums\OrderStatus;
use App\Events\Balance\BalanceRefunded;
use App\Models\BalanceTransaction;
use App\Models\Order;
use App\States\OrderState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;
use Thunk\Verbs\Facades\Verbs;

class OrderFailed extends Event
{
    #[StateId(OrderState::class)]
    public int $order_id;

    public function __construct(
        int $order_id,
        public string $failure_reason,
        public ?string $failure_code = null,
    ) {
        $this->order_id = $order_id;
    }

    public function apply(OrderState $state): void
    {
        $state->status = OrderStatus::Failed;
        $state->failure_reason = $this->failure_reason;
        $state->failure_code = $this->failure_code;
    }

    public function handle(OrderState $state): void
    {
        Order::where('id', $this->order_id)->update([
            'status' => OrderStatus::Failed,
            'failure_reason' => $this->failure_reason,
            'failure_code' => $this->failure_code,
        ]);

        // Refund B2B balance if applicable (only if not already refunded)
        Verbs::unlessReplaying(function () use ($state) {
            if (!$state->isB2B()) {
                return;
            }

            $alreadyRefunded = BalanceTransaction::where('order_id', $this->order_id)
                ->where('type', BalanceTransactionType::Refund)
                ->exists();

            if ($alreadyRefunded) {
                return;
            }

            BalanceRefunded::fire(
                customer_id: $state->customer_id,
                amount: $state->amount,
                order_id: $this->order_id,
                description: "Refund for failed order #{$state->order_number}",
            );
        });
    }
}
