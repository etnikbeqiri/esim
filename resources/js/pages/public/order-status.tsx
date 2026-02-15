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
    Calendar,
    CheckCircle2,
    CreditCard,
    Globe,
    HelpCircle,
    Loader2,
    MessageCircle,
    Receipt,
    RefreshCw,
    Sparkles,
    Tag,
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
    amount: string | number;
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
            return <CheckCircle2 className="h-4 w-4 text-accent-600" />;
        case 'processing':
            return <Loader2 className="h-4 w-4 animate-spin text-accent-500" />;
        case 'pending_retry':
            return <RefreshCw className="h-4 w-4 text-orange-500" />;
        case 'failed':
            return <XCircle className="h-4 w-4 text-red-500" />;
        default:
            return <Loader2 className="h-4 w-4 animate-spin text-accent-500" />;
    }
}

function getStatusBadgeClass(color: string): string {
    const colors: Record<string, string> = {
        green: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 ring-1 ring-green-200/50 border-0',
        yellow: 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 ring-1 ring-yellow-200/50 border-0',
        red: 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 ring-1 ring-red-200/50 border-0',
        blue: 'bg-gradient-to-r from-accent-50 to-amber-50 text-accent-700 ring-1 ring-accent-200/50 border-0',
        gray: 'bg-gradient-to-r from-primary-50 to-slate-50 text-primary-600 ring-1 ring-primary-100 border-0',
        orange: 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 ring-1 ring-orange-200/50 border-0',
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

    return (
        <GuestLayout>
            <Head
                title={trans('order_status_page.meta_title', {
                    order_number: order.order_number,
                })}
            />

            <section className="py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl">
                        {/* Header - Enhanced with Gold */}
                        <div className="mb-8 text-center">
                            <Badge
                                variant="outline"
                                className={`${getStatusBadgeClass(order.status_color)} mb-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase shadow-sm`}
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
                            <div className="mb-6 overflow-hidden rounded-2xl border border-accent-200/50 bg-gradient-to-br from-accent-50/50 to-white shadow-sm">
                                <div className="px-4 py-4 md:px-6 md:py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-300 to-accent-400 shadow-md md:h-11 md:w-11">
                                            <Loader2 className="h-5 w-5 animate-spin text-accent-950" />
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

                        {/* Order Summary */}
                        <OrderSummaryCard
                            orderNumber={order.order_number}
                            customerEmail={order.customer_email}
                            package={order.package}
                            className="mb-6"
                        />

                        {/* eSIM Installation - NEW DESIGN */}
                        {isCompleted && order.esim && (
                            <div className="mb-6">
                                <EsimQrCard
                                    esim={order.esim}
                                    onCopy={handleCopyData}
                                />
                            </div>
                        )}

                        {/* Not completed yet - Preparing */}
                        {!isCompleted && !isFailed && !order.esim && (
                            <div className="mb-6 overflow-hidden rounded-2xl border border-accent-200/50 bg-gradient-to-br from-accent-50/30 to-white shadow-sm">
                                <div className="flex flex-col items-center justify-center px-4 py-10 text-center md:px-6 md:py-12">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-300 to-accent-400 shadow-lg md:h-16 md:w-16">
                                        <Loader2 className="h-7 w-7 animate-spin text-accent-950 md:h-8 md:w-8" />
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

                        {/* Payment Summary */}
                        <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                            <div className="bg-gradient-to-br from-accent-50/50 via-white to-primary-50/30 px-4 py-4 md:px-6 md:py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-300 to-accent-400 text-accent-950 shadow-md md:h-10 md:w-10">
                                        <Receipt className="h-4 w-4 md:h-5 md:w-5" />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-primary-900 md:text-base">
                                        {trans('order_status_page.payment.title')}
                                    </h3>
                                </div>
                            </div>
                            <div className="px-4 py-4 md:px-6 md:py-5">
                                <div className="space-y-2.5">
                                    {/* Payment Method */}
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 text-xs text-primary-500 md:text-sm">
                                            <CreditCard className="h-3.5 w-3.5" />
                                            {trans(
                                                'order_status_page.payment.method',
                                            )}
                                        </span>
                                        <span className="text-xs font-medium text-primary-700 md:text-sm">
                                            {order.payment_method}
                                        </span>
                                    </div>

                                    {/* Paid On */}
                                    {order.paid_at && (
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-xs text-primary-500 md:text-sm">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {trans(
                                                    'order_status_page.payment.paid_on',
                                                )}
                                            </span>
                                            <span className="text-xs font-medium text-primary-700 md:text-sm">
                                                {order.paid_at}
                                            </span>
                                        </div>
                                    )}

                                    <div className="h-px bg-primary-100/80" />

                                    {/* Coupon Discount */}
                                    {order.coupon &&
                                        Number(order.coupon_discount) > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-1.5 text-xs text-accent-600 md:text-sm">
                                                    <Tag className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                                    {trans(
                                                        'order_status_page.payment.discount',
                                                        { fallback: 'Discount' },
                                                    )}
                                                    <span className="rounded bg-accent-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent-700 ring-1 ring-accent-200/50 md:text-xs">
                                                        {order.coupon.code}
                                                    </span>
                                                </span>
                                                <span className="text-xs font-medium text-accent-600 md:text-sm">
                                                    -€
                                                    {Number(
                                                        order.coupon_discount,
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        )}

                                    {/* VAT Breakdown */}
                                    {Number(order.vat_rate) > 0 &&
                                        order.net_amount && (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-primary-500 md:text-sm">
                                                        {trans(
                                                            'order_status_page.payment.net_amount',
                                                            {
                                                                fallback:
                                                                    'Net Amount',
                                                            },
                                                        )}
                                                    </span>
                                                    <span className="text-xs font-medium text-primary-700 md:text-sm">
                                                        €
                                                        {Number(
                                                            order.net_amount,
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-primary-500 md:text-sm">
                                                        {trans(
                                                            'order_status_page.payment.vat',
                                                            {
                                                                rate: Number(
                                                                    order.vat_rate,
                                                                ),
                                                                fallback: `VAT (${Number(order.vat_rate)}%)`,
                                                            },
                                                        )}
                                                    </span>
                                                    <span className="text-xs font-medium text-primary-700 md:text-sm">
                                                        €
                                                        {Number(
                                                            order.vat_amount,
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="h-px bg-primary-100/80" />
                                            </>
                                        )}
                                </div>

                                {/* Total */}
                                <div className="mt-3 border-t border-primary-100 pt-3 md:mt-4 md:pt-4">
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-xs font-medium text-primary-600 md:text-sm">
                                            {trans(
                                                'order_status_page.payment.total',
                                            )}
                                            {Number(order.vat_rate) > 0 && (
                                                <span className="ml-1 text-[10px] text-primary-400 md:text-xs">
                                                    (
                                                    {trans(
                                                        'order_status_page.payment.incl_vat',
                                                        { fallback: 'incl. VAT' },
                                                    )}
                                                    )
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-xl font-extrabold text-primary-900 md:text-2xl">
                                            €{Number(order.amount).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions - Gold Button */}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Link
                                href="/destinations"
                                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-accent-400 bg-white px-6 text-sm font-bold text-accent-700 shadow-sm transition-all hover:bg-accent-50 hover:shadow-md md:h-13"
                            >
                                <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                                {trans('order_status_page.actions.browse')}
                            </Link>
                        </div>

                        {/* Help Section - Enhanced */}
                        <div className="mt-8 overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                            <div className="bg-gradient-to-br from-accent-50/50 via-white to-primary-50/30 px-4 py-5 md:px-6 md:py-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-300 to-accent-400 text-accent-950 shadow-md md:h-12 md:w-12">
                                        <HelpCircle className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-primary-900 md:text-base">
                                        {trans('order_status_page.help.title')}
                                    </h3>
                                    <p className="mt-1 text-[11px] text-primary-500 md:text-xs">
                                        {trans(
                                            'order_status_page.help.description',
                                        )}
                                    </p>
                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            href="/how-it-works"
                                            onClick={() => {
                                                contentView(
                                                    'guide',
                                                    'how-it-works',
                                                    'How It Works Guide',
                                                );
                                            }}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-accent-300 bg-white px-4 py-2 text-[11px] font-semibold text-accent-700 shadow-sm transition-all hover:bg-accent-50 hover:shadow-md md:text-xs"
                                        >
                                            <BookOpen className="h-3.5 w-3.5" />
                                            {trans(
                                                'order_status_page.help.guide',
                                            )}
                                        </Link>
                                        <Link
                                            href="/help"
                                            onClick={() =>
                                                handleSupportClick('ticket')
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-primary-200 bg-white px-4 py-2 text-[11px] font-semibold text-primary-700 shadow-sm transition-all hover:bg-primary-50 hover:shadow-md md:text-xs"
                                        >
                                            <MessageCircle className="h-3.5 w-3.5" />
                                            {trans(
                                                'order_status_page.help.contact',
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
