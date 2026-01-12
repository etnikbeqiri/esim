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
}

export function PaymentProviderCard({ provider, isSelected, onSelect }: PaymentProviderCardProps) {
    const providerColor = provider.id === 'paysera'
        ? 'bg-blue-100 text-blue-800 ring-blue-400'
        : 'bg-[#635bff] text-white ring-[#635bff]';
    const providerColorInactive = provider.id === 'paysera'
        ? 'text-blue-600'
        : 'text-[#635bff]';

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
                className={`flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all duration-200 ${
                    isSelected
                        ? 'border-accent-400 bg-accent-50/50 shadow-sm'
                        : 'border-primary-100 bg-white hover:border-accent-200 hover:bg-accent-50/30'
                }`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Cube-shaped logo container with rounded corners */}
                        <div className={`relative flex h-12 w-12 items-center justify-center shadow-sm rounded-xl ${
                            isSelected
                                ? providerColor
                                : `bg-white ${providerColorInactive}`
                        }`}>
                            {/* Logo fills the cube */}
                            <ProviderLogo provider={provider.id} className="h-10 w-10" />
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
            </label>
        </div>
    );
}
