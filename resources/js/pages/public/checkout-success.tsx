import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Copy,
    Loader2,
    Mail,
    QrCode,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
    } | null;
    customer_email: string;
}

interface Props {
    order: Order;
}

export default function CheckoutSuccess({ order }: Props) {
    const [copied, setCopied] = useState<string | null>(null);

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

    function copyToClipboard(text: string, field: string) {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    }

    function getFlagEmoji(countryCode: string) {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }

    return (
        <GuestLayout>
            <Head title="Order Confirmed" />

            <section className="py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl">
                        {/* Status Header */}
                        <div className="mb-8 text-center">
                            {isProcessing && (
                                <>
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h1 className="text-2xl font-bold md:text-3xl">Processing Your Order</h1>
                                    <p className="mt-2 text-muted-foreground">
                                        Please wait while we prepare your eSIM...
                                    </p>
                                    <Progress value={33} className="mt-4 mx-auto max-w-xs" />
                                </>
                            )}
                            {isCompleted && (
                                <>
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h1 className="text-2xl font-bold md:text-3xl">Order Complete!</h1>
                                    <p className="mt-2 text-muted-foreground">
                                        Your eSIM is ready. Scan the QR code to install.
                                    </p>
                                </>
                            )}
                            {isFailed && (
                                <>
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                                        <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                    </div>
                                    <h1 className="text-2xl font-bold md:text-3xl">Order Failed</h1>
                                    <p className="mt-2 text-muted-foreground">
                                        Something went wrong. Your payment has been refunded.
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Order Details */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-base">Order Details</CardTitle>
                                <CardDescription>Order #{order.order_number}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {order.package && (
                                    <div className="flex items-center gap-3">
                                        {order.package.country_iso && (
                                            <span className="text-3xl">
                                                {getFlagEmoji(order.package.country_iso)}
                                            </span>
                                        )}
                                        <div>
                                            <h3 className="font-medium">{order.package.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {order.package.data_label} • {order.package.validity_label}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>Sent to: {order.customer_email}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* eSIM Details (when completed) */}
                        {isCompleted && order.esim && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <QrCode className="h-5 w-5" />
                                        Your eSIM
                                    </CardTitle>
                                    <CardDescription>
                                        Scan this QR code with your phone to install the eSIM
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* QR Code */}
                                    {order.esim.qr_code_data && (
                                        <div className="flex justify-center">
                                            <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 bg-white p-4">
                                                <img
                                                    src={order.esim.qr_code_data}
                                                    alt="eSIM QR Code"
                                                    className="h-48 w-48"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* LPA String */}
                                    {order.esim.lpa_string && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium">
                                                    Manual Activation Code
                                                </label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7"
                                                    onClick={() => copyToClipboard(order.esim!.lpa_string!, 'lpa')}
                                                >
                                                    {copied === 'lpa' ? (
                                                        <span className="text-green-600">Copied!</span>
                                                    ) : (
                                                        <>
                                                            <Copy className="mr-1 h-3 w-3" />
                                                            Copy
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                            <div className="rounded-lg bg-muted p-3">
                                                <code className="text-xs break-all font-mono">
                                                    {order.esim.lpa_string}
                                                </code>
                                            </div>
                                        </div>
                                    )}

                                    {/* Installation Instructions */}
                                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-sm">
                                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                            Installation Instructions
                                        </h4>
                                        <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                                            <li>Go to Settings → Cellular/Mobile</li>
                                            <li>Tap "Add eSIM" or "Add Cellular Plan"</li>
                                            <li>Scan the QR code above</li>
                                            <li>Follow the prompts to complete setup</li>
                                        </ol>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Button asChild variant="outline">
                                <Link href="/destinations">Browse More Plans</Link>
                            </Button>
                            {isCompleted && (
                                <Button asChild>
                                    <Link href={`/order/${order.uuid}/status`}>View Order Status</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
