import { useTrans } from '@/hooks/use-trans';
import { Settings } from 'lucide-react';

interface SetupGuideProps {
    className?: string;
}

export function SetupGuide({ className }: SetupGuideProps) {
    const { trans } = useTrans();

    const iphoneSteps = [
        trans('how_it_works.setup.iphone.steps.0'),
        trans('how_it_works.setup.iphone.steps.1'),
        trans('how_it_works.setup.iphone.steps.2'),
        trans('how_it_works.setup.iphone.steps.3'),
    ];

    const androidSteps = [
        trans('how_it_works.setup.android.steps.0'),
        trans('how_it_works.setup.android.steps.1'),
        trans('how_it_works.setup.android.steps.2'),
        trans('how_it_works.setup.android.steps.3'),
    ];

    return (
        <div className={className}>
            <div className="mb-6 text-center">
                <h3 className="text-lg font-bold text-primary-900 md:text-xl">
                    {trans('how_it_works.setup.title')}
                </h3>
                <p className="mt-1 text-sm text-primary-600">
                    {trans('how_it_works.setup.subtitle')}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="group overflow-hidden rounded-2xl border border-primary-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-300 transition-colors group-hover:bg-accent-400">
                            <Settings className="h-4.5 w-4.5 text-accent-950" />
                        </div>
                        <h4 className="text-base font-bold text-primary-900">
                            {trans('how_it_works.setup.iphone.title')}
                        </h4>
                    </div>
                    <ol className="space-y-3">
                        {iphoneSteps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                    {i + 1}
                                </span>
                                <span className="text-sm text-primary-700">
                                    {step}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="group overflow-hidden rounded-2xl border border-primary-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-300 transition-colors group-hover:bg-accent-400">
                            <Settings className="h-4.5 w-4.5 text-accent-950" />
                        </div>
                        <h4 className="text-base font-bold text-primary-900">
                            {trans('how_it_works.setup.android.title')}
                        </h4>
                    </div>
                    <ol className="space-y-3">
                        {androidSteps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                                    {i + 1}
                                </span>
                                <span className="text-sm text-primary-700">
                                    {step}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
}
