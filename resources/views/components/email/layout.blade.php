@props(['title' => config('app.name')])

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>{{ $title }}</title>
    <style>
        /* Reset & Base */
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #1f2937 !important;
            background-color: #eef5f0 !important;
        }

        /* Force light mode wrapper */
        .email-wrapper {
            width: 100%;
            padding: 32px 16px;
            background-color: #eef5f0 !important;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff !important;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
        }

        /* Header - With explicit solid colors for dark mode compatibility */
        .email-header {
            background-color: #eef5f0 !important;
            background-image:
                radial-gradient(circle at 0% 0%, rgba(186, 230, 253, 0.5) 0px, transparent 50%),
                radial-gradient(circle at 100% 0%, rgba(254, 224, 71, 0.4) 0px, transparent 50%),
                radial-gradient(circle at 100% 100%, rgba(186, 230, 253, 0.3) 0px, transparent 50%),
                radial-gradient(circle at 0% 100%, rgba(254, 224, 71, 0.3) 0px, transparent 50%);
            padding: 0;
            position: relative;
            overflow: hidden;
        }

        /* Floating blurred circles */
        .email-header::before {
            content: '';
            position: absolute;
            top: -40px;
            left: -40px;
            width: 180px;
            height: 180px;
            background: #aad1b6;
            opacity: 0.3;
            border-radius: 50%;
            filter: blur(60px);
            pointer-events: none;
        }
        .email-header::after {
            content: '';
            position: absolute;
            bottom: -30px;
            right: -30px;
            width: 150px;
            height: 150px;
            background: #fef08a;
            opacity: 0.3;
            border-radius: 50%;
            filter: blur(60px);
            pointer-events: none;
        }

        .header-content {
            padding: 42px 40px 38px 40px;
            text-align: center;
            position: relative;
            z-index: 1;
        }

        .email-header .logo {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            text-decoration: none;
        }

        /* Logo container - solid white for dark mode */
        .email-header .logo-wrapper {
            width: 68px;
            height: 68px;
            background: #ffffff !important;
            border: 2px solid #fde047;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 32px rgba(0, 96, 57, 0.12);
            position: relative;
        }

        .email-header .logo-img {
            width: auto;
            height: 40px;
            display: block;
        }

        /* Logo text - solid color for Gmail compatibility */
        .email-header .logo-text {
            font-size: 34px;
            font-weight: 800;
            color: #006039 !important;
            letter-spacing: -1px;
        }

        /* Badge */
        .email-header .logo-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #ffffff !important;
            border: 1px solid #fde047;
            padding: 8px 16px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
            color: #92400e !important;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .email-header .logo-badge-icon {
            width: 16px;
            height: 16px;
            background: linear-gradient(135deg, #fef9c3 0%, #fde047 100%);
            border-radius: 50%;
        }

        /* Body - with explicit colors */
        .email-body {
            padding: 40px;
        }
        .email-body h1 {
            margin: 0 0 16px 0;
            font-size: 28px;
            font-weight: 700;
            color: #1f2937 !important;
        }
        .email-body h2 {
            margin: 24px 0 12px 0;
            font-size: 20px;
            font-weight: 600;
            color: #374151 !important;
        }
        .email-body p {
            margin: 0 0 16px 0;
            color: #4b5563 !important;
        }
        .email-body a {
            color: #006039 !important;
            text-decoration: none;
            font-weight: 500;
        }
        .email-body ul {
            margin: 0 0 16px 0;
            padding-left: 24px;
            color: #4b5563 !important;
        }
        .email-body li {
            margin-bottom: 8px;
            color: #4b5563 !important;
        }

        /* Footer */
        .email-footer {
            background: #fefce8 !important;
            padding: 28px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .email-footer p {
            margin: 0 0 8px 0;
            color: #4b5563 !important;
            font-size: 14px;
        }
        .email-footer a {
            color: #d97706 !important;
            text-decoration: none;
            font-weight: 500;
        }

        /* Utilities */
        .text-center { text-align: center; }
        .text-muted { color: #6b7280 !important; }
        .text-small { font-size: 14px; }
        .mt-4 { margin-top: 24px; }
        .mb-4 { margin-bottom: 24px; }

        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-wrapper { padding: 16px 8px; }
            .header-content { padding: 32px 24px 28px 24px; }
            .email-body { padding: 28px 24px; }
            .email-footer { padding: 24px 20px; }
            .email-body h1 { font-size: 24px; }
            .email-header .logo-wrapper { width: 60px; height: 60px; }
            .email-header .logo-img { height: 34px; }
            .email-header .logo-text { font-size: 28px; }
            .email-header .logo-badge { font-size: 11px; padding: 6px 12px; }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="email-header">
                <div class="header-content">
                    <a href="{{ config('app.url') }}" class="logo">
                        <div class="logo-wrapper">
                            <img src="{{ config('app.url') }}/logo.png" alt="{{ config('app.name') }}" class="logo-img">
                        </div>
                        <span class="logo-text">{{ config('app.name') }}</span>
                        <span class="logo-badge">
                            <span class="logo-badge-icon"></span>
                            Stay Connected, Everywhere
                        </span>
                    </a>
                </div>
            </div>

            <div class="email-body">
                {{ $slot }}
            </div>

            <div class="email-footer">
                <p>Need help? Contact us at <a href="mailto:{{ config('contact.support_email') }}">{{ config('contact.support_email') }}</a></p>
                @if(config('contact.phone'))
                    <p>Or call us at <a href="tel:{{ config('contact.phone') }}">{{ config('app.phone') }}</a></p>
                @endif
                <x-email.divider />
                <p class="text-small">&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
                <p class="text-small text-muted">
                    <a href="{{ config('app.url') }}/terms">Terms of Service</a> &bull;
                    <a href="{{ config('app.url') }}/privacy">Privacy Policy</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
