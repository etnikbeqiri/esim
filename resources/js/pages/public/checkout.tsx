import { Alert, AlertDescription } from '@/components/ui/alert';
import { PaymentMethodIcons } from '@/components/payment-method-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    HardDrive,
    Loader2,
    Lock,
    Mail,
    Phone,
    Shield,
    Timer,
    User,
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

export default function Checkout({ package: pkg, paymentProviders, defaultProvider, prefill }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: prefill?.email || '',
        name: prefill?.name || '',
        phone: prefill?.phone || '',
        accept_terms: false,
        payment_provider: defaultProvider,
    });

    // Update form when prefill changes (e.g., after page load)
    useEffect(() => {
        if (prefill) {
            if (prefill.email && !data.email) setData('email', prefill.email);
            if (prefill.name && !data.name) setData('name', prefill.name);
            if (prefill.phone && !data.phone) setData('phone', prefill.phone);
        }
    }, [prefill]);

    const { auth } = usePage().props as any;

    function getFlagEmoji(countryCode: string) {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/checkout/${pkg.id}`);
    }

    const selectedProvider = paymentProviders.find(p => p.id === data.payment_provider) || paymentProviders[0];

    return (
        <GuestLayout>
            <Head title="Checkout" />

            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4">
                    <Button variant="ghost" size="sm" asChild className="mb-6">
                        <Link href={pkg.country ? `/destinations/${pkg.country.iso_code.toLowerCase()}` : '/destinations'}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>

                    <div className="mx-auto max-w-4xl">
                        <h1 className="mb-8 text-2xl font-bold md:text-3xl">Checkout</h1>

                        <div className="grid gap-8 lg:grid-cols-5">
                            {/* Checkout Form */}
                            <div className="lg:col-span-3">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Your Details</CardTitle>
                                        <CardDescription>
                                            Enter your information to receive your eSIM
                                            {auth?.user && (
                                                <span className="ml-1 text-green-600">
                                                    (auto-filled from your account)
                                                </span>
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {/* General Error */}
                                            {errors.error && (
                                                <Alert variant="destructive">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        {errors.error}
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {/* Email */}
                                            <div className="space-y-2">
                                                <Label htmlFor="email">
                                                    Email Address <span className="text-destructive">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="you@example.com"
                                                        className="pl-10"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="text-sm text-destructive">{errors.email}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    We'll send your eSIM QR code to this email
                                                </p>
                                            </div>

                                            {/* Full Name */}
                                            <div className="space-y-2">
                                                <Label htmlFor="name">
                                                    Full Name <span className="text-destructive">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        placeholder="John Doe"
                                                        className="pl-10"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                {errors.name && (
                                                    <p className="text-sm text-destructive">{errors.name}</p>
                                                )}
                                            </div>

                                            {/* Phone (Optional) */}
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">
                                                    Phone Number <span className="text-muted-foreground">(Optional)</span>
                                                </Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        placeholder="+1 234 567 8900"
                                                        className="pl-10"
                                                        value={data.phone}
                                                        onChange={(e) => setData('phone', e.target.value)}
                                                    />
                                                </div>
                                                {errors.phone && (
                                                    <p className="text-sm text-destructive">{errors.phone}</p>
                                                )}
                                            </div>

                                            <Separator />

                                            {/* Payment Method Selection */}
                                            <div className="space-y-3">
                                                <Label>Payment Method</Label>
                                                <RadioGroup
                                                    value={data.payment_provider}
                                                    onValueChange={(value) => setData('payment_provider', value)}
                                                    className="space-y-3"
                                                >
                                                    {paymentProviders.map((provider) => (
                                                        <div key={provider.id} className="relative">
                                                            <RadioGroupItem
                                                                value={provider.id}
                                                                id={provider.id}
                                                                className="peer sr-only"
                                                            />
                                                            <Label
                                                                htmlFor={provider.id}
                                                                className="flex cursor-pointer flex-col rounded-lg border bg-muted/30 p-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                                            <CreditCard className="h-5 w-5 text-primary" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-medium">{provider.name}</p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {provider.description}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`h-4 w-4 rounded-full border-2 ${data.payment_provider === provider.id ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                                                                        {data.payment_provider === provider.id && (
                                                                            <div className="h-full w-full flex items-center justify-center">
                                                                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-3">
                                                                    <p className="mb-2 text-xs text-muted-foreground">
                                                                        Accepted payment methods:
                                                                    </p>
                                                                    <PaymentMethodIcons methods={provider.payment_methods} />
                                                                </div>
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </div>

                                            <Separator />

                                            {/* Terms Checkbox */}
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    id="accept_terms"
                                                    checked={data.accept_terms}
                                                    onCheckedChange={(checked) =>
                                                        setData('accept_terms', checked === true)
                                                    }
                                                    required
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <Label
                                                        htmlFor="accept_terms"
                                                        className="text-sm font-normal leading-snug"
                                                    >
                                                        I agree to the{' '}
                                                        <Link href="/terms" className="text-primary underline">
                                                            Terms of Service
                                                        </Link>{' '}
                                                        and{' '}
                                                        <Link href="/privacy" className="text-primary underline">
                                                            Privacy Policy
                                                        </Link>
                                                        <span className="text-destructive"> *</span>
                                                    </Label>
                                                </div>
                                            </div>
                                            {errors.accept_terms && (
                                                <p className="text-sm text-destructive">{errors.accept_terms}</p>
                                            )}

                                            {/* Submit Button */}
                                            <Button
                                                type="submit"
                                                className="w-full"
                                                size="lg"
                                                disabled={processing || !data.accept_terms}
                                            >
                                                {processing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        Pay €{Number(pkg.retail_price).toFixed(2)}
                                                    </>
                                                )}
                                            </Button>

                                            {/* Trust Indicators */}
                                            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Lock className="h-3 w-3" />
                                                    <span>Secure checkout</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Shield className="h-3 w-3" />
                                                    <span>SSL encrypted</span>
                                                </div>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-2">
                                <Card className="sticky top-24">
                                    <CardHeader>
                                        <CardTitle className="text-base">Order Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Package Info */}
                                        <div className="flex items-start gap-3">
                                            {pkg.country && (
                                                <span className="text-3xl">
                                                    {getFlagEmoji(pkg.country.iso_code)}
                                                </span>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-medium">{pkg.name}</h3>
                                                {pkg.country && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {pkg.country.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Package Details */}
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <HardDrive className="h-4 w-4 text-muted-foreground" />
                                                <span>{pkg.data_label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Timer className="h-4 w-4 text-muted-foreground" />
                                                <span>{pkg.validity_label}</span>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Price */}
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Total</span>
                                            <span className="text-2xl font-bold">
                                                €{Number(pkg.retail_price).toFixed(2)}
                                            </span>
                                        </div>

                                        {/* Benefits */}
                                        <div className="rounded-lg bg-muted/50 p-3 space-y-2 text-xs">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                                <span>Instant delivery via email</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                                <span>Easy QR code installation</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                                <span>24/7 customer support</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
