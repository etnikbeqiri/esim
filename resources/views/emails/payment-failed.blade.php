<x-email.layout title="Payment Issue">
    <x-email.heading>Payment Failed</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>We were unable to process the payment for your order #{{ $order->order_number }}. This is typically a temporary issue and can often be resolved quickly.</x-email.text>

    <x-email.alert type="error" title="Payment Status">
        <strong>Payment was not successful.</strong>
        @if($reason ?? false)
            <br><br>{{ $reason }}
        @endif
    </x-email.alert>

    <x-email.heading :level="2">Order Details</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Plan" :value="$package->name" />
        <x-email.summary-row label="Amount" :value="number_format($order->amount, 2) . ' ' . config('invoice.currency')" />
    </x-email.summary>

    <x-email.heading :level="2">What to do</x-email.heading>

    <x-email.step number="1" title="Check Payment Method">
        Confirm your card has funds and hasn't expired. Check with your bank for international transaction blocks.
    </x-email.step>

    <x-email.step number="2" title="Retry Purchase">
        You can attempt the purchase again using the same payment method or try a different one.
    </x-email.step>

    <x-email.step number="3" title="Contact Support">
        If the issue persists, our support team is ready to investigate and assist you.
    </x-email.step>

    <div style="text-align: center; margin-top: 32px;">
        <x-email.button :href="config('app.url') . '/destinations'">Try Again</x-email.button>
    </div>

    <x-email.text muted small center class="mt-4">
        If you believe this was sent in error, please contact our support team.
    </x-email.text>
</x-email.layout>
