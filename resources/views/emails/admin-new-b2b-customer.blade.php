<x-email.layout title="New B2B Customer Registration">
    <x-email.heading>New B2B Customer 🏢</x-email.heading>

    <x-email.text>A new B2B customer has registered on {{ config('app.name') }}.</x-email.text>

    <x-email.alert type="info">
        <strong>New business account created!</strong>
    </x-email.alert>

    <x-email.heading :level="2">Customer Details</x-email.heading>

    <x-email.table>
        <x-email.table-row label="Name" :value="$customerName ?? 'Not provided'" />
        <x-email.table-row label="Email" :value="$customerEmail ?? 'Not provided'" />
        @if($companyName ?? false)
            <x-email.table-row label="Company" :value="$companyName" />
        @endif
        <x-email.table-row label="Registration Date" :value="now()->format('F j, Y \a\t g:i A')" />
    </x-email.table>

    <x-email.heading :level="2">Next Steps</x-email.heading>

    <ul>
        <li>Review the customer's business credentials if required</li>
        <li>Set up any custom pricing or credit limits</li>
        <li>Send a welcome message if needed</li>
    </ul>

    <div style="text-align: center; margin-top: 24px;">
        <x-email.button :href="config('app.url') . '/admin/customers/' . ($customerId ?? '')">View Customer</x-email.button>
    </div>
</x-email.layout>
