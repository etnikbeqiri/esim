import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    FileText,
    Loader2,
    Receipt,
    ScrollText,
    Search,
    User,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface CustomerSearchResult {
    id: number;
    name: string | null;
    email: string | null;
    company_name: string | null;
    type: 'b2b' | 'b2c';
    has_balance: boolean;
}

interface UninvoicedOrder {
    id: number;
    uuid: string;
    order_number: string;
    type: 'b2b' | 'b2c';
    amount: number;
    package_name: string | null;
    completed_at: string;
}

interface UninvoicedTransaction {
    id: number;
    uuid: string;
    amount: number;
    description: string | null;
    balance_before: number;
    balance_after: number;
    payment_method: string | null;
    created_at: string;
}

interface InvoiceType {
    value: string;
    label: string;
}

interface Currency {
    id: number;
    code: string;
    symbol: string;
}

interface Props {
    types: InvoiceType[];
    defaultCurrency: Currency | null;
    preselectedCustomer: CustomerSearchResult | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Invoices', href: '/admin/invoices' },
    { title: 'Generate Invoice', href: '/admin/invoices/generate' },
];

const INVOICE_TYPE_ICONS: Record<string, React.ReactNode> = {
    purchase: <FileText className="h-6 w-6" />,
    top_up: <Receipt className="h-6 w-6" />,
    statement: <ScrollText className="h-6 w-6" />,
};

const INVOICE_TYPE_DESCRIPTIONS: Record<string, string> = {
    purchase: 'Generate invoices for completed orders',
    top_up: 'Generate invoices for balance top-ups (B2B only)',
    statement: 'Generate account statement for a date range (B2B only)',
};

export default function GenerateInvoice({ types, defaultCurrency, preselectedCustomer }: Props) {
    const currencySymbol = defaultCurrency?.symbol || '€';

    // Step management
    const [step, setStep] = useState(preselectedCustomer ? 2 : 1);

    // Step 1: Customer selection
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(preselectedCustomer);
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerResults, setCustomerResults] = useState<CustomerSearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Step 2: Invoice type selection
    const [selectedType, setSelectedType] = useState<string | null>(null);

    // Step 3: Item/date selection
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [items, setItems] = useState<(UninvoicedOrder | UninvoicedTransaction)[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [itemsLoading, setItemsLoading] = useState(false);

    // Step 4: Submission
    const [submitting, setSubmitting] = useState(false);

    // Filter available types based on customer
    const availableTypes = types.filter((type) => {
        if (type.value === 'statement' || type.value === 'top_up') {
            return selectedCustomer?.has_balance;
        }
        return true;
    });

    // Debounced customer search
    useEffect(() => {
        if (customerSearch.length < 2) {
            setCustomerResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const response = await fetch(
                    `/admin/invoices/search-customers?search=${encodeURIComponent(customerSearch)}`
                );
                const data = await response.json();
                setCustomerResults(data);
            } catch (error) {
                console.error('Error searching customers:', error);
            }
            setSearchLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [customerSearch]);

    // Fetch uninvoiced items when step 3 is active
    const fetchItems = useCallback(async () => {
        if (!selectedCustomer || !selectedType || selectedType === 'statement') return;

        setItemsLoading(true);
        try {
            const endpoint =
                selectedType === 'purchase' ? 'uninvoiced-orders' : 'uninvoiced-transactions';

            const params = new URLSearchParams();
            if (dateRange.start) params.set('start_date', dateRange.start);
            if (dateRange.end) params.set('end_date', dateRange.end);

            const response = await fetch(
                `/admin/invoices/customers/${selectedCustomer.id}/${endpoint}?${params}`
            );
            const data = await response.json();
            setItems(data);
            setSelectedItems([]);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
        setItemsLoading(false);
    }, [selectedCustomer, selectedType, dateRange.start, dateRange.end]);

    useEffect(() => {
        if (step === 3 && selectedType !== 'statement') {
            fetchItems();
        }
    }, [step, fetchItems, selectedType]);

    // Handle customer selection
    function handleSelectCustomer(customer: CustomerSearchResult) {
        setSelectedCustomer(customer);
        setSelectedType(null);
        setItems([]);
        setSelectedItems([]);
        setStep(2);
    }

    // Handle type selection
    function handleSelectType(type: string) {
        setSelectedType(type);
        setItems([]);
        setSelectedItems([]);
        setDateRange({ start: '', end: '' });
    }

    // Handle select all
    function handleSelectAll(checked: boolean) {
        if (checked) {
            setSelectedItems(items.map((item) => item.uuid));
        } else {
            setSelectedItems([]);
        }
    }

    // Handle individual item selection
    function handleSelectItem(uuid: string, checked: boolean) {
        if (checked) {
            setSelectedItems([...selectedItems, uuid]);
        } else {
            setSelectedItems(selectedItems.filter((itemUuid) => itemUuid !== uuid));
        }
    }

    // Calculate total for selected items
    const selectedTotal = items
        .filter((item) => selectedItems.includes(item.uuid))
        .reduce((sum, item) => sum + item.amount, 0);

    // Check if can proceed to next step
    function canProceed(): boolean {
        switch (step) {
            case 1:
                return selectedCustomer !== null;
            case 2:
                return selectedType !== null;
            case 3:
                if (selectedType === 'statement') {
                    return dateRange.start !== '' && dateRange.end !== '';
                }
                return selectedItems.length > 0;
            default:
                return false;
        }
    }

    // Handle form submission
    function handleSubmit() {
        if (!selectedCustomer || !selectedType) return;

        setSubmitting(true);

        const data: Record<string, unknown> = {
            customer_id: selectedCustomer.id,
            type: selectedType,
        };

        if (selectedType === 'purchase') {
            data.order_ids = selectedItems;
        } else if (selectedType === 'top_up') {
            data.transaction_ids = selectedItems;
        } else if (selectedType === 'statement') {
            data.start_date = dateRange.start;
            data.end_date = dateRange.end;
        }

        router.post('/admin/invoices/generate', data, {
            onFinish: () => setSubmitting(false),
        });
    }

    // Step indicator component
    function StepIndicator() {
        const steps = [
            { num: 1, label: 'Customer' },
            { num: 2, label: 'Type' },
            { num: 3, label: 'Select Items' },
            { num: 4, label: 'Generate' },
        ];

        return (
            <div className="flex items-center justify-center gap-2">
                {steps.map((s, index) => (
                    <div key={s.num} className="flex items-center">
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                                step > s.num
                                    ? 'bg-green-500 text-white'
                                    : step === s.num
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted text-muted-foreground'
                            }`}
                        >
                            {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                        </div>
                        <span
                            className={`ml-2 text-sm ${step === s.num ? 'font-medium' : 'text-muted-foreground'}`}
                        >
                            {s.label}
                        </span>
                        {index < steps.length - 1 && (
                            <div
                                className={`mx-4 h-px w-8 ${step > s.num ? 'bg-green-500' : 'bg-muted'}`}
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Generate Invoice" />
            <div className="flex flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/invoices">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold">Generate Invoice</h1>
                </div>

                {/* Step Indicator */}
                <StepIndicator />

                {/* Step 1: Customer Selection */}
                {step === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 1: Select Customer</CardTitle>
                            <CardDescription>
                                Search for a customer by name, email, or company
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search customers..."
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {searchLoading && (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            )}

                            {!searchLoading && customerResults.length > 0 && (
                                <div className="max-h-96 space-y-2 overflow-auto">
                                    {customerResults.map((customer) => (
                                        <div
                                            key={customer.id}
                                            onClick={() => handleSelectCustomer(customer)}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                {customer.company_name ? (
                                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <User className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">
                                                    {customer.company_name || customer.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {customer.email}
                                                </div>
                                            </div>
                                            <Badge variant="outline">
                                                {customer.type.toUpperCase()}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!searchLoading &&
                                customerSearch.length >= 2 &&
                                customerResults.length === 0 && (
                                    <p className="py-8 text-center text-muted-foreground">
                                        No customers found
                                    </p>
                                )}

                            {customerSearch.length < 2 && (
                                <p className="py-8 text-center text-muted-foreground">
                                    Type at least 2 characters to search
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Invoice Type Selection */}
                {step === 2 && selectedCustomer && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 2: Select Invoice Type</CardTitle>
                            <CardDescription>
                                Generating invoice for:{' '}
                                <span className="font-medium">
                                    {selectedCustomer.company_name || selectedCustomer.name}
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                {availableTypes.map((type) => (
                                    <div
                                        key={type.value}
                                        onClick={() => handleSelectType(type.value)}
                                        className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                                            selectedType === type.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-muted hover:border-muted-foreground/50'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center gap-3 text-center">
                                            <div
                                                className={`rounded-full p-3 ${
                                                    selectedType === type.value
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {INVOICE_TYPE_ICONS[type.value]}
                                            </div>
                                            <div>
                                                <div className="font-medium">{type.label}</div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {INVOICE_TYPE_DESCRIPTIONS[type.value]}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button variant="outline" onClick={() => setStep(1)}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <Button onClick={() => setStep(3)} disabled={!selectedType}>
                                    Continue
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Item Selection / Date Range */}
                {step === 3 && selectedCustomer && selectedType && (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Step 3:{' '}
                                {selectedType === 'statement'
                                    ? 'Select Date Range'
                                    : `Select ${selectedType === 'purchase' ? 'Orders' : 'Transactions'}`}
                            </CardTitle>
                            <CardDescription>
                                {selectedType === 'statement'
                                    ? 'Choose the period for the account statement'
                                    : `Select the items to include in the invoice${items.length > 0 ? ` (${items.length} uninvoiced items found)` : ''}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Date Range Filters */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>
                                        {selectedType === 'statement' ? 'Start Date' : 'From Date (optional)'}
                                    </Label>
                                    <Input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) =>
                                            setDateRange((prev) => ({ ...prev, start: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>
                                        {selectedType === 'statement' ? 'End Date' : 'To Date (optional)'}
                                    </Label>
                                    <Input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) =>
                                            setDateRange((prev) => ({ ...prev, end: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>

                            {/* Apply filter button for non-statement types */}
                            {selectedType !== 'statement' && (
                                <Button variant="secondary" onClick={fetchItems} disabled={itemsLoading}>
                                    {itemsLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Search className="mr-2 h-4 w-4" />
                                    )}
                                    Apply Filter
                                </Button>
                            )}

                            {/* Items Table (for purchase/top_up) */}
                            {selectedType !== 'statement' && (
                                <>
                                    {itemsLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : items.length === 0 ? (
                                        <div className="py-8 text-center text-muted-foreground">
                                            No uninvoiced items found for this period
                                        </div>
                                    ) : (
                                        <>
                                            {/* Select All */}
                                            <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                                                <Checkbox
                                                    checked={
                                                        selectedItems.length === items.length && items.length > 0
                                                    }
                                                    onCheckedChange={handleSelectAll}
                                                />
                                                <Label className="cursor-pointer">
                                                    Select All ({items.length} items)
                                                </Label>
                                                {selectedItems.length > 0 && (
                                                    <span className="ml-auto font-medium">
                                                        Selected: {currencySymbol}
                                                        {selectedTotal.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Items Table */}
                                            <div className="max-h-96 overflow-auto rounded-lg border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-12" />
                                                            <TableHead>
                                                                {selectedType === 'purchase'
                                                                    ? 'Order #'
                                                                    : 'Description'}
                                                            </TableHead>
                                                            {selectedType === 'purchase' && (
                                                                <TableHead>Package</TableHead>
                                                            )}
                                                            <TableHead className="text-right">Amount</TableHead>
                                                            <TableHead>Date</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {items.map((item) => (
                                                            <TableRow key={item.uuid}>
                                                                <TableCell>
                                                                    <Checkbox
                                                                        checked={selectedItems.includes(item.uuid)}
                                                                        onCheckedChange={(checked) =>
                                                                            handleSelectItem(item.uuid, !!checked)
                                                                        }
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="font-mono">
                                                                    {'order_number' in item
                                                                        ? item.order_number
                                                                        : item.description || 'Balance Top-Up'}
                                                                </TableCell>
                                                                {selectedType === 'purchase' && (
                                                                    <TableCell>
                                                                        {(item as UninvoicedOrder).package_name ||
                                                                            '-'}
                                                                    </TableCell>
                                                                )}
                                                                <TableCell className="text-right font-medium">
                                                                    {currencySymbol}
                                                                    {item.amount.toFixed(2)}
                                                                </TableCell>
                                                                <TableCell className="text-muted-foreground">
                                                                    {'completed_at' in item
                                                                        ? item.completed_at
                                                                        : item.created_at}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            <div className="flex justify-between pt-4">
                                <Button variant="outline" onClick={() => setStep(2)}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <Button onClick={() => setStep(4)} disabled={!canProceed()}>
                                    Continue
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 4: Preview & Generate */}
                {step === 4 && selectedCustomer && selectedType && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 4: Review & Generate</CardTitle>
                            <CardDescription>
                                Review the details and generate the invoice
                                {selectedItems.length > 1 ? 's' : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Summary */}
                            <div className="rounded-lg bg-muted p-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Customer</p>
                                        <p className="font-medium">
                                            {selectedCustomer.company_name || selectedCustomer.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedCustomer.email}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Invoice Type</p>
                                        <p className="font-medium capitalize">
                                            {types.find((t) => t.value === selectedType)?.label}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedType === 'statement' ? 'Period' : 'Items'}
                                        </p>
                                        <p className="font-medium">
                                            {selectedType === 'statement'
                                                ? `${dateRange.start} to ${dateRange.end}`
                                                : `${selectedItems.length} selected`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Items Preview (for non-statement) */}
                            {selectedType !== 'statement' && selectedItems.length > 0 && (
                                <div className="rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    {selectedType === 'purchase' ? 'Order #' : 'Description'}
                                                </TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items
                                                .filter((item) => selectedItems.includes(item.uuid))
                                                .map((item) => (
                                                    <TableRow key={item.uuid}>
                                                        <TableCell className="font-mono">
                                                            {'order_number' in item
                                                                ? item.order_number
                                                                : item.description || 'Balance Top-Up'}
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {currencySymbol}
                                                            {item.amount.toFixed(2)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            <TableRow className="bg-muted/50">
                                                <TableCell className="font-semibold">Total</TableCell>
                                                <TableCell className="text-right text-lg font-bold">
                                                    {currencySymbol}
                                                    {selectedTotal.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            <div className="flex justify-between pt-4">
                                <Button variant="outline" onClick={() => setStep(3)}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <Button onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Generate{' '}
                                            {selectedType !== 'statement' && selectedItems.length > 1
                                                ? `${selectedItems.length} Invoices`
                                                : 'Invoice'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
