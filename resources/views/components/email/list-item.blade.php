@props(['title', 'icon' => '✓'])

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
    <tr>
        <td style="width: 20px; vertical-align: top; padding-top: 2px;">
            <span style="color: #18181b; font-size: 14px;">{{ $icon }}</span>
        </td>
        <td style="padding-left: 12px;">
            @if($title)
                <div style="font-weight: 500; color: #18181b; font-size: 14px; margin-bottom: 2px;">
                    {{ $title }}
                </div>
            @endif
            <div style="color: #52525b; font-size: 14px; line-height: 1.5;">
                {{ $slot }}
            </div>
        </td>
    </tr>
</table>
