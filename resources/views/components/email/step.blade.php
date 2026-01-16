@props(['number', 'title' => null, 'active' => true])

@php
$isIcon = in_array($number, ['✓', '✔', '✅', '○', '●', '·']);
$opacity = $active ? '1' : '0.5';
@endphp

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; opacity: {{ $opacity }}; filter: alpha(opacity={{ $opacity * 100 }});">
    <tr>
        <td style="width: 32px; vertical-align: top; padding-top: 2px;">
            @if($isIcon)
                <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: #09090b; font-size: 16px;">
                   {{ $number }}
                </div>
            @else
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="width: 24px; height: 24px; background-color: #09090b; color: #ffffff; border-radius: 50%; text-align: center; font-weight: 600; font-size: 12px; line-height: 24px; mso-line-height-rule: exactly; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            {{ $number }}
                        </td>
                    </tr>
                </table>
            @endif
        </td>
        <td style="padding-left: 16px; vertical-align: top;">
            @if($title)
                <div style="font-weight: 600; color: #09090b; margin-bottom: 4px; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    {{ $title }}
                </div>
            @endif
            <div style="color: #71717a; font-size: 14px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
                {{ $slot }}
            </div>
        </td>
    </tr>
</table>
