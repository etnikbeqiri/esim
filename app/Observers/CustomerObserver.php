<?php

namespace App\Observers;

use App\Models\Customer;
use App\Services\EmailService;

class CustomerObserver
{
    public function __construct(
        protected EmailService $emailService
    ) {}

    /**
     * Handle the Customer "created" event.
     */
    public function created(Customer $customer): void
    {
        // Send welcome email
        $this->emailService->sendWelcome($customer);

        // Notify admin if B2B customer
        if ($customer->isB2B()) {
            $this->emailService->notifyAdminNewB2BCustomer($customer);
        }
    }
}
