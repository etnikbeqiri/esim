<x-email.layout title="Payment Failed">
    <x-email.heading>Payment Failed</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>Unfortunately, we were unable to process your payment for order #{{ $order->order_number }}.</x-email.text>

    <x-email.alert type="error">
        <strong>Payment was not successful.</strong>
        @if($reason ?? false)
            <br>Reason: {{ $reason }}
        @endif
    </x-email.alert>

    <x-email.heading :level="2">Order Details</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Package" :value="$package->name" />
        <x-email.summary-row label="Amount" :value="$currency . number_format($order->amount, 2)" />
    </x-email.summary>

    <x-email.heading :level="2">What You Can Do</x-email.heading>

    <x-email.steps>
        <x-email.step number="1" title="Check Your Payment Method">
            Ensure your card has sufficient funds and hasn't expired. Check for any holds or restrictions.
        </x-email.step>

        <x-email.step number="2" title="Try Again">
            You can place a new order with the same or a different payment method.
        </x-email.step>

        <x-email.step number="3" title="Contact Support">
            If the problem persists, our support team is ready to help.
        </x-email.step>
    </x-email.steps>

    <div style="text-align: center; margin-top: 24px;">
        <x-email.button :href="config('app.url') . '/destinations'">Try Again</x-email.button>
    </div>

    <x-email.text muted small center class="mt-4">
        If you believe this is an error, please contact our support team.
    </x-email.text>
</x-email.layout>
