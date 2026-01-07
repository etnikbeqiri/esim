import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSectionProps {
    title?: string;
    subtitle?: string;
    items: FAQItem[];
    showBackground?: boolean;
    viewAllLink?: string;
    viewAllText?: string;
}

export function FAQSection({
    title,
    subtitle,
    items,
    showBackground = true,
    viewAllLink,
    viewAllText = 'View All FAQs',
}: FAQSectionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="relative bg-white py-16 md:py-24">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] [background-size:24px_24px] opacity-[0.03]" />

            <div className="relative z-10 container mx-auto px-4">
                {(title || subtitle) && (
                    <div className="mb-12 text-center">
                        {title && (
                            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-950 md:text-4xl lg:text-5xl">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="mx-auto max-w-2xl text-lg text-gray-950">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                <div className="mx-auto max-w-3xl space-y-4">
                    {items.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={index}
                                className={`group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 ${
                                    isOpen
                                        ? 'border-accent-400 bg-white shadow-lg shadow-accent-500/20'
                                        : 'border-primary-100 bg-white hover:border-primary-200 hover:shadow-md'
                                }`}
                                onClick={() => setOpenIndex(isOpen ? null : index)}
                            >
                                <button className="flex w-full items-center justify-between p-5 text-left md:p-6">
                                    <span className="flex items-center gap-3 pr-4">
                                        <span
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                                                isOpen
                                                    ? 'bg-accent-400 text-accent-950'
                                                    : 'bg-primary-100 text-primary-600 group-hover:bg-primary-200'
                                            }`}
                                        >
                                            {index + 1}
                                        </span>
                                        <span className="font-semibold text-gray-950">
                                            {faq.question}
                                        </span>
                                    </span>
                                    <div
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                                            isOpen
                                                ? 'bg-accent-400 text-accent-950'
                                                : 'bg-primary-50 text-primary-500 group-hover:bg-primary-100'
                                        }`}
                                    >
                                        <ChevronDown
                                            className={`h-4 w-4 transition-transform duration-300 ${
                                                isOpen ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </div>
                                </button>

                                <div
                                    className={`grid transition-all duration-300 ease-in-out ${
                                        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                    }`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="border-t border-primary-100 px-5 py-5 md:px-6">
                                            <p className="pl-11 text-gray-950 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {viewAllLink && (
                    <div className="mt-10 text-center">
                        <Button
                            variant="outline"
                            asChild
                            className="rounded-full border-primary-200 bg-white px-6 text-primary-700 shadow-sm hover:bg-primary-50 hover:text-primary-900"
                        >
                            <Link href={viewAllLink}>
                                {viewAllText}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
