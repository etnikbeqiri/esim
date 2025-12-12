import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    Copy,
    HardDrive,
    Loader2,
    Mail,
    QrCode,
    RefreshCw,
    Timer,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
    created_at: string;
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
            return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
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
    const [copied, setCopied] = useState<string | null>(null);

    const isProcessing = ['processing', 'pending', 'pending_retry', 'awaiting_payment'].includes(order.status);
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
            <Head title={`Order ${order.order_number}`} />

            <section className="py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold md:text-3xl">
                                        Order #{order.order_number}
                                    </h1>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>{order.created_at}</span>
                                    </div>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={`${getStatusBadgeClass(order.status_color)} flex items-center gap-2 px-3 py-1.5`}
                                >
                                    {getStatusIcon(order.status)}
                                    {order.status_label}
                                </Badge>
                            </div>
                        </div>

                        {/* Status Message */}
                        {isProcessing && (
                            <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                                <CardContent className="flex items-center gap-3 py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                    <div>
                                        <p className="font-medium text-blue-700 dark:text-blue-400">
                                            Processing your order...
                                        </p>
                                        <p className="text-sm text-blue-600 dark:text-blue-500">
                                            This page will update automatically.
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
                                            Order could not be completed
                                        </p>
                                        <p className="text-sm text-red-600 dark:text-red-500">
                                            Your payment has been refunded. Please contact support if you need assistance.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Package Details */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-base">Package Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {order.package && (
                                    <>
                                        <div className="flex items-center gap-3">
                                            {order.package.country_iso && (
                                                <span className="text-3xl">
                                                    {getFlagEmoji(order.package.country_iso)}
                                                </span>
                                            )}
                                            <div>
                                                <h3 className="font-medium">{order.package.name}</h3>
                                                {order.package.country && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.package.country}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-6 text-sm">
                                            <div className="flex items-center gap-2">
                                                <HardDrive className="h-4 w-4 text-muted-foreground" />
                                                <span>{order.package.data_label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Timer className="h-4 w-4 text-muted-foreground" />
                                                <span>{order.package.validity_label}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>{order.customer_email}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* eSIM Details */}
                        {isCompleted && order.esim && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <QrCode className="h-5 w-5" />
                                        Your eSIM
                                    </CardTitle>
                                    <CardDescription>
                                        Scan the QR code with your phone to install the eSIM
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
                                                <label className="text-sm font-medium">Activation Code</label>
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

                                    <Separator />

                                    {/* ICCID */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">ICCID</span>
                                        <div className="flex items-center gap-2">
                                            <code className="font-mono text-xs">{order.esim.iccid}</code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={() => copyToClipboard(order.esim!.iccid, 'iccid')}
                                            >
                                                {copied === 'iccid' ? (
                                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Not completed yet */}
                        {!isCompleted && !isFailed && !order.esim && (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="mt-4 font-semibold">Preparing your eSIM...</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Your eSIM details will appear here once ready
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Button asChild variant="outline">
                                <Link href="/destinations">Browse More Plans</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
