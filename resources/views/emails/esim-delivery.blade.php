<x-email.layout title="Your eSIM is Ready">
    <x-email.heading>Your eSIM is Ready</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>Your eSIM for <strong>{{ $package->name }}</strong> has been provisioned and is ready to install.</x-email.text>

    {{-- QR Code --}}
    @if($esimProfile->lpa_string)
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0 16px 0;">
            <tr>
                <td align="center">
                    <img src="{{ URL::signedRoute('esim.qr', ['order' => $order->uuid]) }}" alt="QR Code" width="180" height="180" style="display: block; max-width: 180px; height: auto;">
                </td>
            </tr>
            <tr>
                <td align="center" style="padding-top: 12px;">
                    <p style="margin: 0; color: #71717a; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                        Scan with your phone's camera to install
                    </p>
                </td>
            </tr>
        </table>
    @endif

    {{-- Install Buttons --}}
    @php
        $lpaString = $esimProfile->lpa_string;
        $iosDeeplink = $lpaString ? 'https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=' . urlencode($lpaString) : null;
        $androidDeeplink = $lpaString ? 'https://lpa.ds/?' . urlencode(str_replace('LPA:1$', '', $lpaString)) : null;
    @endphp

    @if($iosDeeplink || $androidDeeplink)
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
            <tr>
                <td align="center" style="padding-bottom: 12px;">
                    <p style="margin: 0; color: #71717a; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                        Or install directly on your device
                    </p>
                </td>
            </tr>
            <tr>
                <td align="center">
                    @if($iosDeeplink)
                        <x-email.button :href="$iosDeeplink" variant="secondary">Install on iPhone</x-email.button>
                    @endif
                    @if($androidDeeplink)
                        <x-email.button :href="$androidDeeplink" variant="secondary">Install on Android</x-email.button>
                    @endif
                </td>
            </tr>
        </table>
    @endif

    <x-email.divider />

    {{-- Manual Installation --}}
    <x-email.heading :level="2">Manual Installation</x-email.heading>
    <x-email.text :muted="true">If you can't scan the QR code, enter these details manually in your phone's eSIM settings.</x-email.text>

    <x-email.info-box title="SM-DP+ Address">
        {{ $esimProfile->smdp_address }}
    </x-email.info-box>

    <x-email.info-box title="Activation Code">
        {{ $esimProfile->activation_code }}
    </x-email.info-box>

    @if($esimProfile->lpa_string)
        <x-email.info-box title="LPA String">
            {{ $esimProfile->lpa_string }}
        </x-email.info-box>
    @endif

    <x-email.divider />

    {{-- Setup Steps --}}
    <x-email.heading :level="2">How to Install</x-email.heading>

    <x-email.step number="1" title="Open eSIM Settings">
        <strong>iPhone:</strong> Settings → Cellular → Add eSIM<br>
        <strong>Android:</strong> Settings → Network → SIMs → Add
    </x-email.step>

    <x-email.step number="2" title="Add Your eSIM">
        Scan the QR code above, tap an install button, or enter the details manually.
    </x-email.step>

    <x-email.alert type="warning" title="⚠️ Enable Data Roaming">
        After installing, you <strong>must</strong> turn on Data Roaming for this eSIM. Without it, your eSIM will not connect to any network at your destination. Your validity period starts only when your eSIM first connects to a supported network.
    </x-email.alert>

    <x-email.divider />

    {{-- Order Summary --}}
    <x-email.heading :level="2">Order Details</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Plan" :value="$package->name" />
        <x-email.summary-row label="Data" :value="$package->data_label" />
        <x-email.summary-row label="Validity" :value="$package->validity_label" />
        @if($order->country)
            <x-email.summary-row label="Region" :value="$order->country->name" />
        @endif
        <x-email.summary-row label="Order" :value="'#' . $order->order_number" />
    </x-email.summary>

    <div style="text-align: center; margin: 32px 0 8px 0;">
        <x-email.button :href="config('app.url') . '/order/' . $order->uuid . '/status'" size="lg">View Order Status</x-email.button>
    </div>
</x-email.layout>
