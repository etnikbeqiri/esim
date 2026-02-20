import { index as invoicesIndex } from '@/actions/App/Http/Controllers/Client/InvoiceController';
import { index as packagesIndex } from '@/actions/App/Http/Controllers/Client/PackageController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTrans } from '@/hooks/use-trans';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type InvoiceViewData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    CreditCard,
    Download,
    FileText,
    Hash,
    Printer,
    Receipt,
    User,
} from 'lucide-react';

function getStatusStyle(color: string): string {
    const colors: Record<string, string> = {
        green: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20',
        blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20',
        gray: 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20',
        red: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
    };
    return colors[color] || colors.gray;
}

export default function InvoiceShow({
    invoice,
    seller,
    buyer,
    currency,
}: InvoiceViewData) {
    const { trans } = useTrans();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: trans('nav.destinations'), href: packagesIndex.url() },
        { title: trans('client_invoices.title'), href: invoicesIndex.url() },
        { title: invoice.invoice_number, href: '#' },
    ];

    const formatCurrency = (amount: number) => {
        return `${currency.symbol}${amount.toFixed(2)}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={trans('client_invoices.details.title', {
                    number: invoice.invoice_number,
                })}
            />
            <div className="mx-auto w-full max-w-4xl space-y-5 p-4 md:space-y-6 md:p-6">
                {/* Back link */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground"
                    asChild
                >
                    <Link href={invoicesIndex.url()}>
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Invoices
                    </Link>
                </Button>

                {/* Invoice header card */}
                <div className="rounded-xl border bg-card">
                    <div className="flex items-center gap-4 p-5 md:p-6">
                        {/* Icon */}
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 md:h-16 md:w-16">
                            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h1 className="truncate text-lg font-semibold md:text-xl">
                                        {invoice.invoice_number}
                                    </h1>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {invoice.type_label}
                                    </p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-lg font-semibold tabular-nums md:text-xl">
                                        {formatCurrency(invoice.total)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    className={`${getStatusStyle(invoice.status_color)} inline-flex items-center gap-1 ring-1 ring-inset`}
                                >
                                    {invoice.status_label}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {invoice.invoice_date}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                    >
                        <a
                            href={`/client/invoices/${invoice.uuid}/download?print=1`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Printer className="mr-1.5 h-3.5 w-3.5" />
                            Print
                        </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <a
                            href={`/client/invoices/${invoice.uuid}/download`}
                            download={`${invoice.invoice_number}.pdf`}
                        >
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            Download PDF
                        </a>
                    </Button>
                </div>

                {/* From / To cards */}
                <div className="grid gap-5 sm:grid-cols-2 md:gap-6">
                    {/* Seller */}
                    <div className="rounded-xl border bg-card">
                        <div className="border-b px-5 py-4">
                            <h2 className="text-base font-semibold">From</h2>
                        </div>
                        <div className="space-y-3 px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                    {seller.company_name}
                                </span>
                            </div>
                            <div className="pl-[26px] text-sm text-muted-foreground">
                                {seller.address && <p>{seller.address}</p>}
                                {(seller.postal_code || seller.city) && (
                                    <p>
                                        {seller.postal_code} {seller.city}
                                    </p>
                                )}
                                {seller.country && <p>{seller.country}</p>}
                                {seller.vat_number && (
                                    <p className="mt-1.5 font-mono text-xs">
                                        VAT: {seller.vat_number}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Buyer */}
                    <div className="rounded-xl border bg-card">
                        <div className="border-b px-5 py-4">
                            <h2 className="text-base font-semibold">Bill To</h2>
                        </div>
                        <div className="space-y-3 px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                    {buyer.company_name || buyer.contact_name}
                                </span>
                            </div>
                            <div className="pl-[26px] text-sm text-muted-foreground">
                                {buyer.contact_name &&
                                    buyer.contact_name !== buyer.company_name && (
                                        <p>{buyer.contact_name}</p>
                                    )}
                                {buyer.address && <p>{buyer.address}</p>}
                                {buyer.email && <p>{buyer.email}</p>}
                                {buyer.vat_number && (
                                    <p className="mt-1.5 font-mono text-xs">
                                        VAT: {buyer.vat_number}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                {invoice.is_statement ? (
                    <div className="rounded-xl border bg-card">
                        <div className="border-b px-5 py-4">
                            <h2 className="text-base font-semibold">
                                Statement
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                                            Date
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                                            Description
                                        </th>
                                        <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                                            Debit
                                        </th>
                                        <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                                            Credit
                                        </th>
                                        <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                                            Balance
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {invoice.line_items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-5 py-3 text-muted-foreground">
                                                {item.date}
                                            </td>
                                            <td className="px-5 py-3">
                                                {item.description}
                                            </td>
                                            <td className="px-5 py-3 text-right tabular-nums">
                                                {item.debit
                                                    ? formatCurrency(item.debit)
                                                    : ''}
                                            </td>
                                            <td className="px-5 py-3 text-right tabular-nums">
                                                {item.credit
                                                    ? formatCurrency(item.credit)
                                                    : ''}
                                            </td>
                                            <td className="px-5 py-3 text-right font-medium tabular-nums">
                                                {item.balance !== undefined
                                                    ? formatCurrency(item.balance)
                                                    : ''}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Statement summary */}
                        {invoice.balance_before !== null &&
                            invoice.balance_after !== null && (
                                <div className="border-t px-5 py-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Opening Balance
                                        </span>
                                        <span className="text-sm font-medium tabular-nums">
                                            {formatCurrency(
                                                invoice.balance_before,
                                            )}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-sm font-semibold">
                                            Closing Balance
                                        </span>
                                        <span className="text-sm font-semibold tabular-nums">
                                            {formatCurrency(
                                                invoice.balance_after,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}
                    </div>
                ) : (
                    <>
                        {/* Regular / Purchase invoice items */}
                        <div className="rounded-xl border bg-card">
                            <div className="border-b px-5 py-4">
                                <h2 className="text-base font-semibold">
                                    Items
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                                                Description
                                            </th>
                                            <th className="w-16 px-5 py-3 text-center text-xs font-medium text-muted-foreground">
                                                Qty
                                            </th>
                                            <th className="w-24 px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                                                Unit Price
                                            </th>
                                            <th className="w-24 px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {invoice.line_items.map(
                                            (item, index) => (
                                                <tr key={index}>
                                                    <td className="px-5 py-3.5">
                                                        <p className="font-medium">
                                                            {item.description}
                                                        </p>
                                                        {item.details && (
                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                {item.details}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center tabular-nums">
                                                        {item.quantity ?? 1}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right tabular-nums">
                                                        {formatCurrency(
                                                            item.unit_price,
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right font-medium tabular-nums">
                                                        {formatCurrency(
                                                            item.total,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="border-t">
                                <div className="flex items-center justify-between px-5 py-3">
                                    <span className="text-sm text-muted-foreground">
                                        Subtotal
                                    </span>
                                    <span className="text-sm tabular-nums">
                                        {formatCurrency(invoice.subtotal)}
                                    </span>
                                </div>
                                {invoice.vat_amount > 0 && (
                                    <div className="flex items-center justify-between border-t px-5 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            VAT ({invoice.vat_rate}%)
                                        </span>
                                        <span className="text-sm tabular-nums">
                                            {formatCurrency(
                                                invoice.vat_amount,
                                            )}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between border-t bg-muted/30 px-5 py-3.5">
                                    <span className="text-sm font-semibold">
                                        Total
                                    </span>
                                    <span className="text-base font-semibold tabular-nums">
                                        {formatCurrency(invoice.total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Balance Info for Top-ups */}
                        {invoice.is_top_up &&
                            invoice.balance_before !== null &&
                            invoice.balance_after !== null && (
                                <div className="rounded-xl border bg-card">
                                    <div className="border-b px-5 py-4">
                                        <h2 className="text-base font-semibold">
                                            Balance Update
                                        </h2>
                                    </div>
                                    <div className="divide-y">
                                        <div className="flex items-center justify-between px-5 py-3.5">
                                            <span className="text-sm text-muted-foreground">
                                                Before
                                            </span>
                                            <span className="text-sm font-medium tabular-nums">
                                                {formatCurrency(
                                                    invoice.balance_before,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between px-5 py-3.5">
                                            <span className="text-sm font-semibold">
                                                After
                                            </span>
                                            <span className="text-sm font-semibold tabular-nums">
                                                {formatCurrency(
                                                    invoice.balance_after,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                    </>
                )}

                {/* Payment & Details card */}
                <div className="rounded-xl border bg-card">
                    <div className="border-b px-5 py-4">
                        <h2 className="text-base font-semibold">Details</h2>
                    </div>
                    <div className="divide-y">
                        <div className="flex items-center justify-between px-5 py-3.5">
                            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Date
                            </div>
                            <span className="text-sm">
                                {invoice.invoice_date}
                            </span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-3.5">
                            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                <Hash className="h-4 w-4" />
                                Invoice Number
                            </div>
                            <span className="font-mono text-sm">
                                {invoice.invoice_number}
                            </span>
                        </div>
                        {invoice.payment_method && (
                            <div className="flex items-center justify-between px-5 py-3.5">
                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                    <CreditCard className="h-4 w-4" />
                                    Payment Method
                                </div>
                                <span className="text-sm font-medium">
                                    {invoice.payment_method}
                                </span>
                            </div>
                        )}
                        {invoice.payment_reference && (
                            <div className="flex items-center justify-between px-5 py-3.5">
                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                    <Receipt className="h-4 w-4" />
                                    Reference
                                </div>
                                <span className="font-mono text-xs font-medium">
                                    {invoice.payment_reference}
                                </span>
                            </div>
                        )}
                        {invoice.paid_at && (
                            <div className="flex items-center justify-between px-5 py-3.5">
                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Paid
                                </div>
                                <span className="text-sm">
                                    {invoice.paid_at}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div className="rounded-xl border bg-card">
                        <div className="border-b px-5 py-4">
                            <h2 className="text-base font-semibold">Notes</h2>
                        </div>
                        <div className="px-5 py-4 text-sm text-muted-foreground">
                            {invoice.notes}
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
