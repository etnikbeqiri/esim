import { index as invoicesIndex, generate as invoicesGenerate } from '@/actions/App/Http/Controllers/Admin/InvoiceController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Download,
    Eye,
    FileText,
    Plus,
    Receipt,
    ScrollText,
    Search,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Invoice {
    id: number;
    uuid: string;
    invoice_number: string;
    type: string;
    type_label: string;
    status: string;
    status_label: string;
    status_color: string;
    total: number;
    currency_code: string;
    invoice_date: string;
    customer: {
        id: number;
        user: { name: string; email: string } | null;
    } | null;
}

interface Currency {
    id: number;
    code: string;
    symbol: string;
}

interface Props {
    invoices: {
        data: Invoice[];
        current_page: number;
        last_page: number;
        total: number;
    };
    types: { value: string; label: string }[];
    statuses: { value: string; label: string; color: string }[];
    filters: {
        search?: string;
        type?: string;
        status?: string;
        customer_id?: string;
    };
    defaultCurrency: Currency | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Invoices', href: '/admin/invoices' },
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

export default function InvoicesIndex({
    invoices,
    types,
    statuses,
    filters,
    defaultCurrency,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const currencySymbol = defaultCurrency?.symbol || '€';

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            invoicesIndex.url(),
            { ...filters, search },
            { preserveState: true },
        );
    }

    function handleFilterChange(key: string, value: string) {
        const newFilters = {
            ...filters,
            [key]: value === 'all' ? undefined : value,
        };
        router.get(invoicesIndex.url(), newFilters, { preserveState: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Invoices</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                            {invoices.total} invoices
                        </span>
                        <Button asChild>
                            <Link href={invoicesGenerate.url()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Generate Invoice
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Invoice # or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-[200px] pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>

                    <Select
                        value={filters.type || 'all'}
                        onValueChange={(v) => handleFilterChange('type', v)}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            {types.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(v) => handleFilterChange('status', v)}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {statuses.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No invoices found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoices.data.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-mono">
                                            {invoice.invoice_number}
                                        </TableCell>
                                        <TableCell>
                                            {invoice.customer?.user ? (
                                                <Link
                                                    href={`/admin/customers/${invoice.customer.id}`}
                                                    className="hover:underline"
                                                >
                                                    <div className="font-medium">
                                                        {
                                                            invoice.customer
                                                                .user.name
                                                        }
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {
                                                            invoice.customer
                                                                .user.email
                                                        }
                                                    </div>
                                                </Link>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(invoice.type)}
                                                <span>
                                                    {invoice.type_label}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getStatusBadgeClass(
                                                    invoice.status_color,
                                                )}
                                            >
                                                {invoice.status_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {currencySymbol}
                                            {Number(invoice.total).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-muted-foreground">
                                            {invoice.invoice_date}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/admin/invoices/${invoice.uuid}`}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <a
                                                        href={`/admin/invoices/${invoice.uuid}/download`}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {invoices.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from(
                            { length: Math.min(invoices.last_page, 10) },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <Button
                                key={page}
                                variant={
                                    page === invoices.current_page
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                    router.get(invoicesIndex.url(), {
                                        ...filters,
                                        page,
                                    })
                                }
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
