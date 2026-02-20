import { index as couponsIndex } from '@/actions/App/Http/Controllers/Admin/CouponController';
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
    type Package,
    type Provider,
} from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
    countries: Country[];
    providers: Provider[];
    packages: Package[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Coupons', href: '/admin/coupons' },
    { title: 'Create Coupon', href: '/admin/coupons/create' },
];

export default function CreateCoupon({
    countries,
    providers,
    packages,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        description: '',
        type: 'percentage' as 'percentage' | 'fixed_amount',
        value: '',
        min_order_amount: '0',
        usage_limit: '',
        per_customer_limit: '1',
        valid_from: '',
        valid_until: '',
        is_active: true,
        is_stackable: false,
        first_time_only: false,
        allowed_countries: [] as number[],
        allowed_providers: [] as number[],
        allowed_packages: [] as number[],
        exclude_packages: [] as number[],
        allowed_customer_types: [] as ('b2b' | 'b2c')[],
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/coupons');
    }

    function toggleArray<T>(array: T[], item: T): T[] {
        return array.includes(item)
            ? array.filter((x) => x !== item)
            : [...array, item];
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Coupon" />
            <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={couponsIndex.url()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold">Create Coupon</h1>
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
                                    placeholder="SUMMER2025"
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
                                    placeholder="Summer Sale 2025"
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
                                    placeholder="Optional description for the coupon..."
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
                                        placeholder={
                                            data.type === 'percentage'
                                                ? '10'
                                                : '5.00'
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
                                        placeholder="0.00"
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
                                    placeholder="Leave empty for unlimited"
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

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" asChild>
                            <Link href={couponsIndex.url()}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Create Coupon
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
