import { Head } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
    checkoutUrl: string;
}

export default function CheckoutRedirect({ checkoutUrl }: Props) {
    useEffect(() => {
        // Use JavaScript redirect to preserve URL fragments (required by Stripe)
        if (checkoutUrl) {
            window.location.href = checkoutUrl;
        }
    }, [checkoutUrl]);

    return (
        <>
            <Head title="Redirecting to Payment" />
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                    <h1 className="text-xl font-semibold">Redirecting to Payment</h1>
                    <p className="text-muted-foreground">
                        Please wait while we redirect you to the secure payment page...
                    </p>
                    <p className="text-sm text-muted-foreground">
                        If you are not redirected automatically,{' '}
                        <a href={checkoutUrl} className="text-primary underline">
                            click here
                        </a>
                        .
                    </p>
                </div>
            </div>
        </>
    );
}
