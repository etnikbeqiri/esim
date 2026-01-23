import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ArrowRight, type LucideIcon } from 'lucide-react';

interface HelpCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    onClick?: () => void;
}

export function HelpCard({
    title,
    description,
    icon: Icon,
    href,
    onClick,
}: HelpCardProps) {
    return (
        <Link href={href} onClick={onClick}>
            <Card className="group h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold group-hover:text-primary">
                        {title}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                        {description}
                    </p>
                    <span className="inline-flex items-center text-sm font-medium text-primary">
                        Learn more
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </CardContent>
            </Card>
        </Link>
    );
}
