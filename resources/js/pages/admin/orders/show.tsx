import { EsimQrCard } from '@/components/esim-qr-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTrans } from '@/hooks/use-trans';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Ban,
    CheckCircle2,
    Clock,
    Copy,
    Loader2,
    Play,
    RefreshCw,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Order {
    id: number;
    uuid: string;
    order_number: string;
    status: string;
    status_label: string;
    status_color: string;
    payment_status: string | null;
    payment_status_label: string | null;
    type: string;
    amount: string | number;
    original_amount: string | number | null;
    cost_price: string | number;
    profit: string | number;
    coupon_discount_amount: string | number | null;
    vat_rate: string | number | null;
    vat_amount: string | number | null;
    net_amount: string | number | null;
    currency: { code: string; symbol: string } | null;
    exchange_rate_used: string | number | null;
    coupon: {
        id: number;
        code: string;
        name: string;
        type: string;
        value: string | number;
        discount_display: string;
    } | null;
    coupon_usages: Array<{
        id: number;
        discount_amount: string | number;
        coupon: {
            id: number;
            code: string;
            name: string;
            type: string;
            value: string | number;
            discount_display: string;
        } | null;
    }>;
    provider_order_id: string | null;
    retry_count: number;
    max_retries: number;
    next_retry_at: string | null;
    next_retry_at_iso: string | null;
    failure_reason: string | null;
    failure_code: string | null;
    customer_email: string;
    customer_name: string;
    ip_address: string | null;
    user_agent: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    created_at_iso: string;
    updated_at: string;
    updated_at_iso: string;
    completed_at: string | null;
    completed_at_iso: string | null;
    paid_at: string | null;
    paid_at_iso: string | null;
    customer: {
        id: number;
        type: string;
        user: { name: string; email: string } | null;
    } | null;
    package: {
        id: number;
        name: string;
        data_mb: number;
        validity_days: number;
        provider: { name: string } | null;
        country: { name: string } | null;
    } | null;
    esim_profile: {
        id: number;
        provider_esim_id: string | null;
        iccid: string;
        eid: string | null;
        msisdn: string | null;
        imsi: string | null;
        activation_code: string;
        smdp_address: string;
        lpa_string: string | null;
        pin: string | null;
        puk: string | null;
        apn: string | null;
        status: string | null;
        status_label: string | null;
        status_color: string | null;
        is_activated: boolean;
        topup_available: boolean;
        data_used_bytes: number;
        data_total_bytes: number;
        data_used_mb: number;
        data_total_mb: number;
        data_remaining_bytes: number;
        data_usage_percentage: number;
        activated_at: string | null;
        expires_at: string | null;
        last_usage_check_at: string | null;
        created_at: string | null;
        provider_data: Record<string, unknown> | null;
    } | null;
    payment: {
        id: number;
        uuid: string | null;
        status: string;
        status_label: string;
        provider: string | null;
        provider_label: string;
        amount: string | number;
        gateway_session_id: string | null;
        gateway_payment_id: string | null;
        created_at: string | null;
        paid_at: string | null;
    } | null;
    invoice: {
        id: number;
        uuid: string;
        invoice_number: string;
        status: string;
        status_label: string;
    } | null;
}

interface Currency {
    id: number;
    code: string;
    symbol: string;
}

interface Props {
    order: Order;
    defaultCurrency: Currency | null;
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'completed':
            return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case 'processing':
            return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
        case 'pending_retry':
            return <RefreshCw className="h-4 w-4 text-orange-500" />;
        case 'failed':
        case 'cancelled':
            return <XCircle className="h-4 w-4 text-red-500" />;
        case 'awaiting_payment':
        case 'pending':
            return <Clock className="h-4 w-4 text-yellow-500" />;
        default:
            return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
}

function getStatusBadgeClass(color: string): string {
    const colors: Record<string, string> = {
        green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
        purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[color] || colors.gray;
}

function CopyableField({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    const [copied, setCopied] = useState(false);
    if (!value) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <code className="max-w-[280px] truncate rounded bg-muted px-2 py-0.5 font-mono text-xs">
                    {value}
                </code>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                    onClick={handleCopy}
                >
                    {copied ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                        <Copy className="h-3 w-3" />
                    )}
                </Button>
            </div>
        </div>
    );
}

export default function OrderShow({ order, defaultCurrency }: Props) {
    const { trans } = useTrans();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: trans('admin.dashboard.title'), href: '/dashboard' },
        { title: trans('admin.orders.title'), href: '/admin/orders' },
        { title: order.order_number, href: `/admin/orders/${order.uuid}` },
    ];

    const currencySymbol =
        order.currency?.symbol || defaultCurrency?.symbol || '€';
    const amount = Number(order.amount);
    const costPrice = Number(order.cost_price);
    const profit = Number(order.profit) || amount - costPrice;
    const couponDiscount = Number(order.coupon_discount_amount) || 0;

    const isActive = [
        'processing',
        'pending_retry',
        'pending',
        'awaiting_payment',
    ].includes(order.status);
    const isPendingRetry = order.status === 'pending_retry';
    const isFailed = order.status === 'failed';
    const isProcessing = order.status === 'processing';
    const isAwaitingPayment = order.status === 'awaiting_payment';
    const canRetry = ['failed', 'pending_retry', 'processing'].includes(
        order.status,
    );
    const canFail = ['awaiting_payment', 'pending_retry'].includes(
        order.status,
    );

    const retryForm = useForm({});
    const failForm = useForm({ reason: 'Manually failed by admin' });
    const syncForm = useForm({});
    const [syncSuccess, setSyncSuccess] = useState(false);

    function handleSyncEsim() {
        syncForm.post(`/admin/orders/${order.uuid}/sync-esim`, {
            preserveScroll: true,
            onSuccess: () => {
                setSyncSuccess(true);
                setTimeout(() => setSyncSuccess(false), 3000);
            },
        });
    }

    function handleRetry() {
        retryForm.post(`/admin/orders/${order.uuid}/retry`, {
            preserveScroll: true,
        });
    }

    function handleFail() {
        if (!confirm(trans('admin.orders.actions.mark_failed_confirm'))) return;
        failForm.post(`/admin/orders/${order.uuid}/fail`, {
            preserveScroll: true,
        });
    }

    useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            router.reload({
                only: ['order'],
                preserveState: true,
                preserveScroll: true,
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [isActive, order.status]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />
            <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4 p-4">
                    <div className="flex items-start gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            asChild
                        >
                            <Link href="/admin/orders">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-semibold">
                                    {order.order_number}
                                </h1>
                                <Badge variant="outline">
                                    {order.type.toUpperCase()}
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className={`${getStatusBadgeClass(order.status_color)} flex items-center gap-1`}
                                >
                                    {getStatusIcon(order.status)}
                                    {order.status_label}
                                </Badge>
                            </div>
                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                                {order.uuid}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {canRetry && (
                            <Button
                                size="sm"
                                onClick={handleRetry}
                                disabled={retryForm.processing || isProcessing}
                            >
                                {retryForm.processing ? (
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Play className="mr-1.5 h-3.5 w-3.5" />
                                )}
                                Retry
                            </Button>
                        )}
                        {canFail && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleFail}
                                disabled={failForm.processing}
                            >
                                {failForm.processing ? (
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Ban className="mr-1.5 h-3.5 w-3.5" />
                                )}
                                Mark Failed
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mx-auto w-full max-w-5xl space-y-6 px-4">
                    {(isAwaitingPayment || isPendingRetry || isFailed) && (
                        <div
                            className={`rounded-lg border p-4 ${
                                isAwaitingPayment
                                    ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30'
                                    : isPendingRetry
                                      ? 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30'
                                      : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                {isAwaitingPayment && (
                                    <Clock className="h-5 w-5 shrink-0 text-yellow-600" />
                                )}
                                {isPendingRetry && (
                                    <RefreshCw className="h-5 w-5 shrink-0 text-orange-600" />
                                )}
                                {isFailed && (
                                    <XCircle className="h-5 w-5 shrink-0 text-red-600" />
                                )}
                                <div className="flex-1">
                                    <p
                                        className={`font-medium ${
                                            isAwaitingPayment
                                                ? 'text-yellow-800 dark:text-yellow-300'
                                                : isPendingRetry
                                                  ? 'text-orange-800 dark:text-orange-300'
                                                  : 'text-red-800 dark:text-red-300'
                                        }`}
                                    >
                                        {isAwaitingPayment &&
                                            'Awaiting Payment'}
                                        {isPendingRetry && 'Pending Retry'}
                                        {isFailed && 'Order Failed'}
                                    </p>
                                    {order.failure_reason && (
                                        <p className="mt-1 text-sm">
                                            <span className="text-muted-foreground">
                                                Reason:{' '}
                                            </span>
                                            <code className="font-mono text-xs">
                                                {order.failure_reason}
                                            </code>
                                        </p>
                                    )}
                                    {isPendingRetry && (
                                        <div className="mt-3">
                                            <div className="mb-1 flex items-center justify-between text-sm">
                                                <span>
                                                    Retry {order.retry_count} of{' '}
                                                    {order.max_retries}
                                                </span>
                                                {order.next_retry_at && (
                                                    <span className="font-medium">
                                                        Next:{' '}
                                                        {order.next_retry_at}
                                                    </span>
                                                )}
                                            </div>
                                            <Progress
                                                value={
                                                    (order.retry_count /
                                                        order.max_retries) *
                                                    100
                                                }
                                                className="h-2"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-4 gap-px overflow-hidden rounded-lg border bg-border">
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                Amount
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {currencySymbol}
                                {amount.toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                Cost
                            </p>
                            <p className="mt-1 text-lg font-semibold text-muted-foreground">
                                {currencySymbol}
                                {costPrice.toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                Profit
                            </p>
                            <p
                                className={`mt-1 text-lg font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                                {currencySymbol}
                                {profit.toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                Retries
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {order.retry_count}/{order.max_retries}
                            </p>
                        </div>
                    </div>

                    {Number(order.vat_rate) > 0 && (
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <div className="flex items-center gap-6 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Net
                                    </p>
                                    <p className="font-medium">
                                        {currencySymbol}
                                        {Number(order.net_amount).toFixed(2)}
                                    </p>
                                </div>
                                <span className="text-muted-foreground">+</span>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        VAT ({Number(order.vat_rate)}%)
                                    </p>
                                    <p className="font-medium">
                                        {currencySymbol}
                                        {Number(order.vat_amount).toFixed(2)}
                                    </p>
                                </div>
                                <span className="text-muted-foreground">=</span>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Total
                                    </p>
                                    <p className="font-medium">
                                        {currencySymbol}
                                        {amount.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {couponDiscount > 0 &&
                        order.coupon_usages &&
                        order.coupon_usages.length > 0 && (
                            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                            {order.coupon_usages.length === 1
                                                ? 'Coupon Applied'
                                                : `${order.coupon_usages.length} Coupons`}
                                        </p>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {order.coupon_usages.map(
                                                (usage) => (
                                                    <Link
                                                        key={usage.id}
                                                        href={`/admin/coupons/${usage.coupon?.id}`}
                                                        className="font-mono text-sm text-green-600 hover:underline dark:text-green-400"
                                                    >
                                                        {usage.coupon?.code}
                                                    </Link>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                        -{currencySymbol}
                                        {couponDiscount.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        )}

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                            <h2 className="mb-4 text-sm font-medium">
                                Customer
                            </h2>
                            <div className="rounded-lg border">
                                <div className="divide-y">
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            Name
                                        </span>
                                        <span className="text-sm font-medium">
                                            {order.customer_name}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            Email
                                        </span>
                                        <span className="text-sm">
                                            {order.customer_email}
                                        </span>
                                    </div>
                                    {order.customer && (
                                        <>
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <span className="text-sm text-muted-foreground">
                                                    Type
                                                </span>
                                                <Badge variant="outline">
                                                    {order.customer.type.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <span className="text-sm text-muted-foreground">
                                                    Customer
                                                </span>
                                                <Link
                                                    href={`/admin/customers/${order.customer.id}`}
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    View Profile
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                    {order.ip_address && (
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                IP Address
                                            </span>
                                            <code className="font-mono text-xs">
                                                {order.ip_address}
                                            </code>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="mb-4 text-sm font-medium">
                                Package
                            </h2>
                            <div className="rounded-lg border">
                                {order.package ? (
                                    <div className="divide-y">
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Name
                                            </span>
                                            <Link
                                                href={`/admin/packages/${order.package.id}`}
                                                className="text-sm font-medium text-primary hover:underline"
                                            >
                                                {order.package.name}
                                            </Link>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Data
                                            </span>
                                            <span className="text-sm font-medium">
                                                {order.package.data_mb >= 1024
                                                    ? `${(order.package.data_mb / 1024).toFixed(1)} GB`
                                                    : `${order.package.data_mb} MB`}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Validity
                                            </span>
                                            <span className="text-sm">
                                                {order.package.validity_days}{' '}
                                                days
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Provider
                                            </span>
                                            <span className="text-sm">
                                                {order.package.provider?.name ||
                                                    '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Region
                                            </span>
                                            <span className="text-sm">
                                                {order.package.country?.name ||
                                                    '—'}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                        No package information
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                            <h2 className="mb-4 text-sm font-medium">
                                Payment
                            </h2>
                            <div className="rounded-lg border">
                                {order.payment ? (
                                    <div className="divide-y">
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Status
                                            </span>
                                            <Badge
                                                variant={
                                                    order.payment.status ===
                                                    'completed'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {order.payment.status_label}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Provider
                                            </span>
                                            <span className="text-sm">
                                                {order.payment.provider_label}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Amount
                                            </span>
                                            <span className="text-sm font-medium">
                                                {currencySymbol}
                                                {Number(
                                                    order.payment.amount,
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                        {order.payment.paid_at && (
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <span className="text-sm text-muted-foreground">
                                                    Paid At
                                                </span>
                                                <span className="text-sm">
                                                    {order.payment.paid_at}
                                                </span>
                                            </div>
                                        )}
                                        {order.payment.gateway_payment_id && (
                                            <CopyableField
                                                label="Payment ID"
                                                value={
                                                    order.payment
                                                        .gateway_payment_id
                                                }
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                        No payment record
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h2 className="mb-4 text-sm font-medium">
                                Timeline
                            </h2>
                            <div className="rounded-lg border">
                                <div className="divide-y">
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            Created
                                        </span>
                                        <span className="text-sm">
                                            {order.created_at}
                                        </span>
                                    </div>
                                    {order.paid_at && (
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Paid
                                            </span>
                                            <span className="text-sm">
                                                {order.paid_at}
                                            </span>
                                        </div>
                                    )}
                                    {order.completed_at && (
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Completed
                                            </span>
                                            <span className="text-sm">
                                                {order.completed_at}
                                            </span>
                                        </div>
                                    )}
                                    {order.next_retry_at && isPendingRetry && (
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-orange-600">
                                                Next Retry
                                            </span>
                                            <span className="text-sm">
                                                {order.next_retry_at}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            Updated
                                        </span>
                                        <span className="text-sm">
                                            {order.updated_at}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {order.invoice && (
                        <div>
                            <h2 className="mb-4 text-sm font-medium">
                                Invoice
                            </h2>
                            <div className="rounded-lg border">
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div>
                                        <code className="font-mono text-sm font-medium">
                                            {order.invoice.invoice_number}
                                        </code>
                                        <Badge
                                            variant="outline"
                                            className="ml-2"
                                        >
                                            {order.invoice.status_label}
                                        </Badge>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link
                                            href={`/admin/invoices/${order.invoice.uuid}`}
                                        >
                                            View Invoice
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {order.esim_profile && (
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-sm font-medium">
                                    eSIM Profile
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSyncEsim}
                                    disabled={syncForm.processing}
                                >
                                    {syncForm.processing ? (
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : syncSuccess ? (
                                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    {syncForm.processing
                                        ? 'Syncing...'
                                        : syncSuccess
                                          ? 'Synced!'
                                          : 'Sync'}
                                </Button>
                            </div>
                            <div className="rounded-lg border">
                                <div className="divide-y">
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            Status
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className={getStatusBadgeClass(
                                                    order.esim_profile
                                                        .status_color || 'gray',
                                                )}
                                            >
                                                {order.esim_profile
                                                    .status_label ||
                                                    order.esim_profile.status ||
                                                    'Unknown'}
                                            </Badge>
                                            {order.esim_profile
                                                .is_activated && (
                                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    Activated
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-4 py-3">
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Data Usage
                                            </span>
                                            <span className="font-mono">
                                                {order.esim_profile.data_used_mb.toFixed(
                                                    1,
                                                )}{' '}
                                                /{' '}
                                                {order.esim_profile.data_total_mb.toFixed(
                                                    1,
                                                )}{' '}
                                                MB
                                            </span>
                                        </div>
                                        <Progress
                                            value={
                                                order.esim_profile
                                                    .data_usage_percentage
                                            }
                                            className="h-2"
                                        />
                                        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                                            <span>
                                                {order.esim_profile.data_usage_percentage.toFixed(
                                                    1,
                                                )}
                                                % used
                                            </span>
                                            <span>
                                                {(
                                                    order.esim_profile
                                                        .data_remaining_bytes /
                                                    (1024 * 1024)
                                                ).toFixed(1)}{' '}
                                                MB left
                                            </span>
                                        </div>
                                    </div>
                                    {order.esim_profile.activated_at && (
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Activated
                                            </span>
                                            <span className="text-sm">
                                                {
                                                    order.esim_profile
                                                        .activated_at
                                                }
                                            </span>
                                        </div>
                                    )}
                                    {order.esim_profile.expires_at && (
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                Expires
                                            </span>
                                            <span className="text-sm">
                                                {order.esim_profile.expires_at}
                                            </span>
                                        </div>
                                    )}
                                    <CopyableField
                                        label="ICCID"
                                        value={order.esim_profile.iccid}
                                    />
                                    <CopyableField
                                        label="SMDP+ Address"
                                        value={order.esim_profile.smdp_address}
                                    />
                                    <CopyableField
                                        label="Activation Code"
                                        value={
                                            order.esim_profile.activation_code
                                        }
                                    />
                                    <CopyableField
                                        label="LPA String"
                                        value={order.esim_profile.lpa_string}
                                    />
                                    {order.esim_profile.pin && (
                                        <CopyableField
                                            label="PIN"
                                            value={order.esim_profile.pin}
                                        />
                                    )}
                                    {order.esim_profile.puk && (
                                        <CopyableField
                                            label="PUK"
                                            value={order.esim_profile.puk}
                                        />
                                    )}
                                    {order.esim_profile.apn && (
                                        <CopyableField
                                            label="APN"
                                            value={order.esim_profile.apn}
                                        />
                                    )}
                                </div>
                            </div>
                            {order.esim_profile.lpa_string && (
                                <div className="mt-4 flex justify-center">
                                    <EsimQrCard
                                        esim={{
                                            iccid: order.esim_profile.iccid,
                                            lpa_string:
                                                order.esim_profile.lpa_string,
                                            smdp_address:
                                                order.esim_profile.smdp_address,
                                            activation_code:
                                                order.esim_profile
                                                    .activation_code,
                                            pin: order.esim_profile.pin,
                                            puk: order.esim_profile.puk,
                                            apn: order.esim_profile.apn,
                                        }}
                                        title="QR Code"
                                        description="Scan to install"
                                        compact
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <h2 className="mb-4 text-sm font-medium">
                            Identifiers
                        </h2>
                        <div className="rounded-lg border">
                            <CopyableField
                                label="Order ID"
                                value={order.id.toString()}
                            />
                            <CopyableField label="UUID" value={order.uuid} />
                            <CopyableField
                                label="Order Number"
                                value={order.order_number}
                            />
                            {order.provider_order_id && (
                                <CopyableField
                                    label="Provider Order ID"
                                    value={order.provider_order_id}
                                />
                            )}
                        </div>
                    </div>

                    {order.metadata &&
                        Object.keys(order.metadata).length > 0 && (
                            <div>
                                <h2 className="mb-4 text-sm font-medium">
                                    Metadata
                                </h2>
                                <div className="rounded-lg border p-4">
                                    <pre className="max-h-48 overflow-auto font-mono text-xs">
                                        {JSON.stringify(
                                            order.metadata,
                                            null,
                                            2,
                                        )}
                                    </pre>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </AppLayout>
    );
}
