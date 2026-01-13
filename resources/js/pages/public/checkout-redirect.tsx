import { useTrans } from '@/hooks/use-trans';
import { Head } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
    checkoutUrl: string;
}

export default function CheckoutRedirect({ checkoutUrl }: Props) {
    const { trans } = useTrans();

    useEffect(() => {
        // Use JavaScript redirect to preserve URL fragments (required by Stripe)
        if (checkoutUrl) {
            window.location.href = checkoutUrl;
        }
    }, [checkoutUrl]);

    return (
        <>
            <Head title={trans('checkout_page.redirect.title')} />
            <div className="flex min-h-screen flex-col items-center justify-center bg-background">
                <div className="space-y-4 text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                    <h1 className="text-xl font-semibold">
                        {trans('checkout_page.redirect.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {trans('checkout_page.redirect.message')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {trans('checkout_page.redirect.manual_desc')}{' '}
                        <a
                            href={checkoutUrl}
                            className="text-primary underline"
                        >
                            {trans('checkout_page.redirect.click_here')}
                        </a>
                        .
                    </p>
                </div>
            </div>
        </>
    );
}
