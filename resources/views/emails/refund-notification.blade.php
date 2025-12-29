<x-email.layout title="Refund Processed">
    <x-email.heading>Refund Processed</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>Your refund for order #{{ $order->order_number }} has been processed.</x-email.text>

    <x-email.alert type="success">
        <strong>Refund Amount: {{ $currency }}{{ number_format($refundAmount, 2) }}</strong>
    </x-email.alert>

    <x-email.heading :level="2">Refund Details</x-email.heading>

    <x-email.table>
        <x-email.table-row label="Order Number" :value="'#' . $order->order_number" />
        <x-email.table-row label="Original Amount" :value="$currency . number_format($order->amount, 2)" />
        <x-email.table-row label="Refund Amount" :value="$currency . number_format($refundAmount, 2)" />
        <x-email.table-row label="Refund Date" :value="now()->format('F j, Y')" />
    </x-email.table>

    @if($isB2B ?? false)
        <x-email.alert type="info">
            <strong>Balance Credit:</strong> The refund has been credited to your account balance immediately.
        </x-email.alert>
    @else
        <x-email.alert type="info">
            <strong>Processing Time:</strong> The refund will appear on your original payment method within 5-10 business days, depending on your bank.
        </x-email.alert>
    @endif

    <x-email.text muted small center class="mt-4">
        If you don't see the refund after 10 business days, please contact your bank or our support team.
    </x-email.text>

    <div style="text-align: center; margin-top: 24px;">
        <x-email.button :href="config('app.url') . '/help'">Contact Support</x-email.button>
    </div>
</x-email.layout>
