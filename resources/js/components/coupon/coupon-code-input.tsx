import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTrans } from '@/hooks/use-trans';
import { type CouponValidationResponse } from '@/types';
import {
    AlertCircle,
    Check,
    Info,
    Loader2,
    Plus,
    Ticket,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AppliedCoupon {
    code: string;
    name: string;
    type: string;
    value: number;
    discount: number;
    isStackable: boolean;
}

interface CouponCodeInputProps {
    packageId: number;
    email: string;
    orderAmount: number;
    onCouponsChanged: (
        coupons: AppliedCoupon[],
        totalDiscount: number,
        finalAmount: number,
    ) => void;
    onEmailFocus?: () => void;
    className?: string;
}

export function CouponCodeInput({
    packageId,
    email,
    orderAmount,
    onCouponsChanged,
    onEmailFocus,
    className = '',
}: CouponCodeInputProps) {
    const { trans } = useTrans();
    const [code, setCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [appliedCoupons, setAppliedCoupons] = useState<AppliedCoupon[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showInput, setShowInput] = useState(true);
    const [lastValidatedEmail, setLastValidatedEmail] = useState<string | null>(
        null,
    );

    // Calculate totals whenever coupons change
    useEffect(() => {
        const totalDiscount = appliedCoupons.reduce(
            (sum, c) => sum + c.discount,
            0,
        );
        const finalAmount = Math.max(0, orderAmount - totalDiscount);
        onCouponsChanged(appliedCoupons, totalDiscount, finalAmount);
    }, [appliedCoupons, orderAmount]);

    // Re-validate coupons when email changes
    useEffect(() => {
        if (
            appliedCoupons.length > 0 &&
            lastValidatedEmail &&
            lastValidatedEmail !== email
        ) {
            if (email && isValidEmail(email)) {
                revalidateAllCoupons();
            } else {
                // Email is now invalid - remove all coupons
                setAppliedCoupons([]);
                setLastValidatedEmail(null);
            }
        }
    }, [email]);

    const isValidEmail = (emailStr: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
    };

    const getCsrfToken = (): string => {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : '';
    };

    // Calculate current amount after existing discounts
    const getCurrentAmount = (): number => {
        const totalDiscount = appliedCoupons.reduce(
            (sum, c) => sum + c.discount,
            0,
        );
        return Math.max(0, orderAmount - totalDiscount);
    };

    const validateCoupon = async () => {
        if (!code.trim()) return;
        if (!email || !isValidEmail(email)) {
            setError(trans('coupon_input.email_required'));
            return;
        }

        // Check if coupon is already applied
        if (
            appliedCoupons.some(
                (c) => c.code.toUpperCase() === code.trim().toUpperCase(),
            )
        ) {
            setError(trans('coupon_input.already_applied'));
            return;
        }

        setIsValidating(true);
        setError(null);

        try {
            const currentAmount = getCurrentAmount();
            const appliedCodes = appliedCoupons.map((c) => c.code);

            const response = await fetch('/api/v1/coupons/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    code: code.trim(),
                    package_id: packageId,
                    email: email,
                    order_amount: currentAmount,
                    applied_coupons: appliedCodes,
                }),
            });

            const data: CouponValidationResponse & { is_stackable?: boolean } =
                await response.json();

            if (data.valid && data.coupon) {
                const newCoupon: AppliedCoupon = {
                    code: data.coupon.code,
                    name: data.coupon.name,
                    type: data.coupon.type,
                    value: data.coupon.value,
                    discount: data.discount || 0,
                    isStackable: data.is_stackable ?? true,
                };

                setAppliedCoupons((prev) => [...prev, newCoupon]);
                setLastValidatedEmail(email);
                setCode('');

                // Check if we can add more coupons
                const canAddMore =
                    newCoupon.isStackable &&
                    appliedCoupons.every((c) => c.isStackable);
                setShowInput(canAddMore);
            } else {
                setError(data.error || trans('coupon_input.invalid_code'));
            }
        } catch (err) {
            setError(trans('coupon_input.validation_failed'));
        } finally {
            setIsValidating(false);
        }
    };

    const revalidateAllCoupons = async () => {
        if (appliedCoupons.length === 0) return;

        setIsValidating(true);
        const validCoupons: AppliedCoupon[] = [];
        let currentAmount = orderAmount;

        for (const coupon of appliedCoupons) {
            try {
                const response = await fetch('/api/v1/coupons/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-XSRF-TOKEN': getCsrfToken(),
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        code: coupon.code,
                        package_id: packageId,
                        email: email,
                        order_amount: currentAmount,
                        applied_coupons: validCoupons.map((c) => c.code),
                    }),
                });

                const data: CouponValidationResponse & {
                    is_stackable?: boolean;
                } = await response.json();

                if (data.valid && data.coupon) {
                    const validCoupon: AppliedCoupon = {
                        code: data.coupon.code,
                        name: data.coupon.name,
                        type: data.coupon.type,
                        value: data.coupon.value,
                        discount: data.discount || 0,
                        isStackable: data.is_stackable ?? true,
                    };
                    validCoupons.push(validCoupon);
                    currentAmount = Math.max(
                        0,
                        currentAmount - validCoupon.discount,
                    );
                }
            } catch (err) {
                // Skip invalid coupons
            }
        }

        setAppliedCoupons(validCoupons);
        setLastValidatedEmail(email);

        // Update show input based on remaining valid coupons
        const canAddMore =
            validCoupons.length === 0 ||
            validCoupons.every((c) => c.isStackable);
        setShowInput(canAddMore);

        setIsValidating(false);
    };

    const removeCoupon = (codeToRemove: string) => {
        setAppliedCoupons((prev) =>
            prev.filter((c) => c.code !== codeToRemove),
        );
        setShowInput(true);
        setError(null);
    };

    const clearError = () => {
        setError(null);
    };

    const isEmailValid = email && isValidEmail(email);

    // Determine error type for styling
    const getErrorType = (
        errorMsg: string,
    ): 'invalid' | 'restriction' | 'limit' | 'expired' | 'stacking' => {
        const lowerError = errorMsg.toLowerCase();
        if (
            lowerError.includes('expired') ||
            lowerError.includes('not yet valid')
        ) {
            return 'expired';
        }
        if (lowerError.includes('limit') || lowerError.includes('maximum')) {
            return 'limit';
        }
        if (
            lowerError.includes('not available') ||
            lowerError.includes('cannot be used') ||
            lowerError.includes('not valid for')
        ) {
            return 'restriction';
        }
        if (lowerError.includes('stack') || lowerError.includes('combine')) {
            return 'stacking';
        }
        return 'invalid';
    };

    const getErrorIcon = (type: string) => {
        switch (type) {
            case 'restriction':
            case 'limit':
            case 'stacking':
                return <Info className="h-4 w-4 shrink-0" />;
            default:
                return <AlertCircle className="h-4 w-4 shrink-0" />;
        }
    };

    const getErrorStyles = (type: string) => {
        switch (type) {
            case 'restriction':
                return {
                    container:
                        'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50',
                    icon: 'text-amber-500 dark:text-amber-400',
                    text: 'text-amber-800 dark:text-amber-200',
                    subtext: 'text-amber-600 dark:text-amber-400',
                };
            case 'limit':
            case 'stacking':
                return {
                    container:
                        'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50',
                    icon: 'text-orange-500 dark:text-orange-400',
                    text: 'text-orange-800 dark:text-orange-200',
                    subtext: 'text-orange-600 dark:text-orange-400',
                };
            case 'expired':
                return {
                    container:
                        'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50',
                    icon: 'text-slate-500 dark:text-slate-400',
                    text: 'text-slate-700 dark:text-slate-200',
                    subtext: 'text-slate-500 dark:text-slate-400',
                };
            default:
                return {
                    container:
                        'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50',
                    icon: 'text-red-500 dark:text-red-400',
                    text: 'text-red-800 dark:text-red-200',
                    subtext: 'text-red-600 dark:text-red-400',
                };
        }
    };

    const getErrorHint = (type: string): string | null => {
        switch (type) {
            case 'restriction':
                return trans('coupon_input.hint_try_another');
            case 'limit':
                return trans('coupon_input.hint_limit_reached');
            case 'expired':
                return trans('coupon_input.hint_expired');
            case 'stacking':
                return trans('coupon_input.hint_not_stackable');
            default:
                return trans('coupon_input.hint_check_code');
        }
    };

    const totalDiscount = appliedCoupons.reduce(
        (sum, c) => sum + c.discount,
        0,
    );

    return (
        <div className={className}>
            {/* Applied Coupons List */}
            {appliedCoupons.length > 0 && (
                <div className="mb-3 space-y-2">
                    {appliedCoupons.map((coupon) => (
                        <div
                            key={coupon.code}
                            className="rounded-xl border border-green-200/80 bg-green-50/60 p-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10">
                                        <Check className="h-3.5 w-3.5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="font-mono text-[13px] font-bold text-green-800">
                                                {coupon.code}
                                            </span>
                                            <span className="text-[11px] text-green-600">
                                                {coupon.name}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-green-600">
                                            {coupon.type === 'percentage'
                                                ? `${coupon.value}%`
                                                : `€${coupon.value}`}{' '}
                                            {trans('coupon_input.off')}
                                            {' · '}
                                            <span className="font-semibold">
                                                -€{coupon.discount.toFixed(2)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCoupon(coupon.code)}
                                    className="h-7 w-7 rounded-lg p-0 text-green-600 hover:bg-green-100 hover:text-green-800"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {/* Total Savings */}
                    {appliedCoupons.length > 1 && (
                        <div className="pl-1 text-xs font-semibold text-green-700">
                            {trans('coupon_input.total_savings')}: €
                            {totalDiscount.toFixed(2)}
                        </div>
                    )}
                </div>
            )}

            {/* Add Coupon Input */}
            {showInput && (
                <div className="space-y-2.5">
                    <div className="flex gap-2">
                        <div
                            className="relative flex-1"
                            onClick={!isEmailValid ? onEmailFocus : undefined}
                        >
                            <Ticket className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-primary-400" />
                            <Input
                                type="text"
                                placeholder={
                                    appliedCoupons.length > 0
                                        ? trans(
                                              'coupon_input.placeholder_another',
                                          )
                                        : trans('coupon_input.placeholder')
                                }
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value.toUpperCase());
                                    if (error) clearError();
                                }}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' &&
                                    isEmailValid &&
                                    validateCoupon()
                                }
                                className={`h-10 rounded-xl border-primary-200 pl-10 font-mono text-sm tracking-wider md:h-11 ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''} ${!isEmailValid ? 'cursor-pointer' : ''}`}
                                disabled={isValidating || !isEmailValid}
                            />
                        </div>
                        <Button
                            onClick={validateCoupon}
                            disabled={
                                !code.trim() || isValidating || !isEmailValid
                            }
                            variant="secondary"
                            className="h-10 rounded-xl px-4 md:h-11"
                        >
                            {isValidating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : appliedCoupons.length > 0 ? (
                                <Plus className="h-4 w-4" />
                            ) : (
                                trans('coupon_input.apply')
                            )}
                        </Button>
                    </div>

                    {!isEmailValid && !error && (
                        <button
                            type="button"
                            onClick={onEmailFocus}
                            className="flex items-center gap-1.5 text-[11px] text-primary-400 transition-colors hover:text-primary-600"
                        >
                            <Info className="h-3 w-3" />
                            {trans('coupon_input.enter_email_first')}
                        </button>
                    )}

                    {error &&
                        (() => {
                            const errorType = getErrorType(error);
                            const styles = getErrorStyles(errorType);
                            const hint = getErrorHint(errorType);

                            return (
                                <div
                                    className={`rounded-lg border p-3 ${styles.container}`}
                                >
                                    <div className="flex items-start gap-2.5">
                                        <div
                                            className={`mt-0.5 ${styles.icon}`}
                                        >
                                            {getErrorIcon(errorType)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className={`text-sm font-medium ${styles.text}`}
                                            >
                                                {error}
                                            </p>
                                            {hint && (
                                                <p
                                                    className={`mt-1 text-xs ${styles.subtext}`}
                                                >
                                                    {hint}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearError}
                                            className={`h-6 w-6 p-0 ${styles.icon} opacity-60 hover:bg-transparent hover:opacity-100`}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })()}
                </div>
            )}

            {/* Show "Add Another" button when input is hidden but coupons are stackable */}
            {!showInput &&
                appliedCoupons.length > 0 &&
                appliedCoupons.every((c) => c.isStackable) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowInput(true)}
                        className="mt-2 text-primary-600 hover:text-primary-700"
                    >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        {trans('coupon_input.add_another')}
                    </Button>
                )}
        </div>
    );
}

export default CouponCodeInput;
