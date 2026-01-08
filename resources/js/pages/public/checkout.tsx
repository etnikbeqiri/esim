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

            <section className="bg-mesh relative min-h-screen py-12 md:py-16">
                {/* Abstract Background Shapes - same as hero */}
                <div className="animate-float absolute top-20 -left-20 h-96 w-96 rounded-full bg-primary-200/30 blur-3xl filter" />
                <div className="animate-float-delayed absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-accent-200/30 blur-3xl filter" />

                <div className="relative z-10 container mx-auto max-w-6xl px-4">
                    {/* Back Button */}
                    <BackButton
                        href={
                            pkg.country
                                ? `/destinations/${pkg.country.iso_code.toLowerCase()}`
                                : '/destinations'
                        }
                        label="Back to Plans"
                        className="mb-8"
                    />

                    {/* Page Header - centered like hero */}
                    <div className="mb-12 text-center">
                        <Badge
                            variant="outline"
                            className="mb-6 inline-flex rounded-full border border-primary-100 bg-white/50 px-6 py-2 text-sm font-medium shadow-sm backdrop-blur-md"
                        >
                            <Sparkles className="mr-2 h-4 w-4 text-accent-500" />
                            <span className="bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
                                Secure Checkout
                            </span>
                        </Badge>
                        <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-primary-900 md:text-4xl lg:text-5xl">
                            Complete Your Order
                        </h1>
                        <p className="mx-auto max-w-xl text-lg text-primary-600">
                            You're just a few steps away from staying connected.
                        </p>
                    </div>

                    <div className="flex flex-col-reverse gap-8 md:flex-row md:items-start">
                        {/* Left Column - Form */}
                        <div className="w-full md:flex-1">
                            <form onSubmit={handleSubmit} className="space-y-6">
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
                                <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                                    <div className="border-b border-primary-100 bg-primary-50/50 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-500 shadow-md ring-1 ring-primary-100">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-primary-900">
                                                    Your Details
                                                </h2>
                                                <p className="text-sm text-primary-600">
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

                                    <div className="space-y-5 p-6">
                                        {/* Email */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="email"
                                                className="text-sm font-semibold text-primary-800"
                                            >
                                                Email Address
                                                <span className="ml-1 text-red-500">*</span>
                                            </Label>
                                            <div className="group relative">
                                                <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-primary-400 transition-colors group-focus-within:text-primary-600" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    className="h-12 rounded-xl border-primary-200 bg-white pl-11 text-gray-950 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                                    value={data.email}
                                                    onChange={(e) =>
                                                        setData('email', e.target.value)
                                                    }
                                                    required
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-sm font-medium text-red-600">
                                                    {errors.email}
                                                </p>
                                            )}
                                            <p className="text-xs text-primary-400">
                                                Your eSIM QR code will be sent here
                                            </p>
                                        </div>

                                        {/* Full Name */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="name"
                                                className="text-sm font-semibold text-primary-800"
                                            >
                                                Full Name
                                                <span className="ml-1 text-red-500">*</span>
                                            </Label>
                                            <div className="group relative">
                                                <User className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-primary-400 transition-colors group-focus-within:text-primary-600" />
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    placeholder="John Doe"
                                                    className="h-12 rounded-xl border-primary-200 bg-white pl-11 text-gray-950 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                                    value={data.name}
                                                    onChange={(e) =>
                                                        setData('name', e.target.value)
                                                    }
                                                    required
                                                />
                                            </div>
                                            {errors.name && (
                                                <p className="text-sm font-medium text-red-600">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="phone"
                                                className="text-sm font-semibold text-primary-800"
                                            >
                                                Phone Number
                                                <span className="ml-1.5 text-xs font-normal text-primary-400">
                                                    (Optional)
                                                </span>
                                            </Label>
                                            <div className="group relative">
                                                <Phone className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-primary-400 transition-colors group-focus-within:text-primary-600" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="+1 234 567 8900"
                                                    className="h-12 rounded-xl border-primary-200 bg-white pl-11 text-gray-950 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                                    value={data.phone}
                                                    onChange={(e) =>
                                                        setData('phone', e.target.value)
                                                    }
                                                />
                                            </div>
                                            {errors.phone && (
                                                <p className="text-sm font-medium text-red-600">
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method Section */}
                                <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                                    <div className="border-b border-primary-100 bg-primary-50/50 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-500 shadow-md ring-1 ring-primary-100">
                                                <CreditCard className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-primary-900">
                                                    Payment Method
                                                </h2>
                                                <p className="text-sm text-primary-600">
                                                    Choose how you'd like to pay
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
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
                                <div className="space-y-5 md:hidden">
                                    <div className="flex items-start gap-3 rounded-xl border border-primary-100 bg-white p-4">
                                        <Checkbox
                                            id="accept_terms_mobile"
                                            checked={data.accept_terms}
                                            onCheckedChange={(checked) =>
                                                setData('accept_terms', checked === true)
                                            }
                                            required
                                            className="mt-0.5 border-primary-300 data-[state=checked]:border-primary-600 data-[state=checked]:bg-primary-600"
                                        />
                                        <Label
                                            htmlFor="accept_terms_mobile"
                                            className="text-sm leading-relaxed text-primary-700"
                                        >
                                            I agree to the{' '}
                                            <Link
                                                href="/terms"
                                                className="font-medium text-primary-600 underline underline-offset-2 hover:text-primary-800"
                                            >
                                                Terms of Service
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
                                        className="h-14 w-full rounded-xl text-base font-semibold"
                                        disabled={processing || !data.accept_terms}
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
                                            <span>Secure Checkout</span>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Right Column - Order Summary (Sticky) */}
                        <div className="w-full shrink-0 md:sticky md:top-28 md:w-[380px]">
                            <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-lg">
                                {/* Header */}
                                <div className="border-b border-primary-100 bg-primary-50/50 px-6 py-4">
                                    <h2 className="text-lg font-bold text-primary-900">
                                        Order Summary
                                    </h2>
                                </div>

                                <div className="p-6">
                                    {/* Package Card */}
                                    <div className="mb-6 flex items-center gap-4 rounded-xl border border-primary-100 bg-primary-50/50 p-4">
                                        {pkg.country && (
                                            <div className="overflow-hidden rounded-lg shadow-md ring-2 ring-white">
                                                <CountryFlag
                                                    countryCode={pkg.country.iso_code}
                                                    size="lg"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="truncate font-bold text-primary-900">
                                                {pkg.name}
                                            </h3>
                                            {pkg.country && (
                                                <p className="text-sm text-primary-600">
                                                    {pkg.country.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Package Details */}
                                    <div className="mb-6 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5 text-primary-600">
                                                <HardDrive className="h-4 w-4" />
                                                <span className="text-sm">Data</span>
                                            </div>
                                            <span className="font-bold text-primary-900">
                                                {pkg.data_label}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5 text-primary-600">
                                                <Timer className="h-4 w-4" />
                                                <span className="text-sm">Validity</span>
                                            </div>
                                            <span className="font-bold text-primary-900">
                                                {pkg.validity_label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="mb-6 h-px bg-primary-100" />

                                    {/* Total */}
                                    <div className="mb-6 flex items-baseline justify-between">
                                        <span className="text-primary-600">Total</span>
                                        <span className="text-3xl font-extrabold text-primary-900">
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
                                                className="mt-0.5 border-primary-300 data-[state=checked]:border-primary-600 data-[state=checked]:bg-primary-600"
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
                                    <div className="mt-6 space-y-3 border-t border-primary-100 pt-6">
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
