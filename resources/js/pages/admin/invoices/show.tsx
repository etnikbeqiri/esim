import { index as invoicesIndex, voidMethod as invoiceVoid } from '@/actions/App/Http/Controllers/Admin/InvoiceController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type InvoiceViewData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Ban, Download, ExternalLink, Printer } from 'lucide-react';

interface Props extends InvoiceViewData {
    order: {
        id: number;
        uuid: string;
        order_number: string;
    } | null;
    customer: {
        id: number;
        company_name: string | null;
        user: { name: string; email: string } | null;
    } | null;
    defaultCurrency: {
        id: number;
        code: string;
        symbol: string;
    } | null;
}

export default function InvoiceShow({
    invoice,
    seller,
    buyer,
    currency,
    order,
    customer,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Invoices', href: invoicesIndex.url() },
        {
            title: invoice.invoice_number,
            href: `/admin/invoices/${invoice.uuid}`,
        },
    ];

    const formatCurrency = (amount: number) => {
        return `${currency.symbol}${amount.toFixed(2)}`;
    };

    const canVoid = invoice.status !== 'voided';

    function handleVoid() {
        if (
            !confirm(
                'Are you sure you want to void this invoice? This action cannot be undone.',
            )
        ) {
            return;
        }
        router.post(invoiceVoid.url(invoice.uuid));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Invoice ${invoice.invoice_number}`} />
            <div className="flex flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={invoicesIndex.url()}>
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {invoice.invoice_number}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {invoice.type_label}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {canVoid && (
                            <Button variant="outline" onClick={handleVoid}>
                                <Ban className="mr-2 h-4 w-4" />
                                Void
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => window.print()}
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button variant="outline" asChild>
                            <a
                                href={`/admin/invoices/${invoice.uuid}/download`}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Quick Links */}
                {(customer || order) && (
                    <div className="flex flex-wrap gap-3">
                        {customer && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/customers/${customer.id}`}>
                                    <ExternalLink className="mr-2 h-3 w-3" />
                                    {customer.company_name ||
                                        customer.user?.name}
                                </Link>
                            </Button>
                        )}
                        {order && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/orders/${order.uuid}`}>
                                    <ExternalLink className="mr-2 h-3 w-3" />
                                    {order.order_number}
                                </Link>
                            </Button>
                        )}
                    </div>
                )}

                {/* Invoice Document */}
                <div className="rounded-lg border bg-card print:border-0 print:shadow-none">
                    <div className="p-8 print:p-0">
                        {/* Document Header */}
                        <div className="mb-12 flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight">
                                    {seller.company_name}
                                </h2>
                                <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                                    {seller.address && <p>{seller.address}</p>}
                                    {(seller.postal_code || seller.city) && (
                                        <p>
                                            {seller.postal_code} {seller.city}
                                        </p>
                                    )}
                                    {seller.country && <p>{seller.country}</p>}
                                    {seller.vat_number && (
                                        <p>VAT: {seller.vat_number}</p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="mb-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                                    {invoice.type_label}
                                </p>
                                <p className="text-2xl font-semibold tracking-tight">
                                    {invoice.invoice_number}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {invoice.invoice_date}
                                </p>
                                <Badge variant="outline" className="mt-3">
                                    {invoice.status_label}
                                </Badge>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="mb-10">
                            <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                                Bill To
                            </p>
                            <p className="font-medium">{buyer.company_name}</p>
                            <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                                {buyer.contact_name &&
                                    buyer.contact_name !==
                                        buyer.company_name && (
                                        <p>{buyer.contact_name}</p>
                                    )}
                                {buyer.address && <p>{buyer.address}</p>}
                                {buyer.email && <p>{buyer.email}</p>}
                                {buyer.vat_number && (
                                    <p>VAT: {buyer.vat_number}</p>
                                )}
                            </div>
                        </div>

                        {/* Line Items */}
                        {invoice.is_statement ? (
                            <>
                                {/* Statement Table */}
                                <div className="overflow-hidden rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                    Description
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                    Debit
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                    Credit
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                    Balance
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {invoice.line_items.map(
                                                (item, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {item.date}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {item.description}
                                                        </td>
                                                        <td className="px-4 py-3 text-right tabular-nums">
                                                            {item.debit
                                                                ? formatCurrency(
                                                                      item.debit,
                                                                  )
                                                                : ''}
                                                        </td>
                                                        <td className="px-4 py-3 text-right tabular-nums">
                                                            {item.credit
                                                                ? formatCurrency(
                                                                      item.credit,
                                                                  )
                                                                : ''}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                                                            {item.balance !==
                                                            undefined
                                                                ? formatCurrency(
                                                                      item.balance,
                                                                  )
                                                                : ''}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Statement Summary */}
                                <div className="mt-6 rounded-lg border p-6">
                                    <p className="mb-4 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                                        Account Summary
                                    </p>
                                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Opening Balance
                                            </p>
                                            <p className="text-lg font-semibold tabular-nums">
                                                {formatCurrency(
                                                    invoice.balance_before ?? 0,
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Closing Balance
                                            </p>
                                            <p className="text-lg font-semibold tabular-nums">
                                                {formatCurrency(
                                                    invoice.balance_after ?? 0,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Regular Invoice Table */}
                                <div className="overflow-hidden rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                    Description
                                                </th>
                                                <th className="w-20 px-4 py-3 text-center text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                    Qty
                                                </th>
                                                <th className="w-28 px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                    Unit Price
                                                </th>
                                                <th className="w-28 px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {invoice.line_items.map(
                                                (item, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-3">
                                                            <p className="font-medium">
                                                                {
                                                                    item.description
                                                                }
                                                            </p>
                                                            {item.details && (
                                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                                    {
                                                                        item.details
                                                                    }
                                                                </p>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center tabular-nums">
                                                            {item.quantity ?? 1}
                                                        </td>
                                                        <td className="px-4 py-3 text-right tabular-nums">
                                                            {formatCurrency(
                                                                item.unit_price,
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium tabular-nums">
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
                                <div className="mt-6 flex justify-end">
                                    <div className="w-72 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Subtotal
                                            </span>
                                            <span className="tabular-nums">
                                                {formatCurrency(
                                                    invoice.subtotal,
                                                )}
                                            </span>
                                        </div>
                                        {invoice.vat_amount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    VAT ({invoice.vat_rate}%)
                                                </span>
                                                <span className="tabular-nums">
                                                    {formatCurrency(
                                                        invoice.vat_amount,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        <Separator />
                                        <div className="flex justify-between pt-2">
                                            <span className="font-semibold">
                                                Total
                                            </span>
                                            <span className="text-lg font-semibold tabular-nums">
                                                {formatCurrency(invoice.total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Balance Info for Top-ups */}
                                {invoice.is_top_up &&
                                    invoice.balance_before !== null &&
                                    invoice.balance_after !== null && (
                                        <div className="mt-6 rounded-lg border p-6">
                                            <p className="mb-4 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                                                Balance Update
                                            </p>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Before
                                                    </p>
                                                    <p className="text-lg font-semibold tabular-nums">
                                                        {formatCurrency(
                                                            invoice.balance_before,
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        After
                                                    </p>
                                                    <p className="text-lg font-semibold tabular-nums">
                                                        {formatCurrency(
                                                            invoice.balance_after,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </>
                        )}

                        {/* Payment Info */}
                        {(invoice.payment_method ||
                            invoice.payment_reference) && (
                            <div className="mt-8 border-t pt-6">
                                <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                                    Payment
                                </p>
                                <div className="flex gap-8 text-sm">
                                    {invoice.payment_method && (
                                        <div>
                                            <span className="text-muted-foreground">
                                                Method:{' '}
                                            </span>
                                            <span className="font-medium">
                                                {invoice.payment_method}
                                            </span>
                                        </div>
                                    )}
                                    {invoice.payment_reference && (
                                        <div>
                                            <span className="text-muted-foreground">
                                                Reference:{' '}
                                            </span>
                                            <span className="font-mono text-xs font-medium">
                                                {invoice.payment_reference}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="mt-6 rounded-lg border p-4">
                                <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                                    Notes
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {invoice.notes}
                                </p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-10 border-t pt-6 text-center">
                            <p className="text-xs text-muted-foreground">
                                {seller.company_name}
                                {seller.registration_number &&
                                    ` · Reg: ${seller.registration_number}`}
                                {seller.vat_number &&
                                    ` · VAT: ${seller.vat_number}`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
