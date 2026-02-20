import { CountryFlag } from '@/components/country-flag';
import { EsimQrCard } from '@/components/esim-qr-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    FileText,
    Globe,
    HardDrive,
    Loader2,
    Mail,
    Package,
    RefreshCw,
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
    invoice: {
        uuid: string;
        invoice_number: string;
        status: string;
        status_label: string;
        formatted_total: string;
    } | null;
}

interface Customer {
    is_b2b: boolean;
}

interface Props {
    order: Order;
    customer: Customer;
}

function getStatusStyle(color: string): string {
    const colors: Record<string, string> = {
        green: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20',
        yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:ring-yellow-500/20',
        red: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
        blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20',
        gray: 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20',
        orange: 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20',
    };
    return colors[color] || colors.gray;
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'completed':
            return <CheckCircle2 className="h-3.5 w-3.5" />;
        case 'processing':
        case 'provider_purchased':
            return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
        case 'pending_retry':
            return <RefreshCw className="h-3.5 w-3.5" />;
        case 'failed':
            return <XCircle className="h-3.5 w-3.5" />;
        case 'awaiting_payment':
        case 'pending':
            return <Clock className="h-3.5 w-3.5" />;
        default:
            return <Clock className="h-3.5 w-3.5" />;
    }
}

export default function OrderShow({ order, customer }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const resendForm = useForm({
        email: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Shop', href: '/client/packages' },
        { title: 'My Orders', href: '/client/orders' },
        { title: order.order_number, href: '#' },
    ];

    const isActive = [
        'processing',
        'pending_retry',
        'pending',
        'awaiting_payment',
        'provider_purchased',
    ].includes(order.status);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            router.reload({
                only: ['order'],
                preserveState: true,
                preserveScroll: true,
            } as Parameters<typeof router.reload>[0]);
        }, 3000);

        return () => clearInterval(interval);
    }, [isActive, order.status]);

    function handleResendEsim(e: React.FormEvent) {
        e.preventDefault();
        resendForm.post(`/client/orders/${order.uuid}/resend-esim`, {
            onSuccess: () => {
                setDialogOpen(false);
                resendForm.reset();
            },
        });
    }

    const isPendingRetry = order.status === 'pending_retry';
    const isFailed = order.status === 'failed';
    const isProcessing =
        order.status === 'processing' ||
        order.status === 'provider_purchased';
    const isCompleted = order.status === 'completed';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />
            <div className="mx-auto w-full max-w-4xl space-y-5 p-4 md:space-y-6 md:p-6">
                {/* Back link */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground"
                    asChild
                >
                    <Link href="/client/orders">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Orders
                    </Link>
                </Button>

                {/* Order header card */}
                <div className="rounded-xl border bg-card">
                    <div className="flex items-center gap-4 p-5 md:p-6">
                        {/* Flag / icon */}
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted md:h-16 md:w-16">
                            {order.package?.country_iso ? (
                                <CountryFlag
                                    countryCode={order.package.country_iso}
                                    size="lg"
                                />
                            ) : (
                                <Package className="h-6 w-6 text-muted-foreground" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h1 className="truncate text-lg font-semibold md:text-xl">
                                        {order.package?.name || 'eSIM Order'}
                                    </h1>
                                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                                        {order.order_number}
                                    </p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-lg font-semibold tabular-nums md:text-xl">
                                        €{Number(order.amount).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    className={`${getStatusStyle(order.status_color)} inline-flex items-center gap-1 ring-1 ring-inset`}
                                >
                                    {getStatusIcon(order.status)}
                                    {order.status_label}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    Placed {order.created_at}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status alerts */}
                {(isPendingRetry || isProcessing) && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30 md:p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                <Loader2 className="h-4.5 w-4.5 animate-spin text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-blue-800 dark:text-blue-300">
                                    Processing your order...
                                </p>
                                <p className="mt-0.5 text-sm text-blue-600 dark:text-blue-400">
                                    This may take a few moments. The page will
                                    update automatically.
                                </p>
                                {isPendingRetry && (
                                    <div className="mt-3">
                                        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-blue-700 dark:text-blue-300">
                                            <span>
                                                Attempt {order.retry_count} of{' '}
                                                {order.max_retries}
                                            </span>
                                        </div>
                                        <Progress
                                            value={
                                                (order.retry_count /
                                                    order.max_retries) *
                                                100
                                            }
                                            className="h-1.5"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {isFailed && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30 md:p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                                <XCircle className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="font-medium text-red-800 dark:text-red-300">
                                    Order could not be completed
                                </p>
                                <p className="mt-0.5 text-sm text-red-600 dark:text-red-400">
                                    {customer.is_b2b
                                        ? 'Your balance has been refunded. Please try again or contact support.'
                                        : 'Your payment has been refunded. Please try again or contact support.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {isCompleted && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30 md:p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                <CheckCircle2 className="h-4.5 w-4.5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="font-medium text-green-800 dark:text-green-300">
                                    Order completed successfully!
                                </p>
                                <p className="mt-0.5 text-sm text-green-600 dark:text-green-400">
                                    Your eSIM is ready. Scan the QR code or use
                                    the activation code to install it.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* eSIM Installation */}
                {order.esim ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold">
                                eSIM Installation
                            </h2>
                            {isCompleted && (
                                <Dialog
                                    open={dialogOpen}
                                    onOpenChange={setDialogOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Mail className="mr-1.5 h-3.5 w-3.5" />
                                            Resend to Email
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Resend eSIM Data
                                            </DialogTitle>
                                            <DialogDescription>
                                                We'll resend your eSIM QR code
                                                and activation details to your
                                                email. You can also specify a
                                                different email address if
                                                needed.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleResendEsim}>
                                            <div className="grid gap-4 py-4">
                                                <div className="space-y-2">
                                                    <label
                                                        htmlFor="email"
                                                        className="text-sm font-medium"
                                                    >
                                                        Email Address (optional)
                                                    </label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="Leave empty to use original email"
                                                        value={
                                                            resendForm.data
                                                                .email
                                                        }
                                                        onChange={(e) =>
                                                            resendForm.setData(
                                                                'email',
                                                                e.target.value,
                                                            )
                                                        }
                                                        disabled={
                                                            resendForm.processing
                                                        }
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Leave empty to send to
                                                        the email used during
                                                        checkout.
                                                    </p>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setDialogOpen(false)
                                                    }
                                                    disabled={
                                                        resendForm.processing
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        resendForm.processing
                                                    }
                                                >
                                                    {resendForm.processing ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Mail className="mr-2 h-4 w-4" />
                                                            Send eSIM Data
                                                        </>
                                                    )}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        {order.esim.lpa_string ? (
                            <EsimQrCard
                                esim={{
                                    iccid: order.esim.iccid,
                                    lpa_string: order.esim.lpa_string,
                                    qr_code_data: order.esim.qr_code_data,
                                    smdp_address: order.esim.smdp_address,
                                    activation_code:
                                        order.esim.activation_code,
                                }}
                                title="Scan to Install eSIM"
                                description="Use your phone's camera to scan the QR code"
                            />
                        ) : (
                            <div className="rounded-xl border bg-card">
                                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                                    QR code is not available for this eSIM.
                                    Please use the manual installation details
                                    provided in your email.
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold">
                            eSIM Installation
                        </h2>
                        <div className="rounded-xl border bg-card">
                            <div className="flex flex-col items-center justify-center py-14 text-center">
                                {isActive ? (
                                    <>
                                        <div className="rounded-full bg-blue-50 p-4 dark:bg-blue-900/30">
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
                                        <div className="rounded-full bg-red-50 p-4 dark:bg-red-900/30">
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
                                            <Package className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="mt-4 font-semibold">
                                            eSIM details pending
                                        </h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Details will appear here once the
                                            order is processed
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Order details card */}
                <div className="rounded-xl border bg-card">
                    <div className="border-b px-5 py-4">
                        <h2 className="text-base font-semibold">
                            Order Details
                        </h2>
                    </div>
                    <div className="divide-y">
                        {order.package && (
                            <>
                                <div className="flex items-center justify-between px-5 py-3.5">
                                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                        <Package className="h-4 w-4" />
                                        Plan
                                    </div>
                                    <span className="text-sm font-medium">
                                        {order.package.name}
                                    </span>
                                </div>
                                {order.package.country && (
                                    <div className="flex items-center justify-between px-5 py-3.5">
                                        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                            <Globe className="h-4 w-4" />
                                            Region
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            {order.package.country_iso && (
                                                <CountryFlag
                                                    countryCode={
                                                        order.package
                                                            .country_iso
                                                    }
                                                    size="sm"
                                                />
                                            )}
                                            {order.package.country}
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center justify-between px-5 py-3.5">
                                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                        <HardDrive className="h-4 w-4" />
                                        Data
                                    </div>
                                    <span className="text-sm font-medium">
                                        {order.package.data_label}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between px-5 py-3.5">
                                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                        <Timer className="h-4 w-4" />
                                        Validity
                                    </div>
                                    <span className="text-sm">
                                        {order.package.validity_label}
                                    </span>
                                </div>
                            </>
                        )}
                        <div className="flex items-center justify-between px-5 py-3.5">
                            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                <CreditCard className="h-4 w-4" />
                                Total Paid
                            </div>
                            <span className="text-sm font-semibold">
                                €{Number(order.amount).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Timeline card */}
                <div className="rounded-xl border bg-card">
                    <div className="border-b px-5 py-4">
                        <h2 className="text-base font-semibold">Timeline</h2>
                    </div>
                    <div className="divide-y">
                        <div className="flex items-center justify-between px-5 py-3.5">
                            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Ordered
                            </div>
                            <span className="text-sm">
                                {order.created_at}
                            </span>
                        </div>
                        {order.paid_at && (
                            <div className="flex items-center justify-between px-5 py-3.5">
                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                    <CreditCard className="h-4 w-4" />
                                    Paid
                                </div>
                                <span className="text-sm">
                                    {order.paid_at}
                                </span>
                            </div>
                        )}
                        {order.completed_at && (
                            <div className="flex items-center justify-between px-5 py-3.5">
                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Completed
                                </div>
                                <span className="text-sm">
                                    {order.completed_at}
                                </span>
                            </div>
                        )}
                        {order.payments.length > 0 && (
                            <div className="flex items-center justify-between px-5 py-3.5">
                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                    <CreditCard className="h-4 w-4" />
                                    Payment
                                </div>
                                <Badge
                                    variant={
                                        order.payments[0].status ===
                                        'completed'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {order.payments[0].status_label}
                                </Badge>
                            </div>
                        )}
                        {order.invoice && (
                            <div className="flex items-center justify-between px-5 py-3.5">
                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    Invoice
                                </div>
                                <Link
                                    href={`/client/invoices/${order.invoice.uuid}`}
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    {order.invoice.invoice_number}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
