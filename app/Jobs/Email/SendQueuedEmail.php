<?php

namespace App\Jobs\Email;

use App\Enums\EmailTemplate;
use App\Mail\TemplatedMail;
use App\Models\EmailQueue;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendQueuedEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 60;

    public function __construct(
        public int $emailQueueId,
    ) {}

    public function handle(): void
    {
        $emailQueue = EmailQueue::find($this->emailQueueId);

        if (!$emailQueue) {
            Log::error('SendQueuedEmail: Email queue entry not found', ['id' => $this->emailQueueId]);
            return;
        }

        if ($emailQueue->status === 'sent') {
            Log::info('SendQueuedEmail: Email already sent', ['id' => $this->emailQueueId]);
            return;
        }

        // Check if this email type is enabled in settings
        if (!$emailQueue->template->isEnabled()) {
            Log::info('SendQueuedEmail: Email skipped - disabled in settings', [
                'id' => $this->emailQueueId,
                'template' => $emailQueue->template->value,
                'setting_key' => $emailQueue->template->settingKey(),
                'to' => $emailQueue->to_email,
            ]);

            $emailQueue->markAsSkipped();

            return;
        }

        $emailQueue->markAsSending();

        try {
            $templateData = $this->buildTemplateData($emailQueue);
            $mailable = new TemplatedMail(
                template: $emailQueue->template,
                templateData: $templateData,
            );

            $response = Mail::to($emailQueue->to_email, $emailQueue->to_name)
                ->send($mailable);

            // Get message ID from Resend response if available
            $messageId = $this->extractMessageId($response);

            $emailQueue->markAsSent(
                providerMessageId: $messageId ?? uniqid('msg_'),
                provider: config('mail.default', 'resend')
            );

            Log::info('SendQueuedEmail: Email sent successfully', [
                'id' => $this->emailQueueId,
                'template' => $emailQueue->template->value,
                'to' => $emailQueue->to_email,
                'message_id' => $messageId,
            ]);

        } catch (\Exception $e) {
            Log::error('SendQueuedEmail: Failed to send email', [
                'id' => $this->emailQueueId,
                'template' => $emailQueue->template->value,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $emailQueue->markAsFailed(
                errorCode: 'SEND_FAILED',
                errorMessage: $e->getMessage()
            );

            // Re-schedule if retries available
            if ($emailQueue->canRetry()) {
                $emailQueue->update(['status' => 'pending']);
                self::dispatch($this->emailQueueId)
                    ->delay($emailQueue->next_attempt_at);
            }
        }
    }

    private function buildTemplateData(EmailQueue $emailQueue): array
    {
        $data = $emailQueue->data ?? [];
        $baseData = [
            'customerName' => $emailQueue->to_name,
            'customerEmail' => $emailQueue->to_email,
        ];

        return match ($emailQueue->template) {
            EmailTemplate::EsimDelivery => $this->buildEsimDeliveryData($emailQueue, $data),
            EmailTemplate::OrderConfirmation => $this->buildOrderData($emailQueue, $data),
            EmailTemplate::PaymentReceipt => $this->buildPaymentReceiptData($emailQueue, $data),
            EmailTemplate::PaymentFailed => $this->buildOrderData($emailQueue, $data, ['reason' => $data['reason'] ?? '']),
            EmailTemplate::OrderFailed => $this->buildOrderFailedData($emailQueue, $data),
            EmailTemplate::RefundNotification => $this->buildRefundData($emailQueue, $data),
            EmailTemplate::Welcome => $this->buildWelcomeData($emailQueue, $data),
            EmailTemplate::BalanceTopUp => $this->buildBalanceTopUpData($emailQueue, $data),
            EmailTemplate::LowBalance => $this->buildLowBalanceData($emailQueue, $data),
            EmailTemplate::AdminNewOrder => $this->buildAdminOrderData($emailQueue, $data),
            EmailTemplate::AdminOrderFailed => $this->buildAdminOrderData($emailQueue, $data, ['reason' => $data['reason'] ?? '']),
            EmailTemplate::AdminPaymentFailed => $this->buildAdminPaymentFailedData($emailQueue, $data),
            EmailTemplate::AdminLowStock => $this->buildAdminLowStockData($data),
            EmailTemplate::AdminNewB2BCustomer => $this->buildAdminB2BCustomerData($emailQueue, $data),
            EmailTemplate::AdminBalanceTopUp => $this->buildAdminBalanceTopUpData($emailQueue, $data),
            default => array_merge($baseData, $data),
        };
    }

    private function buildEsimDeliveryData(EmailQueue $emailQueue, array $data): array
    {
        $order = Order::with(['esimProfile', 'package', 'country'])->find($emailQueue->order_id);

        if (!$order || !$order->esimProfile) {
            throw new \Exception('Order or eSIM profile not found for delivery email');
        }

        return [
            'customerName' => $emailQueue->to_name,
            'order' => $order,
            'package' => $order->package,
            'esimProfile' => $order->esimProfile,
        ];
    }

    private function buildOrderData(EmailQueue $emailQueue, array $data, array $extra = []): array
    {
        $order = Order::with(['package', 'country', 'payment'])->find($emailQueue->order_id);

        if (!$order) {
            throw new \Exception('Order not found for email');
        }

        return array_merge([
            'customerName' => $emailQueue->to_name,
            'order' => $order,
            'package' => $order->package,
            'payment' => $order->payment,
        ], $extra);
    }

    private function buildPaymentReceiptData(EmailQueue $emailQueue, array $data): array
    {
        $order = Order::with(['package', 'payment'])->find($emailQueue->order_id);

        if (!$order) {
            throw new \Exception('Order not found for payment receipt email');
        }

        return [
            'customerName' => $emailQueue->to_name,
            'order' => $order,
            'package' => $order->package,
            'payment' => $order->payment,
        ];
    }

    private function buildOrderFailedData(EmailQueue $emailQueue, array $data): array
    {
        $order = Order::with(['package', 'customer'])->find($emailQueue->order_id);

        if (!$order) {
            throw new \Exception('Order not found for order failed email');
        }

        return [
            'customerName' => $emailQueue->to_name,
            'order' => $order,
            'package' => $order->package,
            'reason' => $data['reason'] ?? '',
            'isB2B' => $order->customer?->isB2B() ?? false,
        ];
    }

    private function buildRefundData(EmailQueue $emailQueue, array $data): array
    {
        $order = Order::with(['package', 'customer'])->find($emailQueue->order_id);

        if (!$order) {
            throw new \Exception('Order not found for refund email');
        }

        return [
            'customerName' => $emailQueue->to_name,
            'order' => $order,
            'package' => $order->package,
            'refundAmount' => $data['refund_amount'] ?? $order->amount,
            'isB2B' => $order->customer?->isB2B() ?? false,
        ];
    }

    private function buildWelcomeData(EmailQueue $emailQueue, array $data): array
    {
        return [
            'customerName' => $emailQueue->to_name,
            'isB2B' => $data['is_b2b'] ?? false,
            'customerType' => $data['customer_type'] ?? 'b2c',
        ];
    }

    private function buildBalanceTopUpData(EmailQueue $emailQueue, array $data): array
    {
        return [
            'customerName' => $emailQueue->to_name,
            'amount' => $data['amount'] ?? 0,
            'newBalance' => $data['new_balance'] ?? 0,
        ];
    }

    private function buildLowBalanceData(EmailQueue $emailQueue, array $data): array
    {
        return [
            'customerName' => $emailQueue->to_name,
            'balance' => $data['balance'] ?? 0,
            'threshold' => $data['threshold'] ?? 50,
        ];
    }

    private function buildAdminOrderData(EmailQueue $emailQueue, array $data, array $extra = []): array
    {
        $order = Order::with(['package.country', 'customer'])->find($emailQueue->order_id);

        if (!$order) {
            throw new \Exception('Order not found for admin notification');
        }

        return array_merge([
            'order' => $order,
            'package' => $order->package,
            'customerEmail' => $data['customer_email'] ?? $order->customer_email,
            'customerType' => $data['customer_type'] ?? $order->customer?->type?->value ?? 'guest',
        ], $extra);
    }

    private function buildAdminPaymentFailedData(EmailQueue $emailQueue, array $data): array
    {
        $order = Order::with(['package'])->find($emailQueue->order_id);

        if (!$order) {
            throw new \Exception('Order not found for admin payment failed notification');
        }

        return [
            'order' => $order,
            'package' => $order->package,
            'customerEmail' => $data['customer_email'] ?? $order->customer_email,
            'errorCode' => $data['error_code'] ?? '',
            'errorMessage' => $data['error_message'] ?? '',
        ];
    }

    private function buildAdminLowStockData(array $data): array
    {
        return [
            'packageName' => $data['package_name'] ?? 'Unknown Package',
            'stockCount' => $data['stock_count'] ?? 0,
            'threshold' => $data['threshold'] ?? 10,
        ];
    }

    private function buildAdminB2BCustomerData(EmailQueue $emailQueue, array $data): array
    {
        return [
            'customerId' => $emailQueue->customer_id,
            'customerName' => $data['customer_name'] ?? '',
            'customerEmail' => $data['customer_email'] ?? '',
            'companyName' => $data['company_name'] ?? '',
        ];
    }

    private function buildAdminBalanceTopUpData(EmailQueue $emailQueue, array $data): array
    {
        return [
            'customerId' => $emailQueue->customer_id,
            'customerName' => $data['customer_name'] ?? '',
            'customerEmail' => $data['customer_email'] ?? '',
            'amount' => $data['amount'] ?? 0,
            'newBalance' => $data['new_balance'] ?? 0,
        ];
    }

    private function extractMessageId($response): ?string
    {
        // Try to extract message ID from Symfony Mailer response
        if ($response && method_exists($response, 'getMessageId')) {
            return $response->getMessageId();
        }

        // For Resend, the message ID might be in the response differently
        if (is_object($response) && property_exists($response, 'id')) {
            return $response->id;
        }

        return null;
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SendQueuedEmail: Job failed permanently', [
            'email_queue_id' => $this->emailQueueId,
            'error' => $exception->getMessage(),
        ]);
    }
}
