import { BackButton } from '@/components/back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle,
    CheckCircle2,
    Clock,
    Copy,
    CreditCard,
    Globe,
    HardDrive,
    Loader2,
    Package,
    RefreshCw,
    Smartphone,
    Timer,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Payment {
    uuid: string;
    status: string;
    status_label: string;
    provider: string;
    amount: string;
    created_at: string;
}

interface Order {
    uuid: string;
    order_number: string;
    status: string;
    status_label: string;
    status_color: string;
    type: string;
    type_label: string;
    amount: string;
    cost_price: string;
    profit: string;
    payment_status: string | null;
    payment_status_label: string | null;
    retry_count: number;
    max_retries: number;
    next_retry_at: string | null;
    failure_reason: string | null;
    package: {
        name: string;
        data_label: string;
        validity_label: string;
        country: string | null;
        country_iso: string | null;
    } | null;
    esim: {
        iccid: string;
        smdp_address: string | null;
        activation_code: string | null;
        qr_code_data: string | null;
        lpa_string: string | null;
        status: string | null;
    } | null;
    payments: Payment[];
    created_at: string;
    completed_at: string | null;
    paid_at: string | null;
}

interface Customer {
    is_b2b: boolean;
}

interface Props {
    order: Order;
    customer: Customer;
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'completed':
            return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case 'processing':
            return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
        case 'pending_retry':
            return <RefreshCw className="h-5 w-5 text-orange-500" />;
        case 'failed':
            return <XCircle className="h-5 w-5 text-red-500" />;
        case 'awaiting_payment':
        case 'pending':
            return <Clock className="h-5 w-5 text-yellow-500" />;
        default:
            return <Clock className="h-5 w-5 text-gray-500" />;
    }
}

function getStatusBadgeClass(color: string): string {
    const colors: Record<string, string> = {
        green: 'bg-green-100 text-green-700 border-green-200',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        red: 'bg-red-100 text-red-700 border-red-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        orange: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[color] || colors.gray;
}

export default function OrderShow({ order, customer }: Props) {
    const [copied, setCopied] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Shop', href: '/client/packages' },
        { title: 'My Orders', href: '/client/orders' },
        { title: order.order_number, href: '#' },
    ];

    // Poll for updates when order is still processing
    const isActive = [
        'processing',
        'pending_retry',
        'pending',
        'awaiting_payment',
    ].includes(order.status);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            router.reload({
                only: ['order'],
                preserveState: true,
                preserveScroll: true,
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [isActive, order.status]);

    function copyToClipboard(text: string, field: string) {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    }

    const isPendingRetry = order.status === 'pending_retry';
    const isFailed = order.status === 'failed';
    const isProcessing = order.status === 'processing';
    const isCompleted = order.status === 'completed';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/client/orders">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {order.order_number}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Placed on {order.created_at}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className={`${getStatusBadgeClass(order.status_color)} flex w-fit items-center gap-2 px-3 py-1.5 text-sm`}
                    >
                        {getStatusIcon(order.status)}
                        {order.status_label}
                    </Badge>
                </div>

                {/* Status Alerts */}
                {(isPendingRetry || isProcessing) && (
                    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                        <CardContent className="flex items-center gap-3 py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            <div className="flex-1">
                                <p className="font-medium text-blue-700 dark:text-blue-400">
                                    Processing your order...
                                </p>
                                <p className="text-sm text-blue-600 dark:text-blue-500">
                                    This may take a few moments. The page will
                                    update automatically.
                                </p>
                            </div>
                            {isPendingRetry && (
                                <div className="w-24">
                                    <Progress
                                        value={
                                            (order.retry_count /
                                                order.max_retries) *
                                            100
                                        }
                                        className="h-2"
                                    />
                                    <p className="mt-1 text-xs text-blue-600">
                                        Attempt {order.retry_count}/
                                        {order.max_retries}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {isFailed && (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-950/30">
                        <CardContent className="flex items-center gap-3 py-4">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <div>
                                <p className="font-medium text-red-700 dark:text-red-400">
                                    Order could not be completed
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-500">
                                    {customer.is_b2b
                                        ? 'Your balance has been refunded. Please try again or contact support.'
                                        : 'Your payment has been refunded. Please try again or contact support.'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {isCompleted && (
                    <Card className="border-green-200 bg-green-50 dark:bg-green-950/30">
                        <CardContent className="flex items-center gap-3 py-4">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="font-medium text-green-700 dark:text-green-400">
                                    Order completed successfully!
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-500">
                                    Your eSIM is ready. Scan the QR code or use
                                    the activation code to install it.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Package Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Package Details
                            </CardTitle>
                            <CardDescription>
                                Information about your purchased eSIM package
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.package ? (
                                <>
                                    <div className="rounded-lg bg-muted/50 p-4">
                                        <h3 className="text-lg font-semibold">
                                            {order.package.name}
                                        </h3>
                                        {order.package.country && (
                                            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                                <Globe className="h-3.5 w-3.5" />
                                                {order.package.country}
                                            </p>
                                        )}
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                                <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Data
                                                </p>
                                                <p className="font-medium">
                                                    {order.package.data_label}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                                                <Timer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Validity
                                                </p>
                                                <p className="font-medium">
                                                    {
                                                        order.package
                                                            .validity_label
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                Total Paid
                                            </span>
                                        </div>
                                        <span className="text-xl font-bold">
                                            €{Number(order.amount).toFixed(2)}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground">
                                    Package information not available
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* eSIM Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5" />
                                eSIM Installation
                            </CardTitle>
                            <CardDescription>
                                {order.esim
                                    ? 'Scan the QR code with your phone or enter the code manually'
                                    : 'Your eSIM details will appear here once ready'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {order.esim ? (
                                <div className="space-y-6">
                                    {/* QR Code */}
                                    {order.esim.qr_code_data && (
                                        <div className="flex justify-center">
                                            <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 bg-white p-4">
                                                <img
                                                    src={
                                                        order.esim.qr_code_data
                                                    }
                                                    alt="eSIM QR Code"
                                                    className="h-48 w-48"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* LPA String / Activation Code */}
                                    {order.esim.lpa_string && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium">
                                                    Activation Code
                                                </label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 gap-1.5"
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            order.esim!
                                                                .lpa_string!,
                                                            'lpa',
                                                        )
                                                    }
                                                >
                                                    {copied === 'lpa' ? (
                                                        <>
                                                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                                            <span className="text-green-600">
                                                                Copied!
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-3.5 w-3.5" />
                                                            <span>Copy</span>
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                            <div className="rounded-lg bg-muted p-3">
                                                <code className="font-mono text-xs break-all">
                                                    {order.esim.lpa_string}
                                                </code>
                                            </div>
                                        </div>
                                    )}

                                    <Separator />

                                    {/* ICCID */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">
                                                ICCID
                                            </p>
                                            <code className="font-mono text-xs text-muted-foreground">
                                                {order.esim.iccid}
                                            </code>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() =>
                                                copyToClipboard(
                                                    order.esim!.iccid,
                                                    'iccid',
                                                )
                                            }
                                        >
                                            {copied === 'iccid' ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    {isActive ? (
                                        <>
                                            <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900">
                                                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h3 className="mt-4 font-semibold">
                                                Preparing your eSIM...
                                            </h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                This usually takes less than a
                                                minute
                                            </p>
                                        </>
                                    ) : isFailed ? (
                                        <>
                                            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900">
                                                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                            </div>
                                            <h3 className="mt-4 font-semibold">
                                                eSIM not available
                                            </h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                The order could not be completed
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="rounded-full bg-muted p-4">
                                                <Smartphone className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <h3 className="mt-4 font-semibold">
                                                eSIM details pending
                                            </h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Details will appear here once
                                                the order is processed
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                    <BackButton
                        href="/client/orders"
                        label="Back to Orders"
                        variant="outline"
                    />
                    {(isFailed || isCompleted) && (
                        <Button asChild>
                            <Link href="/client/packages">
                                <Package className="mr-2 h-4 w-4" />
                                Order Another eSIM
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
