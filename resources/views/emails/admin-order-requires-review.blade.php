<x-email.layout title="ORDER REQUIRES REVIEW - Provider API Error">
    <x-email.heading>Order Requires Admin Review</x-email.heading>

    <x-email.text>A provider API error occurred during eSIM purchase. The order has NOT been retried automatically because the provider may have already processed it. Manual verification is required before taking action.</x-email.text>

    <x-email.alert type="error" title="DO NOT RETRY without checking the provider first">
        <strong>Order #{{ $order->order_number }}</strong> received a provider API error during purchase.
        The eSIM may have already been provisioned on the provider's side despite the error.
        @if($reason ?? false)
            <br><br>Error: {{ $reason }}
        @endif
    </x-email.alert>

    <x-email.heading :level="2">Order Information</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Order Number" :value="'#' . $order->order_number" />
        <x-email.summary-row label="Customer Email" :value="$customerEmail ?? 'Guest'" />
        <x-email.summary-row label="Package" :value="$packageName ?? 'Unknown'" />
        <x-email.summary-row label="Transaction Value" :value="number_format($order->amount, 2) . ' ' . config('invoice.currency')" />
        <x-email.summary-row label="Error Details" :value="$reason ?? 'Unknown error'" />
        <x-email.summary-row label="Error Time" :value="now()->format('F j, Y \a\t g:i A')" />
    </x-email.summary>

    <x-email.heading :level="2">Required Steps</x-email.heading>

    <x-email.step number="1" title="Check Provider Dashboard">
        Log into the provider's dashboard and check if the eSIM was actually provisioned for this order.
    </x-email.step>

    <x-email.step number="2" title="If eSIM WAS provisioned">
        Manually complete the order in the admin panel with the eSIM details from the provider.
    </x-email.step>

    <x-email.step number="3" title="If eSIM was NOT provisioned">
        Click "Retry" in the admin panel to re-attempt the purchase, or "Fail" to cancel and refund.
    </x-email.step>

    <div style="text-align: center; margin-top: 32px;">
        <x-email.button :href="config('app.url') . '/admin/orders/' . $order->uuid">Review Order Now</x-email.button>
    </div>
</x-email.layout>
