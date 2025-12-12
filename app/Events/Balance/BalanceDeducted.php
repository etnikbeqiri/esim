<?php

namespace App\Events\Balance;

use App\Enums\BalanceTransactionType;
use App\Models\BalanceTransaction;
use App\Models\CustomerBalance;
use App\States\CustomerBalanceState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class BalanceDeducted extends Event
{
    #[StateId(CustomerBalanceState::class)]
    public int $customer_id;

    public function __construct(
        int $customer_id,
        public float $amount,
        public int $order_id,
        public ?string $description = null,
        public bool $from_reservation = true,
    ) {
        $this->customer_id = $customer_id;
    }

    public function validate(CustomerBalanceState $state): void
    {
        if ($this->from_reservation) {
            $this->assert(
                $state->reserved >= $this->amount,
                "Insufficient reservation. Reserved: {$state->reserved}, Required: {$this->amount}"
            );
        } else {
            $this->assert(
                $state->canDeduct($this->amount),
                "Insufficient balance. Available: {$state->getAvailableBalance()}, Required: {$this->amount}"
            );
        }
    }

    public function apply(CustomerBalanceState $state): void
    {
        $state->balance -= $this->amount;
        if ($this->from_reservation) {
            $state->reserved -= $this->amount;
        }
    }

    public function handle(CustomerBalanceState $state): void
    {
        $balance = CustomerBalance::where('customer_id', $this->customer_id)->first();
        $balanceBefore = $balance->balance;

        $balance->update([
            'balance' => $state->balance,
            'reserved' => $state->reserved,
        ]);

        BalanceTransaction::create([
            'customer_id' => $this->customer_id,
            'order_id' => $this->order_id,
            'type' => BalanceTransactionType::Purchase,
            'amount' => $this->amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $state->balance,
            'description' => $this->description ?? "Purchase deduction",
        ]);
    }
}
