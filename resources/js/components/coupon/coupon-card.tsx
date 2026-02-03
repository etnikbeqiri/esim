import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Coupon } from '@/types';
import { Calendar, Percent, Euro, Ticket, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CouponCardProps {
    coupon: Coupon;
    onApply?: (code: string) => void;
    appliedCode?: string;
    className?: string;
}

export function CouponCard({ coupon, onApply, appliedCode, className = '' }: CouponCardProps) {
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isApplied = appliedCode === coupon.code;

    const isValid = coupon.is_active &&
        (!coupon.valid_until || new Date(coupon.valid_until) > new Date()) &&
        (!coupon.usage_limit || coupon.usage_count < coupon.usage_limit);

    const getStatusBadge = () => {
        if (!coupon.is_active) {
            return <Badge variant="secondary">Inactive</Badge>;
        }
        if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
            return <Badge variant="destructive">Expired</Badge>;
        }
        if (coupon.valid_from && new Date(coupon.valid_from) > new Date()) {
            return <Badge variant="outline">Upcoming</Badge>;
        }
        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
            return <Badge variant="secondary">Fully Redeemed</Badge>;
        }
        return <Badge variant="default">Active</Badge>;
    };

    return (
        <Card className={`${isApplied ? 'border-green-500 ring-2 ring-green-500/20' : ''} ${className}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Ticket className="h-5 w-5 text-primary" />
                            <CardTitle className="font-mono text-lg">{coupon.code}</CardTitle>
                            {getStatusBadge()}
                        </div>
                        {coupon.name && (
                            <CardDescription className="text-base">{coupon.name}</CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {coupon.description && (
                    <p className="text-sm text-muted-foreground">{coupon.description}</p>
                )}

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {coupon.type === 'percentage' ? (
                            <>
                                <Percent className="h-4 w-4 text-muted-foreground" />
                                <span className="text-2xl font-bold">{coupon.value}% off</span>
                            </>
                        ) : (
                            <>
                                <Euro className="h-4 w-4 text-muted-foreground" />
                                <span className="text-2xl font-bold">€{coupon.value} off</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {coupon.min_order_amount > 0 && (
                        <div className="flex items-center gap-1">
                            <span>Min order:</span>
                            <span className="font-semibold text-foreground">€{coupon.min_order_amount}</span>
                        </div>
                    )}
                    {coupon.usage_limit && (
                        <div className="flex items-center gap-1">
                            <span>Uses:</span>
                            <span className="font-semibold text-foreground">
                                {coupon.usage_count} / {coupon.usage_limit}
                            </span>
                        </div>
                    )}
                    {coupon.first_time_only && (
                        <Badge variant="outline">First-time customers only</Badge>
                    )}
                </div>

                {(coupon.valid_from || coupon.valid_until) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                        <Calendar className="h-4 w-4" />
                        <span>
                            {coupon.valid_from && `Valid from ${new Date(coupon.valid_from).toLocaleDateString()}`}
                            {coupon.valid_from && coupon.valid_until && ' • '}
                            {coupon.valid_until && `until ${new Date(coupon.valid_until).toLocaleDateString()}`}
                        </span>
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                    {isApplied ? (
                        <Button variant="outline" className="flex-1" disabled>
                            <Check className="mr-2 h-4 w-4" />
                            Applied
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={copyCode}
                                className="flex-1"
                            >
                                {copied ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Code
                                    </>
                                )}
                            </Button>
                            {onApply && isValid && (
                                <Button
                                    onClick={() => onApply(coupon.code)}
                                    className="flex-1"
                                >
                                    Apply
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default CouponCard;
