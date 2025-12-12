<?php

namespace App\Jobs\Email;

use App\Models\EmailQueue;
use App\Models\EsimProfile;
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
    public int $timeout = 30;

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

        $emailQueue->markAsSending();

        try {
            $mailable = $this->buildMailable($emailQueue);

            if (!$mailable) {
                throw new \Exception("Unknown email template: {$emailQueue->template->value}");
            }

            Mail::to($emailQueue->to_email, $emailQueue->to_name)
                ->send($mailable);

            $emailQueue->markAsSent(
                providerMessageId: uniqid('msg_'),
                provider: 'default'
            );

            Log::info('SendQueuedEmail: Email sent successfully', [
                'id' => $this->emailQueueId,
                'template' => $emailQueue->template->value,
                'to' => $emailQueue->to_email,
            ]);

        } catch (\Exception $e) {
            Log::error('SendQueuedEmail: Failed to send email', [
                'id' => $this->emailQueueId,
                'error' => $e->getMessage(),
            ]);

            $emailQueue->markAsFailed(
                errorCode: 'SEND_FAILED',
                errorMessage: $e->getMessage()
            );

            // Re-schedule if retries available
            if ($emailQueue->canRetry()) {
                self::dispatch($this->emailQueueId)
                    ->delay($emailQueue->next_attempt_at);
            }
        }
    }

    private function buildMailable(EmailQueue $emailQueue)
    {
        $data = $emailQueue->data ?? [];

        return match ($emailQueue->template->value) {
            'esim_delivery' => $this->buildEsimDeliveryMail($emailQueue, $data),
            'order_confirmation' => $this->buildOrderConfirmationMail($emailQueue, $data),
            'welcome' => $this->buildWelcomeMail($emailQueue, $data),
            default => null,
        };
    }

    private function buildEsimDeliveryMail(EmailQueue $emailQueue, array $data)
    {
        $order = Order::with(['esimProfile', 'package'])->find($emailQueue->order_id);

        if (!$order || !$order->esimProfile) {
            throw new \Exception('Order or eSIM profile not found for email');
        }

        // For now, return a simple mailable that can be customized later
        return new \Illuminate\Mail\Mailable(function ($message) use ($order, $emailQueue) {
            $message->subject('Your eSIM is Ready - ' . $order->package->name)
                ->html($this->getEsimDeliveryHtml($order));
        });
    }

    private function buildOrderConfirmationMail(EmailQueue $emailQueue, array $data)
    {
        $order = Order::with(['package'])->find($emailQueue->order_id);

        if (!$order) {
            throw new \Exception('Order not found for email');
        }

        return new \Illuminate\Mail\Mailable(function ($message) use ($order) {
            $message->subject('Order Confirmation - ' . $order->order_number)
                ->html($this->getOrderConfirmationHtml($order));
        });
    }

    private function buildWelcomeMail(EmailQueue $emailQueue, array $data)
    {
        return new \Illuminate\Mail\Mailable(function ($message) use ($emailQueue) {
            $message->subject('Welcome to Our eSIM Platform')
                ->html($this->getWelcomeHtml($emailQueue->to_name));
        });
    }

    private function getEsimDeliveryHtml(Order $order): string
    {
        $esim = $order->esimProfile;
        $lpaString = $esim->lpa_string;

        return <<<HTML
        <h1>Your eSIM is Ready!</h1>
        <p>Thank you for your order. Your eSIM for {$order->package->name} is ready to install.</p>

        <h2>Installation Instructions</h2>
        <p>Scan the QR code below or use the manual activation code:</p>

        <h3>Activation Code</h3>
        <code>{$esim->activation_code}</code>

        <h3>SMDP Address</h3>
        <code>{$esim->smdp_address}</code>

        <h3>LPA String (for manual entry)</h3>
        <code>{$lpaString}</code>

        <h2>Package Details</h2>
        <ul>
            <li>Data: {$order->package->data_label}</li>
            <li>Validity: {$order->package->validity_label}</li>
        </ul>

        <p>If you have any questions, please contact our support team.</p>
        HTML;
    }

    private function getOrderConfirmationHtml(Order $order): string
    {
        return <<<HTML
        <h1>Order Confirmation</h1>
        <p>Thank you for your order!</p>

        <h2>Order Details</h2>
        <ul>
            <li>Order Number: {$order->order_number}</li>
            <li>Package: {$order->package->name}</li>
            <li>Amount: €{$order->amount}</li>
        </ul>

        <p>We are processing your order and will send you the eSIM details shortly.</p>
        HTML;
    }

    private function getWelcomeHtml(?string $name): string
    {
        $greeting = $name ? "Hello {$name}!" : "Hello!";

        return <<<HTML
        <h1>{$greeting}</h1>
        <p>Welcome to our eSIM platform!</p>
        <p>You can now browse and purchase eSIM packages for your travels.</p>
        HTML;
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SendQueuedEmail: Job failed', [
            'email_queue_id' => $this->emailQueueId,
            'error' => $exception->getMessage(),
        ]);
    }
}
