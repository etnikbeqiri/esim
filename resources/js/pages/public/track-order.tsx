import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Loader2,
    Mail,
    MapPin,
    Search,
    Shield,
} from 'lucide-react';
import { FormEvent } from 'react';

interface Props {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function TrackOrder() {
    const { trans } = useTrans();
    const { props } = usePage<{ flash: { success?: string; error?: string } }>();
    const flash = props.flash;

    const form = useForm({
        email: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        form.post('/track', {
            preserveScroll: true,
        });
    }

    const sent = !!flash?.success;

    return (
        <GuestLayout>
            <Head title={trans('track_order.meta_title')}>
                <meta
                    name="description"
                    content={trans('track_order.meta_description')}
                />
            </Head>

            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-md">
                        {/* Icon */}
                        <div className="mb-6 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 ring-1 ring-primary-200/50 md:h-20 md:w-20">
                                {sent ? (
                                    <CheckCircle2 className="h-8 w-8 text-green-600 md:h-9 md:w-9" />
                                ) : (
                                    <MapPin className="h-8 w-8 text-primary-600 md:h-9 md:w-9" />
                                )}
                            </div>
                        </div>

                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h1 className="text-2xl font-bold text-primary-900 md:text-3xl">
                                {sent ? trans('track_order.title_sent') : trans('track_order.title')}
                            </h1>
                            <p className="mt-2 text-sm text-primary-500 md:text-base">
                                {sent
                                    ? trans('track_order.description_sent')
                                    : trans('track_order.description')}
                            </p>
                        </div>

                        {sent ? (
                            /* Success state */
                            <div className="space-y-4">
                                <div className="overflow-hidden rounded-2xl border border-green-200/60 bg-white shadow-sm">
                                    <div className="px-5 py-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 ring-1 ring-green-200/50">
                                                <Mail className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-[15px] font-bold text-primary-900">
                                                    {trans('track_order.email_sent')}
                                                </p>
                                                <p className="mt-0.5 text-xs text-primary-500">
                                                    {trans('track_order.email_sent_description')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-primary-100 bg-primary-50/30 px-5 py-4">
                                    <div className="flex items-center gap-2 text-xs text-primary-500">
                                        <Shield className="h-3.5 w-3.5 shrink-0" />
                                        <span>{trans('track_order.link_valid')}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => form.reset()}
                                    className="mx-auto block text-sm font-semibold text-primary-600 transition-colors hover:text-primary-900"
                                >
                                    {trans('track_order.try_different')}
                                </button>
                            </div>
                        ) : (
                            /* Form state */
                            <div className="space-y-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                                        <div className="px-5 py-5">
                                            <label
                                                htmlFor="email"
                                                className="mb-2 block text-xs font-semibold tracking-wider text-primary-400 uppercase"
                                            >
                                                {trans('track_order.email_label')}
                                            </label>
                                            <div className="relative">
                                                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-primary-300" />
                                                <input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    placeholder={trans('track_order.email_placeholder')}
                                                    value={form.data.email}
                                                    onChange={(e) =>
                                                        form.setData('email', e.target.value)
                                                    }
                                                    disabled={form.processing}
                                                    className="w-full rounded-xl border border-primary-200 bg-primary-50/50 px-4 py-3 pl-10 text-sm text-primary-900 placeholder-primary-300 outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
                                                />
                                            </div>
                                            {form.errors.email && (
                                                <p className="mt-1.5 text-xs text-red-500">
                                                    {form.errors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div className="border-t border-primary-100 px-5 py-4">
                                            <button
                                                type="submit"
                                                disabled={form.processing || !form.data.email}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-900 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {form.processing ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        {trans('track_order.submitting')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search className="h-4 w-4" />
                                                        {trans('track_order.submit')}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                <div className="rounded-2xl border border-primary-100 bg-primary-50/30 px-5 py-4">
                                    <div className="flex items-center gap-2 text-xs text-primary-500">
                                        <Shield className="h-3.5 w-3.5 shrink-0" />
                                        <span>
                                            {trans('track_order.security_note')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
