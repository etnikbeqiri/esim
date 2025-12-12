import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Eye,
    Mail,
    MailX,
    Pencil,
    Search,
    ShoppingCart,
    User,
    Users,
    Wallet,
    XCircle,
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
        router.get('/admin/customers', { ...filters, search, page: 1 }, { preserveState: true });
    }

    function handleFilterChange(key: string, value: string) {
        const newFilters = { ...filters, [key]: value === 'all' ? undefined : value, page: 1 };
        router.get('/admin/customers', newFilters, { preserveState: true });
    }

    function goToPage(page: number) {
        router.get('/admin/customers', { ...filters, page }, { preserveState: true, preserveScroll: true });
    }

    // Calculate stats
    const b2bCount = customers.data.filter(c => c.type === 'b2b').length;
    const b2cCount = customers.data.filter(c => c.type === 'b2c').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-muted-foreground" />
                        <div>
                            <h1 className="text-2xl font-semibold">Customers</h1>
                            <p className="text-sm text-muted-foreground">
                                {customers.total} total customers
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Total Customers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{customers.total}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-blue-500" />
                                B2B Customers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-blue-600">{b2bCount}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <User className="h-4 w-4 text-purple-500" />
                                B2C Customers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-purple-600">{b2cCount}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 w-[250px]"
                            />
                        </div>
                        <Button type="submit" variant="secondary">Search</Button>
                    </form>

                    <Select value={filters.type || 'all'} onValueChange={(v) => handleFilterChange('type', v)}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="b2b">B2B</SelectItem>
                            <SelectItem value="b2c">B2C</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.active ?? 'all'} onValueChange={(v) => handleFilterChange('active', v)}>
                        <SelectTrigger className="w-[130px]">
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
                            onClick={() => router.get('/admin/customers', {}, { preserveState: true })}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* Table */}
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Orders</TableHead>
                                <TableHead className="text-right">Total Spent</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                        No customers found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customers.data.map((customer) => (
                                    <TableRow key={customer.id} className={!customer.is_active ? 'opacity-60' : ''}>
                                        <TableCell>
                                            {customer.user ? (
                                                <div className="flex items-start gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Link
                                                                href={`/admin/customers/${customer.id}`}
                                                                className="font-medium hover:underline"
                                                            >
                                                                {customer.user.name}
                                                            </Link>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        {customer.user.email_verified ? (
                                                                            <Mail className="h-3.5 w-3.5 text-green-500" />
                                                                        ) : (
                                                                            <MailX className="h-3.5 w-3.5 text-yellow-500" />
                                                                        )}
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {customer.user.email_verified ? 'Email verified' : 'Email not verified'}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">{customer.user.email}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">No user</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={customer.type === 'b2b'
                                                    ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                                                    : 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400'
                                                }
                                            >
                                                {customer.type === 'b2b' ? (
                                                    <Building2 className="h-3 w-3 mr-1" />
                                                ) : (
                                                    <User className="h-3 w-3 mr-1" />
                                                )}
                                                {customer.type_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {customer.is_active ? (
                                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400">
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="font-medium">{customer.orders_count}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            €{Number(customer.total_spent).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {customer.type === 'b2b' && customer.balance ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger className="flex items-center justify-end gap-1">
                                                            <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span className="font-medium text-green-600">
                                                                €{Number(customer.balance.available).toFixed(2)}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Total: €{Number(customer.balance.balance).toFixed(2)}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {Number(customer.discount_percentage) > 0 ? (
                                                <Badge variant="secondary">
                                                    {customer.discount_percentage}%
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(customer.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                                <Link href={`/admin/customers/${customer.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>View details</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                                <Link href={`/admin/customers/${customer.id}/edit`}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit customer</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {customers.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {customers.from}-{customers.to} of {customers.total} customers
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(customers.current_page - 1)}
                                disabled={customers.current_page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(customers.last_page, 5) }, (_, i) => {
                                    let page: number;
                                    if (customers.last_page <= 5) {
                                        page = i + 1;
                                    } else if (customers.current_page <= 3) {
                                        page = i + 1;
                                    } else if (customers.current_page >= customers.last_page - 2) {
                                        page = customers.last_page - 4 + i;
                                    } else {
                                        page = customers.current_page - 2 + i;
                                    }
                                    return (
                                        <Button
                                            key={page}
                                            variant={page === customers.current_page ? 'default' : 'outline'}
                                            size="sm"
                                            className="w-9"
                                            onClick={() => goToPage(page)}
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(customers.current_page + 1)}
                                disabled={customers.current_page === customers.last_page}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
