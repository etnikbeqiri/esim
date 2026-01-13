@props(['title' => config('app.name')])

<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>{{ $title }}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset styles */
        body, table, td, p, a, li, h1, h2, h3 { margin: 0; padding: 0; }
        img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        a img { border: none; }
        body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        /* Link styles */
        a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
        /* Button link fix */
        .button-link { text-decoration: none !important; }
    </style>
    <!--[if mso]>
    <style>
        .button-link { text-decoration: none !important; }
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #09090b; background-color: #fafafa;">
    <!--[if mso]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafafa;">
    <tr><td align="center">
    <![endif]-->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafafa;">
        <tr>
            <td align="center" style="padding: 24px 16px;">
                <!--[if mso]>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560">
                <tr><td>
                <![endif]-->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e4e4e7;">
                    <!--[if mso]>
                    <noscript>
                        <xml>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="width:560px;height:100%" arcsize="1.5%" fillcolor="#ffffff" strokecolor="#e4e4e7" strokeweight="1px">
                            <v:textbox inset="0,0,0,0">
                    <![endif]-->
                    <!-- Header -->
                    <tr>
                        <td style="padding: 24px 24px 0 24px; background-color: #ffffff;">
                            <a href="{{ config('app.url') }}" style="text-decoration: none;">
                                <!--[if mso]>
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding-right: 10px;">
                                <![endif]-->
                                <img src="{{ config('app.url') }}/logo.png" alt="{{ config('app.name') }}" width="28" height="28" style="display: inline-block; vertical-align: middle; border-radius: 6px;">
                                <!--[if mso]>
                                    </td>
                                    <td>
                                <![endif]-->
                                <span style="display: inline-block; vertical-align: middle; <!--[if mso]>margin-left: 0;<![endif]--> <!--[if !mso]>margin-left: 10px;<![endif]--> font-size: 16px; font-weight: 600; color: #18181b; letter-spacing: -0.02em;">
                                    {{ config('app.name') }}
                                </span>
                                <!--[if mso]>
                                    </td>
                                </tr>
                                </table>
                                <![endif]-->
                            </a>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding: 24px; color: #52525b;">
                            {{ $slot }}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 24px; background-color: #fafafa; border-top: 1px solid #e4e4e7; text-align: center;">
                            <p style="margin: 0 0 6px 0; color: #71717a; font-size: 13px;">
                                Need help? Contact <a href="mailto:{{ config('contact.support_email') }}" style="color: #27272a; text-decoration: underline;">{{ config('contact.support_email') }}</a>
                            </p>
                            @if(config('contact.phone'))
                                <p style="margin: 0 0 16px 0; color: #71717a; font-size: 13px;">
                                    or call <a href="tel:{{ config('contact.phone') }}" style="color: #27272a; text-decoration: underline;">{{ config('contact.phone') }}</a>
                                </p>
                            @endif
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr><td style="height: 1px; background-color: #e4e4e7;"></td></tr>
                            </table>
                            <p style="margin: 16px 0 6px 0; color: #71717a; font-size: 13px;">&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
                            <p style="margin: 0; color: #71717a; font-size: 13px;">
                                <a href="{{ config('app.url') }}/terms" style="color: #27272a; text-decoration: underline;">Terms</a> ·
                                <a href="{{ config('app.url') }}/privacy" style="color: #27272a; text-decoration: underline;">Privacy</a>
                            </p>
                        </td>
                    </tr>
                    <!--[if mso]>
                            </v:textbox>
                            </v:roundrect>
                        </noscript>
                    <![endif]-->
                </table>
                <!--[if mso]>
                </td></tr>
                </table>
                <![endif]-->
            </td>
        </tr>
    </table>
    <!--[if mso]>
    </td></tr>
    </table>
    <![endif]-->
</body>
</html>
