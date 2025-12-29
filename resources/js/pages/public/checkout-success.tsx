import { EsimQrCard } from '@/components/esim-qr-card';
import { OrderSummaryCard } from '@/components/order-summary-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    const isProcessing = ['processing', 'pending', 'pending_retry'].includes(order.status);
    const isCompleted = order.status === 'completed';
    const isFailed = order.status === 'failed';

    // Poll for updates while processing
    useEffect(() => {
        if (!isProcessing) return;

        const interval = setInterval(() => {
            router.reload({ only: ['order'], preserveState: true, preserveScroll: true });
        }, 3000);

        return () => clearInterval(interval);
    }, [isProcessing, order.status]);

    return (
        <GuestLayout>
            <Head title={isCompleted ? 'Order Complete' : isProcessing ? 'Processing Order' : 'Order Status'} />

            <section className="bg-gradient-to-b from-muted/50 to-background py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl">
                        {/* Status Header */}
                        <div className="mb-8 text-center">
                            {isProcessing && (
                                <>
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                                        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <Badge variant="secondary" className="mb-4">
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                        Processing
                                    </Badge>
                                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                                        Preparing Your eSIM
                                    </h1>
                                    <p className="mt-3 text-lg text-muted-foreground">
                                        This usually takes less than a minute. Please don't close this page.
                                    </p>
                                </>
                            )}
                            {isCompleted && (
                                <>
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                                    </div>
                                    <Badge className="mb-4 bg-green-600">
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                        Complete
                                    </Badge>
                                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                                        Your eSIM is Ready!
                                    </h1>
                                    <p className="mt-3 text-lg text-muted-foreground">
                                        Scan the QR code below to install your eSIM on your device.
                                    </p>
                                </>
                            )}
                            {isFailed && (
                                <>
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                                        <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                                    </div>
                                    <Badge variant="destructive" className="mb-4">
                                        <XCircle className="mr-1 h-3 w-3" />
                                        Failed
                                    </Badge>
                                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                                        Order Could Not Be Completed
                                    </h1>
                                    <p className="mt-3 text-lg text-muted-foreground">
                                        We were unable to process your order. Any payment has been refunded.
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
                                <Card className="mt-4">
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold mb-4">How to Install</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                                    1
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Go to <strong>Settings → Cellular/Mobile Data</strong>
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                                    2
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Tap <strong>Add eSIM</strong> or <strong>Add Cellular Plan</strong>
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                                    3
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Scan the QR code above with your phone camera
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                                    4
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Follow the prompts and enable <strong>Data Roaming</strong>
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Processing State */}
                        {isProcessing && (
                            <Card className="mb-6">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                                            <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">Setting up your eSIM...</h3>
                                            <p className="text-sm text-muted-foreground">
                                                We're provisioning your eSIM profile. This page will update automatically.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Button asChild variant="outline" size="lg">
                                <Link href="/destinations">
                                    Browse More Plans
                                </Link>
                            </Button>
                            {isCompleted && (
                                <Button asChild size="lg">
                                    <Link href={`/order/${order.uuid}/status`}>
                                        View Order Details
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                        </div>

                        {/* Help Section */}
                        <div className="mt-8 rounded-xl bg-muted/50 p-6 text-center">
                            <HelpCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                            <h3 className="font-semibold">Need Help?</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Having trouble installing your eSIM? Check our installation guide or contact support.
                            </p>
                            <div className="mt-4 flex justify-center gap-3">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/how-it-works">Installation Guide</Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
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
