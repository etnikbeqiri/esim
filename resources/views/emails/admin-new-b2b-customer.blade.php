<x-email.layout title="New B2B Customer Registration">
    <x-email.heading>New Business Customer</x-email.heading>

    <x-email.text>A new B2B account has been registered on {{ config('app.name') }}. Please review the business details and complete any required onboarding steps.</x-email.text>

    <x-email.alert type="info" title="New Registration">
        <strong>New business account created</strong>
    </x-email.alert>

    <x-email.heading :level="2">Customer Information</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Account Name" :value="$customerName ?? 'Not provided'" />
        <x-email.summary-row label="Email Address" :value="$customerEmail ?? 'Not provided'" />
        @if($companyName ?? false)
            <x-email.summary-row label="Company Name" :value="$companyName" />
        @endif
        <x-email.summary-row label="Registration Date" :value="now()->format('F j, Y \a\t g:i A')" />
    </x-email.summary>

    <x-email.heading :level="2">Recommended Actions</x-email.heading>

    <x-email.step number="1" title="Verify Business Credentials">
        Review any submitted business documentation if applicable to your verification process.
    </x-email.step>

    <x-email.step number="2" title="Configure Pricing Structure">
        Set up any custom pricing tiers or credit limits as per your B2B agreements.
    </x-email.step>

    <x-email.step number="3" title="Send Welcome Communication">
        Consider sending a personalized welcome message with account onboarding resources.
    </x-email.step>

    <div style="text-align: center; margin-top: 24px;">
        <x-email.button :href="config('app.url') . '/admin/customers/' . ($customerId ?? '')">View Customer Profile</x-email.button>
    </div>
</x-email.layout>
