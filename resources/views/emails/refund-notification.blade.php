<x-email.layout title="Refund Processed">
    <x-email.heading>Refund Processed</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>We want to confirm that your refund request for order #{{ $order->order_number }} has been successfully processed.</x-email.text>

    <x-email.alert type="success" title="Refund Complete">
        <strong>Refund Amount: {{ number_format($refundAmount, 2) }} {{ config('invoice.currency') }}</strong>
    </x-email.alert>

    <x-email.heading :level="2">Refund Summary</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Order Number" :value="'#' . $order->order_number" />
        <x-email.summary-row label="Original Charge" :value="number_format($order->amount, 2) . ' ' . config('invoice.currency')" />
        <x-email.summary-row label="Refund Amount" :value="number_format($refundAmount, 2) . ' ' . config('invoice.currency')" />
        <x-email.summary-row label="Processing Date" :value="now()->format('F j, Y')" />
    </x-email.summary>

    @if($isB2B ?? false)
        <x-email.alert type="info" title="Account Credit">
            <strong>Immediate Credit:</strong> The refunded amount has been instantly credited to your account balance and is available for immediate use on future purchases.
        </x-email.alert>
    @else
        <x-email.alert type="info" title="Processing Timeline">
            <strong>Bank Processing:</strong> The refund will be reflected on your original payment method within 5-10 business days, depending on your bank's processing schedule.
        </x-email.alert>
    @endif

    <x-email.text muted small center class="mt-4">
        If you do not see the refund reflected after 10 business days, please contact your bank first, then reach out to our support team if the issue remains unresolved.
    </x-email.text>

    <div style="text-align: center; margin-top: 32px;">
        <x-email.button :href="config('app.url') . '/help'" variant="outline">Contact Support</x-email.button>
    </div>
</x-email.layout>
