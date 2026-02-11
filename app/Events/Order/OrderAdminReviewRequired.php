<?php

namespace App\Events\Order;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\EmailService;
use App\States\OrderState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;
use Thunk\Verbs\Facades\Verbs;

class OrderAdminReviewRequired extends Event
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
        $state->status = OrderStatus::AdminReview;
        $state->failure_reason = $this->failure_reason;
        $state->failure_code = $this->failure_code;
    }

    public function handle(OrderState $state): void
    {
        Order::where('id', $this->order_id)->update([
            'status' => OrderStatus::AdminReview,
            'failure_reason' => $this->failure_reason,
            'failure_code' => $this->failure_code,
            'next_retry_at' => null,
        ]);

        Verbs::unlessReplaying(function () {
            $order = Order::with(['customer.user', 'package'])->find($this->order_id);

            if ($order) {
                $emailService = app(EmailService::class);
                $emailService->notifyAdminOrderRequiresReview($order, $this->failure_reason);
            }
        });
    }
}
