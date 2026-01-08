import { BackButton } from '@/components/back-button';
import { CountryFlag } from '@/components/country-flag';
import { PaymentProviderSelect } from '@/components/payment-provider-select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { GoldButton } from '@/components/ui/gold-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    CreditCard,
    HardDrive,
    Loader2,
    Lock,
    Mail,
    Phone,
    Shield,
    Sparkles,
    Timer,
    User,
    Zap,
} from 'lucide-react';
import { useEffect } from 'react';

interface Package {
    id: number;
    name: string;
    data_mb: number;
    data_label: string;
    validity_days: number;
    validity_label: string;
    retail_price: string | number;
    country: {
        name: string;
        iso_code: string;
    } | null;
}

interface PaymentMethod {
    name: string;
    icon: string;
}

interface PaymentProvider {
    id: string;
    name: string;
    description: string;
    payment_methods: PaymentMethod[];
}

interface Prefill {
    email: string;
    name: string;
    phone: string | null;
}

interface Props {
    package: Package;
    paymentProviders: PaymentProvider[];
    defaultProvider: string;
    prefill: Prefill | null;
}

export default function Checkout({
    package: pkg,
    paymentProviders,
    defaultProvider,
    prefill,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: prefill?.email || '',
        name: prefill?.name || '',
        phone: prefill?.phone || '',
        accept_terms: false,
        payment_provider: defaultProvider,
    });

    useEffect(() => {
        if (prefill) {
            if (prefill.email && !data.email) setData('email', prefill.email);
            if (prefill.name && !data.name) setData('name', prefill.name);
            if (prefill.phone && !data.phone) setData('phone', prefill.phone);
        }
    }, [prefill]);

    const { auth } = usePage().props as any;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/checkout/${pkg.id}`);
    }

    return (
        <GuestLayout>
            <Head title="Checkout" />

            <section className="bg-mesh relative min-h-screen py-6 md:py-16">
                {/* Abstract Background Shapes - same as hero */}
                <div className="animate-float absolute top-20 -left-20 h-64 w-64 rounded-full bg-primary-200/30 blur-3xl filter md:h-96 md:w-96" />
                <div className="animate-float-delayed absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-accent-200/30 blur-3xl filter md:h-96 md:w-96" />

                <div className="relative z-10 container mx-auto max-w-6xl px-4">
                    {/* Back Button */}
                    <BackButton
                        href={
                            pkg.country
                                ? `/destinations/${pkg.country.iso_code.toLowerCase()}`
                                : '/destinations'
                        }
                        label="Back"
                        className="mb-4 md:mb-8"
                    />

                    {/* Page Header - centered like hero */}
                    <div className="mb-6 text-center md:mb-12">
                        <Badge
                            variant="outline"
                            className="mb-3 inline-flex rounded-full border border-primary-100 bg-white/50 px-4 py-1.5 text-xs font-medium shadow-sm backdrop-blur-md md:mb-6 md:px-6 md:py-2 md:text-sm"
                        >
                            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-accent-500 md:mr-2 md:h-4 md:w-4" />
                            <span className="bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
                                Secure Checkout
                            </span>
                        </Badge>
                        <h1 className="mb-2 text-xl font-extrabold tracking-tight text-primary-900 md:mb-4 md:text-4xl lg:text-5xl">
                            Complete Your Order
                        </h1>
                        <p className="mx-auto max-w-xl text-sm text-primary-600 md:text-lg">
                            You're just a few steps away from staying connected.
                        </p>
                    </div>

                    <div className="flex flex-col-reverse gap-4 md:flex-row md:items-start md:gap-8">
                        {/* Left Column - Form */}
                        <div className="w-full md:flex-1">
                            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                                {/* General Error */}
                                {/* @ts-ignore */}
                                {errors.error && (
                                    <Alert
                                        variant="destructive"
                                        className="animate-shake"
                                    >
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {/* @ts-ignore */}
                                            {errors.error}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Your Details Section */}
                                <div className="overflow-hidden rounded-xl border border-primary-100 bg-white shadow-sm md:rounded-2xl">
                                    <div className="border-b border-primary-100 bg-primary-50/50 px-4 py-3 md:px-6 md:py-4">
                                        <div className="flex items-center gap-2.5 md:gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary-500 shadow-md ring-1 ring-primary-100 md:h-10 md:w-10 md:rounded-xl">
                                                <User className="h-4 w-4 md:h-5 md:w-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-bold text-primary-900 md:text-base">
                                                    Your Details
                                                </h2>
                                                <p className="text-xs text-primary-600 md:text-sm">
                                                    Where should we send your eSIM?
                                                    {auth?.user && (
                                                        <span className="ml-1 text-primary-400">
                                                            (auto-filled)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-4 md:space-y-5 md:p-6">
                                        {/* Email */}
                                        <div className="space-y-1.5 md:space-y-2">
                                            <Label
                                                htmlFor="email"
                                                className="text-xs font-semibold text-primary-800 md:text-sm"
                                            >
                                                Email Address
                                                <span className="ml-1 text-red-500">*</span>
                                            </Label>
                                            <div className="group relative">
                                                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-primary-400 transition-colors group-focus-within:text-primary-600" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    className="h-10 rounded-lg border-primary-200 bg-white pl-10 text-sm text-gray-950 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 md:h-12 md:rounded-xl md:pl-11 md:text-base"
                                                    value={data.email}
                                                    onChange={(e) =>
                                                        setData('email', e.target.value)
                                                    }
                                                    required
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-xs font-medium text-red-600 md:text-sm">
                                                    {errors.email}
                                                </p>
                                            )}
                                            <p className="text-[10px] text-primary-400 md:text-xs">
                                                Your eSIM QR code will be sent here
                                            </p>
                                        </div>

                                        {/* Full Name */}
                                        <div className="space-y-1.5 md:space-y-2">
                                            <Label
                                                htmlFor="name"
                                                className="text-xs font-semibold text-primary-800 md:text-sm"
                                            >
                                                Full Name
                                                <span className="ml-1 text-red-500">*</span>
                                            </Label>
                                            <div className="group relative">
                                                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-primary-400 transition-colors group-focus-within:text-primary-600" />
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    placeholder="John Doe"
                                                    className="h-10 rounded-lg border-primary-200 bg-white pl-10 text-sm text-gray-950 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 md:h-12 md:rounded-xl md:pl-11 md:text-base"
                                                    value={data.name}
                                                    onChange={(e) =>
                                                        setData('name', e.target.value)
                                                    }
                                                    required
                                                />
                                            </div>
                                            {errors.name && (
                                                <p className="text-xs font-medium text-red-600 md:text-sm">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-1.5 md:space-y-2">
                                            <Label
                                                htmlFor="phone"
                                                className="text-xs font-semibold text-primary-800 md:text-sm"
                                            >
                                                Phone
                                                <span className="ml-1.5 text-[10px] font-normal text-primary-400 md:text-xs">
                                                    (Optional)
                                                </span>
                                            </Label>
                                            <div className="group relative">
                                                <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-primary-400 transition-colors group-focus-within:text-primary-600" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="+1 234 567 8900"
                                                    className="h-10 rounded-lg border-primary-200 bg-white pl-10 text-sm text-gray-950 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 md:h-12 md:rounded-xl md:pl-11 md:text-base"
                                                    value={data.phone}
                                                    onChange={(e) =>
                                                        setData('phone', e.target.value)
                                                    }
                                                />
                                            </div>
                                            {errors.phone && (
                                                <p className="text-xs font-medium text-red-600 md:text-sm">
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method Section */}
                                <div className="overflow-hidden rounded-xl border border-primary-100 bg-white shadow-sm md:rounded-2xl">
                                    <div className="border-b border-primary-100 bg-primary-50/50 px-4 py-3 md:px-6 md:py-4">
                                        <div className="flex items-center gap-2.5 md:gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary-500 shadow-md ring-1 ring-primary-100 md:h-10 md:w-10 md:rounded-xl">
                                                <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-bold text-primary-900 md:text-base">
                                                    Payment Method
                                                </h2>
                                                <p className="text-xs text-primary-600 md:text-sm">
                                                    Choose how you'd like to pay
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 md:p-6">
                                        <PaymentProviderSelect
                                            providers={paymentProviders}
                                            value={data.payment_provider}
                                            onChange={(value) =>
                                                setData('payment_provider', value)
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Terms & Submit - Mobile only */}
                                <div className="space-y-3 md:hidden">
                                    <div className="flex items-start gap-2.5 rounded-lg border border-primary-100 bg-white p-3">
                                        <Checkbox
                                            id="accept_terms_mobile"
                                            checked={data.accept_terms}
                                            onCheckedChange={(checked) =>
                                                setData('accept_terms', checked === true)
                                            }
                                            required
                                            className="mt-0.5 h-4 w-4 border-accent-400 data-[state=checked]:border-accent-500 data-[state=checked]:bg-accent-400 data-[state=checked]:text-accent-950"
                                        />
                                        <Label
                                            htmlFor="accept_terms_mobile"
                                            className="text-xs leading-relaxed text-primary-700"
                                        >
                                            I agree to the{' '}
                                            <Link
                                                href="/terms"
                                                className="font-medium text-primary-600 underline underline-offset-2"
                                            >
                                                Terms
                                            </Link>{' '}
                                            and{' '}
                                            <Link
                                                href="/privacy"
                                                className="font-medium text-primary-600 underline underline-offset-2"
                                            >
                                                Privacy Policy
                                            </Link>
                                        </Label>
                                    </div>
                                    {errors.accept_terms && (
                                        <p className="text-xs font-medium text-red-600">
                                            {errors.accept_terms}
                                        </p>
                                    )}

                                    <GoldButton
                                        type="submit"
                                        className="h-11 w-full rounded-lg text-sm font-semibold"
                                        disabled={processing || !data.accept_terms}
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="mr-1.5 h-3.5 w-3.5" />
                                                Pay €{Number(pkg.retail_price).toFixed(2)}
                                            </>
                                        )}
                                    </GoldButton>

                                    <div className="flex items-center justify-center gap-3 text-[10px] text-primary-400">
                                        <div className="flex items-center gap-1">
                                            <Shield className="h-3 w-3" />
                                            <span>SSL Encrypted</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Lock className="h-3 w-3" />
                                            <span>Secure</span>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Right Column - Order Summary (Sticky) */}
                        <div className="w-full shrink-0 md:sticky md:top-28 md:w-[380px]">
                            <div className="overflow-hidden rounded-xl border border-primary-100 bg-white shadow-lg md:rounded-2xl">
                                {/* Header */}
                                <div className="border-b border-primary-100 bg-primary-50/50 px-4 py-3 md:px-6 md:py-4">
                                    <h2 className="text-sm font-bold text-primary-900 md:text-lg">
                                        Order Summary
                                    </h2>
                                </div>

                                <div className="p-4 md:p-6">
                                    {/* Package Card */}
                                    <div className="mb-4 flex items-center gap-3 rounded-lg border border-primary-100 bg-primary-50/50 p-3 md:mb-6 md:gap-4 md:rounded-xl md:p-4">
                                        {pkg.country && (
                                            <div className="overflow-hidden rounded-md shadow-md ring-2 ring-white md:rounded-lg">
                                                <CountryFlag
                                                    countryCode={pkg.country.iso_code}
                                                    size="md"
                                                    className="md:h-10 md:w-14"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="truncate text-sm font-bold text-primary-900 md:text-base">
                                                {pkg.name}
                                            </h3>
                                            {pkg.country && (
                                                <p className="text-xs text-primary-600 md:text-sm">
                                                    {pkg.country.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Package Details */}
                                    <div className="mb-4 space-y-2 md:mb-6 md:space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-primary-600">
                                                <HardDrive className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                <span className="text-xs md:text-sm">Data</span>
                                            </div>
                                            <span className="text-xs font-bold text-primary-900 md:text-sm">
                                                {pkg.data_label}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-primary-600">
                                                <Timer className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                <span className="text-xs md:text-sm">Validity</span>
                                            </div>
                                            <span className="text-xs font-bold text-primary-900 md:text-sm">
                                                {pkg.validity_label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="mb-4 h-px bg-primary-100 md:mb-6" />

                                    {/* Total */}
                                    <div className="mb-4 flex items-baseline justify-between md:mb-6">
                                        <span className="text-xs text-primary-600 md:text-sm">Total</span>
                                        <span className="text-xl font-extrabold text-primary-900 md:text-3xl">
                                            €{Number(pkg.retail_price).toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Desktop Terms & Button */}
                                    <div className="hidden space-y-4 md:block">
                                        <div className="flex items-start gap-3 rounded-xl border border-primary-100 bg-primary-50/50 p-4">
                                            <Checkbox
                                                id="accept_terms_desktop"
                                                checked={data.accept_terms}
                                                onCheckedChange={(checked) =>
                                                    setData('accept_terms', checked === true)
                                                }
                                                required
                                                className="mt-0.5 border-accent-400 data-[state=checked]:border-accent-500 data-[state=checked]:bg-accent-400 data-[state=checked]:text-accent-950"
                                            />
                                            <Label
                                                htmlFor="accept_terms_desktop"
                                                className="text-sm leading-relaxed text-primary-700"
                                            >
                                                I agree to the{' '}
                                                <Link
                                                    href="/terms"
                                                    className="font-medium text-primary-600 underline underline-offset-2 hover:text-primary-800"
                                                >
                                                    Terms
                                                </Link>{' '}
                                                and{' '}
                                                <Link
                                                    href="/privacy"
                                                    className="font-medium text-primary-600 underline underline-offset-2 hover:text-primary-800"
                                                >
                                                    Privacy Policy
                                                </Link>
                                            </Label>
                                        </div>
                                        {errors.accept_terms && (
                                            <p className="text-sm font-medium text-red-600">
                                                {errors.accept_terms}
                                            </p>
                                        )}

                                        <GoldButton
                                            type="submit"
                                            form="checkout-form"
                                            className="h-14 w-full rounded-xl text-base font-semibold"
                                            disabled={processing || !data.accept_terms}
                                            onClick={handleSubmit}
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="mr-2 h-4 w-4" />
                                                    Pay €{Number(pkg.retail_price).toFixed(2)}
                                                </>
                                            )}
                                        </GoldButton>

                                        <div className="flex items-center justify-center gap-4 text-xs text-primary-400">
                                            <div className="flex items-center gap-1.5">
                                                <Shield className="h-3.5 w-3.5" />
                                                <span>SSL Encrypted</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Lock className="h-3.5 w-3.5" />
                                                <span>Secure</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Benefits - styled like trust section */}
                                    <div className="hidden space-y-2 border-t border-primary-100 pt-4 md:mt-6 md:block md:space-y-3 md:pt-6">
                                        {[
                                            { icon: Zap, text: 'Instant delivery via email' },
                                            { icon: CheckCircle2, text: 'Easy QR code installation' },
                                            { icon: Shield, text: '24/7 customer support' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="flex h-6 w-6 items-center justify-center rounded bg-accent-300">
                                                    <item.icon className="h-3.5 w-3.5 text-accent-950" />
                                                </span>
                                                <span className="text-sm font-medium text-primary-700">
                                                    {item.text}
                                                </span>
                                            </div>
                                        ))}
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
