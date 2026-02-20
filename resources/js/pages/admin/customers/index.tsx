import { index as customersIndex } from '@/actions/App/Http/Controllers/Admin/CustomerController';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    ChevronLeft,
    ChevronRight,
    Eye,
    Mail,
    MailX,
    Pencil,
    Search,
    User,
    Wallet,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Customer {
    id: number;
    type: string;
    type_label: string;
    discount_percentage: number;
    is_active: boolean;
    orders_count: number;
    total_spent: number;
    created_at: string;
    user: {
        name: string;
        email: string;
        email_verified: boolean;
    } | null;
    balance: {
        balance: number;
        available: number;
    } | null;
}

interface Props {
    customers: {
        data: Customer[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    filters: {
        search?: string;
        type?: string;
        active?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Customers', href: '/admin/customers' },
];

export default function CustomersIndex({ customers, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            customersIndex.url(),
            { ...filters, search, page: 1 },
            { preserveState: true },
        );
    }

    function handleFilterChange(key: string, value: string) {
        const newFilters = {
            ...filters,
            [key]: value === 'all' ? undefined : value,
            page: 1,
        };
        router.get(customersIndex.url(), newFilters, { preserveState: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Customers</h1>
                    <span className="text-sm text-muted-foreground">
                        {customers.total} customers
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 w-[220px] pl-9"
                            />
                        </div>
                    </form>

                    <Select
                        value={filters.type || 'all'}
                        onValueChange={(v) => handleFilterChange('type', v)}
                    >
                        <SelectTrigger className="h-9 w-[110px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="b2b">B2B</SelectItem>
                            <SelectItem value="b2c">B2C</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.active ?? 'all'}
                        onValueChange={(v) => handleFilterChange('active', v)}
                    >
                        <SelectTrigger className="h-9 w-[110px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="1">Active</SelectItem>
                            <SelectItem value="0">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    {(filters.search || filters.type || filters.active) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9"
                            onClick={() =>
                                router.get(
                                    customersIndex.url(),
                                    {},
                                    { preserveState: true },
                                )
                            }
                        >
                            Clear
                        </Button>
                    )}
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Customer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Orders
                                </TableHead>
                                <TableHead className="text-right">
                                    Total Spent
                                </TableHead>
                                <TableHead className="text-right">
                                    Balance
                                </TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No customers found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customers.data.map((customer) => (
                                    <TableRow
                                        key={customer.id}
                                        className={`group ${!customer.is_active ? 'opacity-60' : ''}`}
                                    >
                                        <TableCell>
                                            {customer.user ? (
                                                <div className="flex items-start gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Link
                                                                href={`/admin/customers/${customer.id}`}
                                                                className="font-medium hover:underline"
                                                            >
                                                                {
                                                                    customer
                                                                        .user
                                                                        .name
                                                                }
                                                            </Link>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        {customer
                                                                            .user
                                                                            .email_verified ? (
                                                                            <Mail className="h-3.5 w-3.5 text-green-500" />
                                                                        ) : (
                                                                            <MailX className="h-3.5 w-3.5 text-yellow-500" />
                                                                        )}
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {customer
                                                                            .user
                                                                            .email_verified
                                                                            ? 'Email verified'
                                                                            : 'Email not verified'}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {
                                                                customer.user
                                                                    .email
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    No user
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    customer.type === 'b2b'
                                                        ? 'border-blue-200 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : 'border-purple-200 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                }
                                            >
                                                {customer.type === 'b2b' ? (
                                                    <Building2 className="mr-1 h-3 w-3" />
                                                ) : (
                                                    <User className="mr-1 h-3 w-3" />
                                                )}
                                                {customer.type_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {customer.is_active ? (
                                                <Badge variant="default">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {customer.orders_count}
                                        </TableCell>
                                        <TableCell className="text-right font-medium tabular-nums">
                                            €
                                            {Number(
                                                customer.total_spent,
                                            ).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {customer.type === 'b2b' &&
                                            customer.balance ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger className="flex items-center justify-end gap-1">
                                                            <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span className="font-medium text-green-600 tabular-nums">
                                                                €
                                                                {Number(
                                                                    customer
                                                                        .balance
                                                                        .available,
                                                                ).toFixed(2)}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Total: €
                                                            {Number(
                                                                customer.balance
                                                                    .balance,
                                                            ).toFixed(2)}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {Number(
                                                customer.discount_percentage,
                                            ) > 0 ? (
                                                <Badge variant="secondary">
                                                    {
                                                        customer.discount_percentage
                                                    }
                                                    %
                                                </Badge>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(
                                                customer.created_at,
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/admin/customers/${customer.id}`}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/admin/customers/${customer.id}/edit`}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {customers.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Page {customers.current_page} of{' '}
                            {customers.last_page}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                disabled={customers.current_page === 1}
                                onClick={() =>
                                    router.get(
                                        customersIndex.url(),
                                        {
                                            ...filters,
                                            page: customers.current_page - 1,
                                        },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        },
                                    )
                                }
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                disabled={
                                    customers.current_page ===
                                    customers.last_page
                                }
                                onClick={() =>
                                    router.get(
                                        customersIndex.url(),
                                        {
                                            ...filters,
                                            page: customers.current_page + 1,
                                        },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        },
                                    )
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
