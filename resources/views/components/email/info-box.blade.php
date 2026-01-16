@props(['title' => null])

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
    <tr>
        <td style="background-color: #f4f4f5; border-radius: 6px; padding: 16px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;">
            @if($title)
                <div style="font-weight: 600; color: #71717a; margin-bottom: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    {{ $title }}
                </div>
            @endif
            <div style="color: #09090b; font-size: 13px; word-break: break-all; line-height: 1.5; mso-line-height-rule: exactly;">
                {{ $slot }}
            </div>
        </td>
    </tr>
</table>
