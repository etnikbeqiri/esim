import { destinations, howItWorks } from '@/actions/App/Http/Controllers/Public/HomeController';
import { EsimQrCard } from '@/components/esim-qr-card';
import { OrderSummaryCard } from '@/components/order-summary-card';
import { SetupGuide } from '@/components/setup-guide';
import { Badge } from '@/components/ui/badge';
import { GoldButton } from '@/components/ui/gold-button';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { useAnalytics, usePageViewTracking } from '@/lib/analytics';
import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Globe,
    HelpCircle,
    Loader2,
    MessageCircle,
    RefreshCw,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

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
    amount: string | number;
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

function getStatusIcon(status: string) {
    switch (status) {
        case 'completed':
            return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        case 'processing':
            return (
                <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
            );
        case 'pending_retry':
            return <RefreshCw className="h-4 w-4 text-orange-500" />;
        case 'failed':
            return <XCircle className="h-4 w-4 text-red-500" />;
        default:
            return (
                <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
            );
    }
}

function getStatusBadgeClass(color: string): string {
    const colors: Record<string, string> = {
        green: 'bg-green-50 text-green-700 ring-1 ring-green-200/50',
        yellow: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200/50',
        red: 'bg-red-50 text-red-700 ring-1 ring-red-200/50',
        blue: 'bg-primary-50 text-primary-700 ring-1 ring-primary-100',
        gray: 'bg-primary-50 text-primary-600 ring-1 ring-primary-100',
        orange: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200/50',
    };
    return colors[color] || colors.gray;
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
        'provider_purchased',
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

    // Poll for updates while processing OR until eSIM data is available
    useEffect(() => {
        const shouldPoll = isProcessing || (isCompleted && !order.esim);
        if (!shouldPoll) return;

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
    }, [isProcessing, isCompleted, order.esim]);

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

            <section className="py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl">
                        {/* Celebration Header */}
                        <div className="mb-8 text-center">
                            <Badge
                                variant="outline"
                                className={`${getStatusBadgeClass(order.status_color)} mb-4 inline-flex items-center gap-1.5 rounded-lg border-0 px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase`}
                            >
                                {getStatusIcon(order.status)}
                                {order.status_label}
                            </Badge>
                            <h1 className="text-2xl font-bold text-primary-900 md:text-3xl">
                                {isCompleted
                                    ? trans('checkout_success_page.status.ready')
                                    : isProcessing
                                      ? trans('checkout_success_page.status.preparing')
                                      : trans('checkout_success_page.status.failed_title')}
                            </h1>
                            <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-primary-500 md:text-xs">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                    {trans('checkout_success_page.placed_on', {
                                        date: order.created_at,
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Processing State */}
                        {isProcessing && (
                            <div className="mb-6 overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                                <div className="flex flex-col items-center justify-center px-4 py-10 text-center md:px-6 md:py-12">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 ring-1 ring-primary-100 md:h-16 md:w-16">
                                        <Loader2 className="h-7 w-7 animate-spin text-primary-500 md:h-8 md:w-8" />
                                    </div>
                                    <h3 className="mt-4 text-[15px] font-bold text-primary-900 md:text-base">
                                        {trans(
                                            isAwaitingPayment
                                                ? 'checkout_success_page.status.confirming'
                                                : 'checkout_success_page.preparing.title',
                                        )}
                                    </h3>
                                    <p className="mt-1 text-[11px] text-primary-500 md:text-xs">
                                        {trans(
                                            isAwaitingPayment
                                                ? 'checkout_success_page.status.verifying_desc'
                                                : 'checkout_success_page.preparing.description',
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Failed State */}
                        {isFailed && (
                            <div className="mb-6 overflow-hidden rounded-2xl border border-red-200/60 bg-white shadow-sm">
                                <div className="flex flex-col items-center justify-center px-4 py-10 text-center md:px-6 md:py-12">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-200/50 md:h-16 md:w-16">
                                        <XCircle className="h-7 w-7 text-red-500 md:h-8 md:w-8" />
                                    </div>
                                    <h3 className="mt-4 text-[15px] font-bold text-primary-900 md:text-base">
                                        {trans(
                                            'checkout_success_page.status.failed_title',
                                        )}
                                    </h3>
                                    <p className="mt-1 text-[11px] text-primary-500 md:text-xs">
                                        {trans(
                                            'checkout_success_page.status.failed_desc',
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* eSIM QR Code - HERO when completed */}
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
                            </div>
                        )}

                        {/* Quick Setup Guide */}
                        {isCompleted && order.esim && (
                            <SetupGuide className="mb-6" />
                        )}

                        {/* Order Summary - Simple */}
                        <OrderSummaryCard
                            orderNumber={order.order_number}
                            customerEmail={order.customer_email}
                            package={order.package}
                            className="mb-6"
                        />

                        {/* Simple Total */}
                        <div className="mb-6 flex items-center justify-between rounded-2xl border border-primary-100 bg-white px-4 py-4 shadow-sm md:px-6">
                            <span className="text-sm font-bold text-primary-900 md:text-[15px]">
                                {trans('checkout_success_page.payment.total')}
                            </span>
                            <span className="text-lg font-extrabold text-primary-900 md:text-xl">
                                €{Number(order.amount).toFixed(2)}
                            </span>
                        </div>

                        {/* Primary Action */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            {isCompleted && (
                                <GoldButton
                                    asChild
                                    size="lg"
                                    className="h-11 rounded-xl text-[13px] font-semibold md:h-12 md:text-sm"
                                >
                                    <Link href={`/order/${order.uuid}/status`}>
                                        {trans(
                                            'checkout_success_page.actions.view_order',
                                        )}
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </GoldButton>
                            )}
                            <Link
                                href={destinations.url()}
                                className="inline-flex h-11 items-center justify-center rounded-xl border border-primary-200 bg-white px-6 text-[13px] font-semibold text-primary-700 shadow-sm transition-colors hover:bg-primary-50 md:h-12 md:text-sm"
                            >
                                <Globe className="mr-2 h-4 w-4" />
                                {trans(
                                    'checkout_success_page.actions.browse',
                                )}
                            </Link>
                        </div>

                        {/* Help Section - 3 Column Grid */}
                        <div className="mt-8 rounded-2xl border border-primary-100 bg-primary-50/30 p-4 md:p-5">
                            <div className="flex items-center gap-2 text-primary-500">
                                <HelpCircle className="h-4 w-4 shrink-0" />
                                <p className="text-xs font-medium md:text-sm">
                                    {trans('checkout_success_page.help.title')}
                                </p>
                            </div>
                            <p className="mt-1 text-[11px] text-primary-400 md:text-xs">
                                {trans(
                                    'checkout_success_page.help.description',
                                )}
                            </p>
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                <Link
                                    href={howItWorks.url()}
                                    className="flex flex-col items-center gap-1.5 rounded-xl border border-primary-100 bg-white px-2 py-3 text-center transition-colors hover:bg-primary-50"
                                >
                                    <BookOpen className="h-4 w-4 text-primary-400" />
                                    <span className="text-[10px] font-semibold text-primary-700 md:text-[11px]">
                                        {trans(
                                            'checkout_success_page.help.guide',
                                        )}
                                    </span>
                                </Link>
                                <Link
                                    href="/help"
                                    className="flex flex-col items-center gap-1.5 rounded-xl border border-primary-100 bg-white px-2 py-3 text-center transition-colors hover:bg-primary-50"
                                >
                                    <MessageCircle className="h-4 w-4 text-primary-400" />
                                    <span className="text-[10px] font-semibold text-primary-700 md:text-[11px]">
                                        {trans(
                                            'checkout_success_page.help.contact',
                                        )}
                                    </span>
                                </Link>
                                <Link
                                    href={destinations.url()}
                                    className="flex flex-col items-center gap-1.5 rounded-xl border border-primary-100 bg-white px-2 py-3 text-center transition-colors hover:bg-primary-50"
                                >
                                    <Globe className="h-4 w-4 text-primary-400" />
                                    <span className="text-[10px] font-semibold text-primary-700 md:text-[11px]">
                                        {trans(
                                            'checkout_success_page.actions.browse',
                                        )}
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
