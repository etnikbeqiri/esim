import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type InvoiceViewData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, Printer } from 'lucide-react';

export default function InvoiceShow({ invoice, seller, buyer, currency }: InvoiceViewData) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Client', href: '/client' },
        { title: 'Invoices', href: '/client/invoices' },
        { title: invoice.invoice_number, href: `/client/invoices/${invoice.uuid}` },
    ];

    const formatCurrency = (amount: number) => {
        return `${currency.symbol}${amount.toFixed(2)}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Invoice ${invoice.invoice_number}`} />
            <div className="flex flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/client/invoices">
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">{invoice.invoice_number}</h1>
                            <p className="text-sm text-muted-foreground">{invoice.type_label}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button variant="outline" asChild>
                            <a href={`/client/invoices/${invoice.uuid}/download`}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Invoice Document */}
                <div className="rounded-lg border bg-card print:border-0 print:shadow-none">
                    <div className="p-8 print:p-0">
                        {/* Document Header */}
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight">{seller.company_name}</h2>
                                <div className="mt-2 text-sm text-muted-foreground space-y-0.5">
                                    {seller.address && <p>{seller.address}</p>}
                                    {(seller.postal_code || seller.city) && (
                                        <p>{seller.postal_code} {seller.city}</p>
                                    )}
                                    {seller.country && <p>{seller.country}</p>}
                                    {seller.vat_number && <p>VAT: {seller.vat_number}</p>}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
                                    {invoice.type_label}
                                </p>
                                <p className="text-2xl font-semibold tracking-tight">{invoice.invoice_number}</p>
                                <p className="text-sm text-muted-foreground mt-1">{invoice.invoice_date}</p>
                                <Badge variant="outline" className="mt-3">
                                    {invoice.status_label}
                                </Badge>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="mb-10">
                            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                                Bill To
                            </p>
                            <p className="font-medium">{buyer.company_name}</p>
                            <div className="text-sm text-muted-foreground space-y-0.5 mt-1">
                                {buyer.contact_name && buyer.contact_name !== buyer.company_name && (
                                    <p>{buyer.contact_name}</p>
                                )}
                                {buyer.address && <p>{buyer.address}</p>}
                                {buyer.email && <p>{buyer.email}</p>}
                                {buyer.vat_number && <p>VAT: {buyer.vat_number}</p>}
                            </div>
                        </div>

                        {/* Line Items */}
                        {invoice.is_statement ? (
                            <>
                                {/* Statement Table */}
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                    Description
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                    Debit
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                    Credit
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                    Balance
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {invoice.line_items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-3 text-muted-foreground">{item.date}</td>
                                                    <td className="px-4 py-3">{item.description}</td>
                                                    <td className="px-4 py-3 text-right tabular-nums">
                                                        {item.debit ? formatCurrency(item.debit) : ''}
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums">
                                                        {item.credit ? formatCurrency(item.credit) : ''}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                                                        {item.balance !== undefined ? formatCurrency(item.balance) : ''}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Statement Summary */}
                                <div className="mt-6 border rounded-lg p-6">
                                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                                        Account Summary
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Opening Balance</p>
                                            <p className="text-lg font-semibold tabular-nums">
                                                {formatCurrency(invoice.balance_before ?? 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Closing Balance</p>
                                            <p className="text-lg font-semibold tabular-nums">
                                                {formatCurrency(invoice.balance_after ?? 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Regular Invoice Table */}
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                    Description
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground w-20">
                                                    Qty
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground w-28">
                                                    Unit Price
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground w-28">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {invoice.line_items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium">{item.description}</p>
                                                        {item.details && (
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {item.details}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center tabular-nums">
                                                        {item.quantity ?? 1}
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums">
                                                        {formatCurrency(item.unit_price)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                                                        {formatCurrency(item.total)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-end mt-6">
                                    <div className="w-72 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="tabular-nums">{formatCurrency(invoice.subtotal)}</span>
                                        </div>
                                        {invoice.vat_amount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">VAT ({invoice.vat_rate}%)</span>
                                                <span className="tabular-nums">{formatCurrency(invoice.vat_amount)}</span>
                                            </div>
                                        )}
                                        <Separator />
                                        <div className="flex justify-between pt-2">
                                            <span className="font-semibold">Total</span>
                                            <span className="text-lg font-semibold tabular-nums">
                                                {formatCurrency(invoice.total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Balance Info for Top-ups */}
                                {invoice.is_top_up && invoice.balance_before !== null && invoice.balance_after !== null && (
                                    <div className="mt-6 border rounded-lg p-6">
                                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                                            Balance Update
                                        </p>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Before</p>
                                                <p className="text-lg font-semibold tabular-nums">
                                                    {formatCurrency(invoice.balance_before)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">After</p>
                                                <p className="text-lg font-semibold tabular-nums">
                                                    {formatCurrency(invoice.balance_after)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Payment Info */}
                        {(invoice.payment_method || invoice.payment_reference) && (
                            <div className="mt-8 pt-6 border-t">
                                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                                    Payment
                                </p>
                                <div className="flex gap-8 text-sm">
                                    {invoice.payment_method && (
                                        <div>
                                            <span className="text-muted-foreground">Method: </span>
                                            <span className="font-medium">{invoice.payment_method}</span>
                                        </div>
                                    )}
                                    {invoice.payment_reference && (
                                        <div>
                                            <span className="text-muted-foreground">Reference: </span>
                                            <span className="font-medium font-mono text-xs">{invoice.payment_reference}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="mt-6 border rounded-lg p-4">
                                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                                    Notes
                                </p>
                                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-10 pt-6 border-t text-center">
                            <p className="text-xs text-muted-foreground">
                                {seller.company_name}
                                {seller.registration_number && ` · Reg: ${seller.registration_number}`}
                                {seller.vat_number && ` · VAT: ${seller.vat_number}`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
