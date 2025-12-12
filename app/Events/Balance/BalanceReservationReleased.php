<?php

namespace App\Events\Balance;

use App\Enums\BalanceTransactionType;
use App\Models\BalanceTransaction;
use App\Models\CustomerBalance;
use App\States\CustomerBalanceState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class BalanceReservationReleased extends Event
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

    public function validate(CustomerBalanceState $state): void
    {
        $this->assert(
            $state->reserved >= $this->amount,
            "Cannot release more than reserved. Reserved: {$state->reserved}, Release: {$this->amount}"
        );
    }

    public function apply(CustomerBalanceState $state): void
    {
        $state->reserved -= $this->amount;
    }

    public function handle(CustomerBalanceState $state): void
    {
        $balance = CustomerBalance::where('customer_id', $this->customer_id)->first();
        $balanceBefore = $balance->balance;

        $balance->update([
            'reserved' => $state->reserved,
        ]);

        BalanceTransaction::create([
            'customer_id' => $this->customer_id,
            'order_id' => $this->order_id,
            'type' => BalanceTransactionType::ReservationRelease,
            'amount' => $this->amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceBefore,
            'description' => $this->description ?? "Reservation released",
        ]);
    }
}
