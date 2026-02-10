import { useTrans } from '@/hooks/use-trans';
import { Check } from 'lucide-react';
import { PaymentMethodIcons } from './payment-method-icons';
import { ProviderLogo } from './payment-provider-logos';

interface PaymentMethod {
    name: string;
    icon: string;
}

interface PaymentProvider {
    id: string;
    name: string;
    description: string;
    payment_methods: PaymentMethod[];
}

interface PaymentProviderCardProps {
    provider: PaymentProvider;
    isSelected: boolean;
    onSelect: () => void;
    methodsOverride?: PaymentMethod[] | null;
}

export function PaymentProviderCard({
    provider,
    isSelected,
    onSelect,
    methodsOverride,
}: PaymentProviderCardProps) {
    const { trans } = useTrans();

    return (
        <div className="relative">
            <input
                type="radio"
                name="payment_provider"
                id={provider.id}
                value={provider.id}
                checked={isSelected}
                onChange={onSelect}
                className="peer sr-only"
            />
            <label
                htmlFor={provider.id}
                className={`group flex cursor-pointer flex-col overflow-hidden rounded-xl border p-3.5 transition-all duration-300 md:p-4 ${
                    isSelected
                        ? 'animate-glow-pulse border-transparent bg-white'
                        : 'border-primary-100 bg-white hover:border-primary-200 hover:shadow-sm'
                }`}
            >
                <div className="flex items-center gap-3">
                    {/* Provider Logo */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-primary-100 md:h-11 md:w-11 md:rounded-xl">
                        <ProviderLogo
                            provider={provider.id}
                            className="h-6 w-6 md:h-7 md:w-7"
                        />
                    </div>

                    {/* Name & description */}
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-primary-900 md:text-[15px]">
                            {provider.name}
                        </p>
                        <p className="text-[11px] text-primary-500 md:text-xs">
                            {provider.description}
                        </p>
                    </div>

                    {/* Selection indicator */}
                    <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all md:h-[22px] md:w-[22px] ${
                            isSelected
                                ? 'bg-accent-400 shadow-sm'
                                : 'bg-white shadow-sm ring-1 ring-primary-200'
                        }`}
                    >
                        {isSelected && (
                            <Check className="h-3 w-3 text-white md:h-3.5 md:w-3.5" strokeWidth={3} />
                        )}
                    </div>
                </div>

                {/* Payment method icons */}
                <div className="mt-3 min-w-0 border-t border-primary-100/80 pt-3">
                    <p className="mb-1.5 text-[10px] font-medium tracking-wide text-primary-400 uppercase md:text-[11px]">
                        {trans(
                            'payment_provider_card.accepted_payment_methods',
                        )}
                    </p>
                    <PaymentMethodIcons methods={methodsOverride ?? provider.payment_methods} />
                </div>
            </label>
        </div>
    );
}
