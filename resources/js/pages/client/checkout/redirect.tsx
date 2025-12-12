import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
    checkoutUrl: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Client', href: '/client' },
    { title: 'Checkout', href: '#' },
    { title: 'Redirecting...', href: '#' },
];

export default function CheckoutRedirect({ checkoutUrl }: Props) {
    useEffect(() => {
        // Use JavaScript redirect to preserve URL fragments (required by Stripe)
        if (checkoutUrl) {
            window.location.href = checkoutUrl;
        }
    }, [checkoutUrl]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Redirecting to Payment" />
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Redirecting to Payment
                        </CardTitle>
                        <CardDescription>
                            Please wait while we redirect you to the secure payment page...
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            If you are not redirected automatically,{' '}
                            <a href={checkoutUrl} className="text-primary underline">
                                click here
                            </a>
                            .
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
