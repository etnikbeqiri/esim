@props(['data', 'caption' => null])

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
    <tr>
        <td align="center" style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 24px;">
            @if($caption)
                <p style="margin: 0 0 16px 0; color: #52525b; font-size: 14px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; mso-line-height-rule: exactly;">
                    {{ $caption }}
                </p>
            @endif
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="display: inline-block;">
                <tr>
                    <td style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #e4e4e7;">
                        <img src="{{ $data }}" alt="QR Code" width="160" height="160" style="display: block; max-width: 160px; height: auto;">
                    </td>
                </tr>
            </table>
            <p style="margin: 16px 0 0 0; color: #71717a; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; mso-line-height-rule: exactly;">
                Scan with your phone's camera
            </p>
        </td>
    </tr>
</table>
