import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PaymentMethodIcons } from '@/components/payment-method-icons';

function StripeLogo({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 32 32"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                d="M13.88 9.515c0-1.37 1.14-1.9 2.982-1.9A19.661 19.661 0 0 1 25.6 9.876v-8.27A23.184 23.184 0 0 0 16.862.001C9.762.001 5 3.72 5 9.93c0 9.716 13.342 8.138 13.342 12.326c0 1.638-1.4 2.146-3.37 2.146c-2.905 0-6.657-1.202-9.6-2.802v8.378A24.353 24.353 0 0 0 14.973 32C22.27 32 27.3 28.395 27.3 22.077c0-10.486-13.42-8.613-13.42-12.56z"
            />
        </svg>
    );
}

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
            <RadioGroup
                value={value}
                onValueChange={onChange}
                className="space-y-3"
            >
                {providers.map((provider) => {
                    const isSelected = value === provider.id;

                    return (
                        <div key={provider.id} className="relative">
                            <RadioGroupItem
                                value={provider.id}
                                id={provider.id}
                                className="peer sr-only"
                            />
                            <Label
                                htmlFor={provider.id}
                                className={`flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all duration-200 ${
                                    isSelected
                                        ? 'border-accent-400 bg-accent-50/50 shadow-sm'
                                        : 'border-primary-100 bg-white hover:border-accent-200 hover:bg-accent-50/30'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ring-1 ${
                                            isSelected
                                                ? 'bg-[#635bff] text-white ring-[#635bff]'
                                                : 'bg-white text-[#635bff] ring-primary-100'
                                        }`}>
                                            <StripeLogo className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{provider.name}</p>
                                            <p className="text-sm text-primary-600">
                                                {provider.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                                        isSelected
                                            ? 'border-accent-500 bg-accent-400'
                                            : 'border-primary-300 bg-white'
                                    }`}>
                                        {isSelected && (
                                            <div className="h-2 w-2 rounded-full bg-white" />
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 border-t border-primary-100 pt-4">
                                    <p className="mb-2 text-xs font-medium text-primary-500">
                                        Accepted payment methods:
                                    </p>
                                    <PaymentMethodIcons methods={provider.payment_methods} />
                                </div>
                            </Label>
                        </div>
                    );
                })}
            </RadioGroup>
        </div>
    );
}
