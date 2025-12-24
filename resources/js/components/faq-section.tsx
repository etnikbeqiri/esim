import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ArrowRight, ChevronDown, HelpCircle } from 'lucide-react';
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
        <section className={showBackground ? 'bg-muted/30 py-16 md:py-24' : 'py-16 md:py-24'}>
            <div className="container mx-auto px-4">
                {(title || subtitle) && (
                    <div className="mb-12 text-center">
                        {title && <h2 className="mb-4 text-2xl font-bold md:text-3xl">{title}</h2>}
                        {subtitle && (
                            <p className="mx-auto max-w-2xl text-muted-foreground">{subtitle}</p>
                        )}
                    </div>
                )}

                <div className="mx-auto max-w-3xl space-y-4">
                    {items.map((faq, index) => (
                        <Card
                            key={index}
                            className="cursor-pointer"
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        >
                            <CardContent className="p-0">
                                <button className="flex w-full items-center justify-between p-6 text-left">
                                    <span className="flex items-center gap-3 font-medium">
                                        <HelpCircle className="h-5 w-5 text-primary" />
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                                            openIndex === index ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>
                                {openIndex === index && (
                                    <div className="border-t px-6 py-4 text-muted-foreground">
                                        {faq.answer}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {viewAllLink && (
                    <div className="mt-8 text-center">
                        <Button variant="outline" asChild>
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
