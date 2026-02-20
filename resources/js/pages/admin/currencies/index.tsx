import { toggleActive as currencyToggle, setDefault as currencySetDefault } from '@/actions/App/Http/Controllers/Admin/CurrencyController';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { RefreshCw, Star, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';

interface Currency {
    id: number;
    code: string;
    name: string;
    symbol: string;
    exchange_rate_to_eur: string | number;
    is_default: boolean;
    is_active: boolean;
    rate_updated_at: string | null;
}

interface Props {
    currencies: Currency[];
    defaultCurrency: Currency | null;
}

interface Flash {
    success?: string;
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Currencies', href: '/admin/currencies' },
];

export default function CurrenciesIndex({
    currencies,
    defaultCurrency,
}: Props) {
    const [updatingRates, setUpdatingRates] = useState(false);
    const { flash } = usePage().props as { flash?: Flash };

    function handleUpdateRates() {
        setUpdatingRates(true);
        router.post(
            '/admin/currencies/update-rates',
            {},
            {
                onFinish: () => setUpdatingRates(false),
            },
        );
    }

    function handleToggle(currency: Currency) {
        router.post(currencyToggle.url(currency.id));
    }

    function handleSetDefault(currency: Currency) {
        router.post(currencySetDefault.url(currency.id));
    }

    function formatDate(dateString: string | null): string {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString();
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Currencies" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Currencies</h1>
                        <p className="text-muted-foreground">
                            Manage exchange rates and currency settings
                        </p>
                    </div>
                    <Button
                        onClick={handleUpdateRates}
                        disabled={updatingRates}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${updatingRates ? 'animate-spin' : ''}`}
                        />
                        {updatingRates
                            ? 'Updating...'
                            : 'Update Exchange Rates'}
                    </Button>
                </div>

                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 p-3 text-green-800">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-800">
                        {flash.error}
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Default Currency
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {defaultCurrency?.symbol}
                                {defaultCurrency?.code}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {defaultCurrency?.name}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Active Currencies
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {currencies.filter((c) => c.is_active).length}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                of {currencies.length} total
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Last Rate Update
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-bold">
                                {formatDate(currencies[0]?.rate_updated_at)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                via Frankfurter API
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Exchange Rates</CardTitle>
                        <CardDescription>
                            All rates are relative to the system default
                            currency ({defaultCurrency?.code})
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Currency</TableHead>
                                    <TableHead>Symbol</TableHead>
                                    <TableHead>
                                        Exchange Rate to {defaultCurrency?.code}
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currencies.map((currency) => (
                                    <TableRow key={currency.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {currency.code}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {currency.name}
                                                </span>
                                                {currency.is_default && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        <Star className="mr-1 h-3 w-3" />
                                                        Default
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-lg">
                                            {currency.symbol}
                                        </TableCell>
                                        <TableCell className="font-mono">
                                            {Number(
                                                currency.exchange_rate_to_eur,
                                            ).toFixed(6)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    currency.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {currency.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(
                                                currency.rate_updated_at,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {!currency.is_default && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleToggle(
                                                                    currency,
                                                                )
                                                            }
                                                        >
                                                            {currency.is_active ? (
                                                                <ToggleRight className="h-4 w-4" />
                                                            ) : (
                                                                <ToggleLeft className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleSetDefault(
                                                                    currency,
                                                                )
                                                            }
                                                        >
                                                            <Star className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
