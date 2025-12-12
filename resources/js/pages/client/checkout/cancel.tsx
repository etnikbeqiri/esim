import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { XCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Client', href: '/client' },
    { title: 'Checkout Cancelled', href: '#' },
];

export default function CheckoutCancel() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Checkout Cancelled" />
            <div className="flex flex-col gap-6 p-4 max-w-lg mx-auto">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="h-10 w-10 text-gray-500" />
                        </div>
                        <CardTitle>Checkout Cancelled</CardTitle>
                        <CardDescription>
                            Your payment was cancelled and no charges were made.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-center text-muted-foreground">
                            If you experienced any issues during checkout, please try again or contact our support team.
                        </p>
                        <div className="flex gap-4">
                            <Button variant="outline" className="flex-1" asChild>
                                <Link href="/client/packages">Browse Packages</Link>
                            </Button>
                            <Button className="flex-1" asChild>
                                <Link href="/client">Go to Dashboard</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
