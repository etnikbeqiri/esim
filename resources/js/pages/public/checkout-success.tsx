import { EsimQrCard } from '@/components/esim-qr-card';
import { OrderSummaryCard } from '@/components/order-summary-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GoldButton } from '@/components/ui/gold-button';
import { useTrans } from '@/hooks/use-trans';
import { useAnalytics, usePageViewTracking } from '@/lib/analytics';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronRight,
    HelpCircle,
    Loader2,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

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
    analytics: {
        transaction_id: string;
        value: number;
        currency: string;
        item: {
            id: string;
            name: string | null;
            category: string | null;
        };
    };
}

interface Props {
    order: Order;
}

export default function CheckoutSuccess({ order }: Props) {
    const { trans } = useTrans();
    const { purchase, createItem, installationStep, contentShare } = useAnalytics();
    const purchaseTracked = useRef(false);
    const installationStepsViewed = useRef<Set<number>>(new Set());

    const isProcessing = [
        'processing',
        'pending',
        'pending_retry',
        'awaiting_payment',
    ].includes(order.status);
    const isAwaitingPayment = order.status === 'awaiting_payment';
    const isCompleted = order.status === 'completed';
    const isFailed = order.status === 'failed';

    usePageViewTracking('checkout_success', 'Purchase Complete', {
        order_id: order.uuid,
        order_status: order.status,
    });

    useEffect(() => {
        if (order?.analytics && !purchaseTracked.current) {
            purchaseTracked.current = true;
            const { analytics } = order;
            const item = createItem({
                id: analytics.item.id,
                name: analytics.item.name || 'eSIM Package',
                category: analytics.item.category || 'eSIM',
                price: analytics.value,
                currency: analytics.currency,
            });
            purchase(analytics.transaction_id, analytics.currency, analytics.value, [item]);
        }
    }, [order, purchase, createItem]);

    const trackInstallationStep = useCallback(
        (step: 1 | 2 | 3 | 4, stepName: string) => {
            if (!installationStepsViewed.current.has(step)) {
                installationStepsViewed.current.add(step);
                installationStep(step, stepName, order.uuid);
            }
        },
        [installationStep, order.uuid]
    );

    useEffect(() => {
        if (isCompleted && order.esim) {
            trackInstallationStep(1, 'View QR Code');
        }
    }, [isCompleted, order.esim, trackInstallationStep]);

    const handleCopyTracking = useCallback(
        (field: string) => {
            contentShare('esim_activation', order.uuid, `Copy ${field}`, 'copy');
            if (field === 'smdp_address' || field === 'activation_code') {
                trackInstallationStep(2, 'Copy Activation Details');
            }
        },
        [contentShare, order.uuid, trackInstallationStep]
    );

    // Poll for updates while processing
    useEffect(() => {
        if (!isProcessing) return;

        // Immediate check (1s) in case webhook fired during page load
        const quickCheck = setTimeout(() => {
            router.reload({ only: ['order'] });
        }, 1000);

        const interval = setInterval(() => {
            router.reload({ only: ['order'] });
        }, 3000);

        return () => {
            clearTimeout(quickCheck);
            clearInterval(interval);
        };
    }, [isProcessing]); // removed order.status dependency to prevent re-creating interval excessively

    return (
        <GuestLayout>
            <Head
                title={
                    isCompleted
                        ? trans('checkout_success_page.meta_title.complete')
                        : isProcessing
                          ? trans('checkout_success_page.meta_title.processing')
                          : trans('checkout_success_page.meta_title.status')
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
                                        {isAwaitingPayment
                                            ? trans(
                                                  'checkout_success_page.status.verifying',
                                              )
                                            : trans(
                                                  'checkout_success_page.status.processing',
                                              )}
                                    </Badge>
                                    <h1 className="text-3xl font-bold tracking-tight text-primary-900 md:text-4xl">
                                        {isAwaitingPayment
                                            ? trans(
                                                  'checkout_success_page.status.confirming',
                                              )
                                            : trans(
                                                  'checkout_success_page.status.preparing',
                                              )}
                                    </h1>
                                    <p className="mt-3 text-lg text-primary-600">
                                        {isAwaitingPayment
                                            ? trans(
                                                  'checkout_success_page.status.verifying_desc',
                                              )
                                            : trans(
                                                  'checkout_success_page.status.preparing_desc',
                                              )}
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
                                        {trans(
                                            'checkout_success_page.status.complete',
                                        )}
                                    </Badge>
                                    <h1 className="text-3xl font-bold tracking-tight text-primary-900 md:text-4xl">
                                        {trans(
                                            'checkout_success_page.status.ready',
                                        )}
                                    </h1>
                                    <p className="mt-3 text-lg text-primary-600">
                                        {trans(
                                            'checkout_success_page.status.scan_qr',
                                        )}
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
                                        {trans(
                                            'checkout_success_page.status.failed',
                                        )}
                                    </Badge>
                                    <h1 className="text-3xl font-bold tracking-tight text-primary-900 md:text-4xl">
                                        {trans(
                                            'checkout_success_page.status.failed_title',
                                        )}
                                    </h1>
                                    <p className="mt-3 text-lg text-primary-600">
                                        {trans(
                                            'checkout_success_page.status.failed_desc',
                                        )}
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
                                    title={trans(
                                        'checkout_success_page.esim.title',
                                    )}
                                    description={trans(
                                        'checkout_success_page.esim.description',
                                    )}
                                    onCopy={handleCopyTracking}
                                />

                                {/* Installation Instructions */}
                                <Card className="mt-4 border-primary-100 bg-white shadow-sm">
                                    <CardContent className="p-6">
                                        <h3 className="mb-4 font-semibold text-primary-900">
                                            {trans(
                                                'checkout_success_page.installation.title',
                                            )}
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                                    1
                                                </div>
                                                <p className="text-sm text-primary-600">
                                                    {
                                                        trans(
                                                            'checkout_success_page.installation.step_1',
                                                            {
                                                                setting_path:
                                                                    '',
                                                            },
                                                        ).split(
                                                            ':setting_path',
                                                        )[0]
                                                    }
                                                    <strong className="text-primary-800">
                                                        {trans(
                                                            'checkout_success_page.installation.step_1_path',
                                                        )}
                                                    </strong>
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                                    2
                                                </div>
                                                <p className="text-sm text-primary-600">
                                                    {trans(
                                                        'checkout_success_page.installation.step_2',
                                                        {
                                                            option_1:
                                                                '__OPTION_1__',
                                                            option_2:
                                                                '__OPTION_2__',
                                                        },
                                                    )
                                                        .split(
                                                            '__OPTION_1__',
                                                        )[0]
                                                        .trim()}{' '}
                                                    <strong className="text-primary-800">
                                                        {trans(
                                                            'checkout_success_page.installation.step_2_opt_1',
                                                        )}
                                                    </strong>{' '}
                                                    {trans(
                                                        'checkout_success_page.installation.step_2',
                                                        {
                                                            option_1:
                                                                '__OPTION_1__',
                                                            option_2:
                                                                '__OPTION_2__',
                                                        },
                                                    )
                                                        .split(
                                                            '__OPTION_1__',
                                                        )[1]
                                                        .split(
                                                            '__OPTION_2__',
                                                        )[0]
                                                        .trim()}{' '}
                                                    <strong className="text-primary-800">
                                                        {trans(
                                                            'checkout_success_page.installation.step_2_opt_2',
                                                        )}
                                                    </strong>
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                                    3
                                                </div>
                                                <p className="text-sm text-primary-600">
                                                    {trans(
                                                        'checkout_success_page.installation.step_3',
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                                    4
                                                </div>
                                                <p className="text-sm text-primary-600">
                                                    {
                                                        trans(
                                                            'checkout_success_page.installation.step_4',
                                                            {
                                                                feature:
                                                                    '__FEATURE__',
                                                            },
                                                        ).split(
                                                            '__FEATURE__',
                                                        )[0]
                                                    }
                                                    <strong className="text-primary-800">
                                                        {trans(
                                                            'checkout_success_page.installation.step_4_feature',
                                                        )}
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
                                                {trans(
                                                    'checkout_success_page.processing_card.title',
                                                )}
                                            </h3>
                                            <p className="text-sm text-primary-600">
                                                {trans(
                                                    'checkout_success_page.processing_card.description',
                                                )}
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
                                    {trans(
                                        'checkout_success_page.actions.browse',
                                    )}
                                </Link>
                            </Button>
                            {isCompleted && (
                                <GoldButton asChild size="lg">
                                    <Link href={`/order/${order.uuid}/status`}>
                                        {trans(
                                            'checkout_success_page.actions.view_order',
                                        )}
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </GoldButton>
                            )}
                        </div>

                        {/* Help Section */}
                        <div className="mt-8 rounded-2xl border border-primary-100 bg-white p-6 text-center shadow-sm">
                            <HelpCircle className="mx-auto mb-3 h-8 w-8 text-primary-400" />
                            <h3 className="font-semibold text-primary-900">
                                {trans('checkout_success_page.help.title')}
                            </h3>
                            <p className="mt-1 text-sm text-primary-600">
                                {trans(
                                    'checkout_success_page.help.description',
                                )}
                            </p>
                            <div className="mt-4 flex justify-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="rounded-full border-primary-200 text-primary-700 hover:bg-primary-50"
                                >
                                    <Link href="/how-it-works">
                                        {trans(
                                            'checkout_success_page.help.guide',
                                        )}
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="rounded-full border-primary-200 text-primary-700 hover:bg-primary-50"
                                >
                                    <Link href="/help">
                                        {trans(
                                            'checkout_success_page.help.contact',
                                        )}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
