import { EsimQrCard } from '@/components/esim-qr-card';
import { OrderSummaryCard } from '@/components/order-summary-card';
import { Badge } from '@/components/ui/badge';
import { GoldButton } from '@/components/ui/gold-button';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { useAnalytics, usePageViewTracking } from '@/lib/analytics';
import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle2,
    ChevronRight,
    Globe,
    HelpCircle,
    Loader2,
    MessageCircle,
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
    const { purchase, createItem, installationStep, contentShare } =
        useAnalytics();
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
            purchase(
                analytics.transaction_id,
                analytics.currency,
                analytics.value,
                [item],
            );
        }
    }, [order, purchase, createItem]);

    const trackInstallationStep = useCallback(
        (step: 1 | 2 | 3 | 4, stepName: string) => {
            if (!installationStepsViewed.current.has(step)) {
                installationStepsViewed.current.add(step);
                installationStep(step, stepName, order.uuid);
            }
        },
        [installationStep, order.uuid],
    );

    useEffect(() => {
        if (isCompleted && order.esim) {
            trackInstallationStep(1, 'View QR Code');
        }
    }, [isCompleted, order.esim, trackInstallationStep]);

    const handleCopyTracking = useCallback(
        (field: string) => {
            contentShare(
                'esim_activation',
                order.uuid,
                `Copy ${field}`,
                'copy',
            );
            if (field === 'smdp_address' || field === 'activation_code') {
                trackInstallationStep(2, 'Copy Activation Details');
            }
        },
        [contentShare, order.uuid, trackInstallationStep],
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
    }, [isProcessing]);

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
                                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 shadow-sm ring-1 ring-primary-100 md:h-20 md:w-20">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary-500 md:h-10 md:w-10" />
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="mb-3 rounded-lg bg-primary-50 px-3 py-1 text-[11px] font-semibold tracking-wider text-primary-600 uppercase ring-1 ring-primary-100"
                                    >
                                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                        {isAwaitingPayment
                                            ? trans(
                                                  'checkout_success_page.status.verifying',
                                              )
                                            : trans(
                                                  'checkout_success_page.status.processing',
                                              )}
                                    </Badge>
                                    <h1 className="text-2xl font-bold tracking-tight text-primary-900 md:text-4xl">
                                        {isAwaitingPayment
                                            ? trans(
                                                  'checkout_success_page.status.confirming',
                                              )
                                            : trans(
                                                  'checkout_success_page.status.preparing',
                                              )}
                                    </h1>
                                    <p className="mt-2 text-[13px] text-primary-500 md:mt-3 md:text-base">
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
                                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-50 shadow-sm ring-1 ring-accent-200/50 md:h-20 md:w-20">
                                        <CheckCircle2 className="h-8 w-8 text-accent-600 md:h-10 md:w-10" />
                                    </div>
                                    <Badge className="mb-3 rounded-lg bg-accent-50 px-3 py-1 text-[11px] font-semibold tracking-wider text-accent-700 uppercase ring-1 ring-accent-200/50">
                                        <CheckCircle2 className="mr-1.5 h-3 w-3" />
                                        {trans(
                                            'checkout_success_page.status.complete',
                                        )}
                                    </Badge>
                                    <h1 className="text-2xl font-bold tracking-tight text-primary-900 md:text-4xl">
                                        {trans(
                                            'checkout_success_page.status.ready',
                                        )}
                                    </h1>
                                    <p className="mt-2 text-[13px] text-primary-500 md:mt-3 md:text-base">
                                        {trans(
                                            'checkout_success_page.status.scan_qr',
                                        )}
                                    </p>
                                </>
                            )}
                            {isFailed && (
                                <>
                                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 shadow-sm ring-1 ring-red-200/50 md:h-20 md:w-20">
                                        <XCircle className="h-8 w-8 text-red-500 md:h-10 md:w-10" />
                                    </div>
                                    <Badge className="mb-3 rounded-lg bg-red-50 px-3 py-1 text-[11px] font-semibold tracking-wider text-red-600 uppercase ring-1 ring-red-200/50">
                                        <XCircle className="mr-1.5 h-3 w-3" />
                                        {trans(
                                            'checkout_success_page.status.failed',
                                        )}
                                    </Badge>
                                    <h1 className="text-2xl font-bold tracking-tight text-primary-900 md:text-4xl">
                                        {trans(
                                            'checkout_success_page.status.failed_title',
                                        )}
                                    </h1>
                                    <p className="mt-2 text-[13px] text-primary-500 md:mt-3 md:text-base">
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
                            <div className="mb-6 space-y-4">
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
                                <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                                    <div className="bg-gradient-to-br from-primary-50 via-white to-accent-50/30 px-4 py-4 md:px-6 md:py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-500 shadow-sm ring-1 ring-primary-100 md:h-10 md:w-10">
                                                <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                                            </div>
                                            <h3 className="text-[15px] font-bold text-primary-900 md:text-base">
                                                {trans(
                                                    'checkout_success_page.installation.title',
                                                )}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="px-4 py-4 md:px-6 md:py-5">
                                        <div className="space-y-3">
                                            {[1, 2, 3, 4].map((step) => (
                                                <div
                                                    key={step}
                                                    className="flex items-start gap-3"
                                                >
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-[11px] font-bold text-primary-600 ring-1 ring-primary-100">
                                                        {step}
                                                    </div>
                                                    <p className="pt-1 text-[13px] leading-relaxed text-primary-600 md:text-sm">
                                                        {step === 1 && (
                                                            <>
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
                                                                <strong className="font-semibold text-primary-900">
                                                                    {trans(
                                                                        'checkout_success_page.installation.step_1_path',
                                                                    )}
                                                                </strong>
                                                            </>
                                                        )}
                                                        {step === 2 && (
                                                            <>
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
                                                                <strong className="font-semibold text-primary-900">
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
                                                                <strong className="font-semibold text-primary-900">
                                                                    {trans(
                                                                        'checkout_success_page.installation.step_2_opt_2',
                                                                    )}
                                                                </strong>
                                                            </>
                                                        )}
                                                        {step === 3 &&
                                                            trans(
                                                                'checkout_success_page.installation.step_3',
                                                            )}
                                                        {step === 4 && (
                                                            <>
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
                                                                <strong className="font-semibold text-primary-900">
                                                                    {trans(
                                                                        'checkout_success_page.installation.step_4_feature',
                                                                    )}
                                                                </strong>
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Processing State */}
                        {isProcessing && (
                            <div className="mb-6 overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                                <div className="px-4 py-4 md:px-6 md:py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 ring-1 ring-primary-100 md:h-11 md:w-11">
                                            <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-[15px] font-bold text-primary-900 md:text-base">
                                                {trans(
                                                    'checkout_success_page.processing_card.title',
                                                )}
                                            </h3>
                                            <p className="text-[11px] text-primary-500 md:text-xs">
                                                {trans(
                                                    'checkout_success_page.processing_card.description',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Link
                                href="/destinations"
                                className="inline-flex h-11 items-center justify-center rounded-xl border border-primary-200 bg-white px-6 text-[13px] font-semibold text-primary-700 shadow-sm transition-colors hover:bg-primary-50 md:h-12 md:text-sm"
                            >
                                <Globe className="mr-2 h-4 w-4" />
                                {trans(
                                    'checkout_success_page.actions.browse',
                                )}
                            </Link>
                            {isCompleted && (
                                <GoldButton asChild size="lg" className="h-11 rounded-xl text-[13px] font-semibold md:h-12 md:text-sm">
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
                        <div className="mt-8 overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                            <div className="bg-gradient-to-br from-primary-50 via-white to-accent-50/30 px-4 py-4 md:px-6 md:py-5">
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-400 shadow-sm ring-1 ring-primary-100 md:h-11 md:w-11">
                                        <HelpCircle className="h-5 w-5 md:h-5 md:w-5" />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-primary-900 md:text-base">
                                        {trans('checkout_success_page.help.title')}
                                    </h3>
                                    <p className="mt-1 text-[11px] text-primary-500 md:text-xs">
                                        {trans(
                                            'checkout_success_page.help.description',
                                        )}
                                    </p>
                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            href="/how-it-works"
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-primary-200 bg-white px-4 py-2 text-[11px] font-semibold text-primary-700 shadow-sm transition-colors hover:bg-primary-50 md:text-xs"
                                        >
                                            <BookOpen className="h-3.5 w-3.5" />
                                            {trans(
                                                'checkout_success_page.help.guide',
                                            )}
                                        </Link>
                                        <Link
                                            href="/help"
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-primary-200 bg-white px-4 py-2 text-[11px] font-semibold text-primary-700 shadow-sm transition-colors hover:bg-primary-50 md:text-xs"
                                        >
                                            <MessageCircle className="h-3.5 w-3.5" />
                                            {trans(
                                                'checkout_success_page.help.contact',
                                            )}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
