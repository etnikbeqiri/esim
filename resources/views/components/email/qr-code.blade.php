@props(['data', 'caption' => null])

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
    <tr>
        <td align="center" style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px; padding: 20px;">
            @if($caption)
                <p style="margin: 0 0 14px 0; color: #52525b; font-size: 14px; font-weight: 500; mso-line-height-rule: exactly;">
                    {{ $caption }}
                </p>
            @endif

            <!--[if mso]>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="display: inline-block;">
                <tr>
                    <td style="background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e4e4e7;">
                        <img src="data:image/png;base64,{{ $data }}" alt="QR Code" width="140" height="140" style="display: block;">
                    </td>
                </tr>
            </table>
            <![endif]-->
            <!--[if !mso]><!-->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="display: inline-block;">
                <tr>
                    <td style="background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e4e4e7;">
                        <img src="data:image/png;base64,{{ $data }}" alt="QR Code" width="140" height="140" style="display: block;">
                    </td>
                </tr>
            </table>
            <!--<![endif]-->

            <p style="margin: 12px 0 0 0; color: #71717a; font-size: 12px; mso-line-height-rule: exactly;">
                Scan with your phone's camera
            </p>
        </td>
    </tr>
</table>
