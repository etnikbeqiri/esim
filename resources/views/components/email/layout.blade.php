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
                <o:AllowPNG/>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Base Reset */
        body, table, td, p, a, li, h1, h2, h3, h4, h5, h6 { margin: 0; padding: 0; }
        table, td { border-collapse: collapse; border-spacing: 0; }
        img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; max-width: 100%; height: auto; }
        a { text-decoration: none; color: inherit; }
        body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        
        /* Font Family - Geist / Inter approximation */
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        }

        /* Utilities */
        .w-full { width: 100%; }
        .max-w-600 { max-width: 600px; }
        .bg-background { background-color: #ffffff; }
        .text-foreground { color: #09090b; }
        .text-muted-foreground { color: #71717a; }
        
        /* Link styles */
        a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
        
        /* Responsive */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .p-4 { padding: 16px !important; }
            .p-6 { padding: 24px !important; }
            .px-6 { padding-left: 24px !important; padding-right: 24px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; color: #09090b; font-size: 14px; line-height: 1.5;">
    <!-- Preview text -->
    <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
        {{ $slot }}&nbsp;&zwnj;&nbsp;&nbsp;
    </div>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff;">
        <tr>
            <td align="center" style="padding: 40px 16px;">
                <!-- Container -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;">
                    <!-- Logo/Header -->
                    <tr>
                        <td align="left" style="padding-bottom: 32px;">
                            <a href="{{ config('app.url') }}" style="text-decoration: none; display: inline-block;">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="vertical-align: middle; padding-right: 12px;">
                                            <img src="{{ asset('logo.png') }}" alt="{{ config('app.name') }}" width="32" height="32" style="display: block; border-radius: 6px; width: 32px; height: 32px; object-fit: contain;">
                                        </td>
                                        <td style="vertical-align: middle;">
                                            <span style="font-size: 16px; font-weight: 600; color: #09090b; letter-spacing: -0.025em;">
                                                {{ config('app.name') }}
                                            </span>
                                        </td>
                                    </tr>
                                </table>
                            </a>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="color: #09090b;">
                            {{ $slot }}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding-top: 32px; border-top: 1px solid #e4e4e7; margin-top: 32px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="color: #71717a; font-size: 12px; line-height: 20px; text-align: center;">
                                        <p style="margin: 0 0 16px 0;">
                                            &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                                        </p>
                                        <p style="margin: 0 0 16px 0;">
                                            <a href="{{ config('app.url') }}/privacy" target="_blank" style="color: #71717a; text-decoration: none;">Privacy</a>
                                            &nbsp;&nbsp;&middot;&nbsp;&nbsp;
                                            <a href="{{ config('app.url') }}/terms" target="_blank" style="color: #71717a; text-decoration: none;">Terms</a>
                                            &nbsp;&nbsp;&middot;&nbsp;&nbsp;
                                            <a href="{{ config('app.url') }}/help" target="_blank" style="color: #71717a; text-decoration: none;">Contact Support</a>
                                        </p>
                                        <p style="margin: 0; font-size: 11px; color: #a1a1aa;">
                                            You are receiving this email because it contains important updates regarding your {{ config('app.name') }} account. 
                                            <br>
                                            <a href="{{ config('app.url') }}/settings/profile" target="_blank" style="color: #71717a; text-decoration: underline;">Manage Notification Preferences</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>