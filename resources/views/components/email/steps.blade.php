@props(['title' => null])

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
    @if($title)
        <tr>
            <td style="padding-bottom: 12px;">
                <x-email.heading :level="2">{{ $title }}</x-email.heading>
            </td>
        </tr>
    @endif
    <tr>
        <td>
            {{ $slot }}
        </td>
    </tr>
</table>
