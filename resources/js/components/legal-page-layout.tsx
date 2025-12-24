import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface LegalPageLayoutProps {
    title: string;
    lastUpdated?: string;
    children: ReactNode;
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
    const { name } = usePage<SharedData>().props;

    return (
        <div className="py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl">
                    <h1 className="mb-4 text-3xl font-bold md:text-4xl">{title}</h1>
                    {lastUpdated && (
                        <p className="mb-8 text-sm text-muted-foreground">
                            Last updated: {lastUpdated}
                        </p>
                    )}
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface SectionProps {
    title: string;
    children: ReactNode;
}

export function LegalSection({ title, children }: SectionProps) {
    return (
        <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{title}</h2>
            <div className="space-y-4 text-muted-foreground">{children}</div>
        </section>
    );
}
