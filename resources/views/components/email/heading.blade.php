@props(['level' => 1])

@if($level === 1)
    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 600; letter-spacing: -0.02em; color: #18181b; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
        {{ $slot }}
    </h1>
@elseif($level === 2)
    <h2 style="margin: 24px 0 8px 0; font-size: 18px; font-weight: 600; letter-spacing: -0.02em; color: #18181b; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
        {{ $slot }}
    </h2>
@else
    <h3 style="margin: 20px 0 6px 0; font-size: 16px; font-weight: 600; letter-spacing: -0.02em; color: #18181b; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
        {{ $slot }}
    </h3>
@endif
