<x-email.layout title="Verify Your Email Address">
    <x-email.heading>Verify Your Email Address ✉️</x-email.heading>

    <x-email.text>Welcome to {{ config('app.name') }}!</x-email.text>

    <x-email.text>Thank you for signing up! We're excited to have you on board. Before you can start using your account, we need to verify your email address.</x-email.text>

    <div style="text-align: center; margin: 32px 0;">
        <x-email.button :href="config('app.url') . '/email/verify/' . ($id ?? '1') . '/' . ($hash ?? 'demo-hash')">Verify Email Address</x-email.button>
    </div>

    <x-email.alert type="info">
        <strong>Why verify?</strong> Verifying your email helps us secure your account and ensure you receive important updates about your orders.
    </x-email.alert>

    <x-email.divider />

    <x-email.heading :level="2">What's Next?</x-email.heading>

    <x-email.steps>
        <x-email.step number="1" title="Verify Your Email">
            Click the button above to confirm your email address.
        </x-email.step>

        <x-email.step number="2" title="Browse Destinations">
            Explore eSIM packages for 190+ countries worldwide.
        </x-email.step>

        <x-email.step number="3" title="Get Connected">
            Purchase and receive your eSIM instantly via email.
        </x-email.step>
    </x-email.steps>

    <x-email.text muted small class="mt-4">
        If you didn't create an account with {{ config('app.name') }}, you can safely ignore this email.
    </x-email.text>

    <x-email.text muted small center>
        Need help? Contact us at <a href="mailto:{{ config('contact.support_email') }}">{{ config('contact.support_email') }}</a>
    </x-email.text>
</x-email.layout>
