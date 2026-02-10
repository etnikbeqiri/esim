import { PaymentProviderCard } from './payment-provider-card';

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

interface PaymentProviderSelectProps {
    providers: PaymentProvider[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
    methodsOverride?: PaymentMethod[] | null;
}

export function PaymentProviderSelect({
    providers,
    value,
    onChange,
    className = '',
    methodsOverride,
}: PaymentProviderSelectProps) {
    if (providers.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {providers.map((provider) => (
                <PaymentProviderCard
                    key={provider.id}
                    provider={provider}
                    isSelected={value === provider.id}
                    onSelect={() => onChange(provider.id)}
                    methodsOverride={provider.id === 'paysera' ? methodsOverride : null}
                />
            ))}
        </div>
    );
}
