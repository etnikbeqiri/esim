<x-email.layout title="Welcome!">
    <x-email.heading>Welcome to {{ config('app.name') }}!</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>Thank you for joining us! We're excited to help you stay connected wherever your travels take you.</x-email.text>

    @if($isB2B ?? false)
        <x-email.alert type="info">
            <strong>B2B Account Activated:</strong> Your business account is ready. You can now access wholesale pricing and manage orders through your dashboard.
        </x-email.alert>

        <x-email.heading :level="2">Getting Started</x-email.heading>

        <x-email.step number="1" title="Top Up Your Balance">
            Add funds to your account to start purchasing eSIMs at wholesale prices.
        </x-email.step>

        <x-email.step number="2" title="Browse Available Packages">
            Explore our range of eSIM packages for different countries and data needs.
        </x-email.step>

        <x-email.step number="3" title="Start Ordering">
            Purchase eSIMs instantly from your balance - no payment processing delays.
        </x-email.step>

        <div style="text-align: center; margin-top: 16px;">
            <x-email.button :href="config('app.url') . '/client/balance'">Top Up Balance</x-email.button>
        </div>
    @else
        <x-email.heading :level="2">What's Next?</x-email.heading>

        <x-email.step number="1" title="Choose Your Destination">
            Browse our eSIM packages for over 190+ countries and regions.
        </x-email.step>

        <x-email.step number="2" title="Select a Data Plan">
            Choose the data amount and validity that fits your travel needs.
        </x-email.step>

        <x-email.step number="3" title="Get Instant Delivery">
            Receive your eSIM QR code via email within seconds of purchase.
        </x-email.step>

        <div style="text-align: center; margin-top: 16px;">
            <x-email.button :href="config('app.url') . '/destinations'">Explore Destinations</x-email.button>
        </div>
    @endif

    <x-email.divider />

    <x-email.heading :level="2">Why Choose {{ config('app.name') }}?</x-email.heading>

    <x-email.step number="✓" title="Instant Delivery">
        Get your eSIM in seconds, not days
    </x-email.step>

    <x-email.step number="✓" title="Easy Installation">
        Simple QR code scanning - no physical SIM needed
    </x-email.step>

    <x-email.step number="✓" title="Global Coverage">
        Stay connected in 190+ countries
    </x-email.step>

    <x-email.step number="✓" title="24/7 Support">
        Our team is always here to help
    </x-email.step>

    <x-email.text muted small center>
        Questions? Reply to this email or visit our <a href="{{ config('app.url') }}/help" style="color: #27272a;">Help Center</a>.
    </x-email.text>
</x-email.layout>
