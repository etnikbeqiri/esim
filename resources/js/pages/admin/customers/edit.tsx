import { impersonate as customersImpersonate } from '@/actions/App/Http/Controllers/Admin/CustomerController';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Key,
    Loader2,
    LogIn,
    Mail,
    Save,
    User,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

interface Customer {
    id: number;
    type: string;
    type_label: string;
    discount_percentage: number;
    is_active: boolean;
    phone: string | null;
    company_name: string | null;
    vat_number: string | null;
    address: string | null;
    user: {
        id: number;
        name: string;
        email: string;
        email_verified_at: string | null;
    } | null;
    balance: {
        balance: number;
        reserved: number;
        available_balance: number;
    } | null;
}

interface CustomerType {
    value: string;
    label: string;
}

interface Props {
    customer: Customer;
    customerTypes: CustomerType[];
}

export default function EditCustomer({ customer, customerTypes }: Props) {
    const { currency } = usePage<SharedData>().props;
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(
        null,
    );
    const [passwordResetLoading, setPasswordResetLoading] = useState(false);
    const [impersonateLoading, setImpersonateLoading] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        type: customer.type,
        discount_percentage: customer.discount_percentage.toString(),
        is_active: customer.is_active,
        phone: customer.phone || '',
        company_name: customer.company_name || '',
        vat_number: customer.vat_number || '',
        address: customer.address || '',
        balance_amount: customer.balance?.balance?.toString() || '0',
    });

    const {
        data: userData,
        setData: setUserData,
        put: putUser,
        processing: userProcessing,
        errors: userErrors,
    } = useForm({
        name: customer.user?.name || '',
        email: customer.user?.email || '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/admin/customers/${customer.id}`);
    }

    function handleUserSubmit(e: React.FormEvent) {
        e.preventDefault();
        putUser(`/admin/customers/${customer.id}/user`);
    }

    function handleResetPassword(method: 'generate' | 'link') {
        setPasswordResetLoading(true);
        setGeneratedPassword(null);
        router.post(
            `/admin/customers/${customer.id}/reset-password`,
            { method },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    setPasswordResetLoading(false);
                    // Extract password from flash message if generated
                    const props = page.props as {
                        flash?: { success?: string };
                    };
                    const successMsg = props.flash?.success;
                    if (
                        method === 'generate' &&
                        successMsg?.includes('New password:')
                    ) {
                        const pwd = successMsg
                            .split('New password:')[1]
                            ?.trim();
                        if (pwd) setGeneratedPassword(pwd);
                    }
                },
                onError: () => setPasswordResetLoading(false),
            },
        );
    }

    function handleImpersonate() {
        setImpersonateLoading(true);
        router.post(customersImpersonate.url(customer.id));
    }

    const isB2B = data.type === 'b2b';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Customers', href: '/admin/customers' },
                {
                    title: customer.user?.name || 'Customer',
                    href: `/admin/customers/${customer.id}`,
                },
                { title: 'Edit', href: `/admin/customers/${customer.id}/edit` },
            ]}
        >
            <Head title={`Edit ${customer.user?.name || 'Customer'}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/customers/${customer.id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">
                                Edit Customer
                            </h1>
                            <p className="text-muted-foreground">
                                {customer.user?.name} ({customer.user?.email})
                            </p>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid gap-6 lg:grid-cols-2"
                >
                    {/* Account Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Account Settings
                            </CardTitle>
                            <CardDescription>
                                Configure customer type and status
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Customer Type</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value) =>
                                        setData('type', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customerTypes.map((type) => (
                                            <SelectItem
                                                key={type.value}
                                                value={type.value}
                                            >
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.type && (
                                    <p className="text-sm text-destructive">
                                        {errors.type}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    B2B customers can pay with balance. B2C
                                    customers pay with card.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="discount_percentage">
                                    Discount Percentage
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="discount_percentage"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={data.discount_percentage}
                                        onChange={(e) =>
                                            setData(
                                                'discount_percentage',
                                                e.target.value,
                                            )
                                        }
                                        className="pr-8"
                                    />
                                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
                                        %
                                    </span>
                                </div>
                                {errors.discount_percentage && (
                                    <p className="text-sm text-destructive">
                                        {errors.discount_percentage}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">
                                        Active Account
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Inactive customers cannot make purchases
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', checked)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Business Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Business Details
                            </CardTitle>
                            <CardDescription>
                                Company and contact information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="company_name">
                                    Company Name
                                </Label>
                                <Input
                                    id="company_name"
                                    value={data.company_name}
                                    onChange={(e) =>
                                        setData('company_name', e.target.value)
                                    }
                                    placeholder="Acme Inc."
                                />
                                {errors.company_name && (
                                    <p className="text-sm text-destructive">
                                        {errors.company_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    placeholder="+1 234 567 8900"
                                />
                                {errors.phone && (
                                    <p className="text-sm text-destructive">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vat_number">VAT Number</Label>
                                <Input
                                    id="vat_number"
                                    value={data.vat_number}
                                    onChange={(e) =>
                                        setData('vat_number', e.target.value)
                                    }
                                    placeholder="EU123456789"
                                />
                                {errors.vat_number && (
                                    <p className="text-sm text-destructive">
                                        {errors.vat_number}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                    placeholder="123 Main St, City, Country"
                                    rows={3}
                                />
                                {errors.address && (
                                    <p className="text-sm text-destructive">
                                        {errors.address}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Account */}
                    {customer.user && (
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    User Account
                                </CardTitle>
                                <CardDescription>
                                    Manage user credentials and access
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* User Details Form */}
                                <form
                                    onSubmit={handleUserSubmit}
                                    className="space-y-4"
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="user_name">
                                                Name
                                            </Label>
                                            <Input
                                                id="user_name"
                                                value={userData.name}
                                                onChange={(e) =>
                                                    setUserData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {userErrors.name && (
                                                <p className="text-sm text-destructive">
                                                    {userErrors.name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="user_email">
                                                Email
                                            </Label>
                                            <Input
                                                id="user_email"
                                                type="email"
                                                value={userData.email}
                                                onChange={(e) =>
                                                    setUserData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {userErrors.email && (
                                                <p className="text-sm text-destructive">
                                                    {userErrors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>Email verified:</span>
                                        <span
                                            className={
                                                customer.user.email_verified_at
                                                    ? 'text-green-600'
                                                    : 'text-yellow-600'
                                            }
                                        >
                                            {customer.user.email_verified_at
                                                ? new Date(
                                                      customer.user
                                                          .email_verified_at,
                                                  ).toLocaleDateString()
                                                : 'Not verified'}
                                        </span>
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        disabled={userProcessing}
                                    >
                                        {userProcessing ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        Update User Details
                                    </Button>
                                </form>

                                {/* Divider */}
                                <div className="border-t pt-6">
                                    <h4 className="mb-4 font-medium">
                                        Account Actions
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {/* Reset Password */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    disabled={
                                                        passwordResetLoading
                                                    }
                                                >
                                                    {passwordResetLoading ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Key className="mr-2 h-4 w-4" />
                                                    )}
                                                    Reset Password
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Reset User Password
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Choose how to reset the
                                                        password for{' '}
                                                        {customer.user.email}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <div className="flex flex-col gap-3 py-4">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleResetPassword(
                                                                'generate',
                                                            )
                                                        }
                                                        disabled={
                                                            passwordResetLoading
                                                        }
                                                    >
                                                        <Key className="mr-2 h-4 w-4" />
                                                        Generate New Password
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleResetPassword(
                                                                'link',
                                                            )
                                                        }
                                                        disabled={
                                                            passwordResetLoading
                                                        }
                                                    >
                                                        <Mail className="mr-2 h-4 w-4" />
                                                        Send Reset Link via
                                                        Email
                                                    </Button>
                                                </div>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        {/* Login as User */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    disabled={
                                                        impersonateLoading
                                                    }
                                                >
                                                    {impersonateLoading ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <LogIn className="mr-2 h-4 w-4" />
                                                    )}
                                                    Login as User
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Login as User
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        You will be logged in as{' '}
                                                        {customer.user.name} (
                                                        {customer.user.email}).
                                                        You can return to your
                                                        admin account at any
                                                        time.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={
                                                            handleImpersonate
                                                        }
                                                    >
                                                        Continue
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>

                                    {/* Show generated password */}
                                    {generatedPassword && (
                                        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                New Password Generated
                                            </p>
                                            <p className="mt-1 font-mono text-lg text-green-900 dark:text-green-100">
                                                {generatedPassword}
                                            </p>
                                            <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                                                Make sure to copy this password
                                                - it won't be shown again.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Balance Settings (B2B only) */}
                    {isB2B && (
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wallet className="h-5 w-5" />
                                    Balance Settings
                                </CardTitle>
                                <CardDescription>
                                    Manage customer prepaid balance (B2B only)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="balance_amount">
                                            Current Balance
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                                                {currency.symbol}
                                            </span>
                                            <Input
                                                id="balance_amount"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.balance_amount}
                                                onChange={(e) =>
                                                    setData(
                                                        'balance_amount',
                                                        e.target.value,
                                                    )
                                                }
                                                className="pl-8"
                                            />
                                        </div>
                                        {errors.balance_amount && (
                                            <p className="text-sm text-destructive">
                                                {errors.balance_amount}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Reserved</Label>
                                        <div className="flex h-10 items-center rounded-md border bg-muted px-3">
                                            {currency.symbol}
                                            {Number(
                                                customer.balance?.reserved || 0,
                                            ).toFixed(2)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Amount reserved for pending orders
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Available</Label>
                                        <div className="flex h-10 items-center rounded-md border bg-muted px-3">
                                            {currency.symbol}
                                            {Number(
                                                customer.balance
                                                    ?.available_balance || 0,
                                            ).toFixed(2)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Balance minus reserved
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 lg:col-span-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Save Changes
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/admin/customers/${customer.id}`}>
                                Cancel
                            </Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
