import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTrans } from '@/hooks/use-trans';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type InvoiceListItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronRight as ArrowRight,
    Download,
    FileText,
    Receipt,
    ScrollText,
} from 'lucide-react';

interface Props {
    invoices: {
        data: InvoiceListItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

function getStatusStyle(color: string): string {
    const colors: Record<string, string> = {
        green: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20',
        blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20',
        gray: 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20',
        red: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
    };
    return colors[color] || colors.gray;
}

function getTypeIcon(type: string) {
    switch (type) {
        case 'top_up':
            return (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20 md:h-14 md:w-14">
                    <Receipt className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
            );
        case 'purchase':
            return (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 md:h-14 md:w-14">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
            );
        case 'statement':
            return (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/20 md:h-14 md:w-14">
                    <ScrollText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
            );
        default:
            return (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted md:h-14 md:w-14">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
            );
    }
}

export default function InvoicesIndex({ invoices }: Props) {
    const { trans } = useTrans();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: trans('nav.destinations'), href: '/client/packages' },
        { title: trans('client_invoices.title'), href: '/client/invoices' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={trans('client_invoices.title')} />
            <div className="mx-auto w-full max-w-4xl space-y-5 p-4 md:space-y-6 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-semibold md:text-2xl">
                        {trans('client_invoices.title')}
                    </h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        {invoices.total} invoice{invoices.total !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Invoice list */}
                {invoices.data.length === 0 ? (
                    <div className="rounded-xl border bg-card">
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="mb-4 rounded-full bg-muted p-4">
                                <FileText className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <h3 className="text-base font-semibold">
                                {trans('client_invoices.no_invoices')}
                            </h3>
                            <p className="mt-1 max-w-xs text-center text-sm text-muted-foreground">
                                {trans('client_invoices.no_invoices_desc')}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y rounded-xl border bg-card">
                        {invoices.data.map((invoice) => (
                            <Link
                                key={invoice.uuid}
                                href={`/client/invoices/${invoice.uuid}`}
                                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50 md:gap-5 md:py-5"
                            >
                                {/* Type icon */}
                                {getTypeIcon(invoice.type)}

                                {/* Info */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-foreground md:text-base">
                                                {invoice.invoice_number}
                                            </p>
                                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                                                <span>{invoice.type_label}</span>
                                                <span>&middot;</span>
                                                <span>{invoice.invoice_date}</span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-semibold tabular-nums text-foreground md:text-base">
                                                {invoice.formatted_total}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bottom row: status + download + arrow */}
                                    <div className="mt-2.5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className={`${getStatusStyle(invoice.status_color)} inline-flex items-center gap-1 ring-1 ring-inset`}
                                            >
                                                {invoice.status_label}
                                            </Badge>
                                            <a
                                                href={`/client/invoices/${invoice.uuid}/download`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                            >
                                                <Download className="h-3 w-3" />
                                                PDF
                                            </a>
                                        </div>

                                        <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {invoices.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Page {invoices.current_page} of {invoices.last_page}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                disabled={invoices.current_page === 1}
                                onClick={() =>
                                    router.get('/client/invoices', {
                                        page: invoices.current_page - 1,
                                    })
                                }
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                disabled={
                                    invoices.current_page === invoices.last_page
                                }
                                onClick={() =>
                                    router.get('/client/invoices', {
                                        page: invoices.current_page + 1,
                                    })
                                }
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
