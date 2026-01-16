import { CTASection } from '@/components/cta-section';
import { HeroSection } from '@/components/hero-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    ChevronRight,
    Clock,
    Mail,
    MessageSquare,
    Phone,
    Search,
    Send,
    Shield,
    Ticket,
    XCircle,
} from 'lucide-react';

interface UserTicket {
    uuid: string;
    reference: string;
    subject: string;
    status: string;
    status_label: string;
    status_color: string;
    created_at: string;
    updated_at: string;
}

interface TicketsPageProps extends SharedData {
    flash?: {
        success?: string;
        error?: string;
    };
    prefill?: {
        name: string;
        email: string;
    } | null;
    userTickets?: UserTicket[];
}

export default function TicketsIndex() {
    const { name, contact, flash, prefill, userTickets } = usePage<TicketsPageProps>().props;
    const { trans } = useTrans();

    // Ticket creation form - prefill with logged in user data
    const { data, setData, post, processing, errors, reset } = useForm({
        name: prefill?.name || '',
        email: prefill?.email || '',
        subject: '',
        message: '',
        priority: 'medium',
    });

    // Lookup form - prefill email for logged in users
    const lookupForm = useForm({
        reference: '',
        email: prefill?.email || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tickets', {
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleCheckStatus = (e: React.FormEvent) => {
        e.preventDefault();
        lookupForm.post('/tickets/lookup', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <GuestLayout>
            <Head title={trans('ticket.page_title', { app_name: name })}>
                <meta
                    name="description"
                    content={trans('ticket.page_description', { app_name: name })}
                />
            </Head>

            {/* Hero Section - Consistent with other pages */}
            <HeroSection
                badge={trans('ticket.hero_badge')}
                title={trans('ticket.hero_title')}
                description={trans('ticket.hero_description')}
                showSearch={false}
                showStats={false}
            />

            {/* Main Ticket Section */}
            <section className="bg-gradient-to-b from-primary-50/50 to-white py-8 md:py-12">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl">
                        {/* Success Message */}
                        {flash?.success && (
                            <div className="mb-8 flex items-start gap-4 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-white p-6 shadow-sm">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-green-100">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="mb-1 font-bold text-green-900">
                                        {trans('ticket.success_title')}
                                    </h3>
                                    <p className="text-sm text-green-700">
                                        {flash.success}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {flash?.error && (
                            <div className="mb-8 flex items-start gap-4 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-white p-6 shadow-sm">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-100">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-red-700">
                                        {flash.error}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Your Tickets (logged in) or Lookup (guest) */}
                        {userTickets && userTickets.length > 0 ? (
                            <div className="mb-8 rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                                            <Ticket className="h-5 w-5 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-primary-900">
                                                Your Tickets
                                            </h3>
                                            <p className="text-sm text-primary-600">
                                                {userTickets.length} ticket{userTickets.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {userTickets.map((ticket) => (
                                        <Link
                                            key={ticket.uuid}
                                            href={`/tickets/${ticket.uuid}/${prefill?.email}`}
                                            className="flex items-center justify-between rounded-xl border border-primary-100 bg-primary-50/50 p-4 transition-all hover:border-primary-200 hover:bg-primary-50"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <code className="rounded bg-primary-100 px-1.5 py-0.5 text-xs font-medium text-primary-700">
                                                        {ticket.reference}
                                                    </code>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            ticket.status === 'open'
                                                                ? 'bg-green-100 text-green-700'
                                                                : ticket.status === 'in_progress'
                                                                  ? 'bg-blue-100 text-blue-700'
                                                                  : ticket.status === 'waiting_on_customer'
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                    >
                                                        {ticket.status_label}
                                                    </span>
                                                </div>
                                                <p className="mt-1 truncate font-medium text-primary-900">
                                                    {ticket.subject}
                                                </p>
                                                <p className="text-xs text-primary-500">
                                                    Created {ticket.created_at}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 flex-shrink-0 text-primary-400" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : prefill ? (
                            <div className="mb-8 rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-3 text-primary-600">
                                    <Ticket className="h-5 w-5" />
                                    <p className="text-sm">
                                        You don't have any support tickets yet. Submit one below if you need help.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-8 rounded-2xl border border-primary-100 bg-white p-4 shadow-sm md:p-6">
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 md:mt-0">
                                        <Search className="h-6 w-6 text-primary-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-2 text-lg font-bold text-primary-900 md:mb-1 md:text-base">
                                            {trans('ticket.lookup_title')}
                                        </h3>
                                        <p className="mb-4 text-sm leading-relaxed text-primary-600 md:mb-4">
                                            {trans('ticket.lookup_description')}
                                        </p>
                                        <form
                                            onSubmit={handleCheckStatus}
                                            className="space-y-3"
                                        >
                                            <div className="space-y-3 md:flex md:gap-3 md:space-y-0">
                                                <Input
                                                    value={lookupForm.data.reference}
                                                    onChange={(e) => lookupForm.setData('reference', e.target.value)}
                                                    placeholder="TKT-XXXXXXXX"
                                                    required
                                                    className="h-11 flex-1 text-base md:h-10"
                                                />
                                                <Input
                                                    type="email"
                                                    value={lookupForm.data.email}
                                                    onChange={(e) => lookupForm.setData('email', e.target.value)}
                                                    placeholder={trans('ticket.lookup_email_placeholder')}
                                                    required
                                                    className="h-11 flex-1 text-base md:h-10"
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                variant="outline"
                                                className="h-11 w-full md:h-10 md:w-auto"
                                                disabled={lookupForm.processing}
                                            >
                                                <Search className="mr-2 h-4 w-4" />
                                                {trans('ticket.lookup_button')}
                                            </Button>
                                        </form>
                                        {lookupForm.errors.reference && (
                                            <p className="mt-2 text-sm text-red-500">{lookupForm.errors.reference}</p>
                                        )}
                                        {lookupForm.errors.email && (
                                            <p className="mt-2 text-sm text-red-500">{lookupForm.errors.email}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Create New Ticket Form */}
                        <div className="rounded-2xl border border-accent-200 bg-gradient-to-br from-accent-50/50 to-white p-6 shadow-sm md:p-8">
                            <div className="mb-8 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-300 to-accent-500 shadow-lg shadow-accent-400/30">
                                    <Ticket className="h-8 w-8 text-accent-950" />
                                </div>
                                <h2 className="mb-2 text-2xl font-bold text-primary-900">
                                    {trans('ticket.form_title')}
                                </h2>
                                <p className="text-sm text-primary-600">
                                    {trans('ticket.form_description')}
                                </p>

                                {/* Trust Indicators */}
                                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-primary-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {trans('ticket.badge_response')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Shield className="h-3.5 w-3.5" />
                                        {trans('ticket.badge_secure')}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name & Email */}
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            {trans('ticket.field_name')} *
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder={trans('ticket.field_name_placeholder')}
                                            className={errors.name ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-500">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            {trans('ticket.field_email')} *
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder={trans('ticket.field_email_placeholder')}
                                            className={errors.email ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-500">{errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Subject & Priority */}
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">
                                            {trans('ticket.field_subject')} *
                                        </Label>
                                        <Input
                                            id="subject"
                                            value={data.subject}
                                            onChange={(e) => setData('subject', e.target.value)}
                                            placeholder={trans('ticket.field_subject_placeholder')}
                                            className={errors.subject ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors.subject && (
                                            <p className="text-sm text-red-500">{errors.subject}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="priority">
                                            {trans('ticket.field_priority')}
                                        </Label>
                                        <Select
                                            value={data.priority}
                                            onValueChange={(value) => setData('priority', value)}
                                        >
                                            <SelectTrigger id="priority">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">
                                                    {trans('ticket.priority_low')}
                                                </SelectItem>
                                                <SelectItem value="medium">
                                                    {trans('ticket.priority_medium')}
                                                </SelectItem>
                                                <SelectItem value="high">
                                                    {trans('ticket.priority_high')}
                                                </SelectItem>
                                                <SelectItem value="urgent">
                                                    {trans('ticket.priority_urgent')}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="space-y-2">
                                    <Label htmlFor="message">
                                        {trans('ticket.field_message')} *
                                    </Label>
                                    <Textarea
                                        id="message"
                                        rows={6}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        placeholder={trans('ticket.field_message_placeholder')}
                                        className={errors.message ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.message && (
                                        <p className="text-sm text-red-500">{errors.message}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-12 w-full text-base font-semibold"
                                >
                                    {processing ? (
                                        <>
                                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            {trans('ticket.submitting')}
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-5 w-5" />
                                            {trans('ticket.submit_button')}
                                        </>
                                    )}
                                </Button>

                                <p className="text-center text-xs text-primary-500">
                                    {trans('ticket.form_note')}
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Contact Options */}
            <section className="relative overflow-hidden border-t border-primary-100 py-8 md:py-16">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50/30" />

                <div className="relative z-10 container mx-auto px-4">
                    <div className="mb-5 text-center md:mb-8">
                        <h2 className="mb-2 text-lg font-bold text-primary-900 md:text-2xl">
                            {trans('ticket.quick_options_title')}
                        </h2>
                        <p className="text-sm text-primary-600 md:text-base">
                            {trans('ticket.quick_options_desc')}
                        </p>
                    </div>

                    {/* Contact Cards Grid */}
                    <div className="mx-auto grid max-w-4xl gap-3 md:grid-cols-3 md:gap-5">
                        {/* Email Card */}
                        <a
                            href={`mailto:${contact?.supportEmail || ''}`}
                            className="group flex items-center gap-3 rounded-xl border border-primary-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md md:flex-col md:rounded-2xl md:p-6 md:text-center"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-300 transition-colors group-hover:bg-accent-400 md:mb-4 md:h-12 md:w-12 md:rounded-xl">
                                <Mail className="h-5 w-5 text-accent-950 md:h-6 md:w-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-primary-900 md:mb-1 md:text-base">
                                    {trans('ticket.quick_email')}
                                </h3>
                                <p className="text-xs text-primary-600 md:text-sm">
                                    {contact?.supportEmail}
                                </p>
                                <p className="mt-1 text-[10px] text-primary-400 md:mt-2 md:text-xs">
                                    {trans('ticket.email_response_time')}
                                </p>
                            </div>
                        </a>

                        {/* Phone Card */}
                        {contact?.phone && (
                            <a
                                href={`tel:${contact.phone}`}
                                className="group flex items-center gap-3 rounded-xl border border-primary-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md md:flex-col md:rounded-2xl md:p-6 md:text-center"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 transition-colors group-hover:bg-primary-200 md:mb-4 md:h-12 md:w-12 md:rounded-xl">
                                    <Phone className="h-5 w-5 text-primary-600 md:h-6 md:w-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-primary-900 md:mb-1 md:text-base">
                                        {trans('ticket.quick_phone')}
                                    </h3>
                                    <p className="text-xs text-primary-600 md:text-sm">
                                        {contact.phone}
                                    </p>
                                    <p className="mt-1 text-[10px] text-primary-400 md:mt-2 md:text-xs">
                                        {trans('ticket.phone_hours')}
                                    </p>
                                </div>
                            </a>
                        )}

                        {/* WhatsApp Card */}
                        {contact?.whatsapp && (
                            <a
                                href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-3 rounded-xl border border-primary-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md md:flex-col md:rounded-2xl md:p-6 md:text-center"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 transition-colors group-hover:bg-green-200 md:mb-4 md:h-12 md:w-12 md:rounded-xl">
                                    <MessageSquare className="h-5 w-5 text-green-600 md:h-6 md:w-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-primary-900 md:mb-1 md:text-base">
                                        {trans('ticket.quick_whatsapp')}
                                    </h3>
                                    <p className="text-xs text-primary-600 md:text-sm">
                                        {trans('ticket.quick_whatsapp_desc')}
                                    </p>
                                    <p className="mt-1 text-[10px] text-primary-400 md:mt-2 md:text-xs">
                                        {trans('ticket.whatsapp_response_time')}
                                    </p>
                                </div>
                            </a>
                        )}
                    </div>

                    {/* Company Details */}
                    {(contact?.companyName || contact?.companyAddress) && (
                        <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-primary-100 bg-white p-4 shadow-sm md:mt-10 md:rounded-2xl md:p-6">
                            <div className="flex items-start gap-3 md:gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 md:h-12 md:w-12 md:rounded-xl">
                                    <svg className="h-5 w-5 text-primary-600 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    {contact?.companyName && (
                                        <h3 className="mb-1 text-sm font-bold text-primary-900 md:text-base">
                                            {contact.companyName}
                                        </h3>
                                    )}
                                    <div className="text-xs text-primary-600 md:text-sm">
                                        {contact?.companyAddress && <p>{contact.companyAddress}</p>}
                                        {(contact?.companyPostalCode || contact?.companyCity) && (
                                            <p>{contact?.companyPostalCode} {contact?.companyCity}</p>
                                        )}
                                        {contact?.companyCountry && <p>{contact.companyCountry}</p>}
                                    </div>
                                    {(contact?.companyVat || contact?.companyRegistration) && (
                                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-primary-400 md:mt-3 md:gap-3 md:text-xs">
                                            {contact?.companyVat && (
                                                <span>VAT: {contact.companyVat}</span>
                                            )}
                                            {contact?.companyRegistration && (
                                                <span>Reg: {contact.companyRegistration}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <CTASection />
        </GuestLayout>
    );
}
