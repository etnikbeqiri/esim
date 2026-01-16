import { EsimQrCard } from '@/components/esim-qr-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Clock,
    Loader2,
    Play,
    Receipt,
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
    type: string;
    amount: string | number;
    cost_price: string | number;
    profit: string | number;
    provider_order_id: string | null;
    retry_count: number;
    max_retries: number;
    next_retry_at: string | null;
    failure_reason: string | null;
    customer_email: string;
    customer_name: string;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
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
        iccid: string;
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
        provider_data: Record<string, unknown> | null;
    } | null;
    payment: {
        id: number;
        status: string;
        provider: string;
        amount: string | number;
        gateway_session_id: string | null;
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
        green: 'bg-green-100 text-green-700 border-green-200',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        red: 'bg-red-100 text-red-700 border-red-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
        orange: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[color] || colors.gray;
}

export default function OrderShow({ order, defaultCurrency }: Props) {
    const { trans } = useTrans();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: trans('admin.dashboard.title'), href: '/dashboard' },
        { title: trans('admin.orders.title'), href: '/admin/orders' },
        { title: order.order_number, href: `/admin/orders/${order.uuid}` },
    ];

    const currencySymbol = defaultCurrency?.symbol || '€';
    const amount = Number(order.amount);
    const costPrice = Number(order.cost_price);
    const profit = Number(order.profit) || amount - costPrice;

    const isActive = ['processing', 'pending_retry', 'pending', 'awaiting_payment'].includes(order.status);
    const isPendingRetry = order.status === 'pending_retry';
    const isFailed = order.status === 'failed';
    const isProcessing = order.status === 'processing';
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

    // Poll for updates when order is active
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
            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/orders">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold">{order.order_number}</h1>
                        <p className="text-muted-foreground font-mono text-sm">{order.uuid}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <Badge
                            variant="outline"
                            className={`${getStatusBadgeClass(order.status_color)} flex items-center gap-1`}
                        >
                            {getStatusIcon(order.status, 'h-4 w-4')}
                            {order.status_label}
                        </Badge>
                        <Badge variant="outline">{order.type.toUpperCase()}</Badge>
                        {canRetry && (
                            <Button
                                onClick={handleRetry}
                                disabled={retryForm.processing || isProcessing}
                                size="sm"
                            >
                                {retryForm.processing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Play className="mr-2 h-4 w-4" />
                                )}
                                {trans('admin.orders.actions.retry_now')}
                            </Button>
                        )}
                        {canFail && (
                            <Button
                                onClick={handleFail}
                                disabled={failForm.processing}
                                variant="destructive"
                                size="sm"
                            >
                                {failForm.processing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Ban className="mr-2 h-4 w-4" />
                                )}
                                {trans('admin.orders.actions.mark_failed')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status Alerts for Admin */}
                {isAwaitingPayment && (
                    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-900">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
                                        {trans('admin.orders.status_alert.awaiting_payment_title')}
                                    </h3>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                        {trans('admin.orders.status_alert.awaiting_payment_desc')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {isPendingRetry && (
                    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-900">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <RefreshCw className="h-5 w-5 text-orange-500 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-orange-800 dark:text-orange-300">
                                        {trans('admin.orders.status_alert.pending_retry_title')}
                                    </h3>
                                    {order.failure_reason && (
                                        <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900/50 rounded text-sm">
                                            <span className="font-medium text-orange-700 dark:text-orange-400">
                                                {trans('admin.orders.failure_reason')}:
                                            </span>
                                            <p className="text-orange-800 dark:text-orange-300 mt-1">
                                                {order.failure_reason}
                                            </p>
                                        </div>
                                    )}
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-orange-700 dark:text-orange-400">
                                                {trans('admin.orders.retry_info', { count: order.retry_count, max: order.max_retries })}
                                            </span>
                                            {order.next_retry_at && (
                                                <span className="text-orange-600 dark:text-orange-500">
                                                    {trans('admin.orders.next_retry', { date: order.next_retry_at })}
                                                </span>
                                            )}
                                        </div>
                                        <Progress
                                            value={(order.retry_count / order.max_retries) * 100}
                                            className="h-2"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {isFailed && (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-red-800 dark:text-red-300">
                                        {trans('admin.orders.status_alert.failed_title')}
                                    </h3>
                                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                        {trans('admin.orders.status_alert.failed_desc', { count: order.retry_count })}
                                    </p>
                                    {order.failure_reason && (
                                        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/50 rounded text-sm">
                                            <span className="font-medium text-red-700 dark:text-red-400">
                                                {trans('admin.orders.failure_reason')}:
                                            </span>
                                            <p className="text-red-800 dark:text-red-300 mt-1 font-mono text-xs">
                                                {order.failure_reason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{trans('admin.orders.stats.amount')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{currencySymbol}{amount.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{trans('admin.orders.stats.cost')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{currencySymbol}{costPrice.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{trans('admin.orders.stats.profit')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {currencySymbol}{profit.toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{trans('admin.orders.stats.retry_count')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {order.retry_count}
                                <span className="text-lg text-muted-foreground">/{order.max_retries}</span>
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Details Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Customer */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{trans('admin.orders.details.customer_title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{trans('admin.orders.customer.name')}</span>
                                <span>{order.customer_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{trans('admin.orders.customer.email')}</span>
                                <span>{order.customer_email}</span>
                            </div>
                            {order.customer && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{trans('admin.orders.customer.type')}</span>
                                        <Badge variant="outline">{order.customer.type.toUpperCase()}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{trans('admin.orders.customer.id')}</span>
                                        <Link href={`/admin/customers/${order.customer.id}`} className="hover:underline text-primary">
                                            #{order.customer.id}
                                        </Link>
                                    </div>
                                </>
                            )}
                            {order.ip_address && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{trans('admin.orders.customer.ip_address')}</span>
                                    <span className="font-mono text-sm">{order.ip_address}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Package */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{trans('admin.orders.details.package_title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {order.package ? (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{trans('admin.orders.package.name')}</span>
                                        <Link href={`/admin/packages/${order.package.id}`} className="hover:underline text-primary">
                                            {order.package.name}
                                        </Link>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{trans('admin.orders.package.data')}</span>
                                        <span>{order.package.data_mb >= 1024 ? `${(order.package.data_mb / 1024).toFixed(1)} GB` : `${order.package.data_mb} MB`}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{trans('admin.orders.package.validity')}</span>
                                        <span>{trans('admin.orders.package.days', { days: order.package.validity_days })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{trans('admin.orders.package.provider')}</span>
                                        <span>{order.package.provider?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{trans('admin.orders.package.country')}</span>
                                        <span>{order.package.country?.name}</span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground">{trans('admin.orders.package.no_info')}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* eSIM Profile */}
                    {order.esim_profile && (
                        <Card className="md:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>{trans('admin.orders.details.esim_profile_title')}</CardTitle>
                                    {order.esim_profile.last_usage_check_at && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {trans('admin.orders.esim.last_synced', { date: order.esim_profile.last_usage_check_at })}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSyncEsim}
                                    disabled={syncForm.processing}
                                >
                                    {syncForm.processing ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : syncSuccess ? (
                                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                    ) : (
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                    )}
                                    {syncForm.processing ? trans('admin.orders.esim.syncing') : syncSuccess ? trans('admin.orders.esim.synced') : trans('admin.orders.esim.sync_button')}
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Status & Data Usage Row */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Status */}
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={getStatusBadgeClass(order.esim_profile.status_color || 'gray')}
                                            >
                                                {order.esim_profile.status_label || order.esim_profile.status || 'Unknown'}
                                            </Badge>
                                            {order.esim_profile.is_activated ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                    {trans('admin.orders.esim.activated')}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground">
                                                    {trans('admin.orders.esim.not_activated')}
                                                </Badge>
                                            )}
                                            {order.esim_profile.topup_available && (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700">{trans('admin.orders.esim.top_up')}</Badge>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            {order.esim_profile.activated_at && (
                                                <div>
                                                    <p className="text-muted-foreground text-xs">{trans('admin.orders.esim.activated')}</p>
                                                    <p className="font-medium">{order.esim_profile.activated_at}</p>
                                                </div>
                                            )}
                                            {order.esim_profile.expires_at && (
                                                <div>
                                                    <p className="text-muted-foreground text-xs">{trans('admin.orders.esim.expires')}</p>
                                                    <p className="font-medium">{order.esim_profile.expires_at}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Data Usage */}
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">{trans('admin.orders.esim.data_usage')}</span>
                                            <span className="text-sm font-mono">
                                                {order.esim_profile.data_used_mb.toFixed(1)} / {order.esim_profile.data_total_mb.toFixed(1)} MB
                                            </span>
                                        </div>
                                        <Progress value={order.esim_profile.data_usage_percentage} className="h-2" />
                                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                            <span>{trans('admin.orders.esim.used_percentage', { percent: order.esim_profile.data_usage_percentage.toFixed(1) })}</span>
                                            <span>{trans('admin.orders.esim.left_mb', { amount: (order.esim_profile.data_remaining_bytes / (1024 * 1024)).toFixed(1) })}</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* QR Code */}
                                {order.esim_profile.lpa_string && (
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
                                        title={trans('admin.orders.esim.installation_qr')}
                                        description={trans('admin.orders.esim.scan_to_install')}
                                        compact
                                    />
                                )}

                                {/* Provider Data */}
                                {order.esim_profile.provider_data && Object.keys(order.esim_profile.provider_data).length > 0 && (
                                    <>
                                        <Separator />
                                        <details>
                                            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                                                {trans('admin.orders.esim.raw_data')}
                                            </summary>
                                            <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-48">
                                                {JSON.stringify(order.esim_profile.provider_data, null, 2)}
                                            </pre>
                                        </details>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment & Timeline */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>{trans('admin.orders.details.payment_timeline_title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Payment Info */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">{trans('admin.orders.payment.title')}</h4>
                                    {order.payment ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">{trans('admin.orders.payment.status')}</span>
                                                <Badge variant={order.payment.status === 'completed' ? 'default' : 'outline'}>
                                                    {order.payment.status}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">{trans('admin.orders.payment.provider')}</span>
                                                <span>{order.payment.provider}</span>
                                            </div>
                                            {order.payment.gateway_session_id && (
                                                <div className="pt-2">
                                                    <p className="text-muted-foreground text-xs mb-1">{trans('admin.orders.payment.gateway_session_id')}</p>
                                                    <p className="font-mono text-xs break-all bg-muted p-2 rounded">
                                                        {order.payment.gateway_session_id}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">{trans('admin.orders.payment.no_record')}</p>
                                    )}
                                </div>

                                {/* Timeline */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">{trans('admin.orders.timeline.title')}</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{trans('admin.orders.timeline.created')}</span>
                                            <span>{order.created_at}</span>
                                        </div>
                                        {order.completed_at && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">{trans('admin.orders.timeline.completed')}</span>
                                                <span className="text-green-600">{order.completed_at}</span>
                                            </div>
                                        )}
                                        {order.next_retry_at && isPendingRetry && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">{trans('admin.orders.timeline.next_retry')}</span>
                                                <span className="text-orange-600">{order.next_retry_at}</span>
                                            </div>
                                        )}
                                        {order.provider_order_id && (
                                            <div className="pt-2">
                                                <p className="text-muted-foreground text-xs mb-1">{trans('admin.orders.timeline.provider_order_id')}</p>
                                                <p className="font-mono text-xs bg-muted p-2 rounded">{order.provider_order_id}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice */}
                    {order.invoice && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="h-5 w-5" />
                                    {trans('admin.orders.details.invoice_title')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-mono font-semibold">{order.invoice.invoice_number}</p>
                                        <p className="text-sm text-muted-foreground">{order.invoice.status_label}</p>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/invoices/${order.invoice.uuid}`}>
                                            {trans('admin.orders.invoice.view')}
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
