<x-email.layout title="Order Confirmation">
    <x-email.heading>Order Confirmed</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>Thank you for your order! We've received your payment and are now processing your eSIM.</x-email.text>

    <x-email.alert type="success">
        <strong>Order #{{ $order->order_number }}</strong> has been confirmed and is being processed.
    </x-email.alert>

    <x-email.heading :level="2">Order Details</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Package" :value="$package->name" />
        <x-email.summary-row label="Data" :value="$package->data_label" />
        <x-email.summary-row label="Validity" :value="$package->validity_label" />
        @if($order->country)
            <x-email.summary-row label="Destination" :value="$order->country->name" />
        @endif
        <x-email.summary-row label="Total Paid" :value="$currency . number_format($order->amount, 2)" :bold="true" />
    </x-email.summary>

    <x-email.heading :level="2">What's Next?</x-email.heading>

    <x-email.step number="1" title="We Process Your Order">
        Our system is preparing your eSIM. This usually takes just a few seconds.
    </x-email.step>

    <x-email.step number="2" title="You'll Receive Your eSIM">
        You'll receive another email with your eSIM QR code and installation instructions.
    </x-email.step>

    <x-email.step number="3" title="Install Before Your Trip">
        Install the eSIM while connected to WiFi. You can do this before you travel.
    </x-email.step>

    <div style="text-align: center; margin-top: 16px;">
        <x-email.button :href="config('app.url') . '/client/orders'">View Your Orders</x-email.button>
    </div>

    <x-email.text muted small center>
        If you have any questions, our support team is here to help.
    </x-email.text>
</x-email.layout>
