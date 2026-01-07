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
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-primary-50/50 py-20 md:py-28">
            <div className="container relative z-10 mx-auto px-4">
                {(title || subtitle) && (
                    <div className="mb-16 text-center">
                        {title && (
                            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-primary-900 md:text-4xl">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="mx-auto max-w-2xl text-lg text-primary-600">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                <div className="mx-auto max-w-5xl space-y-20">
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isEven = stepNumber % 2 === 0;
                        const Icon = step.icon;

                        return (
                            <div
                                key={index}
                                className="grid items-center gap-10 md:grid-cols-2 md:gap-16"
                            >
                                {/* Content */}
                                <div className={isEven ? 'order-2' : 'order-2 md:order-1'}>
                                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-300 to-accent-500 text-lg font-bold text-accent-950 shadow-lg shadow-accent-400/30">
                                        {stepNumber}
                                    </div>
                                    <h3 className="mb-4 text-2xl font-bold text-primary-900 md:text-3xl">
                                        {step.title}
                                    </h3>
                                    <p className="mb-6 leading-relaxed text-primary-600">
                                        {step.description}
                                    </p>
                                    <ul className="space-y-3">
                                        {step.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-start gap-3">
                                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                                                <span className="text-primary-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Icon Card with Outside Glass Glows */}
                                <div className={isEven ? 'order-1' : 'order-1 md:order-2'}>
                                    <div className="relative">
                                        {/* Outside corner glow effects */}
                                        <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-accent-400/30 blur-3xl" />
                                        <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-primary-400/30 blur-3xl" />
                                        <div className="pointer-events-none absolute -top-6 -left-6 h-20 w-20 rounded-full bg-primary-300/25 blur-2xl" />
                                        <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-accent-300/20 blur-2xl" />

                                        {/* Card */}
                                        <div className="relative overflow-hidden rounded-3xl border border-primary-100 bg-white p-8 shadow-xl md:p-12">
                                            {/* Icon */}
                                            <div className="relative flex aspect-square items-center justify-center">
                                                <Icon className="h-28 w-28 text-primary-500" />
                                            </div>

                                            {/* Accent dots */}
                                            <div className="absolute top-6 right-6 h-3 w-3 rounded-full bg-accent-400" />
                                            <div className="absolute bottom-6 left-6 h-2 w-2 rounded-full bg-primary-400" />
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
