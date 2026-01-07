import { EsimQrCard } from '@/components/esim-qr-card';
import { OrderSummaryCard } from '@/components/order-summary-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GoldButton } from '@/components/ui/gold-button';
import { Card, CardContent } from '@/components/ui/card';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronRight,
    HelpCircle,
    Loader2,
    XCircle,
} from 'lucide-react';
import { useEffect } from 'react';

interface Order {
    uuid: string;
    order_number: string;
    status: string;
    status_label: string;
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
}

interface Props {
    order: Order;
}

export default function CheckoutSuccess({ order }: Props) {
    const isProcessing = ['processing', 'pending', 'pending_retry'].includes(
        order.status,
    );
    const isCompleted = order.status === 'completed';
    const isFailed = order.status === 'failed';

    // Poll for updates while processing
    useEffect(() => {
        if (!isProcessing) return;

        const interval = setInterval(() => {
            router.reload({ only: ['order'] });
        }, 3000);

        return () => clearInterval(interval);
    }, [isProcessing, order.status]);

    return (
        <GuestLayout>
            <Head
                title={
                    isCompleted
                        ? 'Order Complete'
                        : isProcessing
                          ? 'Processing Order'
                          : 'Order Status'
                }
            />

            <section className="bg-mesh relative min-h-screen overflow-hidden py-12 md:py-16">
                {/* Decorative blobs */}
                <div className="animate-float absolute top-10 -left-32 h-96 w-96 rounded-full bg-primary-200/30 blur-3xl" />
                <div className="animate-float-delayed absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-accent-200/20 blur-3xl" />

                <div className="relative z-10 container mx-auto px-4">
                    <div className="mx-auto max-w-3xl">
                        {/* Status Header */}
                        <div className="mb-8 text-center">
                            {isProcessing && (
                                <>
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="mb-4 bg-primary-100 text-primary-700"
                                    >
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                        Processing
                                    </Badge>
                                    <h1 className="text-3xl font-bold tracking-tight text-primary-900 md:text-4xl">
                                        Preparing Your eSIM
                                    </h1>
                                    <p className="mt-3 text-lg text-primary-600">
                                        This usually takes less than a minute.
                                        Please don't close this page.
                                    </p>
                                </>
                            )}
                            {isCompleted && (
                                <>
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent-100">
                                        <CheckCircle2 className="h-10 w-10 text-accent-600" />
                                    </div>
                                    <Badge className="mb-4 bg-accent-500 text-accent-950">
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                        Complete
                                    </Badge>
                                    <h1 className="text-3xl font-bold tracking-tight text-primary-900 md:text-4xl">
                                        Your eSIM is Ready!
                                    </h1>
                                    <p className="mt-3 text-lg text-primary-600">
                                        Scan the QR code below to install your
                                        eSIM on your device.
                                    </p>
                                </>
                            )}
                            {isFailed && (
                                <>
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                                        <XCircle className="h-10 w-10 text-red-600" />
                                    </div>
                                    <Badge
                                        variant="destructive"
                                        className="mb-4"
                                    >
                                        <XCircle className="mr-1 h-3 w-3" />
                                        Failed
                                    </Badge>
                                    <h1 className="text-3xl font-bold tracking-tight text-primary-900 md:text-4xl">
                                        Order Could Not Be Completed
                                    </h1>
                                    <p className="mt-3 text-lg text-primary-600">
                                        We were unable to process your order.
                                        Any payment has been refunded.
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Order Summary Card */}
                        <OrderSummaryCard
                            orderNumber={order.order_number}
                            customerEmail={order.customer_email}
                            package={order.package}
                            className="mb-6"
                        />

                        {/* eSIM Installation (when completed) */}
                        {isCompleted && order.esim && (
                            <div className="mb-6">
                                <EsimQrCard
                                    esim={order.esim}
                                    title="Your eSIM"
                                    description="Scan the QR code with your phone to install the eSIM"
                                />

                                {/* Installation Instructions */}
                                <Card className="mt-4 border-primary-100 bg-white shadow-sm">
                                    <CardContent className="p-6">
                                        <h3 className="mb-4 font-semibold text-primary-900">
                                            How to Install
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                                    1
                                                </div>
                                                <p className="text-sm text-primary-600">
                                                    Go to{' '}
                                                    <strong className="text-primary-800">
                                                        Settings →
                                                        Cellular/Mobile Data
                                                    </strong>
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                                    2
                                                </div>
                                                <p className="text-sm text-primary-600">
                                                    Tap{' '}
                                                    <strong className="text-primary-800">
                                                        Add eSIM
                                                    </strong>{' '}
                                                    or{' '}
                                                    <strong className="text-primary-800">
                                                        Add Cellular Plan
                                                    </strong>
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                                    3
                                                </div>
                                                <p className="text-sm text-primary-600">
                                                    Scan the QR code above with
                                                    your phone camera
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                                    4
                                                </div>
                                                <p className="text-sm text-primary-600">
                                                    Follow the prompts and
                                                    enable{' '}
                                                    <strong className="text-primary-800">
                                                        Data Roaming
                                                    </strong>
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Processing State */}
                        {isProcessing && (
                            <Card className="mb-6 border-primary-100 bg-white shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-primary-900">
                                                Setting up your eSIM...
                                            </h3>
                                            <p className="text-sm text-primary-600">
                                                We're provisioning your eSIM
                                                profile. This page will update
                                                automatically.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="rounded-full border-primary-200 text-primary-700 hover:bg-white"
                            >
                                <Link href="/destinations">
                                    Browse More Plans
                                </Link>
                            </Button>
                            {isCompleted && (
                                <GoldButton
                                    asChild
                                    size="lg"
                                >
                                    <Link href={`/order/${order.uuid}/status`}>
                                        View Order Details
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </GoldButton>
                            )}
                        </div>

                        {/* Help Section */}
                        <div className="mt-8 rounded-2xl border border-primary-100 bg-white p-6 text-center shadow-sm">
                            <HelpCircle className="mx-auto mb-3 h-8 w-8 text-primary-400" />
                            <h3 className="font-semibold text-primary-900">
                                Need Help?
                            </h3>
                            <p className="mt-1 text-sm text-primary-600">
                                Having trouble installing your eSIM? Check our
                                installation guide or contact support.
                            </p>
                            <div className="mt-4 flex justify-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="rounded-full border-primary-200 text-primary-700 hover:bg-primary-50"
                                >
                                    <Link href="/how-it-works">
                                        Installation Guide
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="rounded-full border-primary-200 text-primary-700 hover:bg-primary-50"
                                >
                                    <Link href="/help">Contact Support</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
