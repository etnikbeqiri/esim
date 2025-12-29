<x-email.layout title="Order Could Not Be Completed">
    <x-email.heading>We're Sorry</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>Unfortunately, we were unable to complete your order #{{ $order->order_number }}.</x-email.text>

    <x-email.alert type="error">
        <strong>Order could not be processed.</strong>
        @if($reason ?? false)
            <br>Reason: {{ $reason }}
        @endif
    </x-email.alert>

    <x-email.heading :level="2">Order Details</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Order Number" :value="'#' . $order->order_number" />
        <x-email.summary-row label="Package" :value="$package->name" />
        <x-email.summary-row label="Amount" :value="$currency . number_format($order->amount, 2)" />
    </x-email.summary>

    @if($isB2B ?? false)
        <x-email.alert type="info">
            <strong>Balance Refunded:</strong> Your account balance has been restored for this order.
        </x-email.alert>
    @else
        <x-email.alert type="info">
            <strong>Refund Processing:</strong> If you were charged, your payment will be refunded within 5-10 business days.
        </x-email.alert>
    @endif

    <x-email.heading :level="2">What's Next?</x-email.heading>

    <x-email.text>We sincerely apologize for the inconvenience. You can:</x-email.text>

    <ul>
        <li>Try placing a new order for the same package</li>
        <li>Choose a different package or destination</li>
        <li>Contact our support team for assistance</li>
    </ul>

    <div style="text-align: center; margin-top: 24px;">
        <x-email.button :href="config('app.url') . '/destinations'">Browse Packages</x-email.button>
        <x-email.button :href="config('app.url') . '/help'" variant="secondary">Get Help</x-email.button>
    </div>
</x-email.layout>
