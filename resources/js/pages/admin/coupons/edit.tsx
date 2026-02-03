import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import {
    type BreadcrumbItem,
    type Country,
    type Coupon,
    type Package,
    type Provider,
} from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
    coupon: Coupon;
    countries: Country[];
    providers: Provider[];
    packages: Package[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Coupons', href: '/admin/coupons' },
    { title: 'Edit Coupon', href: '#' },
];

export default function EditCoupon({
    coupon,
    countries,
    providers,
    packages,
}: Props) {
    const { data, setData, put, processing, errors } = useForm({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description || '',
        type: coupon.type,
        value: coupon.value.toString(),
        min_order_amount: coupon.min_order_amount.toString(),
        usage_limit: coupon.usage_limit?.toString() || '',
        per_customer_limit: coupon.per_customer_limit.toString(),
        valid_from: coupon.valid_from ? coupon.valid_from.slice(0, 16) : '',
        valid_until: coupon.valid_until ? coupon.valid_until.slice(0, 16) : '',
        is_active: coupon.is_active,
        is_stackable: coupon.is_stackable,
        first_time_only: coupon.first_time_only,
        allowed_countries: coupon.allowed_countries || [],
        allowed_providers: coupon.allowed_providers || [],
        allowed_packages: coupon.allowed_packages || [],
        exclude_packages: coupon.exclude_packages || [],
        allowed_customer_types: coupon.allowed_customer_types || [],
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/admin/coupons/${coupon.id}`);
    }

    function toggleArray<T>(array: T[], item: T): T[] {
        return array.includes(item)
            ? array.filter((x) => x !== item)
            : [...array, item];
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${coupon.code}`} />
            <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/coupons/${coupon.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold">Edit Coupon</h1>
                        <p className="font-mono text-sm text-muted-foreground">
                            {coupon.code}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Basic Information */}
                    <div className="rounded-lg border p-4">
                        <h2 className="mb-4 text-lg font-semibold">
                            Basic Information
                        </h2>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="code">Coupon Code *</Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(e) =>
                                        setData(
                                            'code',
                                            e.target.value
                                                .toUpperCase()
                                                .replace(/\s/g, ''),
                                        )
                                    }
                                    className="font-mono"
                                />
                                {errors.code && (
                                    <p className="text-sm text-destructive">
                                        {errors.code}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name *</Label>
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

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Discount Settings */}
                    <div className="rounded-lg border p-4">
                        <h2 className="mb-4 text-lg font-semibold">
                            Discount Settings
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Discount Type *</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(
                                        v: 'percentage' | 'fixed_amount',
                                    ) => setData('type', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">
                                            Percentage (%)
                                        </SelectItem>
                                        <SelectItem value="fixed_amount">
                                            Fixed Amount (€)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && (
                                    <p className="text-sm text-destructive">
                                        {errors.type}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="value">Discount Value *</Label>
                                <div className="relative">
                                    <Input
                                        id="value"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.value}
                                        onChange={(e) =>
                                            setData('value', e.target.value)
                                        }
                                        className="pl-8"
                                    />
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                                        {data.type === 'percentage' ? '%' : '€'}
                                    </span>
                                </div>
                                {errors.value && (
                                    <p className="text-sm text-destructive">
                                        {errors.value}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="min_order_amount">
                                    Minimum Order Amount
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="min_order_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.min_order_amount}
                                        onChange={(e) =>
                                            setData(
                                                'min_order_amount',
                                                e.target.value,
                                            )
                                        }
                                        className="pl-8"
                                    />
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                                        €
                                    </span>
                                </div>
                                {errors.min_order_amount && (
                                    <p className="text-sm text-destructive">
                                        {errors.min_order_amount}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="usage_limit">
                                    Total Usage Limit
                                </Label>
                                <Input
                                    id="usage_limit"
                                    type="number"
                                    min="1"
                                    value={data.usage_limit}
                                    onChange={(e) =>
                                        setData('usage_limit', e.target.value)
                                    }
                                    placeholder="Unlimited"
                                />
                                {errors.usage_limit && (
                                    <p className="text-sm text-destructive">
                                        {errors.usage_limit}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="per_customer_limit">
                                    Per Customer Limit *
                                </Label>
                                <Input
                                    id="per_customer_limit"
                                    type="number"
                                    min="1"
                                    value={data.per_customer_limit}
                                    onChange={(e) =>
                                        setData(
                                            'per_customer_limit',
                                            e.target.value,
                                        )
                                    }
                                />
                                {errors.per_customer_limit && (
                                    <p className="text-sm text-destructive">
                                        {errors.per_customer_limit}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Validity Period */}
                    <div className="rounded-lg border p-4">
                        <h2 className="mb-4 text-lg font-semibold">
                            Validity Period
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="valid_from">Valid From</Label>
                                <Input
                                    id="valid_from"
                                    type="datetime-local"
                                    value={data.valid_from}
                                    onChange={(e) =>
                                        setData('valid_from', e.target.value)
                                    }
                                />
                                {errors.valid_from && (
                                    <p className="text-sm text-destructive">
                                        {errors.valid_from}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="valid_until">Valid Until</Label>
                                <Input
                                    id="valid_until"
                                    type="datetime-local"
                                    value={data.valid_until}
                                    onChange={(e) =>
                                        setData('valid_until', e.target.value)
                                    }
                                />
                                {errors.valid_until && (
                                    <p className="text-sm text-destructive">
                                        {errors.valid_until}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Targeting */}
                    <div className="rounded-lg border p-4">
                        <h2 className="mb-4 text-lg font-semibold">
                            Targeting (Optional)
                        </h2>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Customer Types</Label>
                                <div className="flex gap-4">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <Checkbox
                                            checked={data.allowed_customer_types.includes(
                                                'b2b',
                                            )}
                                            onCheckedChange={() =>
                                                setData(
                                                    'allowed_customer_types',
                                                    toggleArray(
                                                        data.allowed_customer_types,
                                                        'b2b',
                                                    ),
                                                )
                                            }
                                        />
                                        <span>B2B (Business)</span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <Checkbox
                                            checked={data.allowed_customer_types.includes(
                                                'b2c',
                                            )}
                                            onCheckedChange={() =>
                                                setData(
                                                    'allowed_customer_types',
                                                    toggleArray(
                                                        data.allowed_customer_types,
                                                        'b2c',
                                                    ),
                                                )
                                            }
                                        />
                                        <span>B2C (Consumer)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Allowed Countries</Label>
                                <div className="max-h-40 overflow-y-auto rounded-md border p-3">
                                    {countries.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No countries available
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                            {countries.map((country) => (
                                                <label
                                                    key={country.id}
                                                    className="flex cursor-pointer items-center gap-2 text-sm"
                                                >
                                                    <Checkbox
                                                        checked={data.allowed_countries.includes(
                                                            country.id,
                                                        )}
                                                        onCheckedChange={() =>
                                                            setData(
                                                                'allowed_countries',
                                                                toggleArray(
                                                                    data.allowed_countries,
                                                                    country.id,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                    <span className="truncate">
                                                        {country.name}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Allowed Providers</Label>
                                <div className="max-h-40 overflow-y-auto rounded-md border p-3">
                                    {providers.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No providers available
                                        </p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {providers.map((provider) => (
                                                <Badge
                                                    key={provider.id}
                                                    variant={
                                                        data.allowed_providers.includes(
                                                            provider.id,
                                                        )
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        setData(
                                                            'allowed_providers',
                                                            toggleArray(
                                                                data.allowed_providers,
                                                                provider.id,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    {provider.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="rounded-lg border p-4">
                        <h2 className="mb-4 text-lg font-semibold">Options</h2>
                        <div className="space-y-3">
                            <label className="flex cursor-pointer items-center gap-3">
                                <Checkbox
                                    checked={data.is_active}
                                    onCheckedChange={(c) =>
                                        setData('is_active', !!c)
                                    }
                                />
                                <div>
                                    <div className="font-medium">Active</div>
                                    <div className="text-sm text-muted-foreground">
                                        Coupon can be used immediately
                                    </div>
                                </div>
                            </label>

                            <label className="flex cursor-pointer items-center gap-3">
                                <Checkbox
                                    checked={data.is_stackable}
                                    onCheckedChange={(c) =>
                                        setData('is_stackable', !!c)
                                    }
                                />
                                <div>
                                    <div className="font-medium">Stackable</div>
                                    <div className="text-sm text-muted-foreground">
                                        Can be combined with other coupons
                                    </div>
                                </div>
                            </label>

                            <label className="flex cursor-pointer items-center gap-3">
                                <Checkbox
                                    checked={data.first_time_only}
                                    onCheckedChange={(c) =>
                                        setData('first_time_only', !!c)
                                    }
                                />
                                <div>
                                    <div className="font-medium">
                                        First Time Only
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Only for first-time customers
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Usage Info */}
                    <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">
                                    Usage Statistics
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {coupon.usage_count} uses{' '}
                                    {coupon.usage_limit
                                        ? `/ ${coupon.usage_limit}`
                                        : '(unlimited)'}
                                </p>
                            </div>
                            {coupon.usage_limit && (
                                <div className="text-right">
                                    <div className="text-2xl font-bold">
                                        {Math.round(
                                            (coupon.usage_count /
                                                coupon.usage_limit) *
                                                100,
                                        )}
                                        %
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Used
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/admin/coupons/${coupon.id}`}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
