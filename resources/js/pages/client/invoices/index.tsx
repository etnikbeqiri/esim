import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type InvoiceListItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Download, Eye, FileText, Receipt, ScrollText } from 'lucide-react';

interface Props {
    invoices: {
        data: InvoiceListItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Client', href: '/client' },
    { title: 'Invoices', href: '/client/invoices' },
];

function getStatusBadgeClass(color: string): string {
    const colors: Record<string, string> = {
        green: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        gray: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    };
    return colors[color] || colors.gray;
}

function getTypeIcon(type: string) {
    switch (type) {
        case 'top_up':
            return <Receipt className="h-4 w-4 text-green-500" />;
        case 'purchase':
            return <FileText className="h-4 w-4 text-blue-500" />;
        case 'statement':
            return <ScrollText className="h-4 w-4 text-purple-500" />;
        default:
            return <FileText className="h-4 w-4" />;
    }
}

export default function InvoicesIndex({ invoices }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />
            <div className="flex flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Invoices</h1>
                        <p className="text-muted-foreground">View and download your invoices</p>
                    </div>
                </div>

                {/* Invoices Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice History</CardTitle>
                        <CardDescription>{invoices.total} invoice{invoices.total !== 1 ? 's' : ''}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {invoices.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-4 text-muted-foreground">No invoices yet</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Invoices will appear here after you make purchases or top-ups.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.data.map((invoice) => (
                                        <TableRow key={invoice.uuid}>
                                            <TableCell className="font-medium">
                                                {invoice.invoice_number}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(invoice.type)}
                                                    <span>{invoice.type_label}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {invoice.invoice_date}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {invoice.formatted_total}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={getStatusBadgeClass(invoice.status_color)}
                                                >
                                                    {invoice.status_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/client/invoices/${invoice.uuid}`}>
                                                            <Eye className="mr-1 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <a href={`/client/invoices/${invoice.uuid}/download`}>
                                                            <Download className="mr-1 h-4 w-4" />
                                                            PDF
                                                        </a>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {invoices.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: Math.min(invoices.last_page, 10) }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === invoices.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get('/client/invoices', { page })}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
