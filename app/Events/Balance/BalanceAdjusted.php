<?php

namespace App\Events\Balance;

use App\Enums\BalanceTransactionType;
use App\Models\BalanceTransaction;
use App\Models\CustomerBalance;
use App\States\CustomerBalanceState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class BalanceAdjusted extends Event
{
    #[StateId(CustomerBalanceState::class)]
    public int $customer_id;

    public function __construct(
        int $customer_id,
        public float $amount,
        public bool $is_credit,
        public ?string $description = null,
        public ?int $adjusted_by = null,
    ) {
        $this->customer_id = $customer_id;
    }

    public function apply(CustomerBalanceState $state): void
    {
        if ($this->is_credit) {
            $state->balance += $this->amount;
        } else {
            $state->balance -= $this->amount;
        }
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
            'type' => BalanceTransactionType::Adjustment,
            'amount' => $this->amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $state->balance,
            'description' => $this->description ?? ($this->is_credit
                ? 'Admin adjustment: balance increased'
                : 'Admin adjustment: balance decreased'),
            'metadata' => [
                'adjusted_by' => $this->adjusted_by,
                'adjustment_type' => $this->is_credit ? 'credit' : 'debit',
            ],
        ]);
    }
}
