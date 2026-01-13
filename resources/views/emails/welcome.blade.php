<x-email.layout title="Welcome">
    <x-email.heading>Welcome to {{ config('app.name') }}</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>Welcome to {{ config('app.name') }}! We're delighted to have you join our global community of travelers. Our platform is designed to ensure you stay connected seamlessly, no matter where your journeys take you.</x-email.text>

    @if($isB2B ?? false)
        <x-email.alert type="info">
            <strong>Business Account Activated:</strong> Your corporate account is now active. You have immediate access to wholesale pricing structures and can manage all orders through your dedicated business dashboard.
        </x-email.alert>

        <x-email.heading :level="2">Getting Started</x-email.heading>

        <x-email.step number="1" title="Fund Your Account">
            Add funds to your account balance to begin purchasing eSIMs at our competitive wholesale rates.
        </x-email.step>

        <x-email.step number="2" title="Explore Available Plans">
            Browse our comprehensive catalog of eSIM packages across 190+ destinations worldwide.
        </x-email.step>

        <x-email.step number="3" title="Start Purchasing">
            Place orders instantly with instant provisioning—no payment processing delays affecting your workflow.
        </x-email.step>

        <div style="text-align: center; margin-top: 32px;">
            <x-email.button :href="config('app.url') . '/client/balance'">Fund Your Account</x-email.button>
        </div>
    @else
        <x-email.heading :level="2">Your Journey Begins Here</x-email.heading>

        <x-email.step number="1" title="Choose Your Destination">
            Explore our extensive range of eSIM packages covering over 190 countries and regions globally.
        </x-email.step>

        <x-email.step number="2" title="Select Your Data Plan">
            Choose the data allocation and validity period that best matches your travel requirements.
        </x-email.step>

        <x-email.step number="3" title="Receive Instant Delivery">
            Your eSIM QR code will be delivered to your inbox within seconds of completing your purchase.
        </x-email.step>

        <div style="text-align: center; margin-top: 32px;">
            <x-email.button :href="config('app.url') . '/destinations'">Explore Destinations</x-email.button>
        </div>
    @endif

    <x-email.divider />

    <x-email.heading :level="2">The {{ config('app.name') }} Advantage</x-email.heading>

    <x-email.step number="✓" title="Instant Provisioning">
        Receive your eSIM within seconds of purchase—never wait to get connected.
    </x-email.step>

    <x-email.step number="✓" title="Effortless Setup">
        Activate via QR code scan—no physical SIM cards or technical expertise required.
    </x-email.step>

    <x-email.step number="✓" title="Global Reach">
        Stay connected in over 190 countries with our extensive network partners.
    </x-email.step>

    <x-email.step number="✓" title="Round-the-Clock Support">
        Our multilingual support team is available 24/7 to assist you whenever needed.
    </x-email.step>

    <div style="text-align: center; margin-top: 32px;">
        <x-email.button :href="config('app.url') . '/help'" variant="outline">Help Center</x-email.button>
    </div>
</x-email.layout>
