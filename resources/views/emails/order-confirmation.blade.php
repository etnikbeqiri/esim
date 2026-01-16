<x-email.layout title="Order Confirmed">
    <x-email.heading>Order Confirmed</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>Thank you for your purchase. We're pleased to confirm that your order #{{ $order->order_number }} has been received and is currently being processed.</x-email.text>

    <x-email.alert type="success" title="Status Update">
        <strong>Order #{{ $order->order_number }}</strong> has been confirmed and is now entering our provisioning queue.
    </x-email.alert>

    <x-email.heading :level="2">Order Summary</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Plan" :value="$package->name" />
        <x-email.summary-row label="Data Allowance" :value="$package->data_label" />
        <x-email.summary-row label="Plan Duration" :value="$package->validity_label" />
        @if($order->country)
            <x-email.summary-row label="Destination" :value="$order->country->name" />
        @endif
        <x-email.summary-row label="Total Amount" :value="number_format($order->amount, 2) . ' ' . config('invoice.currency')" :bold="true" />
    </x-email.summary>

    <x-email.heading :level="2">What Happens Next</x-email.heading>

    <x-email.step number="1" title="Order Processing">
        Our automated system is currently preparing your eSIM for delivery. This typically takes just a few seconds.
    </x-email.step>

    <x-email.step number="2" title="eSIM Delivery">
        Once provisioned, you will receive a separate email containing your eSIM QR code and installation guide.
    </x-email.step>

    <x-email.step number="3" title="Installation">
        We recommend installing your eSIM before your departure while connected to Wi-Fi for a seamless experience.
    </x-email.step>

    <div style="text-align: center; margin-top: 32px;">
        <x-email.button :href="config('app.url') . '/client/orders'">View Order Details</x-email.button>
    </div>

    <x-email.text muted small center class="mt-4">
        If you have any questions, simply reply to this email or contact our support team.
    </x-email.text>
</x-email.layout>
