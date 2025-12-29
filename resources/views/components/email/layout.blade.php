@props(['title' => config('app.name')])

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ $title }}</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #f4f4f5;
        }
        .email-wrapper {
            width: 100%;
            background-color: #f4f4f5;
            padding: 40px 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .email-header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            padding: 32px 40px;
            text-align: center;
        }
        .email-header .logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: #ffffff;
            text-decoration: none;
        }
        .email-header .logo-icon {
            width: 40px;
            height: 40px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .email-header .logo-text {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
        }
        .email-body {
            padding: 40px;
        }
        .email-body h1 {
            margin: 0 0 16px 0;
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a;
        }
        .email-body h2 {
            margin: 24px 0 12px 0;
            font-size: 20px;
            font-weight: 600;
            color: #1a1a1a;
        }
        .email-body p {
            margin: 0 0 16px 0;
            color: #4a4a4a;
        }
        .email-body a {
            color: #6366f1;
            text-decoration: none;
        }
        .email-body ul {
            margin: 0 0 16px 0;
            padding-left: 24px;
            color: #4a4a4a;
        }
        .email-body li {
            margin-bottom: 8px;
        }
        .email-footer {
            background-color: #f8fafc;
            padding: 32px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .email-footer p {
            margin: 0 0 8px 0;
            color: #64748b;
            font-size: 14px;
        }
        .email-footer a {
            color: #6366f1;
            text-decoration: none;
        }
        .text-center { text-align: center; }
        .text-muted { color: #64748b; }
        .text-small { font-size: 14px; }
        .mt-4 { margin-top: 24px; }
        .mb-4 { margin-bottom: 24px; }
        @media only screen and (max-width: 600px) {
            .email-wrapper { padding: 20px 10px; }
            .email-header, .email-body, .email-footer { padding: 24px 20px; }
            .email-body h1 { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="email-header">
                <a href="{{ config('app.url') }}" class="logo">
                    <span class="logo-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
                            <path d="M2 12H22M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22C9.5 19.5 8 16 8 12C8 8 9.5 4.5 12 2Z" stroke="white" stroke-width="2"/>
                        </svg>
                    </span>
                    <span class="logo-text">{{ config('app.name') }}</span>
                </a>
            </div>

            <div class="email-body">
                {{ $slot }}
            </div>

            <div class="email-footer">
                <p>Need help? Contact us at <a href="mailto:{{ config('contact.support_email') }}">{{ config('contact.support_email') }}</a></p>
                @if(config('contact.phone'))
                    <p>Or call us at <a href="tel:{{ config('contact.phone') }}">{{ config('contact.phone') }}</a></p>
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
