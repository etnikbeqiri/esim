import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const goldButtonVariants = cva(
    'relative overflow-hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-accent-600 text-accent-950 shadow-[0px_4px_15px_rgba(212,175,55,0.3)] bg-gradient-to-r from-accent-300 via-accent-400 to-accent-300 bg-[length:200%_auto] before:absolute before:top-0 before:h-full before:w-[80%] before:skew-x-[-20deg] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent before:left-[-150%] hover:before:animate-[logo-shimmer_3s_ease-in-out_infinite]',
    {
        variants: {
            size: {
                default: 'h-10 px-6 text-sm',
                sm: 'h-8 px-4 text-xs',
                lg: 'h-12 px-8 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            size: 'default',
        },
    },
);

export interface GoldButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof goldButtonVariants> {
    asChild?: boolean;
}

const GoldButton = React.forwardRef<HTMLButtonElement, GoldButtonProps>(
    ({ className, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(goldButtonVariants({ size, className }))}
                ref={ref}
                {...props}
            />
        );
    },
);
GoldButton.displayName = 'GoldButton';

export { GoldButton, goldButtonVariants };
