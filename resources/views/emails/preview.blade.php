@use('App\Enums\EmailTemplate')
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #eef5f0 0%, #d5e8da 100%);
        }
        .template-btn {
            @apply px-4 py-3 rounded-xl text-left font-medium transition-all duration-200;
        }
        .template-btn.active {
            @apply bg-white shadow-md text-primary-900 border-l-4 border-primary-500;
        }
        .template-btn:not(.active) {
            @apply hover:bg-white/50 text-primary-700;
        }
        .preview-frame {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 96, 57, 0.1);
        }
        .category-title {
            @apply text-xs font-bold text-primary-500 uppercase tracking-wider mb-2 mt-4 first:mt-0;
        }
    </style>
</head>
<body class="min-h-screen">
    <div class="flex h-screen">
        <!-- Sidebar -->
        <div class="w-80 bg-white/80 backdrop-blur-sm border-r border-primary-200 overflow-y-auto flex-shrink-0">
            <div class="p-6 border-b border-primary-100 bg-gradient-to-r from-primary-50 to-accent-50">
                <h1 class="text-xl font-bold text-primary-900">Email Templates</h1>
                <p class="text-sm text-primary-600 mt-1">Preview all {{ count($templates) }} templates</p>
            </div>

            <div class="p-4">
                @php
                    $customerTemplates = array_filter($templates, fn($t) => !$t->isAdminTemplate());
                    $adminTemplates = array_filter($templates, fn($t) => $t->isAdminTemplate());
                @endphp

                <div class="category-title">Customer Emails</div>
                @foreach($customerTemplates as $template)
                    @php
                        $icon = '📋';
                        if ($template === EmailTemplate::EsimDelivery) $icon = '📱';
                        elseif ($template === EmailTemplate::PasswordReset) $icon = '🔐';
                        elseif ($template === EmailTemplate::EmailVerification) $icon = '✉️';
                        elseif ($template === EmailTemplate::Welcome) $icon = '🌍';
                        elseif ($template === EmailTemplate::PaymentFailed || $template === EmailTemplate::OrderFailed) $icon = '⚠️';
                        elseif ($template === EmailTemplate::RefundNotification) $icon = '💰';
                        elseif ($template === EmailTemplate::BalanceTopUp || $template === EmailTemplate::LowBalance) $icon = '💳';
                        elseif ($template === EmailTemplate::TicketCreated || $template === EmailTemplate::TicketReply) $icon = '🎫';
                    @endphp
                    <a href="?template={{ $template->value }}"
                       class="template-btn {{ $selectedTemplate === $template->value ? 'active' : '' }} block mb-1">
                        <div class="flex items-center gap-2">
                            <span class="text-lg">{{ $icon }}</span>
                            <div>
                                <div class="text-sm">{{ $template->label() }}</div>
                                <div class="text-xs text-primary-400">{{ $template->value }}</div>
                            </div>
                        </div>
                    </a>
                @endforeach

                <div class="category-title">Admin Emails</div>
                @foreach($adminTemplates as $template)
                    @php
                        $adminIcon = '👨‍💼';
                        if ($template === EmailTemplate::AdminTicketCreated || $template === EmailTemplate::AdminTicketReply) $adminIcon = '🎫';
                    @endphp
                    <a href="?template={{ $template->value }}"
                       class="template-btn {{ $selectedTemplate === $template->value ? 'active' : '' }} block mb-1">
                        <div class="flex items-center gap-2">
                            <span class="text-lg">{{ $adminIcon }}</span>
                            <div>
                                <div class="text-sm">{{ $template->label() }}</div>
                                <div class="text-xs text-primary-400">{{ $template->value }}</div>
                            </div>
                        </div>
                    </a>
                @endforeach
            </div>
        </div>

        <!-- Preview Area -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Header -->
            <div class="bg-white border-b border-primary-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div>
                    <h2 class="text-lg font-bold text-primary-900">
                        {{ EmailTemplate::tryFrom($selectedTemplate)?->label() ?? 'Template' }}
                    </h2>
                    <p class="text-sm text-primary-500">
                        Priority: {{ EmailTemplate::tryFrom($selectedTemplate)?->priority() ?? 'N/A' }}
                        &bull; Subject: {{ EmailTemplate::tryFrom($selectedTemplate)?->subject() ?? 'N/A' }}
                    </p>
                </div>
                <div class="flex gap-2">
                    <a href="/preview-email/{{ $selectedTemplate }}?standalone=1"
                       target="_blank"
                       class="px-4 py-2 bg-gradient-to-r from-accent-300 via-accent-400 to-accent-300 text-accent-950 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                        Open in New Tab
                    </a>
                    <button onclick="copyLink()"
                            class="px-4 py-2 bg-primary-100 text-primary-700 font-semibold rounded-lg hover:bg-primary-200 transition-all">
                        Copy Link
                    </button>
                </div>
            </div>

            <!-- Iframe Preview -->
            <div class="flex-1 overflow-auto p-6">
                <div class="preview-frame w-full h-full">
                    <iframe src="/preview-email/{{ $selectedTemplate }}"
                            class="w-full h-full border-0 rounded-xl"
                            sandbox="allow-same-origin"></iframe>
                </div>
            </div>
        </div>
    </div>

    <script>
        function copyLink() {
            const url = window.location.origin + '/preview-email/{{ $selectedTemplate }}?standalone=1';
            navigator.clipboard.writeText(url);
            alert('Link copied: ' + url);
        }
    </script>
</body>
</html>
