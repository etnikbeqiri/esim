<x-email.layout title="Order Issue">
    <x-email.heading>Order Update</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>We regret to inform you that we were unable to complete order #{{ $order->order_number }}. We understand this may cause inconvenience, and we sincerely apologize.</x-email.text>

    <x-email.alert type="error" title="Order Status">
        <strong>Order #{{ $order->order_number }}</strong> could not be processed.
        @if($reason ?? false)
            <br><br>Reason: {{ $reason }}
        @endif
    </x-email.alert>

    <x-email.heading :level="2">Order Reference</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Order Number" :value="'#' . $order->order_number" />
        <x-email.summary-row label="Plan" :value="$package->name" />
        <x-email.summary-row label="Amount" :value="number_format($order->amount, 2) . ' ' . config('invoice.currency')" />
    </x-email.summary>

    @if($isB2B ?? false)
        <x-email.alert type="info" title="Account Credit">
            <strong>Balance Restored:</strong> The amount for this order has been immediately credited back to your account balance.
        </x-email.alert>
    @else
        <x-email.alert type="info" title="Refund Processing">
            <strong>Automatic Refund:</strong> If a payment was processed, the amount will be refunded to your original payment method within 5-10 business days.
        </x-email.alert>
    @endif

    <x-email.heading :level="2">Next Steps</x-email.heading>

    <x-email.step number="1" title="Place a New Order">
        Retry purchasing the same plan, or explore alternative packages.
    </x-email.step>

    <x-email.step number="2" title="Contact Our Team">
        Reach out to our support specialists for personalized assistance.
    </x-email.step>

    <div style="text-align: center; margin-top: 32px;">
        <x-email.button :href="config('app.url') . '/destinations'">Browse Plans</x-email.button>
        <x-email.button :href="config('app.url') . '/help'" variant="secondary">Contact Support</x-email.button>
    </div>
</x-email.layout>
