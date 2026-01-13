<x-email.layout title="Verify Email">
    <x-email.heading>Verify Your Email</x-email.heading>

    <x-email.text>Welcome to {{ config('app.name') }},</x-email.text>

    <x-email.text>Thank you for signing up. Please verify your email address to secure your account and receive important updates about your orders.</x-email.text>

    <div style="text-align: center; margin: 32px 0;">
        <x-email.button :href="config('app.url') . '/email/verify/' . ($id ?? '1') . '/' . ($hash ?? 'demo-hash')">Verify Email Address</x-email.button>
    </div>

    <x-email.alert type="info" title="Why Verify?">
        Email verification protects your account and ensures you receive your eSIM delivery emails and receipts.
    </x-email.alert>

    <x-email.heading :level="2">Next Steps</x-email.heading>

    <x-email.step number="1" title="Confirm Email">
        Click the button above to activate your account.
    </x-email.step>

    <x-email.step number="2" title="Find Your Destination">
        Browse eSIM packages for over 190 countries.
    </x-email.step>

    <x-email.step number="3" title="Get Connected">
        Purchase and install your eSIM in minutes.
    </x-email.step>

    <x-email.text muted small center class="mt-4">
        If you didn't create an account, you can safely ignore this email.
    </x-email.text>
</x-email.layout>
