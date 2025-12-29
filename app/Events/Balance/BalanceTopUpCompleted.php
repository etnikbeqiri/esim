<?php

namespace App\Events\Balance;

use App\Enums\BalanceTransactionType;
use App\Models\BalanceTransaction;
use App\Models\Customer;
use App\Models\CustomerBalance;
use App\Models\Payment;
use App\Services\EmailService;
use App\Services\InvoiceService;
use App\States\CustomerBalanceState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;
use Thunk\Verbs\Facades\Verbs;

class BalanceTopUpCompleted extends Event
{
    #[StateId(CustomerBalanceState::class)]
    public int $customer_id;

    public function __construct(
        int $customer_id,
        public float $amount,
        public ?int $payment_id = null,
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
            'payment_id' => $this->payment_id,
            'type' => BalanceTransactionType::TopUp,
            'amount' => $this->amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $state->balance,
            'description' => $this->description ?? "Balance top up",
        ]);

        // Send email notifications and generate invoice
        Verbs::unlessReplaying(function () use ($state) {
            $customer = Customer::with('user')->find($this->customer_id);

            if (!$customer) {
                return;
            }

            $emailService = app(EmailService::class);

            // Send confirmation to customer
            $emailService->sendBalanceTopUp($customer, $this->amount, $state->balance);

            // Notify admin
            $emailService->notifyAdminBalanceTopUp($customer, $this->amount, $state->balance);

            // Generate invoice for B2B top-ups
            if ($customer->isB2B() && $this->payment_id) {
                $payment = Payment::find($this->payment_id);
                $transaction = BalanceTransaction::where('customer_id', $this->customer_id)
                    ->where('payment_id', $this->payment_id)
                    ->where('type', BalanceTransactionType::TopUp)
                    ->latest()
                    ->first();

                if ($payment && $transaction) {
                    $invoiceService = app(InvoiceService::class);

                    // Prevent duplicate invoices
                    if (! $invoiceService->hasTopUpInvoice($transaction)) {
                        $invoiceService->createTopUpInvoice($customer, $transaction, $payment);
                    }
                }
            }
        });
    }
}
