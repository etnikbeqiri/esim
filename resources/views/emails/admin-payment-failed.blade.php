<x-email.layout title="Payment Failed Alert">
    <x-email.heading>Payment Failed 💳</x-email.heading>

    <x-email.text>A payment has failed for an order on {{ config('app.name') }}.</x-email.text>

    <x-email.alert type="error">
        <strong>Payment for Order #{{ $order->order_number }} has failed.</strong>
    </x-email.alert>

    <x-email.heading :level="2">Payment Details</x-email.heading>

    <x-email.table>
        <x-email.table-row label="Order Number" :value="'#' . $order->order_number" />
        <x-email.table-row label="Customer Email" :value="$customerEmail ?? 'Guest'" />
        <x-email.table-row label="Amount" :value="$currency . number_format($order->amount, 2)" />
        @if($errorCode ?? false)
            <x-email.table-row label="Error Code">
                <code>{{ $errorCode }}</code>
            </x-email.table-row>
        @endif
        @if($errorMessage ?? false)
            <x-email.table-row label="Error Message" :value="$errorMessage" />
        @endif
        <x-email.table-row label="Failed At" :value="now()->format('F j, Y \a\t g:i A')" />
    </x-email.table>

    <x-email.text muted>
        The customer has been notified about the payment failure. No further action is usually required unless the issue persists.
    </x-email.text>

    <div style="text-align: center; margin-top: 24px;">
        <x-email.button :href="config('app.url') . '/admin/orders/' . $order->id">View Order</x-email.button>
    </div>
</x-email.layout>
