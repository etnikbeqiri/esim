import { ApplePayButton } from '@/components/apple-pay-button';
import { BackButton } from '@/components/back-button';
import { CountryFlag } from '@/components/country-flag';
import { CouponCodeInput } from '@/components/coupon/coupon-code-input';
import { PaymentProviderSelect } from '@/components/payment-provider-select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { GoldButton } from '@/components/ui/gold-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTrans } from '@/hooks/use-trans';
import GuestLayout from '@/layouts/guest-layout';
import type { PaymentMethod } from '@/lib/analytics';
import { useAnalytics, useFormTracking } from '@/lib/analytics';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    CreditCard,
    Globe,
    HardDrive,
    Loader2,
    Lock,
    Mail,
    Phone,
    Shield,
    Sparkles,
    Tag,
    Timer,
    User,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
    logo_url?: string;
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

interface VatInfo {
    enabled: boolean;
    rate: number;
    amount: number;
    net: number;
    total: number;
    country: string;
}

interface BillingCountry {
    code: string;
    name: string;
    vat_rate: number;
}

interface Props {
    package: Package;
    paymentProviders: PaymentProvider[];
    defaultProvider: string;
    prefill: Prefill | null;
    billingCountries: BillingCountry[];
    vat: VatInfo;
    applePayMerchantId: string | null;
}

export default function Checkout({
    package: pkg,
    paymentProviders,
    defaultProvider,
    prefill,
    billingCountries,
    vat,
    applePayMerchantId,
}: Props) {
    const { trans } = useTrans();
    const { data, setData, post, processing, errors } = useForm({
        email: prefill?.email || '',
        name: prefill?.name || '',
        phone: prefill?.phone || '',
        billing_country: 'XK',
        accept_terms: false,
        payment_provider: defaultProvider || paymentProviders[0]?.id || '',
        coupon_codes: [] as string[],
    });

    const geoDetected = useRef(false);

    useEffect(() => {
        if (geoDetected.current) return;
        geoDetected.current = true;

        fetch('/api/v1/geo/detect')
            .then((res) => res.json())
            .then((geo) => {
                if (geo.country_code) {
                    const exists = billingCountries.some(
                        (c) => c.code === geo.country_code,
                    );
                    if (exists) {
                        setData('billing_country', geo.country_code);
                    }
                }
            })
            .catch(() => {});
    }, []);

    interface AppliedCoupon {
        code: string;
        name: string;
        type: string;
        value: number;
        discount: number;
        isStackable: boolean;
    }

    const [appliedCoupons, setAppliedCoupons] = useState<AppliedCoupon[]>([]);
    const [totalDiscount, setTotalDiscount] = useState(0);
    const [finalPrice, setFinalPrice] = useState(Number(pkg.retail_price));
    const [termsWiggle, setTermsWiggle] = useState(false);
    const [applePayAvailable, setApplePayAvailable] = useState(false);
    const [applePayProcessing, setApplePayProcessing] = useState(false);

    useEffect(() => {
        if (!applePayMerchantId) return;

        const ApplePaySession = (window as any).ApplePaySession;
        if (!ApplePaySession || !ApplePaySession.canMakePayments()) return;

        ApplePaySession.canMakePaymentsWithActiveCard(applePayMerchantId)
            .then((canMake: boolean) => setApplePayAvailable(canMake))
            .catch(() => {});
    }, [applePayMerchantId]);
    const [dynamicPaymentMethods, setDynamicPaymentMethods] = useState<
        PaymentMethod[] | null
    >(null);
    const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);

    // Fetch available payment methods when billing country changes
    useEffect(() => {
        setPaymentMethodsLoading(true);
        const amountCents = Math.round(Number(pkg.retail_price) * 100);
        fetch(
            `/api/v1/payment-methods?country=${data.billing_country}&amount=${amountCents}`,
        )
            .then((res) => res.json())
            .then((result) => {
                if (result.methods && result.methods.length > 0) {
                    setDynamicPaymentMethods(result.methods);
                } else {
                    setDynamicPaymentMethods(null);
                }
            })
            .catch(() => setDynamicPaymentMethods(null))
            .finally(() => setPaymentMethodsLoading(false));
    }, [data.billing_country]);

    // Get current VAT rate based on selected billing country
    const selectedCountry = billingCountries.find(
        (c) => c.code === data.billing_country,
    );
    const currentVatRate = selectedCountry?.vat_rate ?? 0;

    // Calculate VAT for the current final price (inclusive VAT)
    const calculateVat = (total: number, vatRate: number) => {
        if (!vat.enabled || vatRate <= 0) {
            return { net: total, vatAmount: 0, rate: 0 };
        }
        const vatMultiplier = 1 + vatRate / 100;
        const net = Math.round((total / vatMultiplier) * 100) / 100;
        const vatAmount = Math.round((total - net) * 100) / 100;
        return { net, vatAmount, rate: vatRate };
    };

    const currentVat = calculateVat(finalPrice, currentVatRate);

    const handleCouponsChanged = (
        coupons: AppliedCoupon[],
        discount: number,
        finalAmount: number,
    ) => {
        setAppliedCoupons(coupons);
        setTotalDiscount(discount);
        setFinalPrice(finalAmount);
        setData(
            'coupon_codes',
            coupons.map((c) => c.code),
        );
    };

    const { beginCheckout, addPaymentInfo, createItem, trackError, pageView } =
        useAnalytics();
    const {
        trackFocus,
        trackComplete,
        trackSubmit,
        trackError: trackFormError,
    } = useFormTracking('checkout', 'Checkout Form');
    const analyticsTracked = useRef(false);

    const packageItem = createItem({
        id: String(pkg.id),
        name: pkg.name,
        category: pkg.country?.name ?? 'Global',
        price: Number(pkg.retail_price),
        currency: 'EUR',
    });

    useEffect(() => {
        if (!analyticsTracked.current) {
            analyticsTracked.current = true;
            pageView('checkout', `Checkout - ${pkg.name}`, {
                package_id: String(pkg.id),
                country_code: pkg.country?.iso_code ?? '',
            });
            beginCheckout('EUR', Number(pkg.retail_price), [packageItem]);
        }
    }, []);

    useEffect(() => {
        if (prefill) {
            if (prefill.email && !data.email) setData('email', prefill.email);
            if (prefill.name && !data.name) setData('name', prefill.name);
            if (prefill.phone && !data.phone) setData('phone', prefill.phone);
        }
    }, [prefill]);

    const { auth } = usePage().props as any;

    function handlePaymentProviderChange(value: string) {
        setData('payment_provider', value);
        addPaymentInfo(
            'EUR',
            Number(pkg.retail_price),
            value as PaymentMethod,
            [packageItem],
        );
    }

    function handlePayClick() {
        if (!data.accept_terms) {
            setTermsWiggle(true);
            setTimeout(() => setTermsWiggle(false), 500);
        }
    }

    function getCsrfToken(): string {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : '';
    }

    function handleApplePayClick() {
        startApplePaySession();
    }

    function startApplePaySession() {
        const ApplePaySession = (window as any).ApplePaySession;

        const request = {
            countryCode: data.billing_country || 'XK',
            currencyCode: 'EUR',
            supportedNetworks: ['visa', 'masterCard', 'amex', 'maestro'],
            merchantCapabilities: ['supports3DS'],
            total: {
                label: pkg.name,
                amount: finalPrice.toFixed(2),
            },
            requiredShippingContactFields: ['email', 'name', 'phone'],
        };

        const session = new ApplePaySession(3, request);

        session.onvalidatemerchant = async (event: any) => {
            try {
                const response = await fetch('/api/v1/apple-pay/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-XSRF-TOKEN': getCsrfToken(),
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({ validationURL: event.validationURL }),
                });
                const merchantSession = await response.json();
                session.completeMerchantValidation(merchantSession);
            } catch {
                session.abort();
            }
        };

        session.onpaymentauthorized = async (event: any) => {
            const payment = event.payment;
            setApplePayProcessing(true);

            try {
                const response = await fetch('/api/v1/apple-pay/process', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-XSRF-TOKEN': getCsrfToken(),
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        package_id: pkg.id,
                        token: payment.token,
                        billing_country: data.billing_country,
                        coupon_codes: data.coupon_codes,
                        shipping_contact: payment.shippingContact,
                        billing_contact: payment.billingContact,
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    session.completePayment(ApplePaySession.STATUS_SUCCESS);
                    window.location.href = result.redirect_url || `/checkout/success/${result.order_uuid}`;
                } else {
                    session.completePayment(ApplePaySession.STATUS_FAILURE);
                }
            } catch {
                session.completePayment(ApplePaySession.STATUS_FAILURE);
            } finally {
                setApplePayProcessing(false);
            }
        };

        session.oncancel = () => {
            setApplePayProcessing(false);
        };

        session.begin();
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        trackSubmit();
        post(`/checkout/${pkg.id}`, {
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat().join(', ');
                trackFormError(errorMessages);
                trackError('form', errorMessages, 'checkout');
            },
        });
    }

    return (
        <GuestLayout>
            <Head title={trans('checkout_page.meta_title')} />

            <section className="bg-mesh relative min-h-screen pt-4 pb-6 md:py-10">
                <div className="animate-float absolute top-20 -left-20 h-64 w-64 rounded-full bg-primary-200/30 blur-3xl filter md:h-96 md:w-96" />
                <div className="animate-float-delayed absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-accent-200/30 blur-3xl filter md:h-96 md:w-96" />

                <div className="relative z-10 container mx-auto max-w-6xl px-4">
                    <BackButton
                        href={
                            pkg.country
                                ? `/destinations/${pkg.country.iso_code.toLowerCase()}`
                                : '/destinations'
                        }
                        label={trans('checkout_page.back')}
                        className="mb-3 md:mb-6"
                    />

                    <div className="mb-5 text-center md:mb-10">
                        <Badge
                            variant="outline"
                            className="mb-3 inline-flex rounded-full border border-primary-100 bg-white/60 px-4 py-1.5 text-xs font-medium shadow-sm backdrop-blur-md md:mb-5 md:px-6 md:py-2 md:text-sm"
                        >
                            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-accent-500 md:mr-2 md:h-4 md:w-4" />
                            <span className="bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
                                {trans('checkout_page.secure_checkout')}
                            </span>
                        </Badge>
                        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-primary-900 md:mb-3 md:text-4xl lg:text-5xl">
                            {trans('checkout_page.title')}
                        </h1>
                        <p className="mx-auto max-w-xl text-[13px] leading-relaxed text-primary-500 md:text-lg">
                            {trans('checkout_page.subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-col-reverse gap-4 md:flex-row md:items-start md:gap-8">
                        {/* Left Column - Form */}
                        <div className="w-full md:min-w-0 md:flex-1">
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6 md:space-y-8"
                            >
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

                                {applePayAvailable && (
                                    <>
                                        <ApplePayButton
                                            label={trans('checkout_page.apple_pay.pay_with')}
                                            payLabel={trans('checkout_page.apple_pay.pay')}
                                            onClick={handleApplePayClick}
                                            disabled={processing}
                                            processing={applePayProcessing}
                                        />

                                        <div className="flex items-center gap-3">
                                            <div className="h-px flex-1 bg-primary-200/60" />
                                            <span className="text-xs font-medium text-primary-400 md:text-sm">
                                                {trans('checkout_page.apple_pay.or')}
                                            </span>
                                            <div className="h-px flex-1 bg-primary-200/60" />
                                        </div>
                                    </>
                                )}

                                {/* Your Details Section */}
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2 px-1">
                                        <User className="h-4 w-4 text-primary-400" />
                                        <h2 className="text-xs font-semibold tracking-wide text-primary-500 uppercase md:text-sm">
                                            {trans(
                                                'checkout_page.form.your_details',
                                            )}
                                        </h2>
                                    </div>
                                <div className="overflow-hidden rounded-xl border border-primary-100 bg-white shadow-sm md:rounded-2xl">
                                    <div className="space-y-3.5 p-4 md:space-y-5 md:p-6">
                                        {/* Email */}
                                        <div className="space-y-1.5 md:space-y-2">
                                            <Label
                                                htmlFor="email"
                                                className="text-xs font-semibold text-primary-800 md:text-sm"
                                            >
                                                {trans(
                                                    'checkout_page.form.email.label',
                                                )}
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="group relative">
                                                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-primary-400 transition-colors group-focus-within:text-primary-600" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder={trans(
                                                        'checkout_page.form.email.placeholder',
                                                    )}
                                                    className="h-10 rounded-lg border-primary-200 bg-white pl-10 text-base text-gray-950 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 md:h-12 md:rounded-xl md:pl-11"
                                                    value={data.email}
                                                    onChange={(e) =>
                                                        setData(
                                                            'email',
                                                            e.target.value,
                                                        )
                                                    }
                                                    onFocus={() =>
                                                        trackFocus('email')
                                                    }
                                                    onBlur={() =>
                                                        data.email &&
                                                        trackComplete('email')
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
                                                {trans(
                                                    'checkout_page.form.email.hint',
                                                )}
                                            </p>
                                        </div>

                                        {/* Full Name */}
                                        <div className="space-y-1.5 md:space-y-2">
                                            <Label
                                                htmlFor="name"
                                                className="text-xs font-semibold text-primary-800 md:text-sm"
                                            >
                                                {trans(
                                                    'checkout_page.form.name.label',
                                                )}
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="group relative">
                                                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-primary-400 transition-colors group-focus-within:text-primary-600" />
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    placeholder={trans(
                                                        'checkout_page.form.name.placeholder',
                                                    )}
                                                    className="h-10 rounded-lg border-primary-200 bg-white pl-10 text-base text-gray-950 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 md:h-12 md:rounded-xl md:pl-11"
                                                    value={data.name}
                                                    onChange={(e) =>
                                                        setData(
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    onFocus={() =>
                                                        trackFocus('name')
                                                    }
                                                    onBlur={() =>
                                                        data.name &&
                                                        trackComplete('name')
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
                                                {trans(
                                                    'checkout_page.form.phone.label',
                                                )}
                                                <span className="ml-1.5 text-[10px] font-normal text-primary-400 md:text-xs">
                                                    {trans(
                                                        'checkout_page.form.phone.optional',
                                                    )}
                                                </span>
                                            </Label>
                                            <div className="group relative">
                                                <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-primary-400 transition-colors group-focus-within:text-primary-600" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder={trans(
                                                        'checkout_page.form.phone.placeholder',
                                                    )}
                                                    className="h-10 rounded-lg border-primary-200 bg-white pl-10 text-base text-gray-950 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 md:h-12 md:rounded-xl md:pl-11"
                                                    value={data.phone}
                                                    onChange={(e) =>
                                                        setData(
                                                            'phone',
                                                            e.target.value,
                                                        )
                                                    }
                                                    onFocus={() =>
                                                        trackFocus('phone')
                                                    }
                                                    onBlur={() =>
                                                        data.phone &&
                                                        trackComplete('phone')
                                                    }
                                                />
                                            </div>
                                            {errors.phone && (
                                                <p className="text-xs font-medium text-red-600 md:text-sm">
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>

                                        {/* Billing Country */}
                                        <div className="space-y-1.5 md:space-y-2">
                                            <Label
                                                htmlFor="billing_country"
                                                className="text-xs font-semibold text-primary-800 md:text-sm"
                                            >
                                                {trans(
                                                    'checkout_page.form.country.label',
                                                )}
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="group relative">
                                                <Globe className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-primary-400" />
                                                <Select
                                                    value={data.billing_country}
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'billing_country',
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger
                                                        id="billing_country"
                                                        className="h-10 rounded-lg border-primary-200 bg-white pl-10 text-base text-gray-950 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 md:h-12 md:rounded-xl md:pl-11"
                                                    >
                                                        <SelectValue
                                                            placeholder={trans(
                                                                'checkout_page.form.country.placeholder',
                                                            )}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {billingCountries.map(
                                                            (country) => (
                                                                <SelectItem
                                                                    key={
                                                                        country.code
                                                                    }
                                                                    value={
                                                                        country.code
                                                                    }
                                                                >
                                                                    {
                                                                        country.name
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {errors.billing_country && (
                                                <p className="text-xs font-medium text-red-600 md:text-sm">
                                                    {errors.billing_country}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                </div>

                                {/* Payment Method Section */}
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2 px-1">
                                        <CreditCard className="h-4 w-4 text-primary-400" />
                                        <h2 className="text-xs font-semibold tracking-wide text-primary-500 uppercase md:text-sm">
                                            {trans(
                                                'checkout_page.form.payment_method.title',
                                            )}
                                        </h2>
                                    </div>
                                    <PaymentProviderSelect
                                        providers={paymentProviders}
                                        value={data.payment_provider}
                                        onChange={
                                            handlePaymentProviderChange
                                        }
                                        methodsOverride={dynamicPaymentMethods}
                                        methodsLoading={paymentMethodsLoading}
                                    />
                                </div>

                                {/* Terms & Submit - Mobile only */}
                                <div className="space-y-3 md:hidden">
                                    <div className={`flex items-start gap-2.5 rounded-lg border p-3 transition-all ${termsWiggle && !data.accept_terms ? 'animate-wiggle border-red-300 bg-red-50' : 'border-primary-100 bg-white'}`}>
                                        <Checkbox
                                            id="accept_terms_mobile"
                                            checked={data.accept_terms}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'accept_terms',
                                                    checked === true,
                                                )
                                            }
                                            required
                                            className={`mt-0.5 h-4 w-4 border-accent-400 data-[state=checked]:border-accent-500 data-[state=checked]:bg-accent-400 data-[state=checked]:text-accent-950 ${!data.accept_terms ? 'animate-checkbox-glow' : ''}`}
                                        />
                                        <Label
                                            htmlFor="accept_terms_mobile"
                                            className="text-xs leading-relaxed text-primary-700"
                                        >
                                            {trans(
                                                'checkout_page.form.terms.agree',
                                            )}{' '}
                                            <Link
                                                href="/terms"
                                                className="font-medium text-primary-600 underline underline-offset-2"
                                            >
                                                {trans(
                                                    'checkout_page.form.terms.terms_link',
                                                )}
                                            </Link>{' '}
                                            {trans(
                                                'checkout_page.form.terms.and',
                                            )}{' '}
                                            <Link
                                                href="/privacy"
                                                className="font-medium text-primary-600 underline underline-offset-2"
                                            >
                                                {trans(
                                                    'checkout_page.form.terms.privacy_link',
                                                )}
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
                                        disabled={processing}
                                        onClick={!data.accept_terms ? (e: React.MouseEvent) => { e.preventDefault(); handlePayClick(); } : undefined}
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {trans(
                                                    'checkout_page.form.submit.processing',
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="mr-1.5 h-3.5 w-3.5" />
                                                {trans(
                                                    'checkout_page.form.submit.pay',
                                                    {
                                                        amount: `€${finalPrice.toFixed(2)}`,
                                                    },
                                                )}
                                            </>
                                        )}
                                    </GoldButton>

                                    <div className="flex items-center justify-center gap-3 text-[10px] text-primary-400">
                                        <div className="flex items-center gap-1">
                                            <Shield className="h-3 w-3" />
                                            <span>
                                                {trans(
                                                    'checkout_page.form.security.ssl',
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Lock className="h-3 w-3" />
                                            <span>
                                                {trans(
                                                    'checkout_page.form.security.secure',
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Right Column - Order Summary (Sticky) */}
                        <div className="w-full shrink-0 md:sticky md:top-28 md:w-[380px]">
                            <div className="mb-2.5 flex items-center gap-2 px-1">
                                <Sparkles className="h-4 w-4 text-primary-400" />
                                <h2 className="text-xs font-semibold tracking-wide text-primary-500 uppercase md:text-sm">
                                    {trans('checkout_page.summary.title')}
                                </h2>
                            </div>
                            <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-lg">
                                {/* Package Hero - compact on mobile */}
                                <div className="bg-gradient-to-br from-primary-50 via-white to-accent-50/30 px-4 py-4 md:px-6 md:py-5">
                                    <div className="flex items-center gap-3">
                                        {pkg.country && (
                                            <div className="overflow-hidden rounded-lg shadow-md ring-2 ring-white">
                                                <CountryFlag
                                                    countryCode={
                                                        pkg.country.iso_code
                                                    }
                                                    size="md"
                                                    className="h-9 w-12 md:h-10 md:w-14"
                                                />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-[15px] font-bold text-primary-900 md:text-base">
                                                {pkg.name}
                                            </h3>
                                            {pkg.country && (
                                                <p className="text-xs text-primary-500">
                                                    {pkg.country.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Inline Data & Validity pills */}
                                    <div className="mt-3 flex gap-2 md:mt-4">
                                        <div className="flex flex-1 items-center gap-2 rounded-lg bg-white/80 px-3 py-2 ring-1 ring-primary-100">
                                            <HardDrive className="h-3.5 w-3.5 shrink-0 text-primary-400" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] leading-tight text-primary-400 md:text-[11px]">
                                                    {trans(
                                                        'checkout_page.summary.data',
                                                    )}
                                                </p>
                                                <p className="text-xs font-bold text-primary-900 md:text-sm">
                                                    {pkg.data_label}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-1 items-center gap-2 rounded-lg bg-white/80 px-3 py-2 ring-1 ring-primary-100">
                                            <Timer className="h-3.5 w-3.5 shrink-0 text-primary-400" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] leading-tight text-primary-400 md:text-[11px]">
                                                    {trans(
                                                        'checkout_page.summary.validity',
                                                    )}
                                                </p>
                                                <p className="text-xs font-bold text-primary-900 md:text-sm">
                                                    {pkg.validity_label}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Coupon Code */}
                                <div className="border-t border-primary-100 px-4 pt-3 pb-3 md:px-6 md:pt-4 md:pb-4">
                                    <CouponCodeInput
                                        packageId={pkg.id}
                                        email={data.email}
                                        orderAmount={Number(
                                            pkg.retail_price,
                                        )}
                                        onCouponsChanged={
                                            handleCouponsChanged
                                        }
                                    />
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="px-4 pt-3 pb-4 md:px-6 md:pt-4 md:pb-6">
                                    <div className="space-y-2.5 md:space-y-3">
                                        {/* Subtotal */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-primary-500 md:text-sm">
                                                {trans(
                                                    'checkout_page.summary.subtotal',
                                                )}
                                            </span>
                                            <span className="text-xs font-medium text-primary-700 md:text-sm">
                                                €
                                                {Number(
                                                    pkg.retail_price,
                                                ).toFixed(2)}
                                            </span>
                                        </div>

                                        {/* Coupon Discounts */}
                                        {appliedCoupons.map((coupon) => (
                                            <div
                                                key={coupon.code}
                                                className="flex items-center justify-between"
                                            >
                                                <span className="flex items-center gap-1.5 text-xs text-green-600 md:text-sm">
                                                    <Tag className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                                    {trans(
                                                        'checkout_page.summary.discount',
                                                    )}
                                                    <span className="font-mono text-[10px] md:text-xs">
                                                        ({coupon.code})
                                                    </span>
                                                </span>
                                                <span className="text-xs font-medium text-green-600 md:text-sm">
                                                    -€
                                                    {coupon.discount.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}

                                        {/* VAT Breakdown */}
                                        {vat.enabled && currentVatRate > 0 && (
                                            <div className="animate-in fade-in duration-300">
                                                <div className="h-px bg-primary-100/80" />
                                                <div className="mt-2.5 flex items-center justify-between md:mt-3">
                                                    <span className="text-xs text-primary-500 md:text-sm">
                                                        {trans(
                                                            'checkout_page.summary.net_amount',
                                                        )}
                                                    </span>
                                                    <span className="text-xs font-medium text-primary-700 transition-all duration-300 md:text-sm">
                                                        €
                                                        {currentVat.net.toFixed(
                                                            2,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="mt-2.5 flex items-center justify-between md:mt-3">
                                                    <span className="text-xs text-primary-500 md:text-sm">
                                                        {trans(
                                                            'checkout_page.summary.vat',
                                                            {
                                                                rate: currentVatRate,
                                                            },
                                                        )}
                                                    </span>
                                                    <span className="text-xs font-medium text-primary-700 transition-all duration-300 md:text-sm">
                                                        €
                                                        {currentVat.vatAmount.toFixed(
                                                            2,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Total */}
                                    <div className="mt-3 border-t border-primary-100 pt-3 md:mt-4 md:pt-4">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-xs font-medium text-primary-600 md:text-sm">
                                                {trans(
                                                    'checkout_page.summary.total',
                                                )}
                                                {vat.enabled &&
                                                    currentVatRate > 0 && (
                                                        <span className="ml-1 text-[10px] text-primary-400 md:text-xs">
                                                            (
                                                            {trans(
                                                                'checkout_page.summary.incl_vat',
                                                            )}
                                                            )
                                                        </span>
                                                    )}
                                            </span>
                                            <div className="flex items-baseline gap-2">
                                                {totalDiscount > 0 && (
                                                    <span className="text-xs text-primary-400 line-through md:text-sm">
                                                        €
                                                        {Number(
                                                            pkg.retail_price,
                                                        ).toFixed(2)}
                                                    </span>
                                                )}
                                                <span className="text-xl font-extrabold text-primary-900 md:text-2xl">
                                                    €{finalPrice.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-4 pb-4 md:px-6 md:pb-6">
                                    {/* Desktop Terms & Button */}
                                    <div className="hidden space-y-3 md:block">
                                        <div className={`flex items-start gap-3 rounded-2xl border p-4 transition-all ${termsWiggle && !data.accept_terms ? 'animate-wiggle border-red-300 bg-red-50' : 'border-primary-100 bg-primary-50/30'}`}>
                                            <Checkbox
                                                id="accept_terms_desktop"
                                                checked={data.accept_terms}
                                                onCheckedChange={(checked) =>
                                                    setData(
                                                        'accept_terms',
                                                        checked === true,
                                                    )
                                                }
                                                required
                                                className={`mt-0.5 rounded border-accent-400 data-[state=checked]:border-accent-500 data-[state=checked]:bg-accent-400 data-[state=checked]:text-accent-950 ${!data.accept_terms ? 'animate-checkbox-glow' : ''}`}
                                            />
                                            <Label
                                                htmlFor="accept_terms_desktop"
                                                className="text-[13px] leading-relaxed text-primary-600"
                                            >
                                                {trans(
                                                    'checkout_page.form.terms.agree',
                                                )}{' '}
                                                <Link
                                                    href="/terms"
                                                    className="font-semibold text-primary-800 underline decoration-primary-300 underline-offset-2 hover:text-primary-900"
                                                >
                                                    {trans(
                                                        'checkout_page.form.terms.terms_link',
                                                    )}
                                                </Link>{' '}
                                                {trans(
                                                    'checkout_page.form.terms.and',
                                                )}{' '}
                                                <Link
                                                    href="/privacy"
                                                    className="font-semibold text-primary-800 underline decoration-primary-300 underline-offset-2 hover:text-primary-900"
                                                >
                                                    {trans(
                                                        'checkout_page.form.terms.privacy_link',
                                                    )}
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
                                            form="checkout-form"
                                            className="h-13 w-full rounded-xl text-base font-bold shadow-lg shadow-accent-500/20"
                                            disabled={processing}
                                            onClick={!data.accept_terms ? (e: React.MouseEvent) => { e.preventDefault(); handlePayClick(); } : handleSubmit}
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    {trans(
                                                        'checkout_page.form.submit.processing',
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="mr-2 h-4 w-4" />
                                                    {trans(
                                                        'checkout_page.form.submit.pay',
                                                        {
                                                            amount: `€${finalPrice.toFixed(2)}`,
                                                        },
                                                    )}
                                                </>
                                            )}
                                        </GoldButton>

                                        <div className="flex items-center justify-center gap-4 py-1 text-[11px] text-primary-400">
                                            <div className="flex items-center gap-1.5">
                                                <Shield className="h-3.5 w-3.5" />
                                                <span>
                                                    {trans(
                                                        'checkout_page.form.security.ssl',
                                                    )}
                                                </span>
                                            </div>
                                            <span className="text-primary-200">|</span>
                                            <div className="flex items-center gap-1.5">
                                                <Lock className="h-3.5 w-3.5" />
                                                <span>
                                                    {trans(
                                                        'checkout_page.form.security.secure',
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Benefits - styled like trust section */}
                                    <div className="hidden space-y-2 border-t border-primary-100 pt-4 md:mt-6 md:block md:space-y-3 md:pt-6">
                                        {[
                                            {
                                                icon: Zap,
                                                text: trans(
                                                    'checkout_page.benefits.instant',
                                                ),
                                            },
                                            {
                                                icon: CheckCircle2,
                                                text: trans(
                                                    'checkout_page.benefits.qr',
                                                ),
                                            },
                                            {
                                                icon: Shield,
                                                text: trans(
                                                    'checkout_page.benefits.support',
                                                ),
                                            },
                                        ].map((item, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-3"
                                            >
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
