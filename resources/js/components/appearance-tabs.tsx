import { cn } from '@/lib/utils';
import { Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'pointer-events-none inline-flex gap-1 rounded-lg bg-neutral-100 p-1 opacity-50',
                className,
            )}
            {...props}
        >
            <button
                disabled
                className="flex cursor-not-allowed items-center rounded-md bg-white px-3.5 py-1.5 text-neutral-900 shadow-xs"
            >
                <Sun className="-ml-1 h-4 w-4" />
                <span className="ml-1.5 text-sm">Light (Locked)</span>
            </button>
        </div>
    );
}
