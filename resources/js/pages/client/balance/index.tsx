import { index as balanceIndex } from '@/actions/App/Http/Controllers/Client/BalanceController';
import { PaymentMethodIcons } from '@/components/payment-method-icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useTrans } from '@/hooks/use-trans';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDownLeft,
    ArrowUpRight,
    CheckCircle,
    CreditCard,
    Loader2,
    Plus,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

interface Transaction {
    uuid: string;
    type: string;
    type_label: string;
    is_credit: boolean;
    amount: string;
    signed_amount: number;
    balance_before: string;
    balance_after: string;
    description: string | null;
    order_number: string | null;
    created_at: string;
}

interface Balance {
    current: string;
    reserved: string;
    available: number;
}

interface Customer {
    display_name: string;
    discount_percentage: string;
}

interface Currency {
    code: string;
    symbol: string;
}

interface PaymentMethod {
    name: string;
    icon: string;
    logo_url?: string;
}

interface PaymentProvider {
    id: string;
    name: string;
    description: string;
    payment_methods: PaymentMethod[];
}

interface Props {
    balance: Balance;
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        total: number;
    };
    customer: Customer;
    currency: Currency;
    paymentProviders: PaymentProvider[];
    defaultProvider: string;
}

export default function BalanceIndex({
    balance,
    transactions,
    customer,
    currency,
    paymentProviders,
    defaultProvider,
}: Props) {
    const { trans } = useTrans();
    const [topUpOpen, setTopUpOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Client', href: '/client' },
        { title: trans('client_balance.title'), href: balanceIndex.url() },
    ];

    const [amount, setAmount] = useState('100');
    const [selectedProvider, setSelectedProvider] = useState(defaultProvider);
    const [processing, setProcessing] = useState(false);
    const { flash } = usePage().props as {
        flash?: { success?: string; error?: string; message?: string };
    };

    const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

    const handleTopUp = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 10) {
            return;
        }

        setProcessing(true);
        router.post(
            '/client/balance/topup',
            {
                amount: numAmount,
                payment_provider: selectedProvider,
            },
            {
                onFinish: () => setProcessing(false),
                onError: () => setProcessing(false),
            },
        );
    };

    const isValidAmount = () => {
        const num = parseFloat(amount);
        return !isNaN(num) && num >= 10 && num <= 10000;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={trans('client_balance.title')} />
            <div className="flex flex-col gap-6 p-4">
                {/* Flash Messages */}
                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}
                {flash?.error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}
                {flash?.message && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{flash.message}</AlertDescription>
                    </Alert>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {trans('client_balance.title')}
                        </h1>
                        <p className="text-muted-foreground">
                            {customer.display_name}
                        </p>
                    </div>
                    {paymentProviders.length > 0 && (
                        <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
                            <Button onClick={() => setTopUpOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                {trans('client_balance.top_up_balance')}
                            </Button>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>
                                        {trans('client_balance.top_up_balance')}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {trans(
                                            'client_balance.top_up_description',
                                        )}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6 py-4">
                                    {/* Amount Input */}
                                    <div className="space-y-3">
                                        <Label htmlFor="amount">
                                            {trans(
                                                'client_balance.amount_label',
                                            )}{' '}
                                            ({currency.code})
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                                                {currency.symbol}
                                            </span>
                                            <Input
                                                id="amount"
                                                type="number"
                                                min="10"
                                                max="10000"
                                                step="0.01"
                                                value={amount}
                                                onChange={(e) =>
                                                    setAmount(e.target.value)
                                                }
                                                className="pl-8 text-lg font-medium"
                                                placeholder="100.00"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {trans(
                                                'client_balance.minimum_maximum',
                                                {
                                                    min: `${currency.symbol}10`,
                                                    max: `${currency.symbol}10,000`,
                                                },
                                            )}
                                        </p>

                                        {/* Preset Amounts */}
                                        <div className="flex flex-wrap gap-2">
                                            {PRESET_AMOUNTS.map((preset) => (
                                                <Button
                                                    key={preset}
                                                    type="button"
                                                    variant={
                                                        amount ===
                                                        String(preset)
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        setAmount(
                                                            String(preset),
                                                        )
                                                    }
                                                >
                                                    {currency.symbol}
                                                    {preset}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment Provider Selection */}
                                    <div className="space-y-3">
                                        <Label>
                                            {trans(
                                                'client_balance.payment_method',
                                            )}
                                        </Label>
                                        <RadioGroup
                                            value={selectedProvider}
                                            onValueChange={setSelectedProvider}
                                            className="space-y-3"
                                        >
                                            {paymentProviders.map(
                                                (provider) => (
                                                    <div
                                                        key={provider.id}
                                                        className="relative"
                                                    >
                                                        <RadioGroupItem
                                                            value={provider.id}
                                                            id={`provider-${provider.id}`}
                                                            className="peer sr-only"
                                                        />
                                                        <Label
                                                            htmlFor={`provider-${provider.id}`}
                                                            className="flex cursor-pointer flex-col rounded-lg border bg-card p-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                                        <CreditCard className="h-5 w-5 text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">
                                                                            {
                                                                                provider.name
                                                                            }
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {
                                                                                provider.description
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className={`h-4 w-4 rounded-full border-2 ${
                                                                        selectedProvider ===
                                                                        provider.id
                                                                            ? 'border-primary bg-primary'
                                                                            : 'border-muted-foreground'
                                                                    }`}
                                                                >
                                                                    {selectedProvider ===
                                                                        provider.id && (
                                                                        <div className="flex h-full w-full items-center justify-center">
                                                                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="mt-3">
                                                                <p className="mb-2 text-xs text-muted-foreground">
                                                                    {trans(
                                                                        'client_balance.accepted',
                                                                    )}
                                                                </p>
                                                                <PaymentMethodIcons
                                                                    methods={
                                                                        provider.payment_methods
                                                                    }
                                                                />
                                                            </div>
                                                        </Label>
                                                    </div>
                                                ),
                                            )}
                                        </RadioGroup>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={handleTopUp}
                                        disabled={
                                            processing ||
                                            !isValidAmount() ||
                                            !selectedProvider
                                        }
                                        className="w-full"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {trans(
                                                    'client_balance.processing',
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                {trans('client_balance.pay')}{' '}
                                                {currency.symbol}
                                                {isValidAmount()
                                                    ? parseFloat(
                                                          amount,
                                                      ).toFixed(2)
                                                    : '0.00'}
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-center text-xs text-muted-foreground">
                                        {trans(
                                            'client_balance.redirect_message',
                                        )}
                                    </p>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Balance Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                {trans('client_balance.available_balance')}
                            </CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">
                                {currency.symbol}
                                {balance.available.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {trans('client_balance.ready_to_spend')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                {trans('client_balance.total_balance')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {currency.symbol}
                                {Number(balance.current).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {trans('client_balance.including_reserved')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                {trans('client_balance.reserved')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-muted-foreground">
                                {currency.symbol}
                                {Number(balance.reserved).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {trans('client_balance.pending_transactions')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Discount Badge */}
                {customer.discount_percentage &&
                    Number(customer.discount_percentage) > 0 && (
                        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                            <CardContent className="py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-green-800 dark:text-green-200">
                                            {trans(
                                                'client_balance.b2b_discount_active',
                                            )}
                                        </p>
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            {trans(
                                                'client_balance.b2b_discount_desc',
                                                {
                                                    percentage:
                                                        customer.discount_percentage,
                                                },
                                            )}
                                        </p>
                                    </div>
                                    <Badge className="bg-green-600 text-white">
                                        {customer.discount_percentage}%{' '}
                                        {trans('client_balance.off')}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                {/* Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {trans('client_balance.transaction_history')}
                        </CardTitle>
                        <CardDescription>
                            {trans('client_balance.transactions_count', {
                                count: transactions.total.toString(),
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                {trans('client_balance.no_transactions')}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            {trans('client_balance.type')}
                                        </TableHead>
                                        <TableHead>
                                            {trans(
                                                'client_balance.description',
                                            )}
                                        </TableHead>
                                        <TableHead>
                                            {trans('client_balance.amount')}
                                        </TableHead>
                                        <TableHead>
                                            {trans('client_balance.balance')}
                                        </TableHead>
                                        <TableHead>
                                            {trans('client_balance.date')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.data.map((tx) => (
                                        <TableRow key={tx.uuid}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {tx.is_credit ? (
                                                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                                                    )}
                                                    <span>{tx.type_label}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {tx.description ||
                                                    tx.order_number ||
                                                    '-'}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={
                                                        tx.is_credit
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }
                                                >
                                                    {tx.is_credit ? '+' : '-'}
                                                    {currency.symbol}
                                                    {Math.abs(
                                                        Number(tx.amount),
                                                    ).toFixed(2)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {currency.symbol}
                                                {Number(
                                                    tx.balance_after,
                                                ).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {tx.created_at}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {transactions.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from(
                            { length: Math.min(transactions.last_page, 10) },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <Button
                                key={page}
                                variant={
                                    page === transactions.current_page
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                    router.get(balanceIndex.url(), { page })
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
