import { cn } from '@/lib/utils';
import { Wallet } from 'lucide-react';
import {
    AlipayFlatRoundedIcon,
    AmexIcon,
    DinersClubFlatRoundedIcon,
    DiscoverFlatRoundedIcon,
    GenericFlatRoundedIcon,
    JCBFlatRoundedIcon,
    MaestroFlatRoundedIcon,
    MastercardFlatRoundedIcon,
    PayPalFlatRoundedIcon,
    UnionPayFlatRoundedIcon,
    VisaFlatRoundedIcon,
} from 'react-svg-credit-card-payment-icons';

interface PaymentMethodIconsProps {
    methods: Array<{ name: string; icon: string }>;
    className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconComponents: Record<string, React.ComponentType<any>> = {
    visa: VisaFlatRoundedIcon,
    mastercard: MastercardFlatRoundedIcon,
    amex: AmexIcon,
    maestro: MaestroFlatRoundedIcon,
    discover: DiscoverFlatRoundedIcon,
    diners: DinersClubFlatRoundedIcon,
    jcb: JCBFlatRoundedIcon,
    unionpay: UnionPayFlatRoundedIcon,
    paypal: PayPalFlatRoundedIcon,
    alipay: AlipayFlatRoundedIcon,
    generic: GenericFlatRoundedIcon,
};

export function PaymentMethodIcons({
    methods,
    className,
}: PaymentMethodIconsProps) {
    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            {methods.map((method) => {
                const IconComponent = iconComponents[method.icon];

                if (method.icon === 'wallet') {
                    return (
                        <div
                            key={method.icon}
                            className="rounded border bg-white p-1 shadow-sm"
                            title={method.name}
                        >
                            <Wallet className="h-5 w-5 text-muted-foreground" />
                        </div>
                    );
                }

                const Icon = IconComponent || GenericFlatRoundedIcon;

                return (
                    <div
                        key={method.icon}
                        className="overflow-hidden rounded border shadow-sm"
                        title={method.name}
                    >
                        <Icon width={40} height={26} />
                    </div>
                );
            })}
        </div>
    );
}
