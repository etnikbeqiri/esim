import { EsimQrCard } from '@/components/esim-qr-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useTrans } from '@/hooks/use-trans';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Ban,
    CheckCircle2,
    ChevronDown,
    Clock,
    Copy,
    CreditCard,
    Database,
    Euro,
    ExternalLink,
    Globe,
    Hash,
    Info,
    Loader2,
    Package,
    Play,
    Receipt,
    RefreshCw,
    Server,
    Smartphone,
    Tag,
    TrendingDown,
    TrendingUp,
    User,
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

function getStatusIcon(status: string, size = 'h-5 w-5') {
    switch (status) {
        case 'completed':
            return <CheckCircle2 className={`${size} text-green-500`} />;
        case 'processing':
            return <Loader2 className={`${size} text-blue-500 animate-spin`} />;
        case 'pending_retry':
            return <RefreshCw className={`${size} text-orange-500`} />;
        case 'failed':
        case 'cancelled':
            return <XCircle className={`${size} text-red-500`} />;
        case 'awaiting_payment':
        case 'pending':
            return <Clock className={`${size} text-yellow-500`} />;
        default:
            return <AlertCircle className={`${size} text-gray-500`} />;
    }
}

function getStatusBadgeClass(color: string): string {
    const colors: Record<string, string> = {
        green: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        gray: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        purple: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        orange: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    };
    return colors[color] || colors.gray;
}

function CopyableField({ label, value, mono = true }: { label: string; value: string | null | undefined; mono?: boolean }) {
    const [copied, setCopied] = useState(false);

    if (!value) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <div className="flex items-center gap-2">
                <code className={`text-xs bg-muted px-2 py-1 rounded flex-1 truncate ${mono ? 'font-mono' : ''}`}>
                    {value}
                </code>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleCopy}
                >
                    {copied ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
            </div>
        </div>
    );
}

function DataRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="flex items-center justify-between py-1.5 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className={mono ? 'font-mono text-xs' : ''}>{value}</span>
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

    const currencySymbol = order.currency?.symbol || defaultCurrency?.symbol || '€';
    const amount = Number(order.amount);
    const costPrice = Number(order.cost_price);
    const profit = Number(order.profit) || amount - costPrice;
    const couponDiscount = Number(order.coupon_discount_amount) || 0;
    const originalAmount = amount + couponDiscount;

    const isActive = ['processing', 'pending_retry', 'pending', 'awaiting_payment'].includes(order.status);
    const isPendingRetry = order.status === 'pending_retry';
    const isFailed = order.status === 'failed';
    const isProcessing = order.status === 'processing';
    const isCompleted = order.status === 'completed';
    const isAwaitingPayment = order.status === 'awaiting_payment';
    const canRetry = ['failed', 'pending_retry', 'processing'].includes(order.status);
    const canFail = ['awaiting_payment', 'pending_retry'].includes(order.status);

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
        if (!confirm(trans('admin.orders.actions.mark_failed_confirm'))) {
            return;
        }
        failForm.post(`/admin/orders/${order.uuid}/fail`, {
            preserveScroll: true,
        });
    }

    useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            router.reload({ only: ['order'], preserveState: true, preserveScroll: true });
        }, 5000);
        return () => clearInterval(interval);
    }, [isActive, order.status]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />
            <div className="flex flex-col gap-8 p-4 md:p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <Button variant="ghost" size="icon" asChild className="shrink-0 mt-1">
                            <Link href="/admin/orders">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold">{order.order_number}</h1>
                                <Badge variant="secondary" className="font-medium">{order.type.toUpperCase()}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge
                                    variant="outline"
                                    className={`${getStatusBadgeClass(order.status_color)} flex items-center gap-1.5`}
                                >
                                    {getStatusIcon(order.status, 'h-3.5 w-3.5')}
                                    {order.status_label}
                                </Badge>
                                {order.payment_status_label && (
                                    <Badge variant="outline" className="text-xs">
                                        Payment: {order.payment_status_label}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground font-mono text-xs">{order.uuid}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                        {canRetry && (
                            <Button onClick={handleRetry} disabled={retryForm.processing || isProcessing} size="sm" className="gap-2">
                                {retryForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                {trans('admin.orders.actions.retry_now')}
                            </Button>
                        )}
                        {canFail && (
                            <Button onClick={handleFail} disabled={failForm.processing} variant="destructive" size="sm" className="gap-2">
                                {failForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                                {trans('admin.orders.actions.mark_failed')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status Alert */}
                {(isAwaitingPayment || isPendingRetry || isFailed) && (
                    <div className={`flex items-start gap-3 rounded-lg border p-4 ${
                        isAwaitingPayment ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-900' :
                        isPendingRetry ? 'border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-900' :
                        'border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900'
                    }`}>
                        {isAwaitingPayment && <Clock className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />}
                        {isPendingRetry && <RefreshCw className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />}
                        {isFailed && <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />}
                        <div className="flex-1 min-w-0">
                            <p className={`font-medium ${
                                isAwaitingPayment ? 'text-yellow-800 dark:text-yellow-300' :
                                isPendingRetry ? 'text-orange-800 dark:text-orange-300' :
                                'text-red-800 dark:text-red-300'
                            }`}>
                                {isAwaitingPayment && trans('admin.orders.status_alert.awaiting_payment_title')}
                                {isPendingRetry && trans('admin.orders.status_alert.pending_retry_title')}
                                {isFailed && trans('admin.orders.status_alert.failed_title')}
                            </p>
                            {order.failure_reason && (
                                <div className="mt-2 text-sm">
                                    <span className="text-muted-foreground">Reason: </span>
                                    <code className="font-mono text-xs">{order.failure_reason}</code>
                                    {order.failure_code && (
                                        <Badge variant="outline" className="ml-2 text-xs">{order.failure_code}</Badge>
                                    )}
                                </div>
                            )}
                            {isPendingRetry && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-sm mb-1.5">
                                        <span>Retry {order.retry_count} of {order.max_retries}</span>
                                        {order.next_retry_at && <span className="font-medium">Next: {order.next_retry_at}</span>}
                                    </div>
                                    <Progress value={(order.retry_count / order.max_retries) * 100} className="h-2" />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Financial Summary */}
                <section>
                    <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Euro className="h-4 w-4" /> Financial Summary
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Amount Paid</p>
                                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{currencySymbol}{amount.toFixed(2)}</p>
                                        {couponDiscount > 0 && (
                                            <p className="text-xs text-blue-500 line-through">{currencySymbol}{originalAmount.toFixed(2)}</p>
                                        )}
                                    </div>
                                    <Euro className="h-8 w-8 text-blue-300 dark:text-blue-700" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium">Cost Price</p>
                                        <p className="text-2xl font-bold">{currencySymbol}{costPrice.toFixed(2)}</p>
                                    </div>
                                    <TrendingDown className="h-8 w-8 text-muted-foreground/30" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={profit >= 0 ? 'bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/20 border-green-200 dark:border-green-800' : 'bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/20 border-red-200 dark:border-red-800'}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-xs font-medium ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>Profit</p>
                                        <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                            {currencySymbol}{profit.toFixed(2)}
                                        </p>
                                    </div>
                                    <TrendingUp className={`h-8 w-8 ${profit >= 0 ? 'text-green-300 dark:text-green-700' : 'text-red-300 dark:text-red-700'}`} />
                                </div>
                            </CardContent>
                        </Card>

                        {couponDiscount > 0 ? (
                            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Discount</p>
                                            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">-{currencySymbol}{couponDiscount.toFixed(2)}</p>
                                            <p className="text-xs text-emerald-500 font-mono">
                                                {order.coupon_usages?.length > 1 ? `${order.coupon_usages.length} coupons` : order.coupon_usages?.[0]?.coupon?.code}
                                            </p>
                                        </div>
                                        <Tag className="h-8 w-8 text-emerald-300 dark:text-emerald-700" />
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium">Retries</p>
                                            <p className="text-2xl font-bold">{order.retry_count}<span className="text-base text-muted-foreground font-normal">/{order.max_retries}</span></p>
                                        </div>
                                        <RefreshCw className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* VAT Breakdown */}
                    {Number(order.vat_rate) > 0 && (
                        <div className="mt-3 rounded-lg border bg-muted/30 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Net Amount</p>
                                        <p className="font-semibold">{currencySymbol}{Number(order.net_amount).toFixed(2)}</p>
                                    </div>
                                    <div className="text-muted-foreground">+</div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">VAT ({Number(order.vat_rate)}%)</p>
                                        <p className="font-semibold">{currencySymbol}{Number(order.vat_amount).toFixed(2)}</p>
                                    </div>
                                    <div className="text-muted-foreground">=</div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total (incl. VAT)</p>
                                        <p className="font-semibold">{currencySymbol}{amount.toFixed(2)}</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-xs">VAT Inclusive</Badge>
                            </div>
                        </div>
                    )}
                </section>

                {/* Row 1: Customer, Package, Payment */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Customer */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4" /> Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                                    {order.customer_name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm">{order.customer_name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{order.customer_email}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                {order.customer && (
                                    <>
                                        <DataRow label="Type" value={<Badge variant="secondary" className="text-xs">{order.customer.type.toUpperCase()}</Badge>} />
                                        <DataRow label="Customer ID" value={
                                            <Link href={`/admin/customers/${order.customer.id}`} className="text-primary hover:underline font-mono text-xs">
                                                #{order.customer.id}
                                            </Link>
                                        } />
                                    </>
                                )}
                                {order.ip_address && <DataRow label="IP Address" value={order.ip_address} mono />}
                            </div>
                            {order.user_agent && (
                                <details className="group">
                                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                                        <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                                        User Agent
                                    </summary>
                                    <p className="mt-1 text-xs font-mono bg-muted p-2 rounded break-all">{order.user_agent}</p>
                                </details>
                            )}
                        </CardContent>
                    </Card>

                    {/* Package */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Package className="h-4 w-4" /> Package
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {order.package ? (
                                <>
                                    <div>
                                        <Link href={`/admin/packages/${order.package.id}`} className="font-medium text-primary hover:underline">
                                            {order.package.name}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">ID: #{order.package.id}</p>
                                    </div>
                                    <Separator />
                                    <div className="space-y-1">
                                        <DataRow label="Data" value={
                                            <span className="font-medium">
                                                {order.package.data_mb >= 1024 ? `${(order.package.data_mb / 1024).toFixed(1)} GB` : `${order.package.data_mb} MB`}
                                            </span>
                                        } />
                                        <DataRow label="Validity" value={`${order.package.validity_days} days`} />
                                        <DataRow label="Provider" value={order.package.provider?.name || '-'} />
                                        <DataRow label="Region" value={
                                            <span className="flex items-center gap-1">
                                                <Globe className="h-3 w-3" />
                                                {order.package.country?.name || '-'}
                                            </span>
                                        } />
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground text-sm">No package information</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CreditCard className="h-4 w-4" /> Payment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {order.payment ? (
                                <>
                                    <DataRow label="Status" value={<Badge variant={order.payment.status === 'completed' ? 'default' : 'secondary'}>{order.payment.status_label}</Badge>} />
                                    <DataRow label="Provider" value={order.payment.provider_label} />
                                    <DataRow label="Amount" value={`${currencySymbol}${Number(order.payment.amount).toFixed(2)}`} />
                                    {order.payment.paid_at && <DataRow label="Paid At" value={order.payment.paid_at} />}
                                    {(order.payment.gateway_session_id || order.payment.gateway_payment_id) && (
                                        <>
                                            <Separator />
                                            {order.payment.gateway_session_id && (
                                                <CopyableField label="Session ID" value={order.payment.gateway_session_id} />
                                            )}
                                            {order.payment.gateway_payment_id && (
                                                <CopyableField label="Payment Intent" value={order.payment.gateway_payment_id} />
                                            )}
                                        </>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">No payment record</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Row 2: Timeline, Coupons, Identifiers */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Timeline */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pl-4 border-l-2 border-muted space-y-3">
                                <div className="relative">
                                    <div className="absolute -left-[21px] h-3 w-3 rounded-full bg-blue-500 border-2 border-background" />
                                    <p className="text-sm font-medium">Created</p>
                                    <p className="text-xs text-muted-foreground">{order.created_at}</p>
                                </div>
                                {order.paid_at && (
                                    <div className="relative">
                                        <div className="absolute -left-[21px] h-3 w-3 rounded-full bg-purple-500 border-2 border-background" />
                                        <p className="text-sm font-medium">Paid</p>
                                        <p className="text-xs text-muted-foreground">{order.paid_at}</p>
                                    </div>
                                )}
                                {order.completed_at && (
                                    <div className="relative">
                                        <div className="absolute -left-[21px] h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                                        <p className="text-sm font-medium">Completed</p>
                                        <p className="text-xs text-muted-foreground">{order.completed_at}</p>
                                    </div>
                                )}
                                {order.next_retry_at && isPendingRetry && (
                                    <div className="relative">
                                        <div className="absolute -left-[21px] h-3 w-3 rounded-full bg-orange-500 border-2 border-background animate-pulse" />
                                        <p className="text-sm font-medium">Next Retry</p>
                                        <p className="text-xs text-muted-foreground">{order.next_retry_at}</p>
                                    </div>
                                )}
                                <div className="relative">
                                    <div className="absolute -left-[21px] h-3 w-3 rounded-full bg-gray-400 border-2 border-background" />
                                    <p className="text-sm font-medium">Last Updated</p>
                                    <p className="text-xs text-muted-foreground">{order.updated_at}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Coupons or Identifiers (show coupons if exists, otherwise identifiers takes this spot) */}
                    {order.coupon_usages && order.coupon_usages.length > 0 ? (
                        <Card className="border-emerald-200 dark:border-emerald-900">
                            <CardHeader className="pb-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-t-lg">
                                <CardTitle className="text-base flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                    <Tag className="h-4 w-4" />
                                    {order.coupon_usages.length === 1 ? 'Coupon Applied' : `${order.coupon_usages.length} Coupons`}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                {order.coupon_usages.map((usage, index) => (
                                    <div key={usage.id} className={index > 0 ? 'pt-3 border-t' : ''}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <Link href={`/admin/coupons/${usage.coupon?.id}`} className="font-mono font-bold text-sm text-primary hover:underline">
                                                    {usage.coupon?.code}
                                                </Link>
                                                <p className="text-xs text-muted-foreground truncate">{usage.coupon?.name}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-semibold text-emerald-600">-{currencySymbol}{Number(usage.discount_amount).toFixed(2)}</p>
                                                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">{usage.coupon?.discount_display}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {order.coupon_usages.length > 1 && (
                                    <div className="pt-3 border-t flex justify-between items-center">
                                        <span className="font-medium text-sm">Total Saved</span>
                                        <span className="font-bold text-emerald-600">-{currencySymbol}{couponDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Hash className="h-4 w-4" /> Identifiers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <CopyableField label="Order ID" value={order.id.toString()} />
                                <CopyableField label="UUID" value={order.uuid} />
                                <CopyableField label="Order Number" value={order.order_number} />
                                {order.provider_order_id && <CopyableField label="Provider Order ID" value={order.provider_order_id} />}
                            </CardContent>
                        </Card>
                    )}

                    {/* Identifiers (or Invoice if coupons shown) */}
                    {order.coupon_usages && order.coupon_usages.length > 0 ? (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Hash className="h-4 w-4" /> Identifiers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <CopyableField label="Order ID" value={order.id.toString()} />
                                <CopyableField label="UUID" value={order.uuid} />
                                <CopyableField label="Order Number" value={order.order_number} />
                                {order.provider_order_id && <CopyableField label="Provider Order ID" value={order.provider_order_id} />}
                            </CardContent>
                        </Card>
                    ) : order.invoice ? (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Receipt className="h-4 w-4" /> Invoice
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-mono font-semibold">{order.invoice.invoice_number}</p>
                                        <Badge variant="outline" className="mt-1 text-xs">{order.invoice.status_label}</Badge>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/invoices/${order.invoice.uuid}`}>View</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}
                </div>

                {/* Row 3: eSIM Profile (full width) */}
                {order.esim_profile && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Smartphone className="h-4 w-4" /> eSIM Profile
                                </CardTitle>
                                {order.esim_profile.last_usage_check_at && (
                                    <CardDescription className="text-xs">Last synced: {order.esim_profile.last_usage_check_at}</CardDescription>
                                )}
                            </div>
                            <Button variant="outline" size="sm" onClick={handleSyncEsim} disabled={syncForm.processing} className="gap-2">
                                {syncForm.processing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : syncSuccess ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <RefreshCw className="h-3.5 w-3.5" />}
                                {syncForm.processing ? 'Syncing...' : syncSuccess ? 'Synced!' : 'Sync'}
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Status & Data */}
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline" className={getStatusBadgeClass(order.esim_profile.status_color || 'gray')}>
                                            {order.esim_profile.status_label || order.esim_profile.status || 'Unknown'}
                                        </Badge>
                                        {order.esim_profile.is_activated ? (
                                            <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400">
                                                <CheckCircle2 className="mr-1 h-3 w-3" /> Activated
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground">Not Activated</Badge>
                                        )}
                                        {order.esim_profile.topup_available && (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400">Top-up</Badge>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        {order.esim_profile.activated_at && (
                                            <div><p className="text-xs text-muted-foreground">Activated</p><p className="font-medium text-sm">{order.esim_profile.activated_at}</p></div>
                                        )}
                                        {order.esim_profile.expires_at && (
                                            <div><p className="text-xs text-muted-foreground">Expires</p><p className="font-medium text-sm">{order.esim_profile.expires_at}</p></div>
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Data Usage</span>
                                        <span className="text-sm font-mono">{order.esim_profile.data_used_mb.toFixed(1)} / {order.esim_profile.data_total_mb.toFixed(1)} MB</span>
                                    </div>
                                    <Progress value={order.esim_profile.data_usage_percentage} className="h-2" />
                                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                        <span>{order.esim_profile.data_usage_percentage.toFixed(1)}% used</span>
                                        <span>{(order.esim_profile.data_remaining_bytes / (1024 * 1024)).toFixed(1)} MB left</span>
                                    </div>
                                </div>
                                {/* QR Code inline */}
                                {order.esim_profile.lpa_string && (
                                    <div className="flex justify-center">
                                        <EsimQrCard
                                            esim={{
                                                iccid: order.esim_profile.iccid,
                                                lpa_string: order.esim_profile.lpa_string,
                                                smdp_address: order.esim_profile.smdp_address,
                                                activation_code: order.esim_profile.activation_code,
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

                            <Separator />

                            {/* Technical Details */}
                            <div>
                                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                    <Database className="h-4 w-4" /> Technical Details
                                </h4>
                                <div className="grid gap-3 md:grid-cols-4">
                                    <CopyableField label="ICCID" value={order.esim_profile.iccid} />
                                    <CopyableField label="SMDP+ Address" value={order.esim_profile.smdp_address} />
                                    <CopyableField label="Activation Code" value={order.esim_profile.activation_code} />
                                    <CopyableField label="LPA String" value={order.esim_profile.lpa_string} />
                                    {order.esim_profile.eid && <CopyableField label="EID" value={order.esim_profile.eid} />}
                                    {order.esim_profile.msisdn && <CopyableField label="MSISDN" value={order.esim_profile.msisdn} />}
                                    {order.esim_profile.imsi && <CopyableField label="IMSI" value={order.esim_profile.imsi} />}
                                    {order.esim_profile.provider_esim_id && <CopyableField label="Provider eSIM ID" value={order.esim_profile.provider_esim_id} />}
                                    {order.esim_profile.pin && <CopyableField label="PIN" value={order.esim_profile.pin} />}
                                    {order.esim_profile.puk && <CopyableField label="PUK" value={order.esim_profile.puk} />}
                                    {order.esim_profile.apn && <CopyableField label="APN" value={order.esim_profile.apn} />}
                                </div>
                            </div>

                            {/* Provider Data */}
                            {order.esim_profile.provider_data && Object.keys(order.esim_profile.provider_data).length > 0 && (
                                <details className="group">
                                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
                                        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                                        Raw Provider Data
                                    </summary>
                                    <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-48 font-mono">
                                        {JSON.stringify(order.esim_profile.provider_data, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Row 4: Invoice & Metadata (side by side if both exist) */}
                {(order.invoice || (order.metadata && Object.keys(order.metadata).length > 0)) && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {order.invoice && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Receipt className="h-4 w-4" /> Invoice
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-mono font-semibold">{order.invoice.invoice_number}</p>
                                            <Badge variant="outline" className="mt-1 text-xs">{order.invoice.status_label}</Badge>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/invoices/${order.invoice.uuid}`}>View</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {order.metadata && Object.keys(order.metadata).length > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Info className="h-4 w-4" /> Order Metadata
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="p-3 bg-muted rounded-lg text-xs overflow-auto max-h-32 font-mono">
                                        {JSON.stringify(order.metadata, null, 2)}
                                    </pre>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
