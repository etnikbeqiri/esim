<?php

namespace App\Enums;

enum EmailTemplate: string
{
    // Customer emails
    case EsimDelivery = 'esim_delivery';
    case OrderConfirmation = 'order_confirmation';
    case PaymentReceipt = 'payment_receipt';
    case PaymentFailed = 'payment_failed';
    case RefundNotification = 'refund_notification';
    case PasswordReset = 'password_reset';
    case EmailVerification = 'email_verification';
    case OrderFailed = 'order_failed';
    case Welcome = 'welcome';
    case BalanceTopUp = 'balance_top_up';
    case LowBalance = 'low_balance';

    // Ticket emails
    case TicketCreated = 'ticket_created';
    case TicketReply = 'ticket_reply';
    case AdminTicketReply = 'admin_ticket_reply';

    // Admin notification emails
    case AdminNewOrder = 'admin_new_order';
    case AdminOrderFailed = 'admin_order_failed';
    case AdminPaymentFailed = 'admin_payment_failed';
    case AdminLowStock = 'admin_low_stock';
    case AdminNewB2BCustomer = 'admin_new_b2b_customer';
    case AdminBalanceTopUp = 'admin_balance_top_up';
    case AdminTicketCreated = 'admin_ticket_created';

    public function label(): string
    {
        return match ($this) {
            self::EsimDelivery => 'eSIM Delivery',
            self::OrderConfirmation => 'Order Confirmation',
            self::PaymentReceipt => 'Payment Receipt',
            self::PaymentFailed => 'Payment Failed',
            self::RefundNotification => 'Refund Notification',
            self::PasswordReset => 'Password Reset',
            self::EmailVerification => 'Email Verification',
            self::OrderFailed => 'Order Failed',
            self::Welcome => 'Welcome',
            self::BalanceTopUp => 'Balance Top Up',
            self::LowBalance => 'Low Balance Alert',
            self::AdminNewOrder => 'Admin: New Order',
            self::AdminOrderFailed => 'Admin: Order Failed',
            self::AdminPaymentFailed => 'Admin: Payment Failed',
            self::AdminLowStock => 'Admin: Low Stock Alert',
            self::AdminNewB2BCustomer => 'Admin: New B2B Customer',
            self::AdminBalanceTopUp => 'Admin: Balance Top Up',
            self::TicketCreated => 'Ticket Created',
            self::TicketReply => 'Ticket Reply',
            self::AdminTicketReply => 'Admin: Customer Reply',
            self::AdminTicketCreated => 'Admin: New Ticket',
        };
    }

    public function subject(): string
    {
        $appName = config('app.name');

        return match ($this) {
            self::EsimDelivery => 'Your eSIM is Ready!',
            self::OrderConfirmation => 'Order Confirmation',
            self::PaymentReceipt => 'Payment Receipt',
            self::PaymentFailed => 'Payment Failed - Action Required',
            self::RefundNotification => 'Refund Processed',
            self::PasswordReset => 'Reset Your Password',
            self::EmailVerification => 'Verify Your Email Address',
            self::OrderFailed => 'Order Could Not Be Completed',
            self::Welcome => "Welcome to {$appName}!",
            self::BalanceTopUp => 'Balance Top Up Confirmation',
            self::LowBalance => 'Low Balance Alert',
            self::AdminNewOrder => "[{$appName}] New Order Received",
            self::AdminOrderFailed => "[{$appName}] Order Failed - Attention Required",
            self::AdminPaymentFailed => "[{$appName}] Payment Failed Alert",
            self::AdminLowStock => "[{$appName}] Low Stock Warning",
            self::AdminNewB2BCustomer => "[{$appName}] New B2B Customer Registration",
            self::AdminBalanceTopUp => "[{$appName}] B2B Balance Top Up",
            self::TicketCreated => "Your Support Ticket Has Been Created",
            self::TicketReply => "New Reply to Your Support Ticket",
            self::AdminTicketReply => "[{$appName}] Customer Reply on Ticket",
            self::AdminTicketCreated => "[{$appName}] New Support Ticket",
        };
    }

    public function priority(): int
    {
        return match ($this) {
            // Critical - highest priority
            self::EsimDelivery => 1,
            self::PasswordReset => 2,
            self::EmailVerification => 3,

            // High priority - payment/order issues
            self::PaymentFailed => 4,
            self::OrderFailed => 5,
            self::AdminPaymentFailed => 5,
            self::AdminOrderFailed => 5,

            // Medium priority - confirmations
            self::OrderConfirmation => 6,
            self::PaymentReceipt => 7,
            self::RefundNotification => 8,
            self::AdminNewOrder => 8,

            // Low priority - informational
            self::Welcome => 9,
            self::BalanceTopUp => 10,
            self::LowBalance => 10,
            self::AdminLowStock => 10,
            self::AdminNewB2BCustomer => 10,
            self::AdminBalanceTopUp => 10,
            self::TicketCreated => 7,
            self::TicketReply => 6,
            self::AdminTicketReply => 6,
            self::AdminTicketCreated => 7,
        };
    }

    public function isAdminTemplate(): bool
    {
        return match ($this) {
            self::AdminNewOrder,
            self::AdminOrderFailed,
            self::AdminPaymentFailed,
            self::AdminLowStock,
            self::AdminNewB2BCustomer,
            self::AdminBalanceTopUp,
            self::AdminTicketCreated,
            self::AdminTicketReply => true,
            default => false,
        };
    }

    public function viewName(): string
    {
        return 'emails.' . str_replace('_', '-', $this->value);
    }
}
