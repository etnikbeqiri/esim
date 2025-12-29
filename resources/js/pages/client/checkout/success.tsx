import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Download, Loader2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

interface Order {
    uuid: string;
    order_number: string;
    status: string;
    status_label: string;
    amount: string;
    package: {
        name: string;
        country: string | null;
        data_label: string;
        validity_label: string;
    } | null;
    has_esim: boolean;
    esim: {
        iccid: string;
        qr_code_data: string | null;
        lpa_string: string | null;
        smdp_address: string | null;
        activation_code: string | null;
    } | null;
}

interface Props {
    order: Order;
    payment_status: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Client', href: '/client' },
    { title: 'Order Complete', href: '#' },
];

export default function CheckoutSuccess({ order, payment_status }: Props) {
    const [polling, setPolling] = useState(!order.has_esim && order.status === 'processing');
    const [currentOrder, setCurrentOrder] = useState(order);

    useEffect(() => {
        if (!polling) return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/client/checkout/status/${order.uuid}`);
                const data = await response.json();

                if (data.has_esim || data.is_completed || data.is_failed) {
                    setPolling(false);
                    // Refresh page to get updated order data
                    window.location.reload();
                }
            } catch (error) {
                console.error('Failed to check status:', error);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [polling, order.uuid]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order Complete" />
            <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
                {/* Success Header */}
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-semibold">Order Confirmed!</h1>
                    <p className="text-muted-foreground">
                        Order #{currentOrder.order_number}
                    </p>
                </div>

                {/* Order Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                        <CardDescription>Your eSIM purchase summary</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {currentOrder.package && (
                            <div className="space-y-2">
                                <h3 className="font-medium">{currentOrder.package.name}</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Country</span>
                                        <p>{currentOrder.package.country}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Data</span>
                                        <p>{currentOrder.package.data_label}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Validity</span>
                                        <p>{currentOrder.package.validity_label}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Amount Paid</span>
                                        <p className="font-medium">€{Number(currentOrder.amount).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* eSIM Details / Processing */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your eSIM</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {currentOrder.has_esim && currentOrder.esim ? (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    {(currentOrder.esim.lpa_string || currentOrder.esim.qr_code_data) ? (
                                        <div className="p-4 bg-white rounded-lg border">
                                            <QRCodeSVG
                                                value={currentOrder.esim.lpa_string || currentOrder.esim.qr_code_data || ''}
                                                size={192}
                                                level="M"
                                            />
                                            <p className="text-center text-sm text-muted-foreground mt-2">
                                                Scan to install eSIM
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
                                            <p className="mt-2 text-muted-foreground">
                                                QR code will be available shortly
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">ICCID</p>
                                    <p className="font-mono">{currentOrder.esim.iccid}</p>
                                </div>
                                {currentOrder.esim.lpa_string && (
                                    <div className="text-center text-xs text-muted-foreground">
                                        <p className="break-all font-mono bg-muted p-2 rounded">
                                            {currentOrder.esim.lpa_string}
                                        </p>
                                    </div>
                                )}
                                <Button className="w-full" variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Installation Guide
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                                <p className="mt-4 font-medium">Processing your eSIM...</p>
                                <p className="text-sm text-muted-foreground">
                                    This usually takes a few seconds. Please wait.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button variant="outline" className="flex-1" asChild>
                        <Link href={`/client/orders/${currentOrder.uuid}`}>View Order Details</Link>
                    </Button>
                    <Button className="flex-1" asChild>
                        <Link href="/client/packages">Browse More Packages</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
