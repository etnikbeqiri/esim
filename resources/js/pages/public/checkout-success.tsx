import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronRight,
    Copy,
    Database,
    Calendar,
    Download,
    HelpCircle,
    Loader2,
    Mail,
    QrCode,
    Smartphone,
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
        smdp_address: string | null;
        activation_code: string | null;
    } | null;
    customer_email: string;
}

interface Props {
    order: Order;
}

export default function CheckoutSuccess({ order }: Props) {
    const [copied, setCopied] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'qr' | 'manual'>('qr');

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
                        <Card className="mb-6 overflow-hidden">
                            <div className="bg-muted/50 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Order Number</p>
                                        <p className="font-mono font-semibold">{order.order_number}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Confirmation sent to</p>
                                        <p className="font-medium">{order.customer_email}</p>
                                    </div>
                                </div>
                            </div>
                            {order.package && (
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        {order.package.country_iso && (
                                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                                                <span className="text-4xl">
                                                    {getFlagEmoji(order.package.country_iso)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">{order.package.name}</h3>
                                            {order.package.country && (
                                                <p className="text-muted-foreground">{order.package.country}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                <Database className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Data</p>
                                                <p className="font-semibold">{order.package.data_label}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                <Calendar className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Validity</p>
                                                <p className="font-semibold">{order.package.validity_label}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* eSIM Installation (when completed) */}
                        {isCompleted && order.esim && (
                            <Card className="mb-6">
                                <CardContent className="p-6">
                                    {/* Tabs */}
                                    <div className="mb-6 flex gap-2">
                                        <Button
                                            variant={activeTab === 'qr' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setActiveTab('qr')}
                                            className="flex-1"
                                        >
                                            <QrCode className="mr-2 h-4 w-4" />
                                            QR Code
                                        </Button>
                                        <Button
                                            variant={activeTab === 'manual' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setActiveTab('manual')}
                                            className="flex-1"
                                        >
                                            <Smartphone className="mr-2 h-4 w-4" />
                                            Manual Setup
                                        </Button>
                                    </div>

                                    {activeTab === 'qr' && order.esim.qr_code_data && (
                                        <div className="text-center">
                                            <div className="mx-auto mb-6 inline-block rounded-2xl bg-white p-6 shadow-lg">
                                                <img
                                                    src={order.esim.qr_code_data}
                                                    alt="eSIM QR Code"
                                                    className="h-56 w-56"
                                                />
                                            </div>
                                            <div className="mx-auto max-w-md space-y-4">
                                                <h3 className="font-semibold">How to Install</h3>
                                                <div className="space-y-3 text-left">
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
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'manual' && (
                                        <div className="space-y-4">
                                            <p className="text-sm text-muted-foreground">
                                                If you can't scan the QR code, enter these details manually in your phone's eSIM settings.
                                            </p>

                                            {order.esim.smdp_address && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium">SM-DP+ Address</label>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7"
                                                            onClick={() => copyToClipboard(order.esim!.smdp_address!, 'smdp')}
                                                        >
                                                            {copied === 'smdp' ? (
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
                                                        <code className="text-sm break-all font-mono">
                                                            {order.esim.smdp_address}
                                                        </code>
                                                    </div>
                                                </div>
                                            )}

                                            {order.esim.activation_code && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium">Activation Code</label>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7"
                                                            onClick={() => copyToClipboard(order.esim!.activation_code!, 'activation')}
                                                        >
                                                            {copied === 'activation' ? (
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
                                                        <code className="text-sm break-all font-mono">
                                                            {order.esim.activation_code}
                                                        </code>
                                                    </div>
                                                </div>
                                            )}

                                            {order.esim.lpa_string && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium">Full LPA String</label>
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

                                            {order.esim.iccid && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium">ICCID</label>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7"
                                                            onClick={() => copyToClipboard(order.esim!.iccid, 'iccid')}
                                                        >
                                                            {copied === 'iccid' ? (
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
                                                        <code className="text-sm break-all font-mono">
                                                            {order.esim.iccid}
                                                        </code>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
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
