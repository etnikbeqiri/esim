<?php

namespace App\Services;

use App\Enums\EmailTemplate;
use App\Jobs\Email\SendQueuedEmail;
use App\Models\Customer;
use App\Models\EmailQueue;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Thunk\Verbs\Facades\Verbs;

class EmailService
{
    public function __construct()
    {
    }

    /**
     * Queue an email for sending.
     */
    public function queue(
        EmailTemplate $template,
        string $toEmail,
        ?string $toName = null,
        ?int $customerId = null,
        ?int $orderId = null,
        array $data = [],
        bool $dispatchImmediately = true
    ): EmailQueue {
        $email = EmailQueue::create([
            'template' => $template,
            'to_email' => $toEmail,
            'to_name' => $toName,
            'customer_id' => $customerId,
            'order_id' => $orderId,
            'priority' => $template->priority(),
            'data' => $data,
        ]);

        if ($dispatchImmediately) {
            SendQueuedEmail::dispatch($email->id);
        }

        Log::info('Email queued', [
            'template' => $template->value,
            'to' => $toEmail,
            'email_queue_id' => $email->id,
        ]);

        return $email;
    }

    /**
     * Queue an email only if not replaying events.
     */
    public function queueUnlessReplaying(
        EmailTemplate $template,
        string $toEmail,
        ?string $toName = null,
        ?int $customerId = null,
        ?int $orderId = null,
        array $data = [],
        bool $dispatchImmediately = true
    ): ?EmailQueue {
        $email = null;

        Verbs::unlessReplaying(function () use (
            $template,
            $toEmail,
            $toName,
            $customerId,
            $orderId,
            $data,
            $dispatchImmediately,
            &$email
        ) {
            $email = $this->queue(
                $template,
                $toEmail,
                $toName,
                $customerId,
                $orderId,
                $data,
                $dispatchImmediately
            );
        });

        return $email;
    }

    /**
     * Send welcome email to new customer.
     */
    public function sendWelcome(Customer $customer): ?EmailQueue
    {
        $user = $customer->user;

        if (!$user) {
            return null;
        }

        return $this->queueUnlessReplaying(
            EmailTemplate::Welcome,
            $user->email,
            $user->name,
            $customer->id,
            null,
            [
                'customer_type' => $customer->type->value,
                'is_b2b' => $customer->isB2B(),
            ]
        );
    }

    /**
     * Get the best email address for an order.
     * Priority: payment email (from payment form) > order email (from checkout) > customer account email.
     */
    protected function getOrderEmail(Order $order): ?string
    {
        return $order->payments()->latest()->first()?->customer_email
            ?? $order->customer_email
            ?? $order->customer?->user?->email;
    }

    /**
     * Get the best name for an order.
     */
    protected function getOrderName(Order $order): ?string
    {
        return $order->customer_name
            ?? $order->customer?->user?->name;
    }

    /**
     * Send order confirmation email.
     */
    public function sendOrderConfirmation(Order $order): ?EmailQueue
    {
        $email = $this->getOrderEmail($order);
        $name = $this->getOrderName($order);

        if (!$email) {
            Log::warning('Cannot send order confirmation - no email address', ['order_id' => $order->id]);
            return null;
        }

        return $this->queueUnlessReplaying(
            EmailTemplate::OrderConfirmation,
            $email,
            $name,
            $order->customer_id,
            $order->id,
            [
                'order_number' => $order->order_number,
                'order_uuid' => $order->uuid,
            ]
        );
    }

    /**
     * Send eSIM delivery email with QR code and activation details.
     */
    public function sendEsimDelivery(Order $order): ?EmailQueue
    {
        $email = $this->getOrderEmail($order);
        $name = $this->getOrderName($order);

        if (!$email) {
            Log::warning('Cannot send eSIM delivery - no email address', ['order_id' => $order->id]);
            return null;
        }

        if (!$order->esimProfile) {
            Log::warning('Cannot send eSIM delivery - no eSIM profile', ['order_id' => $order->id]);
            return null;
        }

        return $this->queueUnlessReplaying(
            EmailTemplate::EsimDelivery,
            $email,
            $name,
            $order->customer_id,
            $order->id,
            [
                'order_number' => $order->order_number,
                'order_uuid' => $order->uuid,
            ]
        );
    }

    /**
     * Send payment receipt email.
     */
    public function sendPaymentReceipt(Order $order): ?EmailQueue
    {
        $email = $this->getOrderEmail($order);
        $name = $this->getOrderName($order);

        if (!$email) {
            return null;
        }

        return $this->queueUnlessReplaying(
            EmailTemplate::PaymentReceipt,
            $email,
            $name,
            $order->customer_id,
            $order->id,
            [
                'order_number' => $order->order_number,
            ]
        );
    }

    /**
     * Send payment failed email to customer.
     */
    public function sendPaymentFailed(Order $order, string $reason = ''): ?EmailQueue
    {
        $email = $this->getOrderEmail($order);
        $name = $this->getOrderName($order);

        if (!$email) {
            return null;
        }

        return $this->queueUnlessReplaying(
            EmailTemplate::PaymentFailed,
            $email,
            $name,
            $order->customer_id,
            $order->id,
            [
                'order_number' => $order->order_number,
                'reason' => $reason,
            ]
        );
    }

    /**
     * Send order failed email to customer.
     */
    public function sendOrderFailed(Order $order, string $reason = ''): ?EmailQueue
    {
        $email = $this->getOrderEmail($order);
        $name = $this->getOrderName($order);

        if (!$email) {
            return null;
        }

        return $this->queueUnlessReplaying(
            EmailTemplate::OrderFailed,
            $email,
            $name,
            $order->customer_id,
            $order->id,
            [
                'order_number' => $order->order_number,
                'reason' => $reason,
            ]
        );
    }

    /**
     * Send refund notification email.
     */
    public function sendRefundNotification(Order $order, float $amount): ?EmailQueue
    {
        $email = $this->getOrderEmail($order);
        $name = $this->getOrderName($order);

        if (!$email) {
            return null;
        }

        return $this->queueUnlessReplaying(
            EmailTemplate::RefundNotification,
            $email,
            $name,
            $order->customer_id,
            $order->id,
            [
                'order_number' => $order->order_number,
                'refund_amount' => $amount,
            ]
        );
    }

    /**
     * Send balance top-up confirmation to B2B customer.
     */
    public function sendBalanceTopUp(Customer $customer, float $amount, float $newBalance): ?EmailQueue
    {
        $user = $customer->user;

        if (!$user) {
            return null;
        }

        return $this->queueUnlessReplaying(
            EmailTemplate::BalanceTopUp,
            $user->email,
            $user->name,
            $customer->id,
            null,
            [
                'amount' => $amount,
                'new_balance' => $newBalance,
            ]
        );
    }

    /**
     * Send low balance warning to B2B customer.
     */
    public function sendLowBalanceWarning(Customer $customer, float $balance, float $threshold = 50.00): ?EmailQueue
    {
        $user = $customer->user;

        if (!$user) {
            return null;
        }

        return $this->queueUnlessReplaying(
            EmailTemplate::LowBalance,
            $user->email,
            $user->name,
            $customer->id,
            null,
            [
                'balance' => $balance,
                'threshold' => $threshold,
            ]
        );
    }

    // ========================================
    // Admin Notification Methods
    // ========================================

    /**
     * Get admin email address.
     */
    protected function getAdminEmail(): string
    {
        return config('contact.admin_email', 'admin@example.com');
    }

    /**
     * Notify admin of new order.
     */
    public function notifyAdminNewOrder(Order $order): ?EmailQueue
    {
        return $this->queueUnlessReplaying(
            EmailTemplate::AdminNewOrder,
            $this->getAdminEmail(),
            'Admin',
            null,
            $order->id,
            [
                'order_number' => $order->order_number,
                'customer_email' => $order->customer_email ?? $order->customer?->user?->email,
                'customer_type' => $order->customer?->type?->value ?? 'guest',
                'amount' => $order->amount,
            ]
        );
    }

    /**
     * Notify admin of failed order.
     */
    public function notifyAdminOrderFailed(Order $order, string $reason = ''): ?EmailQueue
    {
        return $this->queueUnlessReplaying(
            EmailTemplate::AdminOrderFailed,
            $this->getAdminEmail(),
            'Admin',
            null,
            $order->id,
            [
                'order_number' => $order->order_number,
                'customer_email' => $order->customer_email ?? $order->customer?->user?->email,
                'reason' => $reason,
            ]
        );
    }

    /**
     * Notify admin of payment failure.
     */
    public function notifyAdminPaymentFailed(Order $order, string $errorCode = '', string $errorMessage = ''): ?EmailQueue
    {
        return $this->queueUnlessReplaying(
            EmailTemplate::AdminPaymentFailed,
            $this->getAdminEmail(),
            'Admin',
            null,
            $order->id,
            [
                'order_number' => $order->order_number,
                'customer_email' => $order->customer_email ?? $order->customer?->user?->email,
                'error_code' => $errorCode,
                'error_message' => $errorMessage,
            ]
        );
    }

    /**
     * Notify admin of new B2B customer registration.
     */
    public function notifyAdminNewB2BCustomer(Customer $customer): ?EmailQueue
    {
        $user = $customer->user;

        return $this->queueUnlessReplaying(
            EmailTemplate::AdminNewB2BCustomer,
            $this->getAdminEmail(),
            'Admin',
            $customer->id,
            null,
            [
                'customer_name' => $user?->name,
                'customer_email' => $user?->email,
                'company_name' => $customer->company_name,
            ]
        );
    }

    /**
     * Notify admin of B2B balance top-up.
     */
    public function notifyAdminBalanceTopUp(Customer $customer, float $amount, float $newBalance): ?EmailQueue
    {
        $user = $customer->user;

        return $this->queueUnlessReplaying(
            EmailTemplate::AdminBalanceTopUp,
            $this->getAdminEmail(),
            'Admin',
            $customer->id,
            null,
            [
                'customer_name' => $user?->name,
                'customer_email' => $user?->email,
                'amount' => $amount,
                'new_balance' => $newBalance,
            ]
        );
    }

    /**
     * Notify admin of low stock for a package.
     */
    public function notifyAdminLowStock(string $packageName, int $stockCount, int $threshold = 10): ?EmailQueue
    {
        return $this->queueUnlessReplaying(
            EmailTemplate::AdminLowStock,
            $this->getAdminEmail(),
            'Admin',
            null,
            null,
            [
                'package_name' => $packageName,
                'stock_count' => $stockCount,
                'threshold' => $threshold,
            ]
        );
    }
}
