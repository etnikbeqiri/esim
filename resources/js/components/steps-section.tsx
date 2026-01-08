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
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-primary-50/50 py-12 md:py-20">
            <div className="container relative z-10 mx-auto px-4">
                {(title || subtitle) && (
                    <div className="mb-10 text-center md:mb-12">
                        {title && (
                            <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-primary-900 md:text-4xl">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="mx-auto max-w-2xl text-base text-primary-600 md:text-lg">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                <div className="mx-auto max-w-5xl space-y-8 md:space-y-14">
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isEven = stepNumber % 2 === 0;
                        const Icon = step.icon;

                        return (
                            <div
                                key={index}
                                className="grid items-center gap-5 md:grid-cols-2 md:gap-12"
                            >
                                {/* Content */}
                                <div className={isEven ? 'order-2' : 'order-2 md:order-1'}>
                                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent-300 to-accent-500 text-sm font-bold text-accent-950 shadow-md shadow-accent-400/30 md:mb-4 md:h-10 md:w-10 md:text-base">
                                        {stepNumber}
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-primary-900 md:mb-3 md:text-2xl">
                                        {step.title}
                                    </h3>
                                    <p className="mb-4 text-sm leading-relaxed text-primary-600 md:mb-5 md:text-base">
                                        {step.description}
                                    </p>
                                    <ul className="space-y-2">
                                        {step.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-start gap-2">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                                                <span className="text-sm text-primary-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Icon Card - Compact */}
                                <div className={isEven ? 'order-1' : 'order-1 md:order-2'}>
                                    <div className="relative mx-auto w-fit">
                                        {/* Outside corner glow effects - smaller */}
                                        <div className="pointer-events-none absolute -top-4 -right-4 h-16 w-16 rounded-full bg-accent-400/30 blur-2xl md:-top-6 md:-right-6 md:h-24 md:w-24 md:blur-3xl" />
                                        <div className="pointer-events-none absolute -bottom-4 -left-4 h-14 w-14 rounded-full bg-primary-400/30 blur-2xl md:-bottom-6 md:-left-6 md:h-20 md:w-20 md:blur-3xl" />

                                        {/* Card - Compact */}
                                        <div className="relative overflow-hidden rounded-2xl border border-primary-100 bg-white p-5 shadow-lg md:rounded-3xl md:p-8">
                                            {/* Icon */}
                                            <div className="relative flex items-center justify-center">
                                                <Icon className="h-12 w-12 text-primary-500 md:h-16 md:w-16" />
                                            </div>

                                            {/* Accent dots - smaller */}
                                            <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-accent-400 md:top-4 md:right-4 md:h-2.5 md:w-2.5" />
                                            <div className="absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full bg-primary-400 md:bottom-4 md:left-4 md:h-2 md:w-2" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
