@props(['number', 'title' => null])

@php
$isIcon = in_array($number, ['✓', '✔', '✅']);
@endphp

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
    <tr>
        <td style="width: 24px; vertical-align: top; padding-top: 1px;">
            @if($isIcon)
                <span style="color: #18181b; font-size: 16px; display: inline-block; width: 20px;">{{ $number }}</span>
            @else
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="width: 22px; height: 22px; background-color: #18181b; color: #ffffff; border-radius: 4px; text-align: center; font-weight: 600; font-size: 12px; line-height: 22px; mso-line-height-rule: exactly;">
                            {{ $number }}
                        </td>
                    </tr>
                </table>
            @endif
        </td>
        <td style="padding-left: 12px;">
            @if($title)
                <div style="font-weight: 600; color: #18181b; margin-bottom: 4px; font-size: 14px;">
                    {{ $title }}
                </div>
            @endif
            <div style="color: #52525b; font-size: 14px; line-height: 1.5; mso-line-height-rule: exactly;">
                {{ $slot }}
            </div>
        </td>
    </tr>
</table>
