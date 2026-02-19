import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link } from '@inertiajs/react';
import { Clock, RotateCcw } from 'lucide-react';

export default function TrackOrderExpired() {
    const { trans } = useTrans();

    return (
        <GuestLayout>
            <Head title={trans('track_order_expired.meta_title')} />

            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-md">
                        <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 ring-1 ring-orange-200/50">
                                    <Clock className="h-8 w-8 text-orange-500" />
                                </div>
                                <h1 className="mt-5 text-xl font-bold text-primary-900 md:text-2xl">
                                    {trans('track_order_expired.title')}
                                </h1>
                                <p className="mt-2 text-sm text-primary-500">
                                    {trans('track_order_expired.description')}
                                </p>
                                <Link
                                    href="/track"
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    {trans('track_order_expired.request_new')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
