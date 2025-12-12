<?php

namespace App\Enums;

enum EmailTemplate: string
{
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
        };
    }

    public function subject(): string
    {
        return match ($this) {
            self::EsimDelivery => 'Your eSIM is Ready',
            self::OrderConfirmation => 'Order Confirmation',
            self::PaymentReceipt => 'Payment Receipt',
            self::PaymentFailed => 'Payment Failed',
            self::RefundNotification => 'Refund Processed',
            self::PasswordReset => 'Reset Your Password',
            self::EmailVerification => 'Verify Your Email',
            self::OrderFailed => 'Order Could Not Be Completed',
            self::Welcome => 'Welcome to Our Platform',
            self::BalanceTopUp => 'Balance Top Up Confirmation',
            self::LowBalance => 'Low Balance Alert',
        };
    }

    public function priority(): int
    {
        return match ($this) {
            self::EsimDelivery => 1,
            self::PasswordReset => 2,
            self::EmailVerification => 3,
            self::PaymentFailed => 4,
            self::OrderFailed => 5,
            self::OrderConfirmation => 6,
            self::PaymentReceipt => 7,
            self::RefundNotification => 8,
            self::Welcome => 9,
            self::BalanceTopUp => 10,
            self::LowBalance => 10,
        };
    }
}
