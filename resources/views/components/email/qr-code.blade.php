@props(['data', 'caption' => null])

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
    <tr>
        <td align="center" style="padding: 32px 24px; border: 1px solid #e4e4e7; border-radius: 8px;">
            <img src="{{ $data }}" alt="QR Code" width="180" height="180" style="display: block; max-width: 180px; height: auto;">
            @if($caption)
                <p style="margin: 16px 0 0 0; color: #71717a; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; mso-line-height-rule: exactly;">
                    {{ $caption }}
                </p>
            @endif
        </td>
    </tr>
</table>
