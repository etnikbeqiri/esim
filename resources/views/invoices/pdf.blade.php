<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $invoice->invoice_number }}</title>
    <style>
        @page {
            margin: 0;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: sans-serif;
            font-size: 10px;
            line-height: 1.5;
            color: #09090b;
            padding: 48px;
            background: #fff;
        }

        /* Header */
        .header {
            display: table;
            width: 100%;
            margin-bottom: 48px;
        }
        .header-left {
            display: table-cell;
            vertical-align: top;
            width: 50%;
        }
        .header-right {
            display: table-cell;
            vertical-align: top;
            width: 50%;
            text-align: right;
        }
        .company-name {
            font-size: 20px;
            font-weight: 600;
            letter-spacing: -0.025em;
            color: #09090b;
        }
        .invoice-type {
            font-size: 11px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #71717a;
            margin-bottom: 4px;
        }
        .invoice-number {
            font-size: 24px;
            font-weight: 600;
            letter-spacing: -0.025em;
            color: #09090b;
        }
        .invoice-date {
            font-size: 11px;
            color: #71717a;
            margin-top: 4px;
        }

        /* Parties */
        .parties {
            display: table;
            width: 100%;
            margin-bottom: 40px;
        }
        .party {
            display: table-cell;
            vertical-align: top;
            width: 48%;
        }
        .party-spacer {
            display: table-cell;
            width: 4%;
        }
        .party-label {
            font-size: 10px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #71717a;
            margin-bottom: 8px;
        }
        .party-name {
            font-size: 13px;
            font-weight: 600;
            color: #09090b;
            margin-bottom: 4px;
        }
        .party-detail {
            font-size: 11px;
            color: #52525b;
            line-height: 1.6;
        }

        /* Tables */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }
        .items-table th {
            text-align: left;
            padding: 12px 0;
            font-size: 10px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #71717a;
            border-bottom: 1px solid #e4e4e7;
        }
        .items-table th.amount {
            text-align: right;
        }
        .items-table td {
            padding: 14px 0;
            border-bottom: 1px solid #f4f4f5;
            vertical-align: top;
            font-size: 11px;
            color: #09090b;
        }
        .items-table td.amount {
            text-align: right;
            font-variant-numeric: tabular-nums;
        }
        .item-description {
            font-weight: 500;
        }
        .item-details {
            font-size: 10px;
            color: #71717a;
            margin-top: 2px;
        }

        /* Statement Table */
        .statement-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            font-size: 10px;
        }
        .statement-table th {
            text-align: left;
            padding: 10px 0;
            font-size: 9px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #71717a;
            border-bottom: 1px solid #e4e4e7;
        }
        .statement-table th.amount {
            text-align: right;
        }
        .statement-table td {
            padding: 10px 0;
            border-bottom: 1px solid #f4f4f5;
            font-variant-numeric: tabular-nums;
        }
        .statement-table td.amount {
            text-align: right;
        }
        .statement-table td.debit {
            color: #09090b;
        }
        .statement-table td.credit {
            color: #09090b;
        }

        /* Totals */
        .totals-wrapper {
            display: table;
            width: 100%;
            margin-bottom: 32px;
        }
        .totals-spacer {
            display: table-cell;
            width: 60%;
        }
        .totals {
            display: table-cell;
            width: 40%;
        }
        .totals-row {
            display: table;
            width: 100%;
            margin-bottom: 8px;
        }
        .totals-label {
            display: table-cell;
            text-align: right;
            padding-right: 16px;
            font-size: 11px;
            color: #71717a;
        }
        .totals-value {
            display: table-cell;
            text-align: right;
            font-size: 11px;
            font-weight: 500;
            font-variant-numeric: tabular-nums;
            width: 100px;
        }
        .totals-total {
            border-top: 1px solid #e4e4e7;
            padding-top: 12px;
            margin-top: 8px;
        }
        .totals-total .totals-label {
            font-size: 12px;
            font-weight: 600;
            color: #09090b;
        }
        .totals-total .totals-value {
            font-size: 14px;
            font-weight: 600;
        }

        /* Balance Info */
        .balance-info {
            border: 1px solid #e4e4e7;
            padding: 16px;
            margin-bottom: 24px;
        }
        .balance-info-title {
            font-size: 11px;
            font-weight: 600;
            color: #09090b;
            margin-bottom: 12px;
        }
        .balance-info-row {
            display: table;
            width: 100%;
            margin-bottom: 6px;
        }
        .balance-info-label {
            display: table-cell;
            font-size: 11px;
            color: #71717a;
            width: 120px;
        }
        .balance-info-value {
            display: table-cell;
            font-size: 11px;
            font-weight: 500;
            font-variant-numeric: tabular-nums;
        }

        /* Payment Info */
        .payment-info {
            border-top: 1px solid #e4e4e7;
            padding-top: 20px;
            margin-top: 20px;
        }
        .payment-info-title {
            font-size: 11px;
            font-weight: 600;
            color: #09090b;
            margin-bottom: 12px;
        }
        .payment-row {
            margin-bottom: 6px;
        }
        .payment-label {
            font-size: 11px;
            color: #71717a;
            display: inline-block;
            width: 80px;
        }
        .payment-value {
            font-size: 11px;
            font-weight: 500;
        }

        /* Notes */
        .notes {
            border: 1px solid #e4e4e7;
            padding: 16px;
            margin-top: 20px;
        }
        .notes-title {
            font-size: 10px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #71717a;
            margin-bottom: 8px;
        }
        .notes-content {
            font-size: 11px;
            color: #52525b;
        }

        /* Footer */
        .footer {
            position: fixed;
            bottom: 32px;
            left: 48px;
            right: 48px;
            text-align: center;
            padding-top: 16px;
            border-top: 1px solid #e4e4e7;
        }
        .footer-text {
            font-size: 9px;
            color: #a1a1aa;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="header-left">
            <div class="company-name">{{ $seller['company_name'] ?? config('app.name') }}</div>
        </div>
        <div class="header-right">
            <div class="invoice-type">{{ $invoice->type->label() }}</div>
            <div class="invoice-number">{{ $invoice->invoice_number }}</div>
            <div class="invoice-date">{{ $invoice->invoice_date->format('F j, Y') }}</div>
        </div>
    </div>

    <!-- Parties -->
    <div class="parties">
        <div class="party">
            <div class="party-label">From</div>
            <div class="party-name">{{ $seller['company_name'] ?? '' }}</div>
            <div class="party-detail">
                @if($seller['address'] ?? false){{ $seller['address'] }}<br>@endif
                @if(($seller['postal_code'] ?? false) || ($seller['city'] ?? false)){{ $seller['postal_code'] ?? '' }} {{ $seller['city'] ?? '' }}<br>@endif
                @if($seller['country'] ?? false){{ $seller['country'] }}<br>@endif
                @if($seller['vat_number'] ?? false)VAT: {{ $seller['vat_number'] }}<br>@endif
                @if($seller['email'] ?? false){{ $seller['email'] }}@endif
            </div>
        </div>
        <div class="party-spacer"></div>
        <div class="party">
            <div class="party-label">Bill To</div>
            <div class="party-name">{{ $buyer['company_name'] ?? $buyer['contact_name'] ?? '' }}</div>
            <div class="party-detail">
                @if(($buyer['contact_name'] ?? false) && ($buyer['contact_name'] !== ($buyer['company_name'] ?? '')))Attn: {{ $buyer['contact_name'] }}<br>@endif
                @if($buyer['address'] ?? false){{ $buyer['address'] }}<br>@endif
                @if($buyer['email'] ?? false){{ $buyer['email'] }}<br>@endif
                @if($buyer['vat_number'] ?? false)VAT: {{ $buyer['vat_number'] }}@endif
            </div>
        </div>
    </div>

    @if($invoice->isStatement())
        <!-- Statement Table -->
        <table class="statement-table">
            <thead>
                <tr>
                    <th style="width: 80px;">Date</th>
                    <th>Description</th>
                    <th class="amount" style="width: 80px;">Debit</th>
                    <th class="amount" style="width: 80px;">Credit</th>
                    <th class="amount" style="width: 90px;">Balance</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->line_items as $item)
                    <tr>
                        <td>{{ $item['date'] }}</td>
                        <td>{{ $item['description'] }}</td>
                        <td class="amount debit">
                            @if($item['debit'] ?? false){{ $currency->symbol }}{{ number_format($item['debit'], 2) }}@endif
                        </td>
                        <td class="amount credit">
                            @if($item['credit'] ?? false){{ $currency->symbol }}{{ number_format($item['credit'], 2) }}@endif
                        </td>
                        <td class="amount">{{ $currency->symbol }}{{ number_format($item['balance'], 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Statement Summary -->
        <div class="balance-info">
            <div class="balance-info-title">Account Summary</div>
            <div class="balance-info-row">
                <div class="balance-info-label">Opening Balance</div>
                <div class="balance-info-value">{{ $currency->symbol }}{{ number_format($invoice->balance_before ?? 0, 2) }}</div>
            </div>
            <div class="balance-info-row">
                <div class="balance-info-label">Total Credits</div>
                <div class="balance-info-value">{{ $currency->symbol }}{{ number_format($invoice->metadata['total_credits'] ?? 0, 2) }}</div>
            </div>
            <div class="balance-info-row">
                <div class="balance-info-label">Total Debits</div>
                <div class="balance-info-value">{{ $currency->symbol }}{{ number_format($invoice->metadata['total_debits'] ?? 0, 2) }}</div>
            </div>
            <div class="balance-info-row">
                <div class="balance-info-label">Closing Balance</div>
                <div class="balance-info-value">{{ $currency->symbol }}{{ number_format($invoice->balance_after ?? 0, 2) }}</div>
            </div>
        </div>
    @else
        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="width: 60px;">Qty</th>
                    <th class="amount" style="width: 90px;">Unit Price</th>
                    <th class="amount" style="width: 90px;">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->line_items as $item)
                    <tr>
                        <td>
                            <div class="item-description">{{ $item['description'] }}</div>
                            @if($item['details'] ?? false)
                                <div class="item-details">{{ $item['details'] }}</div>
                            @endif
                        </td>
                        <td>{{ $item['quantity'] ?? 1 }}</td>
                        <td class="amount">{{ $currency->symbol }}{{ number_format($item['unit_price'], 2) }}</td>
                        <td class="amount">{{ $currency->symbol }}{{ number_format($item['total'], 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-wrapper">
            <div class="totals-spacer"></div>
            <div class="totals">
                <div class="totals-row">
                    <div class="totals-label">Subtotal</div>
                    <div class="totals-value">{{ $currency->symbol }}{{ number_format($invoice->subtotal, 2) }}</div>
                </div>
                @if($invoice->vat_amount > 0)
                    <div class="totals-row">
                        <div class="totals-label">VAT ({{ number_format($invoice->vat_rate, 0) }}%)</div>
                        <div class="totals-value">{{ $currency->symbol }}{{ number_format($invoice->vat_amount, 2) }}</div>
                    </div>
                @endif
                <div class="totals-row totals-total">
                    <div class="totals-label">Total</div>
                    <div class="totals-value">{{ $currency->symbol }}{{ number_format($invoice->total, 2) }}</div>
                </div>
            </div>
        </div>

        @if($invoice->isTopUp())
            <div class="balance-info">
                <div class="balance-info-title">Balance Update</div>
                <div class="balance-info-row">
                    <div class="balance-info-label">Balance Before</div>
                    <div class="balance-info-value">{{ $currency->symbol }}{{ number_format($invoice->balance_before ?? 0, 2) }}</div>
                </div>
                <div class="balance-info-row">
                    <div class="balance-info-label">Balance After</div>
                    <div class="balance-info-value">{{ $currency->symbol }}{{ number_format($invoice->balance_after ?? 0, 2) }}</div>
                </div>
            </div>
        @endif
    @endif

    @if($invoice->payment_method || $invoice->payment_reference)
        <div class="payment-info">
            <div class="payment-info-title">Payment</div>
            @if($invoice->payment_method)
                <div class="payment-row">
                    <span class="payment-label">Method</span>
                    <span class="payment-value">{{ $invoice->payment_method }}</span>
                </div>
            @endif
            @if($invoice->payment_reference)
                <div class="payment-row">
                    <span class="payment-label">Reference</span>
                    <span class="payment-value">{{ $invoice->payment_reference }}</span>
                </div>
            @endif
            <div class="payment-row">
                <span class="payment-label">Status</span>
                <span class="payment-value">{{ $invoice->status->label() }}</span>
            </div>
        </div>
    @endif

    @if($invoice->notes)
        <div class="notes">
            <div class="notes-title">Notes</div>
            <div class="notes-content">{{ $invoice->notes }}</div>
        </div>
    @endif

    <div class="footer">
        <div class="footer-text">
            {{ $seller['company_name'] ?? config('app.name') }}
            @if($seller['registration_number'] ?? false) &middot; Reg: {{ $seller['registration_number'] }}@endif
            @if($seller['vat_number'] ?? false) &middot; VAT: {{ $seller['vat_number'] }}@endif
        </div>
    </div>
</body>
</html>
