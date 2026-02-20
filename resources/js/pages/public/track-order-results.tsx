import { destinations } from '@/actions/App/Http/Controllers/Public/HomeController';
import { CountryFlag } from '@/components/country-flag';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronRight,
    Clock,
    Globe,
    HardDrive,
    Loader2,
    Package,
    RefreshCw,
    Timer,
    XCircle,
} from 'lucide-react';

interface OrderPackage {
    name: string;
    data_label: string;
    validity_label: string;
    country: string | null;
    country_iso: string | null;
}

interface Order {
    uuid: string;
    order_number: string;
    status: string;
    status_label: string;
    status_color: string;
    amount: string;
    has_esim: boolean;
    package: OrderPackage | null;
    created_at: string;
    completed_at: string | null;
}

interface Props {
    email: string;
    orders: Order[];
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'completed':
            return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        case 'processing':
        case 'provider_purchased':
            return <Loader2 className="h-4 w-4 animate-spin text-primary-500" />;
        case 'pending_retry':
            return <RefreshCw className="h-4 w-4 text-orange-500" />;
        case 'failed':
            return <XCircle className="h-4 w-4 text-red-500" />;
        case 'awaiting_payment':
        case 'pending':
            return <Clock className="h-4 w-4 text-primary-400" />;
        default:
            return <Clock className="h-4 w-4 text-primary-400" />;
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

export default function TrackOrderResults({ email, orders }: Props) {
    const { trans } = useTrans();

    return (
        <GuestLayout>
            <Head title={trans('track_order_results.meta_title')} />

            <section className="py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h1 className="text-2xl font-bold text-primary-900 md:text-3xl">
                                {trans('track_order_results.title')}
                            </h1>
                            <p className="mt-2 text-sm text-primary-500">
                                {trans(orders.length !== 1 ? 'track_order_results.order_count_plural' : 'track_order_results.order_count', { count: String(orders.length) })}{' '}
                                <span className="font-medium text-primary-700">{email}</span>
                            </p>
                        </div>

                        {orders.length === 0 ? (
                            <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                                <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 ring-1 ring-primary-100">
                                        <Package className="h-7 w-7 text-primary-400" />
                                    </div>
                                    <h3 className="mt-4 text-[15px] font-bold text-primary-900">
                                        {trans('track_order_results.no_orders')}
                                    </h3>
                                    <p className="mt-1 text-xs text-primary-500">
                                        {trans('track_order_results.no_orders_description')}
                                    </p>
                                    <Link
                                        href={destinations.url()}
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
                                    >
                                        <Globe className="h-4 w-4" />
                                        {trans('track_order_results.browse_destinations')}
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order) => (
                                    <Link
                                        key={order.uuid}
                                        href={`/order/${order.uuid}?from=track`}
                                        className="group block overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
                                    >
                                        <div className="px-4 py-4 md:px-5 md:py-5">
                                            <div className="flex items-center gap-3.5">
                                                {/* Flag / icon */}
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-50 ring-1 ring-primary-100 md:h-14 md:w-14">
                                                    {order.package?.country_iso ? (
                                                        <CountryFlag
                                                            countryCode={order.package.country_iso}
                                                            size="md"
                                                        />
                                                    ) : (
                                                        <Package className="h-5 w-5 text-primary-400" />
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-bold text-primary-900 md:text-[15px]">
                                                                {order.package?.name || order.order_number}
                                                            </p>
                                                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-primary-500 md:text-xs">
                                                                {order.package && (
                                                                    <>
                                                                        <span className="flex items-center gap-1">
                                                                            <HardDrive className="h-3 w-3" />
                                                                            {order.package.data_label}
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Timer className="h-3 w-3" />
                                                                            {order.package.validity_label}
                                                                        </span>
                                                                    </>
                                                                )}
                                                                <span>{order.created_at}</span>
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0 text-right">
                                                            <p className="text-sm font-bold tabular-nums text-primary-900 md:text-[15px]">
                                                                €{Number(order.amount).toFixed(2)}
                                                            </p>
                                                            <p className="mt-0.5 font-mono text-[10px] text-primary-400">
                                                                {order.order_number}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Status row */}
                                                    <div className="mt-2.5 flex items-center justify-between">
                                                        <span
                                                            className={`${getStatusBadgeClass(order.status_color)} inline-flex items-center gap-1.5 rounded-lg border-0 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase md:text-[11px]`}
                                                        >
                                                            {getStatusIcon(order.status)}
                                                            {order.status_label}
                                                        </span>

                                                        <ChevronRight className="h-4 w-4 text-primary-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Browse more */}
                        <div className="mt-8 text-center">
                            <Link
                                href={destinations.url()}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-900"
                            >
                                {trans('track_order_results.browse_more')}
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
