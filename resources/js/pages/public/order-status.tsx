import { destinations, howItWorks } from '@/actions/App/Http/Controllers/Public/HomeController';
import { EsimQrCard } from '@/components/esim-qr-card';
import { OrderSummaryCard } from '@/components/order-summary-card';
import { SetupGuide } from '@/components/setup-guide';
import { Badge } from '@/components/ui/badge';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { useAnalytics, usePageViewTracking } from '@/lib/analytics';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle2,
    CreditCard,
    Globe,
    HelpCircle,
    Loader2,
    MessageCircle,
    RefreshCw,
    Tag,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

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
        // Usage tracking
        data_used_gb: number;
        data_total_gb: number | null;
        data_remaining_gb: number | null;
        usage_percentage: number;
        expires_at: string | null;
        days_remaining: number | null;
        is_expired: boolean;
        is_data_depleted: boolean;
    } | null;
    customer_email: string;
    amount: string | number;
    original_amount: string | number | null;
    net_amount: string | number | null;
    vat_rate: string | number | null;
    vat_amount: string | number | null;
    coupon_discount: string | number | null;
    coupon: {
        code: string;
        name: string;
        discount_display: string;
    } | null;
    payment_method: string;
    created_at: string;
    paid_at: string | null;
    completed_at: string | null;
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

export default function OrderStatus({ order }: Props) {
    const { trans } = useTrans();
    const {
        installationStep,
        supportContact,
        contentView,
        contentShare,
        pageView,
    } = useAnalytics();

    const isProcessing = [
        'processing',
        'pending',
        'pending_retry',
        'awaiting_payment',
        'provider_purchased',
    ].includes(order.status);
    const isCompleted = order.status === 'completed';
    const isFailed = order.status === 'failed';

    usePageViewTracking('order_status', 'Order Status', {
        order_id: order.uuid,
        order_status: order.status,
    });

    const refreshCountRef = useRef(0);
    const hasTrackedCompletionRef = useRef(false);
    const hasTrackedInstallationViewRef = useRef(false);

    useEffect(() => {
        if (
            isCompleted &&
            order.esim &&
            !hasTrackedInstallationViewRef.current
        ) {
            hasTrackedInstallationViewRef.current = true;
            installationStep(1, 'view_qr_code', order.uuid);
            contentView(
                'esim_activation',
                order.uuid,
                'eSIM Installation Instructions',
            );
        }
    }, [isCompleted, order.esim, order.uuid, installationStep, contentView]);

    // Poll for updates while processing
    useEffect(() => {
        if (!isProcessing) return;

        const interval = setInterval(() => {
            refreshCountRef.current += 1;
            if (refreshCountRef.current % 5 === 0) {
                pageView('order_status', 'Order Status - Refresh', {
                    order_id: order.uuid,
                    order_status: order.status,
                    refresh_count: String(refreshCountRef.current),
                });
            }
            router.reload({
                only: ['order'],
                preserveUrl: true,
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [isProcessing, order.status, order.uuid, pageView]);

    useEffect(() => {
        if (isCompleted && !hasTrackedCompletionRef.current) {
            hasTrackedCompletionRef.current = true;
            contentView('guide', order.uuid, 'Order Completed');
        }
    }, [isCompleted, order.uuid, contentView]);

    const handleCopyData = useCallback(
        (field: string) => {
            contentShare(
                'esim_activation',
                order.uuid,
                `eSIM Data - ${field}`,
                'copy',
            );
            installationStep(2, `copy_${field}`, order.uuid);
        },
        [order.uuid, contentShare, installationStep],
    );

    const handleSupportClick = useCallback(
        (method: 'email' | 'phone' | 'whatsapp' | 'ticket') => {
            supportContact(method, 'order_status');
        },
        [supportContact],
    );

    const page = usePage();
    const fromTrack = useMemo(
        () => page.url.includes('from=track'),
        [page.url],
    );

    return (
        <GuestLayout>
            <Head
                title={trans('order_status_page.meta_title', {
                    order_number: order.order_number,
                })}
            />

            <section className={fromTrack ? 'pt-4 pb-12 md:pt-6 md:pb-20' : 'py-12 md:py-20'}>
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl">
                        {/* Back link */}
                        {fromTrack && (
                            <div className="mb-4">
                                <button
                                    onClick={() => window.history.back()}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-primary-400 transition-colors hover:text-primary-700"
                                >
                                    <ArrowLeft className="h-3 w-3" />
                                    {trans('track_order_results.all_orders')}
                                </button>
                            </div>
                        )}

                        {/* Header */}
                        <div className="mb-8 text-center">
                            <Badge
                                variant="outline"
                                className={`${getStatusBadgeClass(order.status_color)} mb-4 inline-flex items-center gap-1.5 rounded-lg border-0 px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase`}
                            >
                                {getStatusIcon(order.status)}
                                {order.status_label}
                            </Badge>
                            <h1 className="text-2xl font-bold text-primary-900 md:text-3xl">
                                {trans('order_status_page.title')}
                            </h1>
                            <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-primary-500 md:text-xs">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                    {trans('order_status_page.placed_on', {
                                        date: order.created_at,
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Status Message - Processing */}
                        {isProcessing && (
                            <div className="mb-6 overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                                <div className="px-4 py-4 md:px-6 md:py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 ring-1 ring-primary-100 md:h-11 md:w-11">
                                            <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[15px] font-bold text-primary-900 md:text-base">
                                                {trans(
                                                    'order_status_page.processing.title',
                                                )}
                                            </p>
                                            <p className="text-[11px] text-primary-500 md:text-xs">
                                                {trans(
                                                    'order_status_page.processing.description',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status Message - Failed */}
                        {isFailed && (
                            <div className="mb-6 overflow-hidden rounded-2xl border border-red-200/60 bg-white shadow-sm">
                                <div className="px-4 py-4 md:px-6 md:py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-200/50 md:h-11 md:w-11">
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[15px] font-bold text-primary-900 md:text-base">
                                                {trans(
                                                    'order_status_page.failed.title',
                                                )}
                                            </p>
                                            <p className="text-[11px] text-primary-500 md:text-xs">
                                                {trans(
                                                    'order_status_page.failed.description',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* eSIM Installation - HERO position when completed */}
                        {isCompleted && order.esim && (
                            <div className="mb-6">
                                <EsimQrCard
                                    esim={order.esim}
                                    onCopy={handleCopyData}
                                />
                            </div>
                        )}

                        {/* Quick Setup Guide */}
                        {isCompleted && order.esim && (
                            <SetupGuide className="mb-6" />
                        )}

                        {/* eSIM Usage Tracking */}
                        {isCompleted && order.esim && order.esim.data_total_gb && (
                            <div className="mb-6 overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                                <div className="px-4 py-4 md:px-6 md:py-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-primary-900 md:text-[15px]">
                                            {trans(
                                                'order_status_page.usage.title',
                                                { fallback: 'Data Usage' }
                                            )}
                                        </h3>
                                        {order.esim.is_expired ? (
                                            <span className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600 ring-1 ring-red-200/50">
                                                {trans(
                                                    'order_status_page.usage.expired',
                                                    { fallback: 'Expired' }
                                                )}
                                            </span>
                                        ) : order.esim.is_data_depleted ? (
                                            <span className="rounded-lg bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-600 ring-1 ring-orange-200/50">
                                                {trans(
                                                    'order_status_page.usage.depleted',
                                                    { fallback: 'Data Depleted' }
                                                )}
                                            </span>
                                        ) : (
                                            <span className="rounded-lg bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-600 ring-1 ring-green-200/50">
                                                {trans(
                                                    'order_status_page.usage.active',
                                                    { fallback: 'Active' }
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-[11px] md:text-xs">
                                            <span className="text-primary-600">
                                                {order.esim.data_used_gb.toFixed(2)} GB{' '}
                                                {trans(
                                                    'order_status_page.usage.used',
                                                    { fallback: 'used' }
                                                )}
                                            </span>
                                            <span className="text-primary-400">
                                                {order.esim.data_total_gb.toFixed(2)} GB{' '}
                                                {trans(
                                                    'order_status_page.usage.total',
                                                    { fallback: 'total' }
                                                )}
                                            </span>
                                        </div>
                                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-primary-100">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    order.esim.usage_percentage > 90
                                                        ? 'bg-red-500'
                                                        : order.esim.usage_percentage > 75
                                                          ? 'bg-orange-500'
                                                          : 'bg-green-500'
                                                }`}
                                                style={{
                                                    width: `${Math.min(order.esim.usage_percentage, 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="mt-1.5 text-[10px] text-primary-400 md:text-[11px]">
                                            {order.esim.data_remaining_gb !== null
                                                ? `${order.esim.data_remaining_gb.toFixed(2)} GB ${trans(
                                                      'order_status_page.usage.remaining',
                                                      { fallback: 'remaining' }
                                                  )} (${order.esim.usage_percentage.toFixed(1)}%)`
                                                : `${order.esim.usage_percentage.toFixed(1)}% ${trans(
                                                      'order_status_page.usage.used_percent',
                                                      { fallback: 'used' }
                                                  )}`}
                                        </p>
                                    </div>

                                    {/* Expiry Info */}
                                    {order.esim.expires_at && (
                                        <div className="mt-3 flex items-center gap-2 border-t border-primary-100 pt-3">
                                            <Calendar className="h-3.5 w-3.5 text-primary-400" />
                                            <span className="text-[11px] text-primary-500 md:text-xs">
                                                {order.esim.days_remaining !== null &&
                                                order.esim.days_remaining > 0
                                                    ? trans(
                                                          'order_status_page.usage.expires_in',
                                                          {
                                                              days: String(order.esim.days_remaining),
                                                              date: order.esim.expires_at,
                                                              fallback: `Expires in ${order.esim.days_remaining} days (${order.esim.expires_at})`,
                                                          }
                                                      )
                                                    : order.esim.days_remaining === 0
                                                      ? trans(
                                                            'order_status_page.usage.expires_today',
                                                            {
                                                                date: order.esim.expires_at,
                                                                fallback: `Expires today (${order.esim.expires_at})`,
                                                            }
                                                        )
                                                      : trans(
                                                            'order_status_page.usage.expired_on',
                                                            {
                                                                date: order.esim.expires_at,
                                                                fallback: `Expired on ${order.esim.expires_at}`,
                                                            }
                                                        )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Not completed yet - Preparing */}
                        {!isCompleted && !isFailed && !order.esim && (
                            <div className="mb-6 overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                                <div className="flex flex-col items-center justify-center px-4 py-10 text-center md:px-6 md:py-12">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 ring-1 ring-primary-100 md:h-16 md:w-16">
                                        <Loader2 className="h-7 w-7 animate-spin text-primary-500 md:h-8 md:w-8" />
                                    </div>
                                    <h3 className="mt-4 text-[15px] font-bold text-primary-900 md:text-base">
                                        {trans(
                                            'order_status_page.preparing.title',
                                        )}
                                    </h3>
                                    <p className="mt-1 text-[11px] text-primary-500 md:text-xs">
                                        {trans(
                                            'order_status_page.preparing.description',
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Order Summary */}
                        <OrderSummaryCard
                            orderNumber={order.order_number}
                            customerEmail={order.customer_email}
                            package={order.package}
                            className="mb-6"
                        />

                        {/* Payment Summary */}
                        <div className="mb-6 overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                            <div className="px-4 py-4 md:px-6 md:py-5">
                                {/* Header row: title + total */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-primary-900 md:text-[15px]">
                                        {trans(
                                            'order_status_page.payment.total',
                                        )}
                                    </h3>
                                    <div className="flex items-baseline gap-2">
                                        {order.original_amount &&
                                            Number(order.original_amount) >
                                                Number(order.amount) && (
                                                <span className="text-xs text-primary-400 line-through">
                                                    €
                                                    {Number(
                                                        order.original_amount,
                                                    ).toFixed(2)}
                                                </span>
                                            )}
                                        <span className="text-lg font-extrabold text-primary-900 md:text-xl">
                                            €{Number(order.amount).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Method + date inline */}
                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-primary-500 md:text-xs">
                                    <span className="flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        {order.payment_method}
                                    </span>
                                    {order.paid_at && (
                                        <>
                                            <span className="text-primary-200">
                                                |
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {order.paid_at}
                                            </span>
                                        </>
                                    )}
                                    {Number(order.vat_rate) > 0 && (
                                        <>
                                            <span className="text-primary-200">
                                                |
                                            </span>
                                            <span>
                                                {trans(
                                                    'order_status_page.payment.incl_vat',
                                                    {
                                                        fallback:
                                                            'incl. VAT',
                                                    },
                                                )}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Expanded breakdown - only when there's something to break down */}
                                {(order.coupon ||
                                    Number(order.vat_rate) > 0) && (
                                    <div className="mt-3 space-y-1.5 border-t border-primary-100 pt-3">
                                        {/* Original price */}
                                        {order.original_amount &&
                                            Number(order.original_amount) !==
                                                Number(order.amount) && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] text-primary-500 md:text-xs">
                                                        {trans(
                                                            'order_status_page.payment.subtotal',
                                                            {
                                                                fallback:
                                                                    'Subtotal',
                                                            },
                                                        )}
                                                    </span>
                                                    <span className="text-[11px] text-primary-500 md:text-xs">
                                                        €
                                                        {Number(
                                                            order.original_amount,
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            )}

                                        {/* Coupon */}
                                        {order.coupon &&
                                            Number(order.coupon_discount) >
                                                0 && (
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5 text-[11px] text-green-600 md:text-xs">
                                                        <Tag className="h-3 w-3" />
                                                        {trans(
                                                            'order_status_page.payment.discount',
                                                            {
                                                                fallback:
                                                                    'Discount',
                                                            },
                                                        )}
                                                        <span className="rounded bg-green-50 px-1 py-0.5 font-mono text-[9px] font-bold text-green-700 ring-1 ring-green-200/50">
                                                            {
                                                                order.coupon
                                                                    .code
                                                            }
                                                        </span>
                                                    </span>
                                                    <span className="text-[11px] font-medium text-green-600 md:text-xs">
                                                        -€
                                                        {Number(
                                                            order.coupon_discount,
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            )}

                                        {/* VAT */}
                                        {Number(order.vat_rate) > 0 &&
                                            order.net_amount && (
                                                <>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] text-primary-400 md:text-xs">
                                                            {trans(
                                                                'order_status_page.payment.net_amount',
                                                                {
                                                                    fallback:
                                                                        'Net Amount',
                                                                },
                                                            )}
                                                        </span>
                                                        <span className="text-[11px] text-primary-500 md:text-xs">
                                                            €
                                                            {Number(
                                                                order.net_amount,
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] text-primary-400 md:text-xs">
                                                            {trans(
                                                                'order_status_page.payment.vat',
                                                                {
                                                                    rate: String(
                                                                        Number(
                                                                            order.vat_rate,
                                                                        ),
                                                                    ),
                                                                    fallback: `VAT (${Number(order.vat_rate)}%)`,
                                                                },
                                                            )}
                                                        </span>
                                                        <span className="text-[11px] text-primary-500 md:text-xs">
                                                            €
                                                            {Number(
                                                                order.vat_amount,
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Help & Actions */}
                        <div className="rounded-2xl border border-primary-100 bg-primary-50/30 p-4 md:p-5">
                            <div className="flex items-center gap-2 text-primary-500">
                                <HelpCircle className="h-4 w-4 shrink-0" />
                                <p className="text-xs font-medium md:text-sm">
                                    {trans('order_status_page.help.title')}
                                </p>
                            </div>
                            <p className="mt-1 text-[11px] text-primary-400 md:text-xs">
                                {trans(
                                    'order_status_page.help.description',
                                )}
                            </p>
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                <Link
                                    href={howItWorks.url()}
                                    onClick={() => {
                                        contentView(
                                            'guide',
                                            'how-it-works',
                                            'How It Works Guide',
                                        );
                                    }}
                                    className="flex flex-col items-center gap-1.5 rounded-xl border border-primary-100 bg-white px-2 py-3 text-center transition-colors hover:bg-primary-50"
                                >
                                    <BookOpen className="h-4 w-4 text-primary-400" />
                                    <span className="text-[10px] font-semibold text-primary-700 md:text-[11px]">
                                        {trans(
                                            'order_status_page.help.guide',
                                        )}
                                    </span>
                                </Link>
                                <Link
                                    href="/help"
                                    onClick={() =>
                                        handleSupportClick('ticket')
                                    }
                                    className="flex flex-col items-center gap-1.5 rounded-xl border border-primary-100 bg-white px-2 py-3 text-center transition-colors hover:bg-primary-50"
                                >
                                    <MessageCircle className="h-4 w-4 text-primary-400" />
                                    <span className="text-[10px] font-semibold text-primary-700 md:text-[11px]">
                                        {trans(
                                            'order_status_page.help.contact',
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
                                            'order_status_page.actions.browse',
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
