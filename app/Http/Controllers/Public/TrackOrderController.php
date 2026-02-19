<?php

namespace App\Http\Controllers\Public;

use App\Enums\EmailTemplate;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Mail\TemplatedMail;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class TrackOrderController extends Controller
{
    /**
     * Show the track order form (enter email).
     */
    public function index()
    {
        return Inertia::render('public/track-order');
    }

    /**
     * Send a signed link to the customer's email.
     */
    public function sendLink(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower(trim($validated['email']));

        // Check if any orders exist for this email (don't reveal this to user for privacy)
        $hasOrders = Order::where('customer_email', $email)->exists();

        if ($hasOrders) {
            $signedUrl = URL::temporarySignedRoute(
                'public.track.verify',
                now()->addDays(7),
                ['email' => $email]
            );

            Mail::to($email)->queue(
                new TemplatedMail(
                    template: EmailTemplate::TrackOrder,
                    templateData: [
                        'url' => $signedUrl,
                    ],
                )
            );
        }

        // Always show success (don't reveal if email exists or not)
        return back()->with('success', 'If orders exist for this email, you will receive a link shortly.');
    }

    /**
     * Show all orders for verified email (via signed URL).
     */
    public function verify(Request $request)
    {
        if (! $request->hasValidSignature()) {
            return Inertia::render('public/track-order-expired');
        }

        $email = strtolower(trim($request->query('email', '')));

        $orders = Order::where('customer_email', $email)
            ->with(['package.country', 'esimProfile'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($order) {
                $publicStatus = $order->status === OrderStatus::AdminReview
                    ? OrderStatus::Processing
                    : $order->status;

                return [
                    'uuid' => $order->uuid,
                    'order_number' => $order->order_number,
                    'status' => $publicStatus->value,
                    'status_label' => $publicStatus->label(),
                    'status_color' => $publicStatus->color(),
                    'amount' => $order->amount,
                    'has_esim' => $order->esimProfile !== null,
                    'package' => $order->package ? [
                        'name' => $order->package->name,
                        'data_label' => $order->package->data_label,
                        'validity_label' => $order->package->validity_label,
                        'country' => $order->package->country?->name,
                        'country_iso' => $order->package->country?->iso_code,
                    ] : null,
                    'created_at' => $order->created_at->format('M j, Y H:i'),
                    'completed_at' => $order->completed_at?->format('M j, Y H:i'),
                ];
            });

        return Inertia::render('public/track-order-results', [
            'email' => $email,
            'orders' => $orders,
        ]);
    }
}
