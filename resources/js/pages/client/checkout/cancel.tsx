import { Button } from '@/components/ui/button';
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
import { Head, Link } from '@inertiajs/react';
import { XCircle } from 'lucide-react';

export default function CheckoutCancel() {
    const { trans } = useTrans();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Client', href: '/client' },
        { title: trans('client_checkout_cancel.title'), href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={trans('client_checkout_cancel.title')} />
            <div className="mx-auto flex max-w-lg flex-col gap-6 p-4">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <XCircle className="h-10 w-10 text-gray-500" />
                        </div>
                        <CardTitle>
                            {trans('client_checkout_cancel.title')}
                        </CardTitle>
                        <CardDescription>
                            {trans('client_checkout_cancel.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-center text-muted-foreground">
                            {trans('client_checkout_cancel.message')}
                        </p>
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                asChild
                            >
                                <Link href="/client/packages">
                                    {trans(
                                        'client_checkout_cancel.browse_packages',
                                    )}
                                </Link>
                            </Button>
                            <Button className="flex-1" asChild>
                                <Link href="/client">
                                    {trans('client_checkout_cancel.dashboard')}
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
