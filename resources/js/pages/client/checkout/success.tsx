import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useTrans } from '@/hooks/use-trans';
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

export default function CheckoutSuccess({ order, payment_status }: Props) {
    const { trans } = useTrans();
    const [polling, setPolling] = useState(
        !order.has_esim && order.status === 'processing',
    );
    const [currentOrder, setCurrentOrder] = useState(order);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Client', href: '/client' },
        { title: trans('client_checkout_success.title'), href: '#' },
    ];

    useEffect(() => {
        if (!polling) return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(
                    `/client/checkout/status/${order.uuid}`,
                );
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
            <Head title={trans('client_checkout_success.title')} />
            <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
                {/* Success Header */}
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-semibold">
                        {trans('client_checkout_success.confirmed')}
                    </h1>
                    <p className="text-muted-foreground">
                        {trans('client_checkout_success.order_number', {
                            number: currentOrder.order_number,
                        })}
                    </p>
                </div>

                {/* Order Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {trans('client_checkout_success.details.title')}
                        </CardTitle>
                        <CardDescription>
                            {trans('client_checkout_success.details.subtitle')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {currentOrder.package && (
                            <div className="space-y-2">
                                <h3 className="font-medium">
                                    {currentOrder.package.name}
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">
                                            {trans(
                                                'client_checkout_success.details.country',
                                            )}
                                        </span>
                                        <p>{currentOrder.package.country}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            {trans(
                                                'client_checkout_success.details.data',
                                            )}
                                        </span>
                                        <p>{currentOrder.package.data_label}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            {trans(
                                                'client_checkout_success.details.validity',
                                            )}
                                        </span>
                                        <p>
                                            {
                                                currentOrder.package
                                                    .validity_label
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            {trans(
                                                'client_checkout_success.details.amount',
                                            )}
                                        </span>
                                        <p className="font-medium">
                                            €
                                            {Number(
                                                currentOrder.amount,
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* eSIM Details / Processing */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {trans('client_checkout_success.esim.title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {currentOrder.has_esim && currentOrder.esim ? (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    {currentOrder.esim.lpa_string ||
                                    currentOrder.esim.qr_code_data ? (
                                        <div className="rounded-lg border bg-white p-4">
                                            <QRCodeSVG
                                                value={
                                                    currentOrder.esim
                                                        .lpa_string ||
                                                    currentOrder.esim
                                                        .qr_code_data ||
                                                    ''
                                                }
                                                size={192}
                                                level="M"
                                            />
                                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                                {trans(
                                                    'client_checkout_success.esim.scan_to_install',
                                                )}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <QrCode className="mx-auto h-16 w-16 text-muted-foreground" />
                                            <p className="mt-2 text-muted-foreground">
                                                {trans(
                                                    'client_checkout_success.esim.qr_soon',
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">
                                        {trans(
                                            'client_checkout_success.esim.iccid',
                                        )}
                                    </p>
                                    <p className="font-mono">
                                        {currentOrder.esim.iccid}
                                    </p>
                                </div>
                                {currentOrder.esim.lpa_string && (
                                    <div className="text-center text-xs text-muted-foreground">
                                        <p className="rounded bg-muted p-2 font-mono break-all">
                                            {currentOrder.esim.lpa_string}
                                        </p>
                                    </div>
                                )}
                                <Button className="w-full" variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    {trans(
                                        'client_checkout_success.esim.download_guide',
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                                <p className="mt-4 font-medium">
                                    {trans(
                                        'client_checkout_success.processing.title',
                                    )}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {trans(
                                        'client_checkout_success.processing.subtitle',
                                    )}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button variant="outline" className="flex-1" asChild>
                        <Link href={`/client/orders/${currentOrder.uuid}`}>
                            {trans(
                                'client_checkout_success.actions.view_order',
                            )}
                        </Link>
                    </Button>
                    <Button className="flex-1" asChild>
                        <Link href="/client/packages">
                            {trans(
                                'client_checkout_success.actions.browse_more',
                            )}
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
