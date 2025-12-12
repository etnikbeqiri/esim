import { PaymentMethodIcons } from '@/components/payment-method-icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    CheckCircle2,
    CreditCard,
    HardDrive,
    Loader2,
    Lock,
    Shield,
    Timer,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

interface Package {
    id: number;
    name: string;
    country: string | null;
    country_iso: string | null;
    data_label: string;
    validity_label: string;
    price: string | number;
    original_price: string | number;
    has_discount: boolean;
    discount_percentage: string;
}

interface Customer {
    is_b2b: boolean;
    balance: number | null;
    can_afford: boolean;
    display_name: string;
    email: string;
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

interface Props {
    package: Package;
    customer: Customer;
    paymentProviders: PaymentProvider[];
    defaultProvider: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Client', href: '/client' },
    { title: 'Packages', href: '/client/packages' },
    { title: 'Checkout', href: '#' },
];

function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

export default function CheckoutShow({ package: pkg, customer, paymentProviders, defaultProvider }: Props) {
    const [processing, setProcessing] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(defaultProvider);
    const { flash } = usePage().props as any;

    function handleCheckout() {
        setProcessing(true);
        router.post(
            `/client/checkout/${pkg.id}`,
            {
                payment_provider: customer.is_b2b ? undefined : selectedProvider,
            },
            {
                onFinish: () => setProcessing(false),
            },
        );
    }

    const price = Number(pkg.price);
    const canProceed = customer.is_b2b ? customer.can_afford : paymentProviders.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Checkout" />
            <div className="p-4 md:p-6">
                {/* Back Button */}
                <Button variant="ghost" size="sm" asChild className="mb-6">
                    <Link href="/client/packages">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Packages
                    </Link>
                </Button>

                <div className="mx-auto max-w-5xl">
                    <h1 className="mb-6 text-2xl font-semibold md:text-3xl">Checkout</h1>

                    {/* Error Alert */}
                    {flash?.error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{flash.error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-6 lg:grid-cols-5">
                        {/* Payment Method Selection - Left Column */}
                        <div className="lg:col-span-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Method</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {customer.is_b2b ? (
                                        // B2B - Balance Payment
                                        <div
                                            className={`flex items-center gap-4 rounded-lg border-2 p-4 ${
                                                customer.can_afford
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-destructive bg-destructive/5'
                                            }`}
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                                <Wallet className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">Pay with Account Balance</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Available balance:{' '}
                                                    <span className="font-semibold text-foreground">
                                                        €{Number(customer.balance || 0).toFixed(2)}
                                                    </span>
                                                </p>
                                            </div>
                                            {customer.can_afford ? (
                                                <CheckCircle className="h-6 w-6 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-6 w-6 text-destructive" />
                                            )}
                                        </div>
                                    ) : (
                                        // B2C - Payment Provider Selection
                                        <>
                                            {paymentProviders.length > 0 ? (
                                                <RadioGroup
                                                    value={selectedProvider}
                                                    onValueChange={setSelectedProvider}
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
                                                                    <div
                                                                        className={`h-4 w-4 rounded-full border-2 ${selectedProvider === provider.id ? 'border-primary bg-primary' : 'border-muted-foreground'}`}
                                                                    >
                                                                        {selectedProvider === provider.id && (
                                                                            <div className="flex h-full w-full items-center justify-center">
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
                                            ) : (
                                                <Alert variant="destructive">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        No payment methods are currently available. Please try again later.
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </>
                                    )}

                                    {/* Insufficient Balance Warning */}
                                    {customer.is_b2b && !customer.can_afford && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                Insufficient balance. You need €{price.toFixed(2)} but only have €
                                                {Number(customer.balance || 0).toFixed(2)}. Please contact support to top up
                                                your account.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <Separator />

                                    {/* Submit Button */}
                                    <Button className="w-full" size="lg" onClick={handleCheckout} disabled={processing || !canProceed}>
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : customer.is_b2b ? (
                                            <>
                                                <Wallet className="mr-2 h-4 w-4" />
                                                Pay €{price.toFixed(2)} with Balance
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                Pay €{price.toFixed(2)}
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

                                    <p className="text-center text-xs text-muted-foreground">
                                        By completing this purchase, you agree to our{' '}
                                        <Link href="/terms" className="text-primary underline">
                                            terms of service
                                        </Link>
                                        .
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Order Summary - Right Column (Sticky) */}
                        <div className="lg:col-span-2">
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle className="text-base">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Package Info with Flag */}
                                    <div className="flex items-start gap-3">
                                        {pkg.country_iso && <span className="text-3xl">{getFlagEmoji(pkg.country_iso)}</span>}
                                        <div className="flex-1">
                                            <h3 className="font-medium">{pkg.name}</h3>
                                            {pkg.country && <p className="text-sm text-muted-foreground">{pkg.country}</p>}
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

                                    {/* B2B Discount Badge */}
                                    {pkg.has_discount && (
                                        <>
                                            <Separator />
                                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                {pkg.discount_percentage}% B2B Discount Applied
                                            </Badge>
                                        </>
                                    )}

                                    <Separator />

                                    {/* Price Breakdown */}
                                    <div className="space-y-2">
                                        {pkg.has_discount && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Original price</span>
                                                <span className="text-muted-foreground line-through">
                                                    €{Number(pkg.original_price).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Total</span>
                                            <span className="text-2xl font-bold">€{price.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Benefits */}
                                    <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-xs">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                            <span>Instant eSIM delivery</span>
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
        </AppLayout>
    );
}
