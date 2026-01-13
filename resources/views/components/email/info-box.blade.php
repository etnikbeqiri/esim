@props(['title' => null])

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
    <tr>
        <td style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px; padding: 14px;">
            @if($title)
                <div style="font-weight: 600; color: #18181b; margin-bottom: 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
                    {{ $title }}
                </div>
            @endif
            <div style="color: #52525b; font-family: 'SF Mono', 'Monaco', 'Courier New', 'Consolas', monospace; font-size: 13px; word-break: break-all; line-height: 1.5; mso-line-height-rule: exactly;">
                {{ $slot }}
            </div>
        </td>
    </tr>
</table>
