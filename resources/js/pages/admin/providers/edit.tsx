import { index as providersIndex } from '@/actions/App/Http/Controllers/Admin/ProviderController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Provider {
    id: number;
    slug: string;
    name: string;
    api_base_url: string;
    is_active: boolean;
    rate_limit_ms: number;
    markup_percentage: number;
    custom_regions: Record<string, string> | null;
}

interface Props {
    provider: Provider;
}

export default function ProvidersEdit({ provider }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Providers', href: '/admin/providers' },
        { title: provider.name, href: `/admin/providers/${provider.id}/edit` },
    ];

    const [newRegionCode, setNewRegionCode] = useState('');
    const [newRegionName, setNewRegionName] = useState('');

    const [customRegions, setCustomRegions] = useState<Record<string, string>>(
        provider.custom_regions || {},
    );

    const { data, setData, put, processing, errors } = useForm({
        slug: provider.slug,
        name: provider.name,
        api_base_url: provider.api_base_url,
        api_key: '',
        is_active: provider.is_active,
        rate_limit_ms: provider.rate_limit_ms,
        markup_percentage: provider.markup_percentage,
        custom_regions: provider.custom_regions || {},
    });

    function addRegion() {
        if (!newRegionCode.trim() || !newRegionName.trim()) return;
        const code = newRegionCode.toUpperCase().trim();
        const name = newRegionName.trim();
        const newRegions = { ...customRegions, [code]: name };
        setCustomRegions(newRegions);
        setData('custom_regions', newRegions);
        setNewRegionCode('');
        setNewRegionName('');
    }

    function removeRegion(code: string) {
        const { [code]: _, ...rest } = customRegions;
        setCustomRegions(rest);
        setData('custom_regions', rest);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/admin/providers/${provider.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${provider.name}`} />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-semibold">Edit Provider</h1>

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
                                />
                                {errors.api_base_url && (
                                    <p className="text-sm text-destructive">
                                        {errors.api_base_url}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="api_key">
                                    API Key (leave blank to keep current)
                                </Label>
                                <Input
                                    id="api_key"
                                    type="password"
                                    value={data.api_key}
                                    onChange={(e) =>
                                        setData('api_key', e.target.value)
                                    }
                                    placeholder="Enter new API key or leave blank"
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

                            <div className="mt-6 border-t pt-6">
                                <h3 className="mb-2 text-lg font-medium">
                                    Custom Regions
                                </h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Define custom region codes for this provider
                                    (e.g., EU for European Union packages).
                                </p>

                                {Object.keys(customRegions).length > 0 && (
                                    <div className="mb-4 space-y-2">
                                        {Object.entries(customRegions).map(
                                            ([code, name]) => (
                                                <div
                                                    key={code}
                                                    className="flex items-center justify-between rounded-lg border p-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Badge
                                                            variant="outline"
                                                            className="font-mono"
                                                        >
                                                            {code}
                                                        </Badge>
                                                        <span>{name}</span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            removeRegion(code)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Code (e.g., EU)"
                                        value={newRegionCode}
                                        onChange={(e) =>
                                            setNewRegionCode(
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        className="w-32 font-mono"
                                        maxLength={10}
                                    />
                                    <Input
                                        placeholder="Name (e.g., European Union)"
                                        value={newRegionName}
                                        onChange={(e) =>
                                            setNewRegionName(e.target.value)
                                        }
                                        className="flex-1"
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' &&
                                            (e.preventDefault(), addRegion())
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addRegion}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {Object.keys(customRegions).length === 0 && (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        No custom regions defined.
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={processing}>
                                    Update Provider
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
