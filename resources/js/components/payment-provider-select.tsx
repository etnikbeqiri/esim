import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PaymentMethodIcons } from '@/components/payment-method-icons';
import { CreditCard } from 'lucide-react';

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
}

export function PaymentProviderSelect({ providers, value, onChange, className = '' }: PaymentProviderSelectProps) {
    if (providers.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <Label>Payment Method</Label>
            <RadioGroup
                value={value}
                onValueChange={onChange}
                className="space-y-3"
            >
                {providers.map((provider) => (
                    <div key={provider.id} className="relative">
                        <RadioGroupItem
                            value={provider.id}
                            id={provider.id}
                            className="peer sr-only"
                        />
                        <Label
                            htmlFor={provider.id}
                            className="flex cursor-pointer flex-col rounded-lg border bg-muted/30 p-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                        <CreditCard className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{provider.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {provider.description}
                                        </p>
                                    </div>
                                </div>
                                <div className={`h-4 w-4 rounded-full border-2 ${value === provider.id ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                                    {value === provider.id && (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="mb-2 text-xs text-muted-foreground">
                                    Accepted payment methods:
                                </p>
                                <PaymentMethodIcons methods={provider.payment_methods} />
                            </div>
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    );
}
