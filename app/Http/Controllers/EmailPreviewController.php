<?php

namespace App\Http\Controllers;

use App\Enums\EmailTemplate;

class EmailPreviewController extends Controller
{
    /**
     * Show the email preview page.
     */
    public function index()
    {
        // Only allow in local/staging environments or for admin users
        if (!app()->environment(['local', 'staging']) && !(auth()->check() && auth()->user()->isAdmin())) {
            abort(403, 'Email preview is only available in local/staging environments or for admin users.');
        }

        $templates = EmailTemplate::cases();

        return view('emails.preview', [
            'templates' => $templates,
            'selectedTemplate' => request()->get('template', EmailTemplate::EsimDelivery->value),
        ]);
    }

    /**
     * Render a specific email template with test data.
     */
    public function preview(string $template)
    {
        // Only allow in local/staging environments or for admin users
        if (!app()->environment(['local', 'staging']) && !(auth()->check() && auth()->user()->isAdmin())) {
            abort(403, 'Email preview is only available in local/staging environments or for admin users.');
        }

        $templateEnum = EmailTemplate::tryFrom($template);

        if (!$templateEnum) {
            abort(404, 'Template not found.');
        }

        $data = $this->getTestData($templateEnum);

        return view($templateEnum->viewName(), $data);
    }

    /**
     * Get test data for each template type.
     */
    protected function getTestData(EmailTemplate $template): array
    {
        $currency = '€';

        // Common objects
        $package = (object) [
            'name' => 'Europe Traveler',
            'data_label' => '10 GB',
            'validity_label' => '30 Days',
            'price' => 29.99,
        ];

        $orderWithCountry = (object) [
            'id' => 1,
            'order_number' => 'ORD-2024-001',
            'uuid' => '550e8400-e29b-41d4-a716-446655440000',
            'amount' => 29.99,
            'created_at' => now(),
            'paid_at' => now(),
            'country' => (object) ['name' => 'France'],
            'status' => (object) ['value' => 'completed'],
        ];

        $orderSimple = (object) [
            'id' => 1,
            'order_number' => 'ORD-2024-001',
            'uuid' => '550e8400-e29b-41d4-a716-446655440000',
            'amount' => 29.99,
        ];

        $esimProfile = (object) [
            'qr_code_data' => $this->generateTestQRCode(),
            'smdp_address' => 'prod-smdp.onesim.net',
            'activation_code' => 'ABCD1EFG2HI3JK4LMN5OP6QR7ST8UV9WX',
            'lpa_string' => 'LPA:1$smdp.example.com$ABCD1EFG2HI3JK4LMN5OP6QR7ST8UV9WX',
        ];

        $payment = (object) [
            'provider' => (object) ['value' => 'stripe'],
            'transaction_id' => 'pi_3NvqxL2eZvKYlo2C1234abcd',
        ];

        return match ($template) {
            EmailTemplate::EsimDelivery => [
                'customerName' => 'John Doe',
                'package' => $package,
                'order' => $orderWithCountry,
                'esimProfile' => $esimProfile,
                'currency' => $currency,
            ],

            EmailTemplate::OrderConfirmation => [
                'customerName' => 'John Doe',
                'order' => $orderWithCountry,
                'package' => $package,
                'currency' => $currency,
            ],

            EmailTemplate::PaymentReceipt => [
                'customerName' => 'John Doe',
                'order' => $orderWithCountry,
                'package' => $package,
                'payment' => $payment,
                'currency' => $currency,
            ],

            EmailTemplate::PaymentFailed => [
                'customerName' => 'John Doe',
                'order' => $orderSimple,
                'package' => $package,
                'reason' => 'Insufficient funds',
                'currency' => $currency,
            ],

            EmailTemplate::OrderFailed => [
                'customerName' => 'John Doe',
                'order' => $orderSimple,
                'package' => $package,
                'reason' => 'Unable to provision eSIM from provider',
                'currency' => $currency,
            ],

            EmailTemplate::RefundNotification => [
                'customerName' => 'John Doe',
                'order' => $orderSimple,
                'refundAmount' => 29.99,
                'currency' => $currency,
            ],

            EmailTemplate::PasswordReset => [
                'customerName' => 'John Doe',
                'token' => 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
                'expires' => '60',
            ],

            EmailTemplate::EmailVerification => [
                'customerName' => 'John Doe',
                'id' => '1',
                'hash' => 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
            ],

            EmailTemplate::Welcome => [
                'customerName' => 'John Doe',
                'isB2B' => false,
            ],

            EmailTemplate::BalanceTopUp => [
                'customerName' => 'John Doe',
                'amount' => 500.00,
                'newBalance' => 1500.00,
                'currency' => $currency,
            ],

            EmailTemplate::LowBalance => [
                'customerName' => 'John Doe',
                'balance' => 45.50,
                'threshold' => 50.00,
                'currency' => $currency,
            ],

            // Admin templates
            EmailTemplate::AdminNewOrder => [
                'order' => $orderWithCountry,
                'package' => $package,
                'customerEmail' => 'john@example.com',
                'customerType' => 'b2c',
                'currency' => $currency,
            ],

            EmailTemplate::AdminOrderFailed => [
                'order' => $orderSimple,
                'package' => $package,
                'customerEmail' => 'john@example.com',
                'reason' => 'Unable to provision eSIM',
                'currency' => $currency,
            ],

            EmailTemplate::AdminPaymentFailed => [
                'order' => $orderSimple,
                'customerEmail' => 'john@example.com',
                'errorCode' => 'card_declined',
                'errorMessage' => 'Insufficient funds',
                'currency' => $currency,
            ],

            EmailTemplate::AdminLowStock => [
                'packageName' => 'Europe Traveler - 10GB',
                'stockCount' => 3,
                'threshold' => 10,
            ],

            EmailTemplate::AdminNewB2BCustomer => [
                'customerName' => 'John Doe',
                'customerEmail' => 'admin@acmecorp.com',
                'companyName' => 'Acme Corp',
                'customerId' => '1',
            ],

            EmailTemplate::AdminBalanceTopUp => [
                'customerName' => 'John Doe',
                'customerEmail' => 'john@example.com',
                'amount' => 500.00,
                'newBalance' => 1500.00,
                'currency' => $currency,
                'customerId' => '1',
            ],

            // Ticket templates
            EmailTemplate::TicketCreated => [
                'customerName' => 'John Doe',
                'ticketReference' => 'TKT-ABC12345',
                'ticketSubject' => 'Issue with my eSIM activation',
                'ticketUrl' => config('app.url') . '/tickets/550e8400-e29b-41d4-a716-446655440000/john@example.com',
            ],

            EmailTemplate::TicketReply => [
                'customerName' => 'John Doe',
                'ticketReference' => 'TKT-ABC12345',
                'ticketSubject' => 'Issue with my eSIM activation',
                'ticketUrl' => config('app.url') . '/tickets/550e8400-e29b-41d4-a716-446655440000/john@example.com',
                'replyPreview' => "Thank you for contacting us. I've looked into your issue and found that your eSIM needs to be re-provisioned. I've initiated the process and you should receive a new QR code within the next few minutes.",
            ],

            EmailTemplate::AdminTicketCreated => [
                'ticketReference' => 'TKT-ABC12345',
                'customerName' => 'John Doe',
                'customerEmail' => 'john@example.com',
                'ticketSubject' => 'Issue with my eSIM activation',
                'ticketPriority' => 'High',
                'ticketMessage' => "Hello,\n\nI purchased an eSIM for France yesterday but I'm having trouble activating it. When I scan the QR code, my phone shows an error message saying 'Unable to add eSIM'.\n\nI've tried restarting my phone and scanning the code again but it still doesn't work. My phone is an iPhone 14 Pro running iOS 17.2.\n\nPlease help me resolve this issue.\n\nThank you,\nJohn",
                'adminTicketUrl' => config('app.url') . '/admin/tickets/550e8400-e29b-41d4-a716-446655440000',
            ],

            EmailTemplate::AdminTicketReply => [
                'ticketReference' => 'TKT-ABC12345',
                'customerName' => 'John Doe',
                'customerEmail' => 'john@example.com',
                'ticketSubject' => 'Issue with my eSIM activation',
                'replyMessage' => "Hi,\n\nThank you for looking into this. I tried the steps you suggested but unfortunately the issue persists.\n\nI've attached a screenshot of the error message I'm seeing. Is there anything else I can try?\n\nThanks,\nJohn",
                'adminTicketUrl' => config('app.url') . '/admin/tickets/550e8400-e29b-41d4-a716-446655440000',
                'assignedTo' => 'Admin User',
            ],
        };
    }

    /**
     * Generate a test QR code for email preview.
     */
    protected function generateTestQRCode(): string
    {
        // Use BaconQrCode which is already installed
        if (class_exists(\BaconQrCode\Writer::class)) {
            // Create a clean, high-contrast QR code style
            // Size: 300px, Margin: 1 (minimal margin to maximize content)
            $style = new \BaconQrCode\Renderer\RendererStyle\RendererStyle(
                300, 
                1
            );
            
            $renderer = new \BaconQrCode\Renderer\ImageRenderer(
                $style,
                new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
            );
            
            $writer = new \BaconQrCode\Writer($renderer);
            $qrCode = $writer->writeString('LPA:1$smdp.example.com$ABCD1EFG2HI3JK4LMN5OP6QR7ST8UV9WX');
            
            return base64_encode($qrCode);
        }

        // Final fallback: Return a placeholder PNG
        return $this->generatePlaceholderQR();
    }

    /**
     * Generate a placeholder QR code image.
     */
    protected function generatePlaceholderQR(): string
    {
        // Create a simple 200x200 PNG with a QR-like pattern
        $size = 200;
        $moduleSize = 10; // Size of each "QR module"
        $modules = $size / $moduleSize;

        $img = imagecreatetruecolor($size, $size);

        // White background
        $white = imagecolorallocate($img, 255, 255, 255);
        imagefill($img, 0, 0, $white);

        // Black/dark color for modules
        $black = imagecolorallocate($img, 0, 96, 57);

        // Create a QR-like pattern
        $pattern = [
            [1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1],
            [1,0,0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0,0,1],
            [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0],
            [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0],
            [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0],
            [1,0,0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0,0,1],
            [1,1,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,1],
            [0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0],
            [1,1,1,1,1,1,1,0,1,1,1,0,1,1,0,1,1,1,1,1],
            [0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0],
            [1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1,1,1,1,1],
            [0,0,0,0,0,0,0,0,1,1,1,0,1,1,0,1,0,1,1,0,1],
            [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1],
            [0,0,0,0,0,0,0,0,1,1,1,0,0,1,0,1,0,1,1,1,1],
            [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,0,1,0,1,1],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1],
            [1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,0],
            [1,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,1,0,0,0,0],
            [1,0,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,1,0],
            [1,0,1,1,1,0,1,0,0,0,0,0,1,1,0,1,0,1,1,1,0],
            [1,0,0,0,0,0,1,0,1,1,1,1,0,1,0,1,0,1,1,1,1],
        ];

        for ($y = 0; $y < count($pattern); $y++) {
            for ($x = 0; $x < count($pattern[$y]); $x++) {
                if ($pattern[$y][$x] === 1) {
                    imagefilledrectangle(
                        $img,
                        $x * $moduleSize,
                        $y * $moduleSize,
                        ($x + 1) * $moduleSize - 1,
                        ($y + 1) * $moduleSize - 1,
                        $black
                    );
                }
            }
        }

        // Convert to base64
        ob_start();
        imagepng($img);
        $imageData = ob_get_clean();
        imagedestroy($img);

        return base64_encode($imageData);
    }
}
