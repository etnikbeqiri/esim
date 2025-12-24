import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Globe, Search, Shield, Sparkles, X, Zap } from 'lucide-react';
import { useState } from 'react';

interface HeroSectionProps {
    badge?: string;
    title: string;
    titleHighlight?: string;
    description: string;
    showSearch?: boolean;
    showStats?: boolean;
    totalCountries?: number;
    // Controlled search props for local filtering
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
}

export function HeroSection({
    badge = 'Instant Activation',
    title,
    titleHighlight,
    description,
    showSearch = false,
    showStats = true,
    totalCountries = 0,
    searchValue,
    onSearchChange,
    searchPlaceholder = 'Where are you traveling to?',
}: HeroSectionProps) {
    const { name } = usePage<SharedData>().props;
    const [internalQuery, setInternalQuery] = useState('');

    // Use controlled value if provided, otherwise use internal state
    const isControlled = searchValue !== undefined && onSearchChange !== undefined;
    const searchQuery = isControlled ? searchValue : internalQuery;
    const setSearchQuery = isControlled ? onSearchChange : setInternalQuery;

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        // Only navigate if not in controlled mode
        if (!isControlled && searchQuery.trim()) {
            router.visit(`/destinations?search=${encodeURIComponent(searchQuery)}`);
        }
    }

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background pb-16 pt-12 md:pb-24 md:pt-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <Badge variant="secondary" className="mb-4">
                        <Sparkles className="mr-1 h-3 w-3" />
                        {badge}
                    </Badge>
                    <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                        {title}
                        {titleHighlight && (
                            <span className="block text-primary">{titleHighlight}</span>
                        )}
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                        {description}
                    </p>

                    {showSearch && (
                        <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-xl">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    className={`h-14 rounded-full pl-12 text-base shadow-lg ${isControlled ? 'pr-12' : 'pr-36'}`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {isControlled ? (
                                    searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    )
                                ) : (
                                    <Button
                                        type="submit"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6"
                                    >
                                        Search
                                    </Button>
                                )}
                            </div>
                        </form>
                    )}

                    {showStats && (
                        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground md:gap-12">
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                <span>{totalCountries}+ Countries</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                <span>Instant Delivery</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                <span>Secure Payment</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
