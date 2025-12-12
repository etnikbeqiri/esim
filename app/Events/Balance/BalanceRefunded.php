<?php

namespace App\Events\Balance;

use App\Enums\BalanceTransactionType;
use App\Models\BalanceTransaction;
use App\Models\CustomerBalance;
use App\States\CustomerBalanceState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class BalanceRefunded extends Event
{
    #[StateId(CustomerBalanceState::class)]
    public int $customer_id;

    public function __construct(
        int $customer_id,
        public float $amount,
        public ?int $order_id = null,
        public ?string $description = null,
    ) {
        $this->customer_id = $customer_id;
    }

    public function apply(CustomerBalanceState $state): void
    {
        $state->balance += $this->amount;
    }

    public function handle(CustomerBalanceState $state): void
    {
        $balance = CustomerBalance::firstOrCreate(
            ['customer_id' => $this->customer_id],
            ['balance' => 0, 'reserved' => 0]
        );

        $balanceBefore = $balance->balance;

        $balance->update([
            'balance' => $state->balance,
        ]);

        BalanceTransaction::create([
            'customer_id' => $this->customer_id,
            'order_id' => $this->order_id,
            'type' => BalanceTransactionType::Refund,
            'amount' => $this->amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $state->balance,
            'description' => $this->description ?? "Balance refund",
        ]);
    }
}
