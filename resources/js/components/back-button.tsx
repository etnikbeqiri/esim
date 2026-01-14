import { Button } from '@/components/ui/button';
import { useTrans } from '@/hooks/use-trans';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    href: string;
    label?: string;
    variant?: 'default' | 'ghost' | 'outline';
    className?: string;
}

export function BackButton({
    href,
    label,
    variant = 'default',
    className,
}: BackButtonProps) {
    const { trans } = useTrans();
    const buttonLabel = label || trans('common.back');

    if (variant === 'default') {
        return (
            <Link
                href={href}
                className={cn(
                    'inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-4 py-2 text-sm font-semibold text-primary-600 shadow-sm backdrop-blur-sm transition-all hover:border-accent-400 hover:bg-accent-50 hover:text-accent-700 hover:shadow-md',
                    className,
                )}
            >
                <ArrowLeft className="h-4 w-4" />
                {buttonLabel}
            </Link>
        );
    }

    return (
        <Button variant={variant} size="sm" asChild className={className}>
            <Link href={href}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {buttonLabel}
            </Link>
        </Button>
    );
}
