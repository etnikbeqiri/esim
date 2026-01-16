import { EsimQrCard } from '@/components/esim-qr-card';
import { OrderSummaryCard } from '@/components/order-summary-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    Loader2,
    RefreshCw,
    XCircle,
} from 'lucide-react';
import { useEffect } from 'react';

interface Order {
    uuid: string;
    order_number: string;
    status: string;
    status_label: string;
    status_color: string;
    package: {
        name: string;
        data_label: string;
        validity_label: string;
        country: string | null;
        country_iso: string | null;
    } | null;
    esim: {
        iccid: string;
        qr_code_data: string | null;
        lpa_string: string | null;
        smdp_address: string | null;
        activation_code: string | null;
    } | null;
    customer_email: string;
    amount: string | number;
    payment_method: string;
    created_at: string;
    paid_at: string | null;
    completed_at: string | null;
}

interface Props {
    order: Order;
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
        default:
            return <Clock className="h-5 w-5 text-yellow-500" />;
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

export default function OrderStatus({ order }: Props) {
    const { trans } = useTrans();
    const isProcessing = [
        'processing',
        'pending',
        'pending_retry',
        'awaiting_payment',
    ].includes(order.status);
    const isCompleted = order.status === 'completed';
    const isFailed = order.status === 'failed';

    // Poll for updates while processing
    useEffect(() => {
        if (!isProcessing) return;

        const interval = setInterval(() => {
            router.reload({
                only: ['order'],
                preserveUrl: true,
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [isProcessing, order.status]);

    return (
        <GuestLayout>
            <Head
                title={trans('order_status_page.meta_title', {
                    order_number: order.order_number,
                })}
            />

            <section className="py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <Badge
                                variant="outline"
                                className={`${getStatusBadgeClass(order.status_color)} mb-4 inline-flex items-center gap-2 px-4 py-2 text-sm`}
                            >
                                {getStatusIcon(order.status)}
                                {order.status_label}
                            </Badge>
                            <h1 className="text-2xl font-bold md:text-3xl">
                                {trans('order_status_page.title')}
                            </h1>
                            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {trans('order_status_page.placed_on', {
                                        date: order.created_at,
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Status Message */}
                        {isProcessing && (
                            <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                                <CardContent className="flex items-center gap-3 py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                    <div>
                                        <p className="font-medium text-blue-700 dark:text-blue-400">
                                            {trans(
                                                'order_status_page.processing.title',
                                            )}
                                        </p>
                                        <p className="text-sm text-blue-600 dark:text-blue-500">
                                            {trans(
                                                'order_status_page.processing.description',
                                            )}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {isFailed && (
                            <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/30">
                                <CardContent className="flex items-center gap-3 py-4">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                    <div>
                                        <p className="font-medium text-red-700 dark:text-red-400">
                                            {trans(
                                                'order_status_page.failed.title',
                                            )}
                                        </p>
                                        <p className="text-sm text-red-600 dark:text-red-500">
                                            {trans(
                                                'order_status_page.failed.description',
                                            )}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Summary */}
                        <OrderSummaryCard
                            orderNumber={order.order_number}
                            customerEmail={order.customer_email}
                            package={order.package}
                            className="mb-6"
                        />

                        {/* eSIM Details */}
                        {isCompleted && order.esim && (
                            <EsimQrCard
                                esim={order.esim}
                                title={trans('order_status_page.esim.title')}
                                description={trans(
                                    'order_status_page.esim.description',
                                )}
                            />
                        )}

                        {/* Not completed yet */}
                        {!isCompleted && !isFailed && !order.esim && (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="mt-4 font-semibold">
                                        {trans(
                                            'order_status_page.preparing.title',
                                        )}
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {trans(
                                            'order_status_page.preparing.description',
                                        )}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Payment Summary */}
                        <Card className="mt-6">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base">
                                    {trans('order_status_page.payment.title')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {trans(
                                            'order_status_page.payment.method',
                                        )}
                                    </span>
                                    <span className="font-medium">
                                        {order.payment_method}
                                    </span>
                                </div>
                                {order.paid_at && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {trans(
                                                'order_status_page.payment.paid_on',
                                            )}
                                        </span>
                                        <span className="font-medium">
                                            {order.paid_at}
                                        </span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex items-center justify-between pt-1">
                                    <span className="font-medium">
                                        {trans(
                                            'order_status_page.payment.total',
                                        )}
                                    </span>
                                    <span className="text-xl font-bold">
                                        €{Number(order.amount).toFixed(2)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Button asChild variant="outline">
                                <Link href="/destinations">
                                    {trans('order_status_page.actions.browse')}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
