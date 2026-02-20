import { index as providersIndex } from '@/actions/App/Http/Controllers/Admin/ProviderController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Providers', href: '/admin/providers' },
    { title: 'Create', href: '/admin/providers/create' },
];

export default function ProvidersCreate() {
    const { data, setData, post, processing, errors } = useForm({
        slug: '',
        name: '',
        api_base_url: '',
        api_key: '',
        is_active: true,
        rate_limit_ms: 300,
        markup_percentage: 30,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/providers');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Provider" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-semibold">Create Provider</h1>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Provider Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="SMSPool"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) =>
                                            setData('slug', e.target.value)
                                        }
                                        placeholder="smspool"
                                    />
                                    {errors.slug && (
                                        <p className="text-sm text-destructive">
                                            {errors.slug}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="api_base_url">
                                    API Base URL
                                </Label>
                                <Input
                                    id="api_base_url"
                                    type="url"
                                    value={data.api_base_url}
                                    onChange={(e) =>
                                        setData('api_base_url', e.target.value)
                                    }
                                    placeholder="https://api.provider.com"
                                />
                                {errors.api_base_url && (
                                    <p className="text-sm text-destructive">
                                        {errors.api_base_url}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="api_key">API Key</Label>
                                <Input
                                    id="api_key"
                                    type="password"
                                    value={data.api_key}
                                    onChange={(e) =>
                                        setData('api_key', e.target.value)
                                    }
                                    placeholder="Enter API key"
                                />
                                {errors.api_key && (
                                    <p className="text-sm text-destructive">
                                        {errors.api_key}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="rate_limit_ms">
                                        Rate Limit (ms)
                                    </Label>
                                    <Input
                                        id="rate_limit_ms"
                                        type="number"
                                        value={data.rate_limit_ms}
                                        onChange={(e) =>
                                            setData(
                                                'rate_limit_ms',
                                                parseInt(e.target.value),
                                            )
                                        }
                                    />
                                    {errors.rate_limit_ms && (
                                        <p className="text-sm text-destructive">
                                            {errors.rate_limit_ms}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="markup_percentage">
                                        Markup (%)
                                    </Label>
                                    <Input
                                        id="markup_percentage"
                                        type="number"
                                        step="0.01"
                                        value={data.markup_percentage}
                                        onChange={(e) =>
                                            setData(
                                                'markup_percentage',
                                                parseFloat(e.target.value),
                                            )
                                        }
                                    />
                                    {errors.markup_percentage && (
                                        <p className="text-sm text-destructive">
                                            {errors.markup_percentage}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', !!checked)
                                    }
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={processing}>
                                    Create Provider
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={providersIndex.url()}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
