import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTrans } from '@/hooks/use-trans';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type InvoiceViewData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, Printer } from 'lucide-react';

export default function InvoiceShow({
    invoice,
    seller,
    buyer,
    currency,
}: InvoiceViewData) {
    const { trans } = useTrans();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Client', href: '/client' },
        { title: trans('client_invoices.title'), href: '/client/invoices' },
        {
            title: invoice.invoice_number,
            href: `/client/invoices/${invoice.uuid}`,
        },
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
            <div className="flex flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/client/invoices">
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                {trans('client_invoices.details.back')}
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
                        <Button
                            variant="outline"
                            onClick={() => window.print()}
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            {trans('client_invoices.details.print')}
                        </Button>
                        <Button variant="outline" asChild>
                            <a
                                href={`/client/invoices/${invoice.uuid}/download`}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {trans('client_invoices.details.download')}
                            </a>
                        </Button>
                    </div>
                </div>

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
                                {trans('client_invoices.details.bill_to')}
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
                                                    {trans(
                                                        'client_invoices.details.description',
                                                    )}
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                    {trans(
                                                        'client_invoices.details.debit',
                                                    )}
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                    {trans(
                                                        'client_invoices.details.credit',
                                                    )}
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                    {trans(
                                                        'client_invoices.details.balance',
                                                    )}
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
                                        {trans(
                                            'client_invoices.details.account_summary',
                                        )}
                                    </p>
                                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                {trans(
                                                    'client_invoices.details.opening_balance',
                                                )}
                                            </p>
                                            <p className="text-lg font-semibold tabular-nums">
                                                {formatCurrency(
                                                    invoice.balance_before ?? 0,
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                {trans(
                                                    'client_invoices.details.closing_balance',
                                                )}
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
                                                    {trans(
                                                        'client_invoices.details.description',
                                                    )}
                                                </th>
                                                <th className="w-20 px-4 py-3 text-center text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                    {trans(
                                                        'client_invoices.details.qty',
                                                    )}
                                                </th>
                                                <th className="w-28 px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                    {trans(
                                                        'client_invoices.details.unit_price',
                                                    )}
                                                </th>
                                                <th className="w-28 px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                    {trans(
                                                        'client_invoices.details.amount',
                                                    )}
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
                                                {trans(
                                                    'client_invoices.details.subtotal',
                                                )}
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
                                                    {trans(
                                                        'client_invoices.details.vat',
                                                        {
                                                            rate: invoice.vat_rate.toString(),
                                                        },
                                                    )}
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
                                                {trans(
                                                    'client_invoices.details.total',
                                                )}
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
                                                {trans(
                                                    'client_invoices.details.balance_update',
                                                )}
                                            </p>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {trans(
                                                            'client_invoices.details.before',
                                                        )}
                                                    </p>
                                                    <p className="text-lg font-semibold tabular-nums">
                                                        {formatCurrency(
                                                            invoice.balance_before,
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {trans(
                                                            'client_invoices.details.after',
                                                        )}
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
                                    {trans('client_invoices.details.payment')}
                                </p>
                                <div className="flex gap-8 text-sm">
                                    {invoice.payment_method && (
                                        <div>
                                            <span className="text-muted-foreground">
                                                {trans(
                                                    'client_invoices.details.method',
                                                )}{' '}
                                            </span>
                                            <span className="font-medium">
                                                {invoice.payment_method}
                                            </span>
                                        </div>
                                    )}
                                    {invoice.payment_reference && (
                                        <div>
                                            <span className="text-muted-foreground">
                                                {trans(
                                                    'client_invoices.details.reference',
                                                )}{' '}
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
                                    {trans('client_invoices.details.notes')}
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
