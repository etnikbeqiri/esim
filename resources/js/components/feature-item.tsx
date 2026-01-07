import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureItemProps {
    children: React.ReactNode;
    description?: string;
    variant?: 'default' | 'gold';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function FeatureItem({
    children,
    description,
    variant = 'default',
    size = 'sm',
    className,
}: FeatureItemProps) {
    const iconSizes = {
        sm: 'h-5 w-5',
        md: 'h-6 w-6',
        lg: 'h-10 w-10',
    };

    const checkSizes = {
        sm: 'h-3 w-3',
        md: 'h-3.5 w-3.5',
        lg: 'h-5 w-5',
    };

    const titleSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    return (
        <div className={cn('flex items-start gap-3', className)}>
            <span
                className={cn(
                    'flex shrink-0 items-center justify-center rounded',
                    iconSizes[size],
                    variant === 'gold'
                        ? 'bg-accent-300 text-accent-950'
                        : 'bg-primary-100 text-primary-600'
                )}
            >
                <Check className={checkSizes[size]} strokeWidth={3} />
            </span>
            <div className={description ? 'flex flex-col' : 'flex items-center'}>
                <span
                    className={cn(
                        'font-medium',
                        titleSizes[size],
                        variant === 'gold' ? 'text-primary-900' : 'text-primary-700'
                    )}
                >
                    {children}
                </span>
                {description && (
                    <span className="text-sm text-primary-500">
                        {description}
                    </span>
                )}
            </div>
        </div>
    );
}
