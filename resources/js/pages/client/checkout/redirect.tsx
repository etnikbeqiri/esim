import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useTrans } from '@/hooks/use-trans';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
    checkoutUrl: string;
}

export default function CheckoutRedirect({ checkoutUrl }: Props) {
    const { trans } = useTrans();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Client', href: '/client' },
        { title: 'Checkout', href: '#' },
        { title: trans('client_checkout_redirect.title'), href: '#' },
    ];

    useEffect(() => {
        // Use JavaScript redirect to preserve URL fragments (required by Stripe)
        if (checkoutUrl) {
            window.location.href = checkoutUrl;
        }
    }, [checkoutUrl]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={trans('client_checkout_redirect.title')} />
            <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {trans('client_checkout_redirect.title')}
                        </CardTitle>
                        <CardDescription>
                            {trans('client_checkout_redirect.message')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {trans('client_checkout_redirect.manual_redirect')}{' '}
                            <a
                                href={checkoutUrl}
                                className="text-primary underline"
                            >
                                {trans('client_checkout_redirect.click_here')}
                            </a>
                            .
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
