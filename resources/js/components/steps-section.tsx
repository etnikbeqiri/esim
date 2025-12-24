import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

interface Step {
    title: string;
    description: string;
    features: string[];
    icon: LucideIcon;
}

interface StepsSectionProps {
    title?: string;
    subtitle?: string;
    steps: Step[];
}

export function StepsSection({ title, subtitle, steps }: StepsSectionProps) {
    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                {(title || subtitle) && (
                    <div className="mb-12 text-center">
                        {title && <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>}
                        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
                    </div>
                )}
                <div className="mx-auto max-w-4xl space-y-16">
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isEven = stepNumber % 2 === 0;
                        const Icon = step.icon;

                        return (
                            <div key={index} className="grid items-center gap-8 md:grid-cols-2">
                                {/* Content */}
                                <div className={isEven ? 'order-2' : 'order-2 md:order-1'}>
                                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                                        {stepNumber}
                                    </div>
                                    <h2 className="mb-4 text-2xl font-bold md:text-3xl">
                                        {step.title}
                                    </h2>
                                    <p className="mb-6 text-muted-foreground">
                                        {step.description}
                                    </p>
                                    <ul className="space-y-3">
                                        {step.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-start gap-3">
                                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Icon Card */}
                                <div className={isEven ? 'order-1' : 'order-1 md:order-2'}>
                                    <Card className="bg-muted/30">
                                        <CardContent className="flex items-center justify-center p-12">
                                            <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-primary/10">
                                                <Icon className="h-16 w-16 text-primary" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
